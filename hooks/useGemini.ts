/**
 * @file useGemini.ts
 * @description 이 파일은 Gemini API를 호출하는 과정을 더 쉽고 편리하게 만들어주는 '커스텀 훅(Custom Hook)'입니다.
 * 훅(Hook)은 React에서 상태 관리나 생명주기 같은 기능들을 함수 컴포넌트에서 사용할 수 있게 해주는 특별한 함수입니다.
 * 이 `useGemini` 훅을 사용하면 API를 호출할 때마다 반복적으로 작성해야 하는 로딩 상태, 데이터 저장, 에러 처리 코드를
 * 한 번에 관리할 수 있어 코드가 훨씬 깔끔해지고 재사용성이 높아집니다.
 * 
 * @summary
 * 1. API 호출과 관련된 세 가지 상태(data, isLoading, error)를 `useState`로 관리합니다.
 * 2. API를 실제로 실행하는 `execute` 함수를 `useCallback`으로 최적화하여 제공합니다.
 * 3. `execute` 함수가 호출되면 로딩 상태를 true로 바꾸고, API 호출 후 결과에 따라 data 또는 error 상태를 업데이트하며, 마지막에 로딩 상태를 false로 변경합니다.
 * 4. 이 모든 상태와 실행 함수를 객체 형태로 반환하여 컴포넌트에서 쉽게 사용할 수 있게 합니다.
 */

// React에서 'useState'와 'useCallback' 훅을 가져옵니다.
import { useState, useCallback } from 'react';

// API 함수의 타입을 정의합니다. 어떤 인자(`...args: any[]`)든 받을 수 있고, Promise(`Promise<T>`)를 반환하는 함수라는 의미입니다.
// 여기서 `T`는 제네릭(Generic) 타입으로, 이 훅을 사용할 때 결정되는 데이터의 타입을 의미합니다. (예: string, RefinedTextResult 등)
type GeminiApiFunction<T> = (...args: any[]) => Promise<T>;

// `useGemini`라는 커스텀 훅을 정의하고 내보냅니다.
// 이 훅은 Gemini API를 호출하는 함수(apiFunc)를 인자로 받습니다.
export const useGemini = <T,>(apiFunc: GeminiApiFunction<T>) => {
  // `useState`를 사용하여 세 가지 상태를 만듭니다.
  // 1. `data`: API 호출이 성공했을 때 받아온 데이터를 저장하는 상태입니다. 처음에는 비어있습니다(null).
  const [data, setData] = useState<T | null>(null);
  // 2. `isLoading`: API를 호출하고 응답을 기다리는 동안 `true`가 되는 상태입니다. 로딩 아이콘을 보여줄 때 사용합니다.
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // 3. `error`: API 호출 중 오류가 발생했을 때 에러 메시지를 저장하는 상태입니다.
  const [error, setError] = useState<string | null>(null);

  // `execute` 함수는 실제로 API 호출을 실행하는 역할을 합니다.
  // `useCallback`으로 이 함수를 감싸주면, 의존성 배열(`[apiFunc]`)의 값이 변경되지 않는 한 함수를 새로 만들지 않아 불필요한 렌더링을 막아줍니다.
  // 이는 성능 최적화에 도움이 됩니다.
  const execute = useCallback(async (...args: any[]) => {
    // API 호출을 시작하기 전에 상태를 초기화합니다.
    setIsLoading(true);  // 로딩 시작
    setError(null);      // 이전 에러 메시지 초기화
    setData(null);       // 이전 데이터 초기화

    // `try...catch...finally` 블록으로 API 호출 중 발생할 수 있는 오류를 안전하게 처리합니다.
    try {
      // 인자로 받은 `apiFunc`를 실행하고, `await`를 사용해 결과가 올 때까지 기다립니다.
      // `...args`는 execute 함수로 전달된 모든 인자를 그대로 apiFunc에 전달하는 문법입니다.
      const result = await apiFunc(...args);
      // 성공적으로 데이터를 받으면 `data` 상태에 저장합니다.
      setData(result);
    } catch (e) {
      // 오류가 발생하면, 에러 객체에서 메시지를 추출하여 `error` 상태에 저장합니다.
      let errorMessage = '알 수 없는 오류가 발생했습니다.';
      if (e instanceof Error) {
        errorMessage = e.message;
      } else if (typeof e === 'string') {
        errorMessage = e;
      } else if (e && typeof e === 'object') {
        // 객체인 경우 message 속성이 있는지 확인
        errorMessage = (e as any).message || JSON.stringify(e);
      }
      setError(errorMessage);
    } finally {
      // API 호출이 성공하든 실패하든, 마지막에는 항상 로딩 상태를 끝냅니다.
      setIsLoading(false);
    }
  }, [apiFunc]); // `apiFunc`가 바뀔 때만 이 함수를 새로 생성합니다.

  // 훅의 최종 결과물로, 관리하고 있는 상태들(data, isLoading, error)과 실행 함수(execute)를 객체 형태로 반환합니다.
  // 이렇게 반환된 값들을 사용하는 컴포넌트에서 편리하게 꺼내 쓸 수 있습니다.
  return { data, isLoading, error, execute };
};
