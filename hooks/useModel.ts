/**
 * @file useModel.ts
 * @description 이 파일은 `ModelContext`에 저장된 AI 모델 관련 데이터에 쉽게 접근할 수 있도록 도와주는 커스텀 훅(Custom Hook)입니다.
 * `usePrompts` 훅과 마찬가지로, 컴포넌트에서 `useContext(ModelContext)` 코드를 직접 사용하는 대신 `useModel()`이라는
 * 더 간단하고 의미 있는 이름의 훅을 사용하여 `selectedModel` 상태와 `setSelectedModel` 함수를 편리하게 가져올 수 있습니다.
 * 
 * @summary
 * 1. React의 `useContext` 훅과 우리가 만든 `ModelContext`를 임포트합니다.
 * 2. `useModel`라는 커스텀 훅을 정의합니다.
 * 3. 이 훅은 내부적으로 `useContext(ModelContext)`를 호출하여 context 값을 반환합니다.
 * 4. 이를 통해 컴포넌트에서는 `useContext`와 `ModelContext`를 직접 임포트할 필요 없이, 이 훅 하나만으로 context에 접근할 수 있게 됩니다.
 */

// React에서 `useContext` 훅을 가져옵니다. Context의 값을 사용하기 위해 필요합니다.
import { useContext } from 'react';
// 우리가 만든 `ModelContext`를 가져옵니다.
import { ModelContext } from '../context/ModelContext';

// `useModel` 커스텀 훅을 정의하고 내보냅니다.
export const useModel = () => {
  // `useContext` 훅에 `ModelContext`를 전달하여, `ModelProvider`가 제공하는 `value` 객체를 가져옵니다.
  // 이 `value` 객체 안에는 `selectedModel` 데이터와 `setSelectedModel` 함수가 들어있습니다.
  // 이 값을 그대로 반환합니다.
  return useContext(ModelContext);
};
