/**
 * @file usePrompts.ts
 * @description 이 파일은 `PromptContext`에 저장된 전역 프롬프트 데이터에 쉽게 접근할 수 있도록 도와주는 커스텀 훅(Custom Hook)입니다.
 * 컴포넌트에서 `useContext(PromptContext)` 코드를 직접 사용하는 대신, `usePrompts()`라는 더 간단하고 의미 있는 이름의 훅을 호출하여
 * 프롬프트 데이터(prompts), 저장 함수(savePrompts) 등을 편리하게 가져올 수 있습니다.
 * 
 * @summary
 * 1. React의 `useContext` 훅과 우리가 만든 `PromptContext`를 임포트합니다.
 * 2. `usePrompts`라는 커스텀 훅을 정의합니다.
 * 3. 이 훅은 내부적으로 `useContext(PromptContext)`를 호출하여 context 값을 반환합니다.
 * 4. 이를 통해 컴포넌트에서는 `useContext`와 `PromptContext`를 직접 임포트할 필요 없이, 이 훅 하나만으로 context에 접근할 수 있게 됩니다.
 * 
 * @why_is_this_useful (왜 이렇게 할까요?)
 * - **추상화**: 컴포넌트는 `PromptContext`의 존재를 직접 알 필요가 없습니다. 그냥 `usePrompts` 훅을 사용하면 됩니다.
 * - **유지보수 용이성**: 만약 나중에 `PromptContext`의 로직이 변경되더라도, 이 훅 파일만 수정하면 됩니다. 훅을 사용하는 모든 컴포넌트를 수정할 필요가 없습니다.
 * - **코드 간결성**: `usePrompts()`는 `useContext(PromptContext)`보다 짧고 의미가 명확합니다.
 */

// React에서 `useContext` 훅을 가져옵니다. Context의 값을 사용하기 위해 필요합니다.
import { useContext } from 'react';
// 우리가 만든 `PromptContext`를 가져옵니다. 이 Context 객체가 데이터 저장소의 역할을 합니다.
import { PromptContext } from '../context/PromptContext';

// `usePrompts` 커스텀 훅을 정의하고 내보냅니다.
export const usePrompts = () => {
  // `useContext` 훅에 `PromptContext`를 전달하여, `PromptProvider`가 제공하는 `value` 객체를 가져옵니다.
  // 이 `value` 객체 안에는 `prompts` 데이터, `savePrompts` 함수, `isLoading` 상태 등이 들어있습니다.
  // 이 값을 그대로 반환합니다.
  return useContext(PromptContext);
};
