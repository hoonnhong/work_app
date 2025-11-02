/**
 * @file PromptEditorPage.tsx
 * @description 이 파일은 '프롬프트 편집기' 페이지 컴포넌트입니다.
 * 탭을 통해 '프롬프트 직접 편집'과 'AI 프롬프트 생성기' 두 가지 기능을 제공합니다.
 * '직접 편집'에서는 모든 AI 기능의 프롬프트를 수동으로 수정하고,
 * '생성기'에서는 AI를 이용해 새로운 프롬프트를 만들 수 있습니다.
 */

// React와 필요한 기능, 컴포넌트, 훅, 타입들을 가져옵니다.
import React, { useState, useEffect } from 'react';
import { ALL_NAV_LINKS } from '../constants';
import PageHeader from '../components/PageHeader';
import { usePrompts } from '../hooks/usePrompts';
import type { Prompts } from '../context/PromptContext';
import Loader from '../components/Loader';
import ModelSelector from '../components/ModelSelector';
import ResultDisplay from '../components/ResultDisplay';
import { useGemini } from '../hooks/useGemini';
import { generatePrompt } from '../services/geminiService';
import { useModel } from '../hooks/useModel';
import type { GeneratedPrompt } from '../types';
import { ClipboardDocumentIcon, CheckIcon } from '../components/Icons';


