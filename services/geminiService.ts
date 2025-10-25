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
 
// Vite 환경 변수에서 API 키를 가져옵니다.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
 
// API 키가 없는 경우 에러를 발생시켜 개발자가 문제를 즉시 인지할 수 있도록 합니다.
if (!apiKey) {
  throw new Error("VITE_GEMINI_API_KEY 환경 변수가 설정되지 않았습니다. .env 파일을 확인해주세요.");
}
 
// API 클라이언트를 초기화합니다.
const ai = new GoogleGenAI({ apiKey });

/**
 * 주어진 프롬프트를 실행하고, AI의 응답을 JSON 객체로 파싱하는 범용 헬퍼 함수입니다.
 * @param prompt AI에게 보낼 전체 프롬프트 문자열
 * @param model 사용할 Gemini 모델의 이름
 * @param schema AI가 반환할 JSON의 구조를 정의하는 스키마 (선택 사항)
 * @returns AI 응답을 파싱한 Promise<T>
 */
async function runJsonPrompt<T>(prompt: string, model: string, schema?: any): Promise<T> {
  // `ai.models.generateContent`를 사용하여 Gemini API에 요청을 보냅니다.
  const response = await ai.models.generateContent({
    model,      // 사용할 AI 모델
    contents: prompt, // AI에게 전달할 프롬프트 내용
    config: {
      responseMimeType: 'application/json', // 응답을 반드시 JSON 형식으로 요청합니다.
      responseSchema: schema, // 만약 schema가 제공되면, 응답이 이 구조를 따르도록 요청합니다.
    },
  });

  try {
    // `response.text` 속성을 통해 AI가 생성한 텍스트 응답을 직접 가져옵니다.
    const text = response.text.trim();
    // 모델이 마크다운 코드 블록(```json ... ```) 안에 JSON을 반환하는 경우가 있으므로, 이를 제거하는 전처리 과정입니다.
    const jsonStr = text.startsWith('```json') ? text.replace(/```json\n|```/g, '') : text;
    // JSON 문자열을 실제 JavaScript 객체로 파싱하여 반환합니다.
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    // JSON 파싱에 실패하면, 콘솔에 원본 응답을 출력하고 사용자에게 에러를 던집니다.
    console.error("JSON 파싱 실패:", response.text);
    throw new Error("AI 응답을 파싱하는 데 실패했습니다. 응답이 유효한 JSON 형식이 아닙니다.");
  }
}

/**
 * 주어진 프롬프트를 실행하고, AI의 응답을 순수 텍스트로 반환하는 범용 헬퍼 함수입니다.
 * @param prompt AI에게 보낼 전체 프롬프트 문자열
 * @param model 사용할 Gemini 모델의 이름
 * @returns AI가 생성한 텍스트 문자열을 담은 Promise<string>
 */
async function runTextPrompt(prompt: string, model: string): Promise<string> {
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });
  // `response.text` 속성을 통해 AI가 생성한 텍스트 응답을 직접 반환합니다.
  return response.text;
}

// --- 각 기능별 API 호출 함수들 (Wrapper Functions) ---
// 아래 함수들은 각 기능 페이지에서 필요한 인자들을 받아,
// 위에서 만든 `runJsonPrompt` 또는 `runTextPrompt` 함수를 호출하는 '래퍼(Wrapper)' 역할을 합니다.
// 이를 통해 각 컴포넌트는 복잡한 프롬프트 조립 과정을 알 필요 없이 간단하게 API를 호출할 수 있습니다.

// [글쓰기 도우미] 문장 다듬기
export const refineText = async (text: string, tone: string, customPrompt: string, model: string): Promise<RefinedTextResult> => {
  const prompt = customPrompt.replace('{text}', text).replace('{tone}', tone);
  return runJsonPrompt<RefinedTextResult>(prompt, model);
};

// [글쓰기 도우미] 맞춤법 검사
export const spellCheck = async (text: string, customPrompt: string, model: string): Promise<SpellCheckResult> => {
  const prompt = customPrompt.replace('{text}', text);
  return runJsonPrompt<SpellCheckResult>(prompt, model);
};

// [글쓰기 도우미] 단어 비교
export const compareWords = async (word1: string, word2: string, customPrompt: string, model: string): Promise<string> => {
  const prompt = customPrompt.replace('{word1}', word1).replace('{word2}', word2);
  return runTextPrompt(prompt, model);
};

// [글쓰기 도우미] 번역
export const translateText = async (text: string, targetLanguage: string, customPrompt: string, model: string): Promise<string> => {
  const prompt = customPrompt.replace('{text}', text).replace('{targetLanguage}', targetLanguage);
  return runTextPrompt(prompt, model);
};

// [글쓰기 도우미] 단어 뜻풀이
export const getWordDefinition = async (word: string, customPrompt: string, model: string): Promise<string> => {
  const prompt = customPrompt.replace('{word}', word);
  return runTextPrompt(prompt, model);
};

// [글쓰기 도우미] 단어 추천
export const findWordsForDescription = async (description: string, customPrompt: string, model: string): Promise<string> => {
  const prompt = customPrompt.replace('{description}', description);
  return runTextPrompt(prompt, model);
};

// [AI 계산기]
export const calculateExpression = async (expression: string, customPrompt: string | undefined | null, model: string): Promise<string> => {
  // customPrompt가 undefined 또는 null일 경우 기본 프롬프트를 사용합니다.
  const effectivePrompt = customPrompt ?? "다음 수식을 계산해줘: {expression}";
  const prompt = effectivePrompt.replace('{expression}', expression);
  return runTextPrompt(prompt, model);
};

// [안내 문자 생성]
export const generateAnnouncement = async (details: Record<string, string | number>, customPrompt: string, model: string): Promise<string> => {
  const detailsString = Object.entries(details)
    .filter(([, value]) => String(value).trim() !== '') // 비어있지 않은 값만 필터링
    .map(([key, value]) => `${key}: ${value}`) // "키: 값" 형태의 문자열로 변환
    .join('\n'); // 각 항목을 줄바꿈으로 연결
  const prompt = customPrompt.replace('{details}', detailsString);
  return runTextPrompt(prompt, model);
};

// [프롬프트 생성기]
export const generatePrompt = async (details: { request: string; variables: string; outputFormat: string }, customPrompt: string, model: string): Promise<GeneratedPrompt> => {
    const detailsString = `
- 프롬프트의 목표: ${details.request}
- 프롬프트에 포함될 변수 (예: {text}): ${details.variables}
- 원하는 결과물 형식: ${details.outputFormat}
`;
    const prompt = customPrompt.replace('{details}', detailsString);
    return runJsonPrompt<GeneratedPrompt>(prompt, model);
};

// [뉴스 브리핑]
export const getNewsBriefing = async (details: { topic: string; period: string; country: string; mediaOutlet?: string; articleCount: number }, customPrompt: string, model: string): Promise<NewsArticle[]> => {
    const detailsString = `
- 주제: ${details.topic}
- 기간: ${details.period}
- 국가: ${details.country}
- 특정 언론사: ${details.mediaOutlet || '지정되지 않음'}
- 기사 수: ${details.articleCount}
`;
    const prompt = customPrompt.replace('{details}', detailsString);
    
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
