/**
 * @file ModelSelector.tsx
 * @description 이 파일은 사용자가 여러 Gemini AI 모델 중에서 하나를 선택할 수 있도록 해주는 드롭다운 메뉴 컴포넌트입니다.
 * 이 컴포넌트는 `useModel` 훅을 사용하여 전역적으로 관리되는 현재 선택된 모델 상태를 가져오고,
 * 사용자가 다른 모델을 선택하면 전역 상태를 업데이트하는 역할을 합니다.
 * 각 AI 기능 페이지에서 재사용되어 일관된 모델 선택 UI를 제공합니다.
 */

// React 라이브러리와 필요한 훅, 상수, 아이콘을 가져옵니다.
import React from 'react';
import { useModel } from '../hooks/useModel'; // 전역 모델 상태에 접근하기 위한 커스텀 훅
import { MODELS } from '../constants'; // 선택 가능한 모델 목록
import { QuestionMarkCircleIcon } from './Icons'; // 도움말 아이콘

// ModelSelector 컴포넌트를 정의합니다.
const ModelSelector: React.FC = () => {
    // `useModel` 훅을 호출하여 현재 선택된 모델(`selectedModel`)과
    // 모델을 변경하는 함수(`setSelectedModel`)를 가져옵니다.
    // 이 값들은 `ModelContext`로부터 제공됩니다.
    const { selectedModel, setSelectedModel } = useModel();

    // 컴포넌트가 화면에 그릴 내용을 JSX로 반환합니다.
    return (
        <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
                <label htmlFor="model-select" className="block text-base font-medium text-slate-700 dark:text-slate-300">
                    사용할 Gemini 모델 선택:
                </label>
                {/* 도움말 아이콘과 툴팁 */}
                <div className="group relative flex items-center">
                    <QuestionMarkCircleIcon className="h-5 w-5 text-slate-400 cursor-help" />
                    {/* 
                      마우스를 올렸을 때(group-hover) 나타나는 툴팁 메시지입니다.
                      평소에는 `opacity-0`으로 투명하게 숨겨져 있습니다.
                      `pointer-events-none`는 툴팁이 마우스 이벤트를 가로채지 않도록 합니다.
                    */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-slate-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                        Flash는 빠르고 경제적이며, Pro는 더 복잡한 작업에 적합합니다.
                    </div>
                </div>
            </div>
            {/* 모델 선택 드롭다운 메뉴(<select>)입니다. */}
            <select
                id="model-select"
                value={selectedModel} // 현재 선택된 모델을 드롭다운의 값으로 설정합니다.
                onChange={(e) => setSelectedModel(e.target.value)} // 사용자가 다른 옵션을 선택하면 `setSelectedModel` 함수를 호출하여 전역 모델 상태를 업데이트합니다.
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
            >
                {/* 
                  `MODELS` 배열을 순회(`map`)하면서 각 모델에 대한 `<option>` 태그를 생성합니다.
                  - `key`: React가 각 항목을 효율적으로 식별하고 업데이트하기 위한 고유한 값입니다.
                  - `value`: 옵션이 선택되었을 때 `e.target.value`가 될 실제 값입니다. (API 호출 시 사용될 모델 이름)
                  - `{model.name}`: 사용자에게 보여질 텍스트입니다. (예: "Gemini 2.5 Pro")
                */}
                {MODELS.map(model => (
                    <option key={model.value} value={model.value}>{model.name}</option>
                ))}
            </select>
        </div>
    );
};

// ModelSelector 컴포넌트를 다른 파일에서 사용할 수 있도록 내보냅니다.
export default ModelSelector;
