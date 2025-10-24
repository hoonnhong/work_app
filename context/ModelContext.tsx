/**
 * @file ModelContext.tsx
 * @description 이 파일은 React의 Context API를 사용하여 사용자가 선택한 'AI 모델' 정보를 앱 전체에서 공유할 수 있도록 해주는 역할을 합니다.
 * `PromptContext`와 유사하게, 이 Context를 통해 어떤 컴포넌트에서든 현재 선택된 AI 모델이 무엇인지 알 수 있고,
 * 모델을 변경할 수도 있습니다. 사용자가 선택한 모델은 브라우저의 localStorage에 저장되어,
 * 앱을 새로고침하거나 다시 방문해도 마지막 선택이 유지됩니다.
 */

// React와 필요한 기능들을 가져옵니다.
import React, { createContext, useState, useEffect, ReactNode } from 'react';
// 앱의 기본 AI 모델 정보를 상수로 가져옵니다.
import { DEFAULT_MODEL } from '../constants';

// Context가 어떤 데이터와 함수를 가지고 있을지 타입을 정의합니다.
interface ModelContextType {
  selectedModel: string; // 현재 선택된 모델의 이름 (예: 'gemini-2.5-flash')
  setSelectedModel: (model: string) => void; // 모델을 변경하는 함수
}

// ModelContext를 생성합니다. 다른 컴포넌트들이 이 Context를 통해 데이터에 접근합니다.
export const ModelContext = createContext<ModelContextType>({
  selectedModel: DEFAULT_MODEL,
  setSelectedModel: () => {}, // 기본값으로는 아무것도 하지 않는 빈 함수를 설정합니다.
});

// localStorage에 모델 정보를 저장할 때 사용할 키(key)입니다.
const LOCAL_STORAGE_KEY = 'gemini_mini_helper_model';

// ModelProvider 컴포넌트는 자식 컴포넌트들에게 ModelContext의 값을 제공하는 역할을 합니다.
// App.tsx에서 이 컴포넌트로 앱을 감싸 모든 컴포넌트가 모델 정보에 접근할 수 있게 됩니다.
export const ModelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  
  // `useState` 훅을 사용하여 현재 선택된 모델을 관리하는 `selectedModel` 상태를 만듭니다.
  // useState에 함수를 전달하면, 이 함수는 컴포넌트가 처음 렌더링될 때 딱 한 번만 실행됩니다.
  // 이를 통해 localStorage에서 값을 읽어오는 초기화 작업을 효율적으로 처리할 수 있습니다.
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    try {
      // 1. localStorage에서 이전에 저장된 모델이 있는지 확인합니다.
      const savedModel = localStorage.getItem(LOCAL_STORAGE_KEY);
      // 2. 저장된 모델이 있으면 그 값을 사용하고, 없으면 기본 모델(DEFAULT_MODEL)을 사용합니다.
      return savedModel ? savedModel : DEFAULT_MODEL;
    } catch (error) {
      // localStorage 접근 중 오류가 발생할 경우를 대비하여 에러를 처리하고 기본 모델을 반환합니다.
      console.error('localStorage에서 모델 정보 읽기 실패:', error);
      return DEFAULT_MODEL;
    }
  });

  // `useEffect` 훅은 `selectedModel` 상태가 변경될 때마다 특정 작업을 수행하게 합니다.
  // 여기서는 `selectedModel`이 바뀔 때마다 그 값을 localStorage에 저장하는 역할을 합니다.
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, selectedModel);
    } catch (error) {
      console.error('localStorage에 모델 정보 저장 실패:', error);
    }
  }, [selectedModel]); // 의존성 배열에 `selectedModel`을 넣어, 이 값이 변경될 때만 `useEffect`가 실행되도록 합니다.

  // ModelContext.Provider를 사용하여 자식 컴포넌트들에게 `value` 객체에 담긴 데이터와 함수를 제공합니다.
  // `setSelectedModel`은 `useState`가 반환한 상태 변경 함수이므로, 이 함수를 호출하면 `selectedModel` 상태가 업데이트되고,
  // 위 `useEffect`가 실행되어 localStorage에도 변경 사항이 저장됩니다.
  return (
    <ModelContext.Provider value={{ selectedModel, setSelectedModel }}>
      {children}
    </ModelContext.Provider>
  );
};
