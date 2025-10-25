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
import { promptService } from '../src/firebase/firestore-service';

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

  // Firestore 실시간 데이터 구독
  useEffect(() => {
    setIsLoading(true);

    // Firestore에서 프롬프트 데이터 실시간 구독
    const unsubscribe = promptService.subscribe(async (data) => {
      try {
        if (data.length > 0) {
          // Firestore에 데이터가 있으면 첫 번째 문서를 프롬프트로 사용
          const firestorePrompts = data[0] as any;
          // id 필드 제거 후 Prompts 타입으로 변환
          const { id, ...promptsData } = firestorePrompts;
          setPrompts(promptsData as Prompts);
          // localStorage에도 저장 (백업 및 오프라인 지원)
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(promptsData));
        } else {
          // Firestore에 데이터가 없으면 localStorage 또는 기본 파일에서 로드
          const savedPrompts = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (savedPrompts) {
            const parsedPrompts = JSON.parse(savedPrompts);
            setPrompts(parsedPrompts);
            // Firestore에도 저장
            await promptService.setWithId('default', parsedPrompts);
          } else {
            // 기본 프롬프트 JSON 파일에서 로드
            const response = await fetch('./data/prompts.json');
            if (!response.ok) {
              throw new Error(`Failed to fetch prompts.json: ${response.statusText}`);
            }
            const defaultPrompts = await response.json();
            setPrompts(defaultPrompts);
            // Firestore와 localStorage에 저장
            await promptService.setWithId('default', defaultPrompts);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultPrompts));
          }
        }
      } catch (error) {
        console.error("프롬프트 로딩 실패:", error);
        setPrompts({} as Prompts);
      } finally {
        setIsLoading(false);
      }
    });

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      unsubscribe();
    };
  }, []);

  // 프롬프트를 저장하는 함수입니다. `useCallback`으로 감싸 불필요한 재생성을 방지하여 성능을 최적화합니다.
  const savePrompts = useCallback(async (newPrompts: Prompts) => {
    try {
      // 1. Firestore에 저장 (실시간 구독을 통해 자동으로 상태 업데이트됨)
      await promptService.setWithId('default', newPrompts);
      // 2. localStorage에도 저장 (백업 및 오프라인 지원)
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newPrompts));
    } catch (error) {
      console.error("프롬프트 저장 실패:", error);
      // Firestore 저장 실패 시 최소한 localStorage에 저장 시도
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newPrompts));
        setPrompts(newPrompts);
      } catch (localError) {
        console.error("localStorage 저장도 실패:", localError);
      }
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
