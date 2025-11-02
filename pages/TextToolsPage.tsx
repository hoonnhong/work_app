/**
 * @file TextToolsPage.tsx
 * @description 이 파일은 '글쓰기 도우미' 페이지 컴포넌트입니다.
 * 문장 다듬기, 맞춤법 검사, 단어 비교, 번역 등 여러 글쓰기 관련 AI 도구들을
 * 탭(Tab) 형태로 제공하여 사용자가 쉽게 전환하며 사용할 수 있도록 합니다.
 */

// React와 필요한 컴포넌트, 훅, 서비스, 타입들을 가져옵니다.
import React, { useState } from 'react';
import { ALL_NAV_LINKS } from '../constants';
import { useGemini } from '../hooks/useGemini';
import { refineText, spellCheck, compareWords, translateText, getWordDefinition, findWordsForDescription } from '../services/geminiService';
import PageHeader from '../components/PageHeader';
import ResultDisplay from '../components/ResultDisplay';
import { usePrompts } from '../hooks/usePrompts';
import PromptEditor from '../components/PromptEditor';
import ModelSelector from '../components/ModelSelector';
import { useModel } from '../hooks/useModel';
import type { RefinedTextResult, SpellCheckResult } from '../types';
import Loader from '../components/Loader';
import { ExclamationTriangleIcon } from '../components/Icons';
import MarkdownRenderer from '../components/MarkdownRenderer';

// 사용 가능한 도구들의 타입을 정의합니다.
type Tool = 'refine' | 'spellCheck' | 'compare' | 'translate' | 'wordFinder';