// 'AI 프롬프트 생성기' 탭의 컴포넌트
const PromptGenerator: React.FC = () => {
    // 폼 입력값을 관리하는 상태
    const [details, setDetails] = useState({
        request: '',
        variables: '',
        outputFormat: '',
    });
    const [copied, setCopied] = useState<'korean' | 'english' | null>(null);

    const { prompts } = usePrompts();
    const { selectedModel } = useModel();
    // AI 프롬프트 생성을 위한 `useGemini` 훅
    const { data, isLoading, error, execute } = useGemini<GeneratedPrompt>(generatePrompt);

    // 입력 필드 변경 핸들러
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setDetails({ ...details, [e.target.name]: e.target.value });
    };

    // 폼 제출 핸들러
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!details.request.trim()) {
            alert('프롬프트의 목표를 입력해주세요.');
            return;
        }
        execute(details, prompts.generatePrompt, selectedModel);
    };

    const handleCopy = (text: string, type: 'korean' | 'english') => {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            setCopied(type);
            setTimeout(() => setCopied(null), 2000); // Reset after 2 seconds
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('클립보드 복사에 실패했습니다.');
        });
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
            <ModelSelector />
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="request" className="block text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                        1. 프롬프트의 목표가 무엇인가요?
                    </label>
                    <textarea
                        id="request"
                        name="request"
                        value={details.request}
                        onChange={handleChange}
                        rows={4}
                        placeholder="예: 주어진 텍스트를 세 개의 핵심 불렛포인트로 요약하는 프롬프트"
                        className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-primary-500"
                    />
                </div>
                <div>
                    <label htmlFor="variables" className="block text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                        2. 프롬프트에 포함될 변수가 있나요? (선택)
                    </label>
                    <input
                        type="text"
                        id="variables"
                        name="variables"
                        value={details.variables}
                        onChange={handleChange}
                        placeholder="예: {text}, {tone}, {topic}"
                        className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-primary-500"
                    />
                </div>
                <div>
                    <label htmlFor="outputFormat" className="block text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                        3. 원하는 결과물 형식이 있나요? (선택)
                    </label>
                    <input
                        type="text"
                        id="outputFormat"
                        name="outputFormat"
                        value={details.outputFormat}
                        onChange={handleChange}
                        placeholder="예: JSON 형식, 마크다운 테이블, 간단한 문장"
                        className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-primary-500"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 disabled:bg-slate-400"
                >
                    {isLoading ? '생성 중...' : '프롬프트 생성'}
                </button>
            </form>
            
            { (isLoading || error || data) && (
                <div className="mt-6">
                    <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">생성된 프롬프트</h3>
                    <div className="min-h-[8rem] space-y-6">
                        {isLoading && <Loader />}
                        {error && <div className="text-red-500">{error}</div>}
                        {data && !isLoading && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Korean Prompt */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-semibold text-slate-600 dark:text-slate-300">한국어 프롬프트</h4>
                                        <button 
                                            onClick={() => handleCopy(data.korean, 'korean')}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                            aria-label="한국어 프롬프트 복사"
                                        >
                                            {copied === 'korean' ? (
                                                <>
                                                    <CheckIcon className="h-4 w-4 text-green-500" />
                                                    복사 완료!
                                                </>
                                            ) : (
                                                <>
                                                    <ClipboardDocumentIcon className="h-4 w-4" />
                                                    복사
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <pre className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-sm whitespace-pre-wrap font-sans leading-relaxed h-full">{data.korean}</pre>
                                </div>
                                {/* English Prompt */}
                                <div className="space-y-2">
                                     <div className="flex justify-between items-center">
                                        <h4 className="font-semibold text-slate-600 dark:text-slate-300">English Prompt</h4>
                                        <button 
                                            onClick={() => handleCopy(data.english, 'english')}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                            aria-label="English prompt copy"
                                        >
                                            {copied === 'english' ? (
                                                <>
                                                    <CheckIcon className="h-4 w-4 text-green-500" />
                                                    Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <ClipboardDocumentIcon className="h-4 w-4" />
                                                    Copy
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <pre className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-sm whitespace-pre-wrap font-sans leading-relaxed h-full">{data.english}</pre>
                                </div>
                            </div>
                        )}
                        {!isLoading && !error && !data && (
                            <p className="text-slate-400 dark:text-slate-500 text-center py-10">
                                결과가 여기에 표시됩니다.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// '프롬프트 직접 편집' 탭의 컴포넌트
const PromptManualEditor: React.FC = () => {
    const { prompts, savePrompts, isLoading } = usePrompts();
    const [selectedPromptKey, setSelectedPromptKey] = useState<keyof Prompts | ''>('');
    const [editablePrompt, setEditablePrompt] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const promptLabels: Record<keyof Prompts, string> = {
        refine: '문장 다듬기',
        spellCheck: '맞춤법 검사',
        compare: '단어 비교',
        translate: '번역',
        aiCalculator: 'AI 계산기',
        announcement: '안내 문자 생성',
        newsBriefing: '뉴스브리핑',
        wordDefinition: '단어 뜻풀이',
        findWords: '단어 추천',
        generatePrompt: 'AI 프롬프트 생성기'
    };

    // 드롭다운에서 프롬프트 선택 시 실행
    const handleSelectPrompt = (key: keyof Prompts | '') => {
        setSelectedPromptKey(key);
        if (key) {
            setEditablePrompt(prompts[key] || '');
        } else {
            setEditablePrompt('');
        }
    };

    const handleChange = (value: string) => {
        setEditablePrompt(value);
    };

    const handleSave = () => {
        if (selectedPromptKey && editablePrompt) {
            savePrompts({ ...prompts, [selectedPromptKey]: editablePrompt });
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader /></div>;
    }

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
            <div className="space-y-6">
                {/* 프롬프트 선택 드롭다운 */}
                <div>
                    <label htmlFor="prompt-select" className="block text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                        편집할 프롬프트 선택
                    </label>
                    <select
                        id="prompt-select"
                        value={selectedPromptKey}
                        onChange={(e) => handleSelectPrompt(e.target.value as keyof Prompts | '')}
                        className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 transition"
                    >
                        <option value="">프롬프트를 선택하세요</option>
                        {(Object.keys(prompts) as Array<keyof Prompts>).map((key) => (
                            <option key={key} value={key}>
                                {promptLabels[key] || key}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 선택된 프롬프트 편집 영역 */}
                {selectedPromptKey && (
                    <div>
                        <label htmlFor="prompt-editor" className="block text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {promptLabels[selectedPromptKey] || selectedPromptKey} 프롬프트
                        </label>
                        <textarea
                            id="prompt-editor"
                            value={editablePrompt}
                            onChange={(e) => handleChange(e.target.value)}
                            rows={12}
                            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 transition font-mono text-sm"
                            placeholder="프롬프트 내용이 여기에 표시됩니다..."
                        />
                    </div>
                )}
            </div>

            {/* 저장 버튼 */}
            {selectedPromptKey && (
                <div className="mt-6 flex items-center justify-end gap-4">
                    {showSuccess && <div className="text-sm text-green-600 dark:text-green-400">저장되었습니다!</div>}
                    <button
                        onClick={handleSave}
                        className="px-6 py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition"
                    >
                        프롬프트 저장
                    </button>
                </div>
            )}
        </div>
    );
};


const PromptEditorPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'edit' | 'generate'>('edit');
    
    const tabs = [
        { id: 'edit', name: '프롬프트 직접 편집' },
        { id: 'generate', name: 'AI 프롬프트 생성기' }
    ];

    return (
        <div>
            <PageHeader
                title={ALL_NAV_LINKS.prompts.name}
                subtitle="각 기능에서 사용하는 AI 프롬프트를 한 곳에서 관리하세요."
                icon={ALL_NAV_LINKS.prompts.icon}
            />

            <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as 'edit' | 'generate')}
                            className={`${
                                activeTab === tab.id
                                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-500'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            {activeTab === 'edit' && <PromptManualEditor />}
            {activeTab === 'generate' && <PromptGenerator />}
        </div>
    );
};

export default PromptEditorPage;