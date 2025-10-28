/**
 * @file services/geminiService.ts
 * @description 이 파일은 애플리케이션의 모든 Gemini API 호출을 중앙에서 관리하는 서비스 모듈입니다.
 * 각 기능(글쓰기 도우미, AI 계산기 등)에 필요한 API 요청을 함수 형태로 캡슐화(wrapping)하여
 * 컴포넌트에서는 간단하게 함수만 호출하여 AI 기능을 사용할 수 있도록 합니다.
 * API 키 관리, 모델 선택, 요청/응답 형식 처리 등 API 관련 로직이 여기에 집중됩니다.
 * 이렇게 하면 컴포넌트는 UI에만 집중할 수 있고, API 관련 코드는 한 곳에서 관리되어 유지보수가 용이해집니다.
 */

// Gemini API 클라이언트와 필요한 타입들을 가져옵니다.
import { GoogleGenAI, Type } from "@google/genai";
import type { RefinedTextResult, SpellCheckResult, NewsArticle, GeneratedPrompt } from '../types';

/**
 * AI 응답에서 불필요한 마크다운 기호를 정리하는 함수
 * AI가 일관성 없게 **만 단독으로 보내거나 형식을 어길 때 정규화합니다.
 */
function normalizeMarkdown(text: string): string {
  if (!text) return text;

  // 1. 텍스트 시작 부분의 ** 제거 (여러 개 있어도 모두 제거)
  text = text.replace(/^\*\*+\s*/gm, '');

  // 2. 텍스트 끝 부분의 ** 제거 (여러 개 있어도 모두 제거)
  text = text.replace(/\s*\*\*+$/gm, '');

  // 3. 줄바꿈 다음에 오는 단독 ** 제거
  text = text.replace(/\n\*\*+\s*\n/g, '\n');

  // 4. 공백만 있는 ** ** 패턴 제거
  text = text.replace(/\*\*+\s+\*\*+/g, '');

  // 5. ** 뒤에 바로 공백과 내용이 오는 경우 ** 제거 (** 내용 -> 내용)
  text = text.replace(/\*\*+\s+(?=[^\*])/g, '');

  // 6. 내용 뒤에 바로 공백과 **가 오는 경우 ** 제거 (내용 ** -> 내용)
  text = text.replace(/(?<=[^\*])\s+\*\*+/g, '');

  return text.trim();
}

/**
 * 텍스트 형식의 수학 기호를 LaTeX 형식으로 자동 변환하는 함수
 * AI가 가끔 LaTeX를 쓰지 않고 sqrt, ^ 등을 사용할 때 자동 변환합니다.
 */
function convertMathToLatex(text: string): string {
  if (!text) return text;

  // 1단계: LaTeX 표현 안의 이스케이프된 백슬래시를 정상화
  // $\\sqrt{27}$ -> $\sqrt{27}$
  text = text.replace(/\$([^$]+)\$/g, (match, content) => {
    const unescaped = content.replace(/\\\\/g, '\\');
    return `$${unescaped}$`;
  });

  // 이미 LaTeX 형식($...$)으로 감싸진 부분은 건드리지 않음
  const latexProtected: string[] = [];
  text = text.replace(/\$[^$]+\$/g, (match) => {
    latexProtected.push(match);
    return `__LATEX_${latexProtected.length - 1}__`;
  });

  // 1. sqrt(숫자) -> $\sqrt{숫자}$ (단, $로 감싸지지 않은 경우만)
  // 공백 허용: sqrt ( 27 ) 또는 sqrt(27) 모두 변환
  text = text.replace(/(?<!\$)sqrt\s*\(\s*(\d+)\s*\)(?!\$)/g, '$\\sqrt{$1}$');

  // 2. 숫자^숫자 -> $숫자^{숫자}$ (단, $로 감싸지지 않은 경우만)
  text = text.replace(/(?<!\$)(\d+)\^(\d+)(?!\$)/g, '$$$1^{$2}$$');

  // 3. 분수 표현 (예: 7/3) -> $\frac{7}{3}$ (단, $로 감싸지지 않은 경우만)
  text = text.replace(/(?<!\$)(\d+)\/(\d+)(?!\$)/g, (match, num, den) => {
    // 날짜나 URL이 아닌 경우만 변환 (간단한 체크)
    if (parseInt(num) > 12 || parseInt(den) > 31) {
      return `$\\frac{${num}}{${den}}$`;
    }
    return match;
  });

  // 4. √ 기호를 LaTeX로 변환 (예: 3√3 -> $3\sqrt{3}$) (단, $로 감싸지지 않은 경우만)
  text = text.replace(/(?<!\$)(\d+)√(\d+)(?!\$)/g, '$$$1\\sqrt{$2}$$');
  text = text.replace(/(?<!\$)√(\d+)(?!\$)/g, '$\\sqrt{$1}$');

  // 보호했던 LaTeX 복원
  latexProtected.forEach((latex, i) => {
    text = text.replace(`__LATEX_${i}__`, latex);
  });

  return text;
}