// TextToolsPage 메인 컴포넌트
const TextToolsPage: React.FC = () => {
  // 현재 활성화된 탭(도구)을 관리하는 상태입니다. 기본값은 '문장 다듬기'입니다.
  const [activeTool, setActiveTool] = useState<Tool>('refine');

  // `activeTool` 상태에 따라 해당 도구의 컴포넌트를 렌더링하는 함수입니다.
  const renderTool = () => {
    switch (activeTool) {
      case 'refine':
        return <RefineTextTool />;
      case 'spellCheck':
        return <SpellCheckTool />;
      case 'wordFinder':
        return <WordFinderTool />;
      case 'compare':
        return <CompareWordsTool />;
      case 'translate':
        return <TranslateTool />;
      default:
        return null;
    }
  };

  // 탭 메뉴에 표시될 정보 배열
  const toolTabs: { id: Tool; name: string }[] = [
    { id: 'refine', name: '문장 다듬기' },
    { id: 'spellCheck', name: '맞춤법 검사' },
    { id: 'wordFinder', name: '단어 찾기' },
    { id: 'compare', name: '단어 비교' },
    { id: 'translate', name: '번역' },
  ];

  return (
    <div>
      <PageHeader
        title={ALL_NAV_LINKS.textTools.name}
        subtitle="AI의 도움으로 글쓰기 실력을 향상시키세요."
        icon={ALL_NAV_LINKS.textTools.icon}
      />
      
      {/* 탭 네비게이션 */}
      <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
          {toolTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTool(tab.id)}
              className={`${
                activeTool === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-500'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* 현재 활성화된 도구 컴포넌트 렌더링 */}
      {renderTool()}
    </div>
  );
};

//--- 각 도구별 서브 컴포넌트들 ---

// 1. 문장 다듬기 도구
const RefineTextTool: React.FC = () => {
  const [text, setText] = useState('');
  const [tone, setTone] = useState('전문적으로');
  const [customTone, setCustomTone] = useState('');
  const [exampleText, setExampleText] = useState('');
  const [useCustomTone, setUseCustomTone] = useState(false);
  const { prompts } = usePrompts();
  const { selectedModel } = useModel();
  const { data, isLoading, error, execute } = useGemini<RefinedTextResult>(refineText);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const finalTone = useCustomTone ? customTone : tone;
    execute(text, finalTone, exampleText, prompts.refine, selectedModel);
  };

  const presetTones = ['전문적으로', '친근하게', '간결하게', '설득력 있게'];

  return (
    <div>
        <PromptEditor promptKey="refine" title="문장 다듬기 프롬프트" />
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
            <ModelSelector />
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">다듬고 싶은 문장</label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="다듬고 싶은 문장을 입력하세요."
                            rows={5}
                            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">톤/스타일</label>
                        <div className="flex items-center gap-2 mb-2">
                            <button
                                type="button"
                                onClick={() => setUseCustomTone(false)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium ${!useCustomTone ? 'bg-primary-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
                            >
                                프리셋
                            </button>
                            <button
                                type="button"
                                onClick={() => setUseCustomTone(true)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium ${useCustomTone ? 'bg-primary-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
                            >
                                직접 입력
                            </button>
                        </div>
                        {!useCustomTone ? (
                            <select
                                value={tone}
                                onChange={(e) => setTone(e.target.value)}
                                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700"
                            >
                                {presetTones.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        ) : (
                            <input
                                type="text"
                                value={customTone}
                                onChange={(e) => setCustomTone(e.target.value)}
                                placeholder="예: 공손하면서도 전문적으로, 유머러스하게"
                                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-primary-500"
                            />
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            예시 글 (선택사항)
                            <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">이 스타일을 참고하여 다듬습니다</span>
                        </label>
                        <textarea
                            value={exampleText}
                            onChange={(e) => setExampleText(e.target.value)}
                            placeholder="참고할 글의 예시를 입력하세요. (비워두면 톤만 적용)"
                            rows={3}
                            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>

                <div className="mt-4">
                    <button type="submit" disabled={isLoading} className="w-full sm:w-auto px-6 py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 disabled:bg-slate-400">
                        {isLoading ? '실행 중...' : '다듬기 실행'}
                    </button>
                </div>
            </form>
        </div>
        <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">결과</h3>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md min-h-[10rem] border border-slate-200 dark:border-slate-700">
                {isLoading && <Loader />}
                {error && <div className="text-red-500 flex items-center gap-2"><ExclamationTriangleIcon className="h-5 w-5" /><span>{error}</span></div>}
                {data && !isLoading && (
                  <div>
                      <h4 className="font-semibold mb-2">추천 문장:</h4>
                      <ul className="space-y-3">
                          {data.recommendations.map((rec, index) => (
                              <li key={index} className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                <MarkdownRenderer content={rec} />
                              </li>
                          ))}
                      </ul>
                      <h4 className="font-semibold mt-4 mb-2">수정 방향 설명:</h4>
                      <p>{data.explanation}</p>
                  </div>
                )}
                 {!isLoading && !error && !data && <p className="text-slate-400 dark:text-slate-500 text-center py-10">결과가 여기에 표시됩니다.</p>}
            </div>
        </div>
    </div>
  );
};

// 2. 맞춤법 검사 도구
const SpellCheckTool: React.FC = () => {
    const [text, setText] = useState('');
    const { prompts } = usePrompts();
    const { selectedModel } = useModel();
    const { data, isLoading, error, execute } = useGemini<SpellCheckResult>(spellCheck);
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!text.trim()) return;
      execute(text, prompts.spellCheck, selectedModel);
    };
  
    return (
      <div>
          <PromptEditor promptKey="spellCheck" title="맞춤법 검사 프롬프트" />
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
              <ModelSelector />
              <form onSubmit={handleSubmit}>
                  <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="맞춤법을 검사할 문장을 입력하세요."
                      rows={5}
                      className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-primary-500"
                  />
                  <div className="mt-4">
                      <button type="submit" disabled={isLoading} className="w-full sm:w-auto px-6 py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 disabled:bg-slate-400">
                          {isLoading ? '검사 중...' : '맞춤법 검사'}
                      </button>
                  </div>
              </form>
          </div>
          <div className="mt-6">
              <h3 className="text-xl font-semibold mb-4">결과</h3>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md min-h-[10rem] border border-slate-200 dark:border-slate-700">
                  {isLoading && <Loader />}
                  {error && <div className="text-red-500 flex items-center gap-2"><ExclamationTriangleIcon className="h-5 w-5" /><span>{error}</span></div>}
                  {data && !isLoading && (
                      <div>
                          <h4 className="font-semibold mb-2">교정된 텍스트:</h4>
                          <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                            <MarkdownRenderer content={data.checkedText} />
                          </div>
                          <h4 className="font-semibold mt-4 mb-2">수정 제안:</h4>
                          <ul className="space-y-2">
                            {Array.isArray(data.corrections) && data.corrections.map((c, i) => (
                              <li key={i} className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                                <p><span className="line-through text-red-500">{c.original}</span> → <span className="font-semibold text-green-600">{c.corrected}</span></p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{c.explanation}</p>
                              </li>
                            ))}
                          </ul>
                      </div>
                  )}
                   {!isLoading && !error && !data && <p className="text-slate-400 dark:text-slate-500 text-center py-10">결과가 여기에 표시됩니다.</p>}
              </div>
          </div>
      </div>
    );
};

// 3. 단어 찾기 도구
const WordFinderTool: React.FC = () => {
  type SubTool = 'definition' | 'recommendation';
  const [activeSubTool, setActiveSubTool] = useState<SubTool>('definition');
  
  const subToolTabs = [
    { id: 'definition', name: '단어 뜻풀이' },
    { id: 'recommendation', name: '단어 추천' }
  ];

  return (
    <div>
      <PromptEditor 
        promptKey={activeSubTool === 'definition' ? 'wordDefinition' : 'findWords'}
        title={activeSubTool === 'definition' ? '단어 뜻풀이 프롬프트' : '단어 추천 프롬프트'}
      />
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
        <ModelSelector />
        <div className="flex border-b border-slate-200 dark:border-slate-700 mb-4">
          {subToolTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTool(tab.id as SubTool)}
              className={`-mb-px py-2 px-4 text-sm font-medium border-b-2 ${
                activeSubTool === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
        {activeSubTool === 'definition' ? <WordDefinition /> : <WordRecommendation />}
      </div>
    </div>
  );
};

const WordDefinition: React.FC = () => {
  const [word, setWord] = useState('');
  const { prompts } = usePrompts();
  const { selectedModel } = useModel();
  const { data, isLoading, error, execute } = useGemini<string>(getWordDefinition);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim()) return;
    execute(word, prompts.wordDefinition, selectedModel);
  };
  
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={word}
          onChange={e => setWord(e.target.value)}
          placeholder="뜻이 궁금한 단어를 입력하세요"
          className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-primary-500"
        />
        <div className="mt-4">
          <button type="submit" disabled={isLoading} className="w-full sm:w-auto px-6 py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 disabled:bg-slate-400">
            {isLoading ? '검색 중...' : '뜻풀이 검색'}
          </button>
        </div>
      </form>
      <ResultDisplay isLoading={isLoading} error={error} data={data} title="단어 뜻풀이 결과" />
    </div>
  );
};

