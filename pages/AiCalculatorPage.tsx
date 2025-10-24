/**
 * @file AiCalculatorPage.tsx
 * @description 이 파일은 'AI 계산기' 페이지 컴포넌트입니다.
 * 사용자가 자연어(일상적인 말)나 수학적 표현으로 질문을 입력하면,
 * Gemini AI가 이를 해석하여 계산 결과를 알려주고 풀이 과정까지 설명해주는 기능을 제공합니다.
 */

// React와 필요한 컴포넌트, 훅, 서비스들을 가져옵니다.
import React, { useState, useMemo } from 'react';
import { ALL_NAV_LINKS } from '../constants'; // 내비게이션 링크 상수
import { useGemini } from '../hooks/useGemini'; // Gemini API 호출용 커스텀 훅
import { calculateExpression } from '../services/geminiService'; // AI 계산 API 함수
import PageHeader from '../components/PageHeader'; // 페이지 상단 제목 컴포넌트
import { usePrompts } from '../hooks/usePrompts'; // 프롬프트 관리용 커스텀 훅
import PromptEditor from '../components/PromptEditor'; // 프롬프트 수정 컴포넌트
import ModelSelector from '../components/ModelSelector'; // AI 모델 선택 컴포넌트
import { useModel } from '../hooks/useModel'; // AI 모델 관리용 커스텀 훅
import Loader from '../components/Loader'; // 로딩 스피너
import { ExclamationTriangleIcon, ChevronDownIcon } from '../components/Icons'; // 아이콘
import MarkdownRenderer from '../components/MarkdownRenderer'; // 마크다운 렌더링 컴포넌트

