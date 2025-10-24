/**
 * @file ResultDisplay.tsx
 * @description 이 파일은 AI의 응답 결과를 사용자에게 보여주는 공통 컴포넌트입니다.
 * API 호출의 세 가지 주요 상태(로딩 중, 에러 발생, 데이터 수신 완료)에 따라
 * 각각 다른 화면(로딩 스피너, 에러 메시지, 결과 데이터)을 조건부로 렌더링합니다.
 * 이 컴포넌트를 재사용함으로써 여러 페이지에서 일관된 결과 표시 UI를 쉽게 구현할 수 있습니다.
 * 
 * @summary
 * 1. 부모 컴포넌트로부터 `isLoading`, `error`, `data`, `title`, `actions`를 props로 받습니다.
 * 2. `isLoading`이 true이면 `Loader` 컴포넌트를 보여줍니다.
 * 3. `error`에 값이 있으면 에러 메시지를 보여줍니다.
 * 4. `data`에 값이 있고 로딩 중이 아니면 `MarkdownRenderer`를 통해 결과를 보여줍니다.
 * 5. 모든 조건이 false이면 (초기 상태) 기본 안내 메시지를 보여줍니다.
 */

// React 라이브러리와 필요한 컴포넌트들을 가져옵니다.
import React from 'react';
import Loader from './Loader'; // 로딩 스피너 컴포넌트
import MarkdownRenderer from './MarkdownRenderer'; // 마크다운 렌더링 컴포넌트
import { ExclamationTriangleIcon } from './Icons'; // 에러 아이콘

// ResultDisplay 컴포넌트가 부모로부터 받을 데이터(props)의 타입을 정의합니다.
interface ResultDisplayProps {
  isLoading: boolean;     // 로딩 중인지 여부 (true/false)
  error: string | null;   // 에러 메시지 (에러가 없으면 null)
  data: string | null;    // 성공적으로 받아온 데이터 (데이터가 없으면 null)
  title?: string;         // 결과 창의 제목 (선택 사항, ?는 optional을 의미)
  actions?: React.ReactNode; // 제목 옆에 표시될 추가적인 UI 요소 (예: 버튼). ReactNode는 모든 렌더링 가능한 요소를 의미합니다.
}

// ResultDisplay 컴포넌트를 정의합니다.
// props의 기본값 설정을 통해 title이 전달되지 않으면 "결과"를 사용하도록 합니다. (title = "결과")
const ResultDisplay: React.FC<ResultDisplayProps> = ({ isLoading, error, data, title = "결과", actions }) => {
  // 컴포넌트가 화면에 그릴 내용을 JSX로 반환합니다.
  return (
    // 결과 표시 영역 전체를 감싸는 div
    <div className="mt-6">
      {/* 결과 창의 제목과 추가 UI(actions)를 담는 컨테이너 */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">{title}</h3>
        {actions}
      </div>
      {/* 실제 내용이 표시될 흰색 박스 */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md min-h-[8rem] sm:min-h-[10rem] border border-slate-200 dark:border-slate-700">
        
        {/* 
          조건부 렌더링(Conditional Rendering): 특정 조건이 참일 때만 UI의 일부를 렌더링하는 기법입니다.
          여기서는 `&&` 연산자를 사용하여, 왼쪽 조건이 true이면 오른쪽의 JSX를 렌더링합니다.
        */}
        
        {/* isLoading이 true이면 Loader 컴포넌트를 보여줍니다. */}
        {isLoading && <Loader />}
        
        {/* error에 메시지가 있으면 에러 메시지를 보여줍니다. */}
        {error && (
          <div className="text-red-500 flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}
        
        {/* data가 있고, 로딩 중이 아닐 때만 MarkdownRenderer로 데이터를 보여줍니다. */}
        {data && !isLoading && <MarkdownRenderer content={data} />}
        
        {/* 로딩 중도 아니고, 에러도 없고, 데이터도 없을 때 (초기 상태) 안내 메시지를 보여줍니다. */}
        {!isLoading && !error && !data && (
          <p className="text-slate-400 dark:text-slate-500 text-center py-10">
            결과가 여기에 표시됩니다.
          </p>
        )}
      </div>
    </div>
  );
};

// ResultDisplay 컴포넌트를 다른 파일에서 사용할 수 있도록 내보냅니다.
export default ResultDisplay;