const WordRecommendation: React.FC = () => {
  const [description, setDescription] = useState('');
  const { prompts } = usePrompts();
  const { selectedModel } = useModel();
  const { data, isLoading, error, execute } = useGemini<string>(findWordsForDescription);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    execute(description, prompts.findWords, selectedModel);
  };
  
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="찾고 싶은 단어나 표현을 자유롭게 묘사해주세요. (예: '오랫동안 해결되지 않던 문제가 마침내 풀렸을 때의 시원한 느낌')"
          rows={5}
          className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-primary-500"
        />
        <div className="mt-4">
          <button type="submit" disabled={isLoading} className="w-full sm:w-auto px-6 py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 disabled:bg-slate-400">
            {isLoading ? '추천 찾는 중...' : '단어 추천받기'}
          </button>
        </div>
      </form>
      <ResultDisplay isLoading={isLoading} error={error} data={data} title="추천 단어" />
    </div>
  );
};

// 4. 단어 비교 도구
const CompareWordsTool: React.FC = () => {
    const [wordsInput, setWordsInput] = useState('');
    const { prompts } = usePrompts();
    const { selectedModel } = useModel();
    const { data, isLoading, error, execute } = useGemini<string>(compareWords);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!wordsInput.trim()) return;

      // 쉼표로 구분하여 단어 배열 생성 (공백 제거)
      const words = wordsInput.split(',').map(w => w.trim()).filter(w => w.length > 0);

      if (words.length < 2) {
        alert('비교할 단어를 최소 2개 이상 입력해주세요.');
        return;
      }

      execute(words, prompts.compare, selectedModel);
    };

    return (
      <div>
          <PromptEditor promptKey="compare" title="단어 비교 프롬프트" />
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
              <ModelSelector />
              <form onSubmit={handleSubmit}>
                  <div className="space-y-2">
                      <input
                          type="text"
                          value={wordsInput}
                          onChange={e => setWordsInput(e.target.value)}
                          placeholder="비교할 단어들을 쉼표(,)로 구분하여 입력하세요. (예: 사과, 배, 귤)"
                          className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-primary-500"
                      />
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                          💡 2개 이상의 단어를 쉼표로 구분하여 입력하세요
                      </p>
                  </div>
                  <div className="mt-4">
                      <button type="submit" disabled={isLoading} className="w-full sm:w-auto px-6 py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 disabled:bg-slate-400">
                          {isLoading ? '비교 중...' : '단어 비교'}
                      </button>
                  </div>
              </form>
          </div>
          <ResultDisplay isLoading={isLoading} error={error} data={data} title="비교 결과" />
      </div>
    );
};

// 5. 번역 도구
const TranslateTool: React.FC = () => {
    const [text, setText] = useState('');
    const [targetLanguage, setTargetLanguage] = useState('English');
    const { prompts } = usePrompts();
    const { selectedModel } = useModel();
    const { data, isLoading, error, execute } = useGemini<string>(translateText);
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!text.trim()) return;
      execute(text, targetLanguage, prompts.translate, selectedModel);
    };
  
    return (
      <div>
          <PromptEditor promptKey="translate" title="번역 프롬프트" />
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
              <ModelSelector />
              <form onSubmit={handleSubmit}>
                  <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="번역할 내용을 입력하세요."
                      rows={5}
                      className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-primary-500"
                  />
                  <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
                      <select value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)} className="w-full sm:w-auto p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700">
                          <option>한국어</option>
                          <option>English</option>
                          <option>日本語</option>
                          <option>中文</option>
                          <option>Español</option>
                          <option>Français</option>
                          <option>Deutsch</option>
                          <option>Tiếng Việt</option>
                      </select>
                      <button type="submit" disabled={isLoading} className="w-full sm:w-auto px-6 py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 disabled:bg-slate-400">
                          {isLoading ? '번역 중...' : '번역하기'}
                      </button>
                  </div>
              </form>
          </div>
          <ResultDisplay isLoading={isLoading} error={error} data={data} title="번역 결과" />
      </div>
    );
};

export default TextToolsPage;