// AiCalculatorPage 컴포넌트를 정의합니다.
const AiCalculatorPage: React.FC = () => {
  // `useState` 훅을 사용하여 상태(state)를 관리합니다.
  // 1. `expression`: 사용자가 입력한 계산식을 저장하는 상태입니다.
  const [expression, setExpression] = useState('');
  // 2. `isExplanationVisible`: 풀이 과정 설명이 보이는지 여부를 저장하는 상태입니다.
  const [isExplanationVisible, setIsExplanationVisible] = useState(false);
  
  // 커스텀 훅을 사용하여 필요한 데이터와 함수를 가져옵니다.
  const { prompts } = usePrompts(); // 전역 프롬프트
  const { selectedModel } = useModel(); // 전역으로 선택된 AI 모델
  // `useGemini` 훅을 사용하여 AI 계산 API(calculateExpression) 호출과 관련된 상태(data, isLoading, error)와 실행 함수(execute)를 가져옵니다.
  const { data, isLoading, error, execute } = useGemini<string>(calculateExpression);

  // '계산하기' 버튼 클릭 시 실행될 함수입니다.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // 폼의 기본 동작(페이지 새로고침)을 막습니다.
    if (!expression.trim()) return; // 입력값이 없으면 아무것도 하지 않습니다.
    setIsExplanationVisible(false); // 새로운 계산을 시작할 때 이전 풀이 과정은 숨깁니다.
    // `useGemini` 훅에서 받은 `execute` 함수를 호출하여 API 요청을 보냅니다.
    execute(expression, prompts.aiCalculator, selectedModel);
  };

  // `useMemo` 훅은 계산 비용이 큰 함수의 결과값을 기억(memoization)해두고,
  // 의존성 배열(`[data]`)의 값이 변경될 때만 함수를 다시 실행합니다.
  // 여기서는 AI 응답 데이터(`data`)가 바뀔 때만 응답 텍스트를 파싱하여 '결과'와 '풀이'로 나눕니다.
  // 이렇게 하면 불필요한 리렌더링 시에 파싱 로직이 반복 실행되는 것을 막아 성능을 최적화할 수 있습니다.
  const parsedData = useMemo(() => {
    if (!data) return { result: null, explanation: null }; // 데이터가 없으면 null 반환
    
    // 정규 표현식을 사용하여 응답 텍스트에서 '결과:'와 '풀이:' 부분을 찾습니다.
    const resultMatch = data.match(/결과:([\s\S]*?)(풀이:|$)/);
    const explanationMatch = data.match(/풀이:([\s\S]*)/);
    
    // 찾은 텍스트의 앞뒤 공백을 제거합니다.
    const resultText = resultMatch ? resultMatch[1].trim() : data;
    const explanationText = explanationMatch ? explanationMatch[1].trim() : null;

    // 만약 '결과'나 '풀이' 패턴을 찾지 못했다면, 전체 응답을 결과로 간주합니다.
    if (!resultMatch && !explanationMatch) {
      return { result: data, explanation: null };
    }

    // 파싱된 결과와 풀이를 객체 형태로 반환합니다.
    return {
      result: resultText,
      explanation: explanationText
    };
  }, [data]); // `data` 상태가 변경될 때만 이 memoized 값을 다시 계산합니다.

  return (
    <div>
      <PageHeader
        title={ALL_NAV_LINKS.aiCalculator.name}
        subtitle="자연어를 사용하여 수학 문제를 풀고 단계별 설명을 확인하세요."
        icon={ALL_NAV_LINKS.aiCalculator.icon}
      />

      <PromptEditor
        promptKey="aiCalculator"
        title="AI 계산기 프롬프트"
      />

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
        <ModelSelector />
        <form onSubmit={handleSubmit}>
          <label htmlFor="expression-input" className="block text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
            계산할 내용을 입력하세요
          </label>
          <input
            id="expression-input"
            type="text"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            placeholder="예: 5kg의 15%는 얼마인가요? 또는 sqrt(27) * 3"
            className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
          />
          <button
            type="submit"
            disabled={isLoading || !expression.trim()}
            className="mt-4 w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition"
          >
            {isLoading ? '계산 중...' : '계산하기'}
          </button>
        </form>
      </div>
      
      {/* 로딩 중이거나, 에러가 발생했거나, 데이터가 있을 때만 결과 섹션을 보여줍니다. (조건부 렌더링) */}
      { (isLoading || error || data) && (
        <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-300">계산 결과</h3>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md min-h-[8rem] border border-slate-200 dark:border-slate-700">
                {isLoading && <Loader />}
                {error && (
                    <div className="text-red-500 flex items-center gap-2">
                        <ExclamationTriangleIcon className="h-5 w-5" />
                        <span>{error}</span>
                    </div>
                )}
                {/* 데이터가 있고, 로딩이 끝났고, 파싱된 결과가 있을 때 결과를 보여줍니다. */}
                {data && !isLoading && parsedData.result && (
                     <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-center">
                         <div className="text-3xl font-bold text-primary-700 dark:text-primary-300">
                             {/* 결과에 포함된 LaTeX 수학 공식을 렌더링하기 위해 MarkdownRenderer를 사용합니다. */}
                             <MarkdownRenderer content={parsedData.result} />
                         </div>
                     </div>
                )}
                {/* 초기 상태일 때 안내 메시지를 보여줍니다. */}
                {!isLoading && !error && !data && (
                    <p className="text-slate-400 dark:text-slate-500 text-center py-10">
                        결과가 여기에 표시됩니다.
                    </p>
                )}
            </div>

            {/* 데이터가 있고, 로딩이 끝났고, 파싱된 풀이가 있을 때 '풀이 과정 보기' 섹션(아코디언)을 보여줍니다. */}
            {data && !isLoading && parsedData.explanation && (
              <div className="mt-4 bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
                <button
                  // 클릭하면 풀이 과정의 보임/숨김 상태(`isExplanationVisible`)를 토글합니다.
                  onClick={() => setIsExplanationVisible(!isExplanationVisible)}
                  className="w-full cursor-pointer font-semibold text-slate-600 dark:text-slate-400 p-4 flex justify-between items-center"
                >
                  <span>풀이 과정 보기</span>
                  {/* 상태에 따라 아이콘이 회전합니다. */}
                  <ChevronDownIcon className={`h-5 w-5 transition-transform ${isExplanationVisible ? 'rotate-180' : ''}`} />
                </button>
                {/* 풀이 과정 내용을 담는 div. max-height를 조절하여 부드러운 애니메이션 효과를 줍니다. */}
                <div
                  className={`transition-[max-height] duration-500 ease-in-out ${isExplanationVisible ? 'max-h-[1000px]' : 'max-h-0'}`}
                >
                  <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                    <MarkdownRenderer content={parsedData.explanation} />
                  </div>
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default AiCalculatorPage;
