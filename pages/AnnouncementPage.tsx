/**
 * @file AnnouncementPage.tsx
 * @description 이 파일은 '안내 문자 생성' 페이지 컴포넌트입니다.
 * 사용자가 행사명, 날짜, 장소 등 간단한 정보만 입력하면,
 * Gemini AI가 이 정보를 바탕으로 자연스럽고 친근한 톤의 안내문(예: 카카오톡 공지)을 자동으로 생성해주는 기능을 제공합니다.
 */

// React와 필요한 컴포넌트, 훅, 서비스들을 가져옵니다.
import React, { useState } from 'react';
import { ALL_NAV_LINKS } from '../constants'; // 내비게이션 링크 상수
import { useGemini } from '../hooks/useGemini'; // Gemini API 호출용 커스텀 훅
import { generateAnnouncement } from '../services/geminiService'; // 안내문 생성 API 함수
import PageHeader from '../components/PageHeader'; // 페이지 상단 제목 컴포넌트
import ResultDisplay from '../components/ResultDisplay'; // 결과 표시 컴포넌트
import { usePrompts } from '../hooks/usePrompts'; // 프롬프트 관리용 커스텀 훅
import PromptEditor from '../components/PromptEditor'; // 프롬프트 수정 컴포넌트
import ModelSelector from '../components/ModelSelector'; // AI 모델 선택 컴포넌트
import { useModel } from '../hooks/useModel'; // AI 모델 관리용 커스텀 훅
import { ClipboardDocumentIcon, CheckIcon } from '../components/Icons'; // 아이콘

// AnnouncementPage 컴포넌트를 정의합니다.
const AnnouncementPage: React.FC = () => {
  // `useState` 훅을 사용하여 상태(state)를 관리합니다.
  // 1. `details`: 사용자가 입력할 안내문 세부 정보를 객체 형태로 관리합니다.
  const [details, setDetails] = useState({
    '핵심 정보': '',
    '문장 스타일': '',
    '참고 예시글': '',
    '글자 수': '',
  });
  // 2. `isCopied`: 복사 버튼 클릭 후 성공 여부를 잠시 표시하기 위한 상태입니다.
  const [isCopied, setIsCopied] = useState(false);

  // 커스텀 훅을 사용하여 필요한 데이터와 함수를 가져옵니다.
  const { prompts } = usePrompts();
  const { selectedModel } = useModel();
  const { data, isLoading, error, execute } = useGemini<string>(generateAnnouncement);

  // 입력 필드의 내용이 변경될 때마다 `details` 상태를 업데이트하는 함수입니다.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // `...details`는 기존 객체를 복사하고, `[name]: value` 부분만 새 값으로 덮어씁니다.
    setDetails({ ...details, [name]: value });
  };

  // '안내문 생성' 버튼 클릭 시 실행될 함수입니다.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // 폼의 기본 동작(페이지 새로고침)을 막습니다.
    
    // 핵심 정보가 입력되었는지 확인합니다.
    if (!details['핵심 정보'].trim()) {
        alert('안내문의 핵심 정보를 입력해주세요.');
        return;
    }
    
    // `useGemini` 훅에서 받은 `execute` 함수를 호출하여 API 요청을 보냅니다.
    execute(details, prompts.announcement, selectedModel);
  };
  
  // 생성된 안내문을 클립보드에 복사하는 함수입니다.
  const handleCopy = () => {
    if (data) {
        // 브라우저의 Clipboard API를 사용하여 텍스트를 복사합니다.
        navigator.clipboard.writeText(data).then(() => {
            setIsCopied(true); // 복사 성공 시 상태를 true로 변경
            // 2초 후에 버튼 상태를 원래대로(false) 되돌립니다.
            setTimeout(() => setIsCopied(false), 2000); 
        }, (err) => {
            console.error('클립보드 복사에 실패했습니다:', err);
            alert('클립보드 복사에 실패했습니다.');
        });
    }
  };
  
  return (
    <div>
      <PageHeader 
        title={ALL_NAV_LINKS.announcement.name} 
        subtitle="다양한 상황에 맞는 명확하고 친근한 안내문을 만드세요."
        icon={ALL_NAV_LINKS.announcement.icon}
      />

      <PromptEditor
        promptKey="announcement"
        title="안내 문자 생성 프롬프트"
      />

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
        <ModelSelector />
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="핵심 정보" className="block text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
              핵심 정보
            </label>
            <textarea
              id="핵심 정보"
              name="핵심 정보" // `handleChange`에서 이 name을 키로 사용합니다.
              value={details['핵심 정보']}
              onChange={handleChange}
              rows={6}
              placeholder="안내문에 포함될 핵심 내용을 모두 입력해주세요. (예: 주제, 대상, 날짜, 요청사항 등)"
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label htmlFor="문장 스타일" className="block text-base font-medium text-slate-700 dark:text-slate-300 mb-2">문장 스타일</label>
                  <input
                      type="text"
                      id="문장 스타일"
                      name="문장 스타일"
                      value={details['문장 스타일']}
                      onChange={handleChange}
                      placeholder="예: 친근하고 명확한 톤"
                      className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                  />
              </div>
              <div>
                  <label htmlFor="글자 수" className="block text-base font-medium text-slate-700 dark:text-slate-300 mb-2">글자 수 (약)</label>
                  <input
                      type="number"
                      id="글자 수"
                      name="글자 수"
                      value={details['글자 수']}
                      onChange={handleChange}
                      placeholder="예: 200"
                      min="50"
                      step="50"
                      className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                  />
              </div>
          </div>
          <div>
            <label htmlFor="참고 예시글" className="block text-base font-medium text-slate-700 dark:text-slate-300 mb-2">참고 예시글 (선택)</label>
            <textarea
              id="참고 예시글"
              name="참고 예시글"
              value={details['참고 예시글']}
              onChange={handleChange}
              rows={4}
              placeholder="원하는 결과물의 형식이나 톤을 보여주는 예시를 입력하면 AI가 더 잘 이해할 수 있습니다."
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading} // 로딩 중에는 버튼을 비활성화합니다.
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition"
          >
            {isLoading ? '생성 중...' : '안내문 생성'}
          </button>
        </form>
      </div>
      
      {/* 생성된 안내문 결과를 `ResultDisplay` 컴포넌트를 통해 표시합니다. */}
      <ResultDisplay 
        isLoading={isLoading} 
        error={error} 
        data={data}
        title="생성된 안내문"
      />

      {/* 결과가 성공적으로 생성되었을 때만 복사 버튼을 표시합니다. */}
      {data && !isLoading && !error && (
        <div className="mt-4 flex justify-end">
            <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 px-4 py-2 text-base font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:bg-slate-400"
                disabled={isCopied}
                aria-label="생성된 안내문 전체 복사"
            >
                {/* `isCopied` 상태에 따라 버튼의 내용이 동적으로 변경됩니다. */}
                {isCopied ? (
                    <>
                        <CheckIcon className="h-5 w-5" />
                        복사 완료!
                    </>
                ) : (
                    <>
                        <ClipboardDocumentIcon className="h-5 w-5" />
                        전체 복사
                    </>
                )}
            </button>
        </div>
      )}
    </div>
  );
};

export default AnnouncementPage;