// API 클라이언트를 지연 초기화(lazy initialization)합니다.
// 이렇게 하면 빌드 시점이 아닌 실제 사용 시점에 환경 변수를 확인하므로
// Netlify 등에서 빌드할 때 에러가 발생하지 않습니다.
let ai: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!ai) {
    // Vite 환경 변수에서 API 키를 가져옵니다.
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    // API 키가 없는 경우 에러를 발생시켜 개발자가 문제를 즉시 인지할 수 있도록 합니다.
    if (!apiKey) {
      throw new Error("VITE_GEMINI_API_KEY 환경 변수가 설정되지 않았습니다. Netlify 환경 변수 설정을 확인해주세요.");
    }

    // API 클라이언트를 초기화합니다.
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

/**
 * 주어진 프롬프트를 실행하고, AI의 응답을 JSON 객체로 파싱하는 범용 헬퍼 함수입니다.
 * @param prompt AI에게 보낼 전체 프롬프트 문자열
 * @param model 사용할 Gemini 모델의 이름
 * @param schema AI가 반환할 JSON의 구조를 정의하는 스키마 (선택 사항)
 * @returns AI 응답을 파싱한 Promise<T>
 */
async function runJsonPrompt<T>(prompt: string, model: string, schema?: any): Promise<T> {
  try {
    // `getAIClient().models.generateContent`를 사용하여 Gemini API에 요청을 보냅니다.
    const response = await getAIClient().models.generateContent({
      model,      // 사용할 AI 모델
      contents: prompt, // AI에게 전달할 프롬프트 내용
      config: {
        responseMimeType: 'application/json', // 응답을 반드시 JSON 형식으로 요청합니다.
        responseSchema: schema, // 만약 schema가 제공되면, 응답이 이 구조를 따르도록 요청합니다.
      },
    });

    // `response.text` 속성을 통해 AI가 생성한 텍스트 응답을 직접 가져옵니다.
    let text = response.text.trim();

    // 1. 마크다운 코드 블록 제거
    if (text.startsWith('```json')) {
      text = text.replace(/```json\n?|```/g, '');
    }

    // 2. 불필요한 ** 기호 제거
    text = normalizeMarkdown(text);

    // 3. JSON 문자열을 실제 JavaScript 객체로 파싱하여 반환합니다.
    const parsed = JSON.parse(text) as T;

    // 4. JSON 내부의 문자열 필드도 정규화 (checkedText, recommendations 등)
    if (typeof parsed === 'object' && parsed !== null) {
      Object.keys(parsed).forEach(key => {
        const value = (parsed as any)[key];
        if (typeof value === 'string') {
          (parsed as any)[key] = normalizeMarkdown(value);
        } else if (Array.isArray(value)) {
          (parsed as any)[key] = value.map(item =>
            typeof item === 'string' ? normalizeMarkdown(item) : item
          );
        }
      });
    }

    return parsed;
  } catch (e: any) {
    // API 에러 처리
    if (e?.error?.code === 500) {
      throw new Error("Gemini API 서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
    if (e?.error?.code === 429) {
      throw new Error("API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.");
    }
    // JSON 파싱 에러 처리
    if (e instanceof SyntaxError) {
      console.error("JSON 파싱 실패:", e);
      throw new Error("AI 응답을 파싱하는 데 실패했습니다. 응답이 유효한 JSON 형식이 아닙니다.");
    }
    // 기타 에러 - Error 객체로 변환하여 던지기
    if (e instanceof Error) {
      throw e;
    }
    // 일반 객체나 문자열인 경우 Error 객체로 변환
    const errorMsg = typeof e === 'string' ? e : (e?.message || JSON.stringify(e));
    throw new Error(errorMsg);
  }
}

/**
 * 주어진 프롬프트를 실행하고, AI의 응답을 순수 텍스트로 반환하는 범용 헬퍼 함수입니다.
 * @param prompt AI에게 보낼 전체 프롬프트 문자열
 * @param model 사용할 Gemini 모델의 이름
 * @returns AI가 생성한 텍스트 문자열을 담은 Promise<string>
 */
async function runTextPrompt(prompt: string, model: string): Promise<string> {
  try {
    const response = await getAIClient().models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature: 0.1, // 낮은 temperature로 일관성 있는 응답 생성
      },
    });
    // response.text가 문자열이 아닌 경우 처리
    let textContent: string;
    if (typeof response.text === 'string') {
      textContent = response.text;
    } else if (response.text && typeof response.text === 'object') {
      // response.text가 객체인 경우 JSON.stringify로 변환
      console.warn('⚠️ response.text가 문자열이 아님:', response.text);
      textContent = JSON.stringify(response.text);
    } else {
      throw new Error('AI 응답을 텍스트로 변환할 수 없습니다.');
    }

    // `response.text` 속성을 통해 AI가 생성한 텍스트 응답을 받아 정규화한 후 반환합니다.
    return normalizeMarkdown(textContent);
  } catch (e: any) {
    // API 에러 처리
    if (e?.error?.code === 500) {
      throw new Error("Gemini API 서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
    if (e?.error?.code === 429) {
      throw new Error("API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.");
    }
    // 기타 에러 - Error 객체로 변환하여 던지기
    if (e instanceof Error) {
      throw e;
    }
    // 일반 객체나 문자열인 경우 Error 객체로 변환
    const errorMsg = typeof e === 'string' ? e : (e?.message || JSON.stringify(e));
    throw new Error(errorMsg);
  }
}

// --- 각 기능별 API 호출 함수들 (Wrapper Functions) ---
// 아래 함수들은 각 기능 페이지에서 필요한 인자들을 받아,
// 위에서 만든 `runJsonPrompt` 또는 `runTextPrompt` 함수를 호출하는 '래퍼(Wrapper)' 역할을 합니다.
// 이를 통해 각 컴포넌트는 복잡한 프롬프트 조립 과정을 알 필요 없이 간단하게 API를 호출할 수 있습니다.
// customPrompt가 undefined 또는 null일 경우를 대비하여 기본 프롬프트를 사용합니다.

// [글쓰기 도우미] 문장 다듬기
export const refineText = async (text: string, tone: string, customPrompt: string | undefined | null, model: string): Promise<RefinedTextResult> => {
  const effectivePrompt = customPrompt ?? "다음 텍스트를 {tone} 톤으로 더 자연스럽고 명확하게 다듬어줘. 3가지 버전의 추천 문장을 'recommendations' 필드(배열)에, 수정 방향에 대한 설명을 'explanation' 필드에 담아 JSON 형식으로 반환해줘. **어떤 추가적인 설명이나 대화 없이 오직 JSON 객체만 반환해야 해.**:\n\n---\n{text}\n---";
  const prompt = effectivePrompt.replace('{text}', text).replace('{tone}', tone);
  return runJsonPrompt<RefinedTextResult>(prompt, model);
};

// [글쓰기 도우미] 맞춤법 검사
export const spellCheck = async (text: string, customPrompt: string | undefined | null, model: string): Promise<SpellCheckResult> => {
  const effectivePrompt = customPrompt ?? "다음 텍스트에서 맞춤법과 문법 오류를 찾아 수정해줘. 수정된 부분은 **굵은 글씨**로 표시하고, 전체 문장을 'checkedText' 필드에, 수정 사항에 대한 설명을 'corrections' 필드(배열)에 담아 JSON 형식으로 반환해줘. **어떤 추가적인 설명이나 대화 없이 오직 JSON 객체만 반환해야 해.**:\n\n---\n{text}\n---";
  const prompt = effectivePrompt.replace('{text}', text);
  return runJsonPrompt<SpellCheckResult>(prompt, model);
};

// [글쓰기 도우미] 단어 비교
export const compareWords = async (word1: string, word2: string, customPrompt: string | undefined | null, model: string): Promise<string> => {
  const effectivePrompt = customPrompt ?? "두 단어 '{word1}'와(과) '{word2}'의 차이점을 주요 특징, 사용 예시, 뉘앙스 관점에서 비교 설명해줘.";
  const prompt = effectivePrompt.replace('{word1}', word1).replace('{word2}', word2);
  return runTextPrompt(prompt, model);
};

// [글쓰기 도우미] 번역
export const translateText = async (text: string, targetLanguage: string, customPrompt: string | undefined | null, model: string): Promise<string> => {
  const effectivePrompt = customPrompt ?? "다음 텍스트를 '{targetLanguage}'(으)로 번역해줘:\n\n---\n{text}\n---";
  const prompt = effectivePrompt.replace('{text}', text).replace('{targetLanguage}', targetLanguage);
  return runTextPrompt(prompt, model);
};

// [글쓰기 도우미] 단어 뜻풀이
export const getWordDefinition = async (word: string, customPrompt: string | undefined | null, model: string): Promise<string> => {
  const effectivePrompt = customPrompt ?? "단어 '{word}'의 뜻을 초등학생도 이해할 수 있도록 쉽고 재미있는 예시를 들어 설명해줘.";
  const prompt = effectivePrompt.replace('{word}', word);
  return runTextPrompt(prompt, model);
};

// [글쓰기 도우미] 단어 추천
export const findWordsForDescription = async (description: string, customPrompt: string | undefined | null, model: string): Promise<string> => {
  const effectivePrompt = customPrompt ?? "다음 설명에 가장 잘 맞는 단어나 표현을 3개 추천하고, 각 단어의 간단한 뜻과 사용 예시를 알려줘.\n\n---\n설명: {description}\n---";
  const prompt = effectivePrompt.replace('{description}', description);
  return runTextPrompt(prompt, model);
};

// [AI 계산기]
export const calculateExpression = async (expression: string, customPrompt: string | undefined | null, model: string): Promise<string> => {
  const effectivePrompt = customPrompt ?? "다음 수식을 계산하고, 풀이 과정을 단계별로 설명해줘.\n\n**출력 형식 (반드시 이 형식을 따를 것):**\n결과: [여기에 최종 답을 한 줄로 작성. 무리수나 루트가 포함된 경우 근사값을 소수점 5자리까지 함께 표시 (예: 3√3 ≈ 5.19615)]\n\n풀이:\n[여기에 단계별 풀이 과정 작성]\n\n**중요**: 모든 수학 기호와 수식은 반드시 LaTeX 형식으로 $ 기호로 감싸서 표시해줘 (예: $\\sqrt{27}$, $3\\sqrt{3}$, $x^2$, $\\frac{7}{3}$).\n\n수식: {expression}";
  const prompt = effectivePrompt.replace('{expression}', expression);
  const result = await runTextPrompt(prompt, model);
  // AI가 LaTeX를 쓰지 않은 경우 자동 변환
  return convertMathToLatex(result);
};

// [안내 문자 생성]
export const generateAnnouncement = async (details: Record<string, string | number>, customPrompt: string | undefined | null, model: string): Promise<string> => {
  const effectivePrompt = customPrompt ?? "다음 세부 정보를 바탕으로, 친근하고 명확한 톤의 안내문을 작성해줘. 형식에 얽매이지 말고 자연스럽게 써줘.\n\n---\n{details}\n---";
  const detailsString = Object.entries(details)
    .filter(([, value]) => String(value).trim() !== '') // 비어있지 않은 값만 필터링
    .map(([key, value]) => `${key}: ${value}`) // "키: 값" 형태의 문자열로 변환
    .join('\n'); // 각 항목을 줄바꿈으로 연결
  const prompt = effectivePrompt.replace('{details}', detailsString);
  return runTextPrompt(prompt, model);
};

// [프롬프트 생성기]
export const generatePrompt = async (details: { request: string; variables: string; outputFormat: string }, customPrompt: string | undefined | null, model: string): Promise<GeneratedPrompt> => {
    const effectivePrompt = customPrompt ?? "다음 요구사항을 바탕으로, Gemini API가 최고의 성능을 발휘할 수 있는 명확하고 상세한 프롬프트를 한국어와 영어로 각각 작성해줘. 생성된 한국어 프롬프트는 'korean' 필드에, 영어 프롬프트는 'english' 필드에 담아 JSON 형식으로 반환해줘. **어떤 추가적인 설명이나 대화 없이 오직 JSON 객체만 반환해야 해.**\n\n---\n{details}\n---";
    const detailsString = `
- 프롬프트의 목표: ${details.request}
- 프롬프트에 포함될 변수 (예: {text}): ${details.variables}
- 원하는 결과물 형식: ${details.outputFormat}
`;
    const prompt = effectivePrompt.replace('{details}', detailsString);
    return runJsonPrompt<GeneratedPrompt>(prompt, model);
};

// [뉴스 브리핑]
export const getNewsBriefing = async (details: { topic: string; period: string; country: string; mediaOutlet?: string; articleCount: number }, customPrompt: string | undefined | null, model: string): Promise<NewsArticle[]> => {
    // 현재 날짜 정보를 가져옵니다 (오늘 날짜 기준으로 상대적 기간 계산에 사용)
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const todayString = `${year}년 ${month}월 ${day}일`;

    // "지난 7일" 같은 상대 기간을 구체적인 날짜로 변환
    let periodString = details.period;
    if (details.period.includes('지난') && details.period.includes('일')) {
      const match = details.period.match(/지난\s*(\d+)\s*일/);
      if (match) {
        const days = parseInt(match[1]);
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - days);
        const startYear = startDate.getFullYear();
        const startMonth = startDate.getMonth() + 1;
        const startDay = startDate.getDate();
        periodString = `${startYear}년 ${startMonth}월 ${startDay}일 ~ ${year}년 ${month}월 ${day}일 (최근 ${days}일간)`;
      }
    }

    // 커스텀 프롬프트가 있으면 변수 치환, 없으면 기본 프롬프트 사용
    let prompt: string;
    if (customPrompt) {
      // 커스텀 프롬프트의 변수들을 실제 값으로 치환
      prompt = customPrompt
        .replace(/{today}/g, todayString)
        .replace(/{topic}/g, details.topic)
        .replace(/{period}/g, periodString)
        .replace(/{country}/g, details.country)
        .replace(/{mediaOutlet}/g, details.mediaOutlet || '지정되지 않음')
        .replace(/{articleCount}/g, String(details.articleCount));
    } else {
      // 기본 프롬프트: 변수 없이 직접 값을 포함
      prompt = `**매우 중요**: 반드시 ${todayString} 기준으로 뉴스를 검색해야 합니다. 절대 과거 데이터(2024년 등)를 반환하지 마세요.

다음 조건에 맞는 최신 뉴스를 요약해서 알려줘. 각 뉴스는 날짜, 언론사, 제목, 핵심 요약, 원문 URL을 포함해야 해.

**검색 조건:**
- 오늘 날짜 (기준일): ${todayString}
- 주제: ${details.topic}
- 기간: ${periodString}
- 국가: ${details.country}
${details.mediaOutlet ? `- 특정 언론사: ${details.mediaOutlet}` : ''}
- 기사 수: ${details.articleCount}개

**중요**: 반드시 정확히 ${details.articleCount}개의 기사를 반환해야 합니다. 위 주제("${details.topic}")와 관련된 뉴스만 찾아주세요.`;
    }

    // 디버깅: 프롬프트와 기사 개수를 콘솔에 출력
    console.log('=== News Briefing Debug ===');
    console.log('Requested article count:', details.articleCount);
    console.log('Final prompt:', prompt);
    console.log('========================');
    
    // 뉴스 기사 응답에 대한 JSON 스키마를 정의합니다.
    // 이렇게 하면 AI가 더 안정적으로 우리가 원하는 구조의 JSON을 반환하게 됩니다.
    const responseSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING },
            mediaOutlet: { type: Type.STRING },
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            url: { type: Type.STRING },
          },
          required: ['date', 'mediaOutlet', 'title', 'summary', 'url'],
        },
    };

    // 범용 `runJsonPrompt` 함수에 스키마를 전달하여 API를 호출합니다.
    return runJsonPrompt<NewsArticle[]>(prompt, model, responseSchema);
};
