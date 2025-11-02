/**
 * @file services/geminiServiceNew.ts
 * @description Firebase Cloud Functions를 통해 Gemini API를 호출하는 서비스
 * API 키를 클라이언트에 노출하지 않고 서버 사이드에서 안전하게 호출합니다.
 */

import type { RefinedTextResult, SpellCheckResult, NewsArticle, GeneratedPrompt } from '../types';

/**
 * Firebase Cloud Function 엔드포인트
 */
const CLOUD_FUNCTION_URL = 'https://callgemini-x7yhjx23da-uc.a.run.app';

/**
 * Cloud Function을 통해 Gemini API 호출
 */
async function callGeminiFunction<T>(prompt: string, model: string, responseType: 'text' | 'json' = 'text'): Promise<T> {
  try {
    const response = await fetch(CLOUD_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model,
        responseType,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Unknown error occurred');
    }

    return result.data as T;
  } catch (error: any) {
    console.error('Cloud Function 호출 오류:', error);
    throw new Error(error.message || 'Gemini API 호출에 실패했습니다.');
  }
}

// === 기존 함수들을 Cloud Functions 호출로 변경 ===

// [글쓰기 도우미] 문장 다듬기
export const refineText = async (text: string, tone: string, exampleText: string, customPrompt: string | undefined | null, model: string): Promise<RefinedTextResult> => {
  const defaultPrompt = exampleText
    ? `다음 텍스트를 {tone} 톤으로 더 자연스럽고 명확하게 다듬어줘. 아래 '예시 글'의 스타일과 문체를 참고해서 비슷한 느낌으로 작성해줘. 3가지 버전의 추천 문장을 'recommendations' 필드(배열)에, 수정 방향에 대한 설명을 'explanation' 필드에 담아 JSON 형식으로 반환해줘. **어떤 추가적인 설명이나 대화 없이 오직 JSON 객체만 반환해야 해.**\n\n예시 글:\n---\n{exampleText}\n---\n\n다듬을 텍스트:\n---\n{text}\n---`
    : `다음 텍스트를 {tone} 톤으로 더 자연스럽고 명확하게 다듬어줘. 3가지 버전의 추천 문장을 'recommendations' 필드(배열)에, 수정 방향에 대한 설명을 'explanation' 필드에 담아 JSON 형식으로 반환해줘. **어떤 추가적인 설명이나 대화 없이 오직 JSON 객체만 반환해야 해.**:\n\n---\n{text}\n---`;

  const effectivePrompt = customPrompt ?? defaultPrompt;
  let prompt = effectivePrompt.replace(/{text}/g, text).replace(/{tone}/g, tone);

  if (exampleText) {
    prompt = prompt.replace(/{exampleText}/g, exampleText);
  }

  return callGeminiFunction<RefinedTextResult>(prompt, model, 'json');
};

// [글쓰기 도우미] 맞춤법 검사
export const spellCheck = async (text: string, customPrompt: string | undefined | null, model: string): Promise<SpellCheckResult> => {
  const effectivePrompt = customPrompt ?? `다음 텍스트에서 맞춤법과 문법 오류를 찾아 수정해줘. 수정된 부분은 **굵은 글씨**로 표시하고, 전체 문장을 'checkedText' 필드에, 수정 사항에 대한 설명을 'corrections' 필드(배열)에 담아 JSON 형식으로 반환해줘. **어떤 추가적인 설명이나 대화 없이 오직 JSON 객체만 반환해야 해.**:\n\n---\n{text}\n---`;
  const prompt = effectivePrompt.replace(/{text}/g, text);
  return callGeminiFunction<SpellCheckResult>(prompt, model, 'json');
};

// [글쓰기 도우미] 단어 비교
export const compareWords = async (words: string[], customPrompt: string | undefined | null, model: string): Promise<string> => {
  const wordsList = words.map((w, i) => `'${w}'`).join(', ');
  const defaultPrompt = words.length === 2
    ? `두 단어 '{word1}'와(과) '{word2}'의 차이점을 주요 특징, 사용 예시, 뉘앙스 관점에서 비교 설명해줘.`
    : `다음 단어들 {wordsList}의 차이점을 주요 특징, 사용 예시, 뉘앙스 관점에서 비교 설명해줘.`;

  let prompt = customPrompt ?? defaultPrompt;

  if (words.length > 2 && (prompt.includes('{word1}') || prompt.includes('{word2}'))) {
    prompt = `다음 단어들 ${wordsList}의 차이점을 주요 특징, 사용 예시, 뉘앙스 관점에서 비교 설명해줘.`;
  } else {
    if (words.length >= 2) {
      prompt = prompt.replace(/{word1}/g, words[0]);
      prompt = prompt.replace(/{word2}/g, words[1] || '');
    }
    prompt = prompt.replace(/{wordsList}/g, wordsList);
  }

  return callGeminiFunction<string>(prompt, model, 'text');
};

