/**
 * @file PromptEditor.tsx
 * @description 이 파일은 각 AI 기능 페이지 내에서 사용되는 '프롬프트 설정' 컴포넌트입니다.
 * 사용자가 이 컴포넌트를 펼쳐서 해당 기능이 사용하는 AI 프롬프트를 직접 확인하고 수정할 수 있습니다.
 * 수정된 프롬프트는 '저장' 버튼을 통해 앱 전역 상태와 브라우저 저장소에 반영됩니다.
 * 아코디언(Accordion) 형태로 되어 있어 평소에는 접혀 있다가 필요할 때만 펼쳐볼 수 있습니다.
 */

// React와 필요한 기능, 컴포넌트, 훅들을 가져옵니다.
import React, { useState, useEffect } from 'react';
import { usePrompts } from '../hooks/usePrompts'; // 프롬프트 데이터에 접근하기 위한 커스텀 훅
import type { Prompts } from '../context/PromptContext'; // Prompts 데이터 타입
import { WrenchScrewdriverIcon, ChevronDownIcon } from './Icons'; // 아이콘

// PromptEditor 컴포넌트가 부모로부터 받을 데이터(props)의 타입을 정의합니다.
interface PromptEditorProps {
  promptKey: keyof Prompts; // 수정할 프롬프트의 키(key), 예: 'refine', 'translate'. `keyof Prompts`는 Prompts 타입의 키들 중 하나만 허용하도록 강제합니다.
  title: string; // 프롬프트 입력창 위에 표시될 제목
}

// PromptEditor 컴포넌트를 정의합니다.
const PromptEditor: React.FC<PromptEditorProps> = ({ promptKey, title }) => {
  // `usePrompts` 훅을 사용하여 전역 프롬프트 데이터와 관리 함수들을 가져옵니다.
  const { prompts, savePrompts, isLoading } = usePrompts();
  
  // `useState` 훅을 사용하여 이 컴포넌트 내부의 상태들을 관리합니다.
  // 1. `currentPrompt`: 현재 편집 중인 프롬프트 내용을 저장합니다.
  const [currentPrompt, setCurrentPrompt] = useState('');
  // 2. `isOpen`: 아코디언 메뉴가 펼쳐져 있는지 여부를 저장합니다.
  const [isOpen, setIsOpen] = useState(false);
  // 3. `showSuccess`: 저장 성공 메시지를 잠시 보여주기 위한 상태입니다.
  const [showSuccess, setShowSuccess] = useState(false);

  // `useEffect` 훅은 특정 값이 변경될 때마다 특정 작업을 수행하게 합니다.
  // 여기서는 전역 `prompts` 데이터가 로딩 완료되거나 변경될 때,
  // `currentPrompt` 상태를 해당 기능의 프롬프트 내용으로 업데이트합니다.
  useEffect(() => {
    // prompts 로딩이 끝난 후에만 실행합니다.
    if (!isLoading) {
      setCurrentPrompt(prompts[promptKey] || '');
    }
  }, [prompts, promptKey, isLoading]); // 의존성 배열: 이 배열 안의 값이 바뀔 때마다 effect 함수가 다시 실행됩니다.

  // '프롬프트 설정 저장' 버튼 클릭 시 실행될 함수입니다.
  const handleSave = () => {
    // `savePrompts` 함수를 호출하여 전역 상태와 localStorage를 업데이트합니다.
    // `...prompts`는 기존의 모든 프롬프트들을 복사하고, `[promptKey]: currentPrompt` 부분만 새 내용으로 덮어씁니다.
    savePrompts({ ...prompts, [promptKey]: currentPrompt });
    setShowSuccess(true); // 성공 메시지를 표시하고,
    setTimeout(() => setShowSuccess(false), 3000); // 3초 후에 자동으로 숨깁니다.
  };

  // 전역 프롬프트가 로딩 중일 때는 아무것도 렌더링하지 않습니다 (null 반환).
  if (isLoading) {
    return null;
  }

  // 컴포넌트가 화면에 그릴 내용을 JSX로 반환합니다.
  return (
    <div className="mb-8 bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
      {/* 아코디언 헤더. 클릭하면 isOpen 상태가 토글(true <-> false)됩니다. */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left"
        aria-expanded={isOpen} // 웹 접근성을 위해 현재 확장 상태를 스크린 리더에 알려줍니다.
        aria-controls={`prompt-editor-content-${String(promptKey)}`} // 이 버튼이 제어하는 콘텐츠 영역의 ID를 알려줍니다.
      >
        <div className="flex items-center gap-3">
          <WrenchScrewdriverIcon className="h-6 w-6 text-primary-500" />
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">프롬프트 설정</h2>
        </div>
        {/* isOpen 상태에 따라 아이콘이 회전하도록 클래스를 동적으로 적용합니다. */}
        <ChevronDownIcon className={`h-6 w-6 text-slate-500 dark:text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {/* isOpen이 true일 때만 아코디언 내용(콘텐츠)을 보여줍니다. */}
      {isOpen && (
        <div id={`prompt-editor-content-${String(promptKey)}`} className="p-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            이 기능에 사용되는 프롬프트를 직접 수정할 수 있습니다.
          </p>
          <div>
            <label htmlFor={`prompt-${String(promptKey)}`} className="block text-base font-medium text-slate-700 dark:text-slate-300 mb-2">
              {title}
            </label>
            <textarea
              id={`prompt-${String(promptKey)}`}
              value={currentPrompt} // textarea의 내용을 `currentPrompt` 상태와 동기화합니다.
              onChange={(e) => setCurrentPrompt(e.target.value)} // 내용이 변경되면 `currentPrompt` 상태를 업데이트합니다.
              rows={5}
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
            />
          </div>
          <div className="mt-4 flex items-center justify-end gap-4">
             {/* showSuccess가 true일 때만 저장 성공 메시지를 보여줍니다. */}
             {showSuccess && <div className="text-sm text-green-600 dark:text-green-400">저장되었습니다!</div>}
             <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition"
             >
                프롬프트 설정 저장
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptEditor;
