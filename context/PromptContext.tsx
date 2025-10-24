/**
 * @file context/PromptContext.tsx
 * @description 이 파일은 React의 Context API를 사용하여 앱 전체에서 사용되는 'AI 프롬프트'들을 전역적으로 관리합니다.
 * 사용자가 각 기능의 프롬프트를 수정하면, 그 내용이 여기에 저장되고 브라우저의 localStorage에도 보관되어
 * 앱을 새로고침하거나 다시 방문해도 변경 사항이 유지됩니다.
 * 이렇게 중앙에서 데이터를 관리하면 여러 컴포넌트가 동일한 데이터에 쉽게 접근하고 공유할 수 있어, 
 * props를 여러 단계로 계속 전달해야 하는 'prop drilling' 문제를 해결할 수 있습니다.
 */

// React와 필요한 기능들을 가져옵니다.
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';

// 앱에서 사용되는 모든 프롬프트들의 타입을 정의합니다.
// 새로운 AI 기능이 추가되면 여기에 해당 프롬프트의 키(key)를 추가해야 합니다.
export interface Prompts {
  refine: string;
  spellCheck: string;
  compare: string;
  translate: string;
  aiCalculator: string;
  announcement: string;
  newsBriefing: string;
  wordDefinition: string;
  findWords: string;
  generatePrompt: string;
}

// Context가 어떤 데이터와 함수를 가지고 있을지 타입을 정의합니다.
// 이 Context를 사용하는 컴포넌트들은 이 타입에 정의된 값들에 접근할 수 있습니다.
interface PromptContextType {
  prompts: Prompts; // 모든 프롬프트 내용을 담고 있는 객체
  savePrompts: (newPrompts: Prompts) => void; // 프롬프트를 저장하는 함수
  isLoading: boolean; // 프롬프트를 로딩 중인지 여부 (초기 로딩 시)
}

// localStorage에 프롬프트를 저장할 때 사용할 키(key)입니다.
const LOCAL_STORAGE_KEY = 'gemini_mini_helper_prompts';

// PromptContext를 생성합니다. 다른 컴포넌트들이 이 Context를 통해 데이터에 접근합니다.
// createContext 호출 시 제공되는 기본값은 Provider가 없을 때 사용됩니다.
export const PromptContext = createContext<PromptContextType>({
  prompts: {} as Prompts, // 처음에는 빈 객체로 시작
  savePrompts: () => {}, // 기본 함수는 아무것도 하지 않음
  isLoading: true, // 처음에는 로딩 상태로 시작
});

// PromptProvider 컴포넌트는 자식 컴포넌트들에게 PromptContext의 값을 제공하는 역할을 합니다.
// index.tsx에서 이 컴포넌트로 앱 전체를 감싸 모든 컴포넌트가 프롬프트 데이터에 접근할 수 있게 됩니다.
export const PromptProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // `useState` 훅을 사용하여 프롬프트 데이터와 로딩 상태를 관리합니다.
  const [prompts, setPrompts] = useState<Prompts>({} as Prompts);
  const [isLoading, setIsLoading] = useState(true);

  // `useEffect` 훅은 컴포넌트가 처음 렌더링될 때 한 번만 실행되어 프롬프트를 초기화합니다.
  useEffect(() => {
    // 프롬프트를 불러오는 비동기 함수
    const loadPrompts = async () => {
      setIsLoading(true);
      try {
        // 1. localStorage에 저장된 프롬프트가 있는지 확인합니다.
        const savedPrompts = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedPrompts) {
          // 저장된 값이 있으면 그것을 파싱하여 상태로 설정합니다. (데이터 영속성)
          setPrompts(JSON.parse(savedPrompts));
        } else {
          // 저장된 값이 없으면, public 폴더의 기본 프롬프트 JSON 파일을 불러옵니다.
          const response = await fetch('./data/prompts.json');
          if (!response.ok) {
            throw new Error(`Failed to fetch prompts.json: ${response.statusText}`);
          }
          const defaultPrompts = await response.json();
          setPrompts(defaultPrompts);
        }
      } catch (error) {
        console.error("프롬프트 로딩 실패:", error);
        // 에러 발생 시 빈 객체로 설정하여 앱이 멈추지 않도록 합니다.
        setPrompts({} as Prompts);
      } finally {
        // 로딩이 성공하든 실패하든, 로딩 상태를 false로 변경합니다.
        setIsLoading(false);
      }
    };

    loadPrompts();
  }, []); // 의존성 배열이 비어있으므로, 이 `useEffect`는 컴포넌트가 처음 마운트될 때 한 번만 실행됩니다.

  // 프롬프트를 저장하는 함수입니다. `useCallback`으로 감싸 불필요한 재생성을 방지하여 성능을 최적화합니다.
  const savePrompts = useCallback((newPrompts: Prompts) => {
    try {
      // 1. 새로운 프롬프트 데이터를 JSON 문자열로 변환하여 localStorage에 저장합니다.
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newPrompts));
      // 2. 컴포넌트의 상태(state)도 업데이트하여 화면에 즉시 반영되도록 합니다.
      setPrompts(newPrompts);
    } catch (error) {
      console.error("localStorage에 프롬프트 저장 실패:", error);
    }
  }, []);

  // PromptContext.Provider를 사용하여 자식 컴포넌트들에게 `value` 객체에 담긴 데이터와 함수를 제공합니다.
  // `value`로 전달된 객체는 Provider 하위의 모든 컴포넌트에서 `useContext(PromptContext)`를 통해 접근할 수 있습니다.
  return (
    <PromptContext.Provider value={{ prompts, savePrompts, isLoading }}>
      {children}
    </PromptContext.Provider>
  );
};