// [글쓰기 도우미] 번역
export const translateText = async (text: string, targetLanguage: string, customPrompt: string | undefined | null, model: string): Promise<string> => {
  const effectivePrompt = customPrompt ?? `다음 텍스트를 '{targetLanguage}'(으)로 번역해줘:\n\n---\n{text}\n---`;
  const prompt = effectivePrompt.replace(/{text}/g, text).replace(/{targetLanguage}/g, targetLanguage);
  return callGeminiFunction<string>(prompt, model, 'text');
};

// [글쓰기 도우미] 단어 뜻풀이
export const getWordDefinition = async (word: string, customPrompt: string | undefined | null, model: string): Promise<string> => {
  const effectivePrompt = customPrompt ?? `단어 '{word}'의 뜻을 초등학생도 이해할 수 있도록 쉽고 재미있는 예시를 들어 설명해줘.`;
  const prompt = effectivePrompt.replace(/{word}/g, word);
  return callGeminiFunction<string>(prompt, model, 'text');
};

// [글쓰기 도우미] 단어 추천
export const findWordsForDescription = async (description: string, customPrompt: string | undefined | null, model: string): Promise<string> => {
  const effectivePrompt = customPrompt ?? `다음 설명에 가장 잘 맞는 한국어 단어나 표현을 3-5개 추천하고, 각 단어의 뜻과 사용 예시를 들어 설명해줘:\n\n{description}`;
  const prompt = effectivePrompt.replace(/{description}/g, description);
  return callGeminiFunction<string>(prompt, model, 'text');
};

// [AI 계산기]
export const calculateWithAI = async (problem: string, customPrompt: string | undefined | null, model: string): Promise<string> => {
  const effectivePrompt = customPrompt ?? `다음 수학 문제를 단계별로 풀이하고, 최종 답을 명확하게 제시해줘:\n\n{problem}`;
  const prompt = effectivePrompt.replace(/{problem}/g, problem);
  return callGeminiFunction<string>(prompt, model, 'text');
};

// Alias for backward compatibility
export const calculateExpression = calculateWithAI;

// [공지사항 생성기]
export const generateAnnouncement = async (topic: string, details: string, customPrompt: string | undefined | null, model: string): Promise<string> => {
  const effectivePrompt = customPrompt ?? `다음 주제에 대한 공지사항을 작성해줘:\n\n주제: {topic}\n상세 내용: {details}`;
  const prompt = effectivePrompt.replace(/{topic}/g, topic).replace(/{details}/g, details);
  return callGeminiFunction<string>(prompt, model, 'text');
};

// [뉴스 브리핑]
export const generateNewsBriefing = async (
  newsData: { title: string; url: string; description: string }[],
  customPrompt: string | undefined | null,
  model: string
): Promise<NewsArticle[]> => {
  const newsText = newsData.map((news, i) => `${i + 1}. 제목: ${news.title}\n   내용: ${news.description}`).join('\n\n');
  const effectivePrompt = customPrompt ?? `다음 뉴스 기사들을 요약하여 JSON 배열로 반환해줘. 각 기사는 'title', 'summary', 'keyPoints'(배열) 필드를 가져야 해. **어떤 추가적인 설명이나 대화 없이 오직 JSON 배열만 반환해야 해.**:\n\n{newsText}`;
  const prompt = effectivePrompt.replace(/{newsText}/g, newsText);
  return callGeminiFunction<NewsArticle[]>(prompt, model, 'json');
};

// Alias for backward compatibility
export const getNewsBriefing = generateNewsBriefing;

// [프롬프트 생성기]
export const generatePrompt = async (
  details: { request: string; variables: string; outputFormat: string },
  customPrompt: string | undefined | null,
  model: string
): Promise<GeneratedPrompt> => {
  const effectivePrompt = customPrompt ?? `다음 요구사항에 맞는 프롬프트를 한국어와 영어로 작성해줘:\n\n목표: {request}\n변수: {variables}\n출력 형식: {outputFormat}\n\nJSON 형식으로 'korean'과 'english' 필드에 각각 프롬프트를 담아 반환해줘. **어떤 추가적인 설명이나 대화 없이 오직 JSON 객체만 반환해야 해.**`;
  const prompt = effectivePrompt
    .replace(/{request}/g, details.request)
    .replace(/{variables}/g, details.variables || '없음')
    .replace(/{outputFormat}/g, details.outputFormat || '없음');
  return callGeminiFunction<GeneratedPrompt>(prompt, model, 'json');
};
