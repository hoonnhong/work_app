import React, { useState } from 'react';
import { ALL_NAV_LINKS } from '../constants';
import { useGemini } from '../hooks/useGemini';
import { getNewsBriefing } from '../services/geminiService';
import PageHeader from '../components/PageHeader';
import { usePrompts } from '../hooks/usePrompts';
import PromptEditor from '../components/PromptEditor';
import ModelSelector from '../components/ModelSelector';
import { useModel } from '../hooks/useModel';
import type { NewsArticle } from '../types';
import Loader from '../components/Loader';
import { ExclamationTriangleIcon } from '../components/Icons';

const NewsBriefingPage: React.FC = () => {
  const [details, setDetails] = useState({
    topic: '',
    period: '',
    country: '',
    mediaOutlet: '',
    articleCount: 0, // 빈 값으로 시작 (placeholder가 5를 표시)
  });
  const { prompts } = usePrompts();
  const { selectedModel } = useModel();
  const { data, isLoading, error, execute } = useGemini<NewsArticle[]>(getNewsBriefing);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setDetails({
        ...details,
        [name]: type === 'number' ? parseInt(value, 10) || 0 : value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.topic.trim() || !details.period.trim()) {
        alert('주제와 기간은 필수 입력 항목입니다.');
        return;
    }

    // 기본값 적용
    const submissionDetails = {
      ...details,
      country: details.country.trim() || '대한민국',
      articleCount: details.articleCount || 5
    };

    console.log('=== NewsBriefingPage Submit ===');
    console.log('Submission details:', submissionDetails);
    console.log('Article count:', submissionDetails.articleCount);
    console.log('==============================');

    execute(submissionDetails, prompts.newsBriefing, selectedModel);
  };

  return (
    <div>
      <PageHeader 
        title={ALL_NAV_LINKS.newsBriefing.name} 
        subtitle="원하는 조건에 맞춰 AI 뉴스 큐레이터에게 브리핑을 받아보세요."
        icon={ALL_NAV_LINKS.newsBriefing.icon}
      />

      <PromptEditor
        promptKey="newsBriefing"
        title="뉴스브리핑 프롬프트"
      />

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
        <ModelSelector />
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="topic" className="block text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                주제 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="topic"
                name="topic"
                value={details.topic}
                onChange={handleChange}
                placeholder="예: 최신 IT 기술, K-pop 산업 동향"
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
            <div>
              <label htmlFor="period" className="block text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                기간 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="period"
                name="period"
                value={details.period}
                onChange={handleChange}
                placeholder="예: 지난 7일, 2025-01-01 ~ 2025-01-07"
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                상대적 기간(예: 지난 7일) 또는 구체적 날짜를 입력할 수 있습니다.
              </p>
            </div>
            <div>
              <label htmlFor="country" className="block text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                언론 국가 <span className="text-slate-400 text-sm">(기본값: 대한민국)</span>
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={details.country}
                onChange={handleChange}
                placeholder="대한민국"
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
            <div>
              <label htmlFor="mediaOutlet" className="block text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                특정 언론사 <span className="text-slate-400 text-sm">(선택사항)</span>
              </label>
              <input
                type="text"
                id="mediaOutlet"
                name="mediaOutlet"
                value={details.mediaOutlet}
                onChange={handleChange}
                placeholder="예: 조선일보, CNN"
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
            <div>
              <label htmlFor="articleCount" className="block text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                브리핑 기사 개수 <span className="text-slate-400 text-sm">(기본값: 5개)</span>
              </label>
              <input
                type="number"
                id="articleCount"
                name="articleCount"
                value={details.articleCount}
                onChange={handleChange}
                min="1"
                max="20"
                placeholder="5"
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition"
          >
            {isLoading ? '브리핑 생성 중...' : '브리핑 요청'}
          </button>
        </form>
      </div>
      
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-300">뉴스 브리핑 결과</h3>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
          <div className="p-6 min-h-[10rem]">
            {isLoading && <Loader />}
            {error && (
              <div className="text-red-500 flex items-center gap-2">
                <ExclamationTriangleIcon className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}
            {data && !isLoading && data.length > 0 && (
                <>
                    {/* Desktop Table */}
                    <div className="overflow-x-auto hidden md:block">
                        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                            <tr>
                                <th scope="col" className="px-6 py-3">날짜</th>
                                <th scope="col" className="px-6 py-3">언론사</th>
                                <th scope="col" className="px-6 py-3">기사제목</th>
                                <th scope="col" className="px-6 py-3">기사요약</th>
                            </tr>
                            </thead>
                            <tbody>
                            {data.map((article, index) => (
                                <tr key={index} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                                <td className="px-6 py-4 align-top">{article.date}</td>
                                <td className="px-6 py-4 align-top">{article.mediaOutlet}</td>
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white align-top">
                                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">
                                    {article.title}
                                    </a>
                                </td>
                                <td className="px-6 py-4 align-top">{article.summary}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Mobile List */}
                    <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-700">
                        {data.map((article, index) => (
                            <div key={index} className="py-4">
                            <h4 className="font-bold text-slate-800 dark:text-white mb-2">
                                <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">
                                    {article.title}
                                </a>
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{article.summary}</p>
                            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                                <span>{article.mediaOutlet}</span>
                                <span>{article.date}</span>
                            </div>
                            </div>
                        ))}
                    </div>
              </>
            )}
            {!isLoading && !error && (!data || data.length === 0) && (
              <p className="text-slate-400 dark:text-slate-500 text-center py-10">
                결과가 여기에 표시됩니다.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsBriefingPage;