/**
 * @file EventManagementPage.tsx
 * @description 이 파일은 '행사 관리' 페이지의 최상위 컨테이너 컴포넌트입니다.
 * 행사 관리와 강사비 지급 확인서 탭 사이의 전환을 관리합니다.
 */
import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import EventManagement from '../components/EventManagement';
import InstructorPaymentConfirmation from '../components/InstructorPaymentConfirmation';
import { CalendarIcon } from '../components/Icons';

const EventManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'events' | 'confirmation'>('events');

  // 샘플 데이터 자동 로드 비활성화 (사용자 수동 관리)
  // useEffect(() => {
  //   const loadSampleDataIfNeeded = async () => {
  //     try {
  //       // localStorage에서 샘플 데이터 로드 여부 확인
  //       const isLoaded = localStorage.getItem('sampleDataLoaded_v3');
  //       if (!isLoaded) {
  //         console.log('첫 방문: 샘플 데이터를 자동으로 로드합니다.');
  //         await addAllSampleData();
  //         localStorage.setItem('sampleDataLoaded_v3', 'true');
  //         console.log('샘플 데이터 로드 완료!');
  //       } else {
  //         console.log('[EventManagementPage] 샘플 데이터는 이미 로드되었습니다.');
  //       }
  //     } catch (error) {
  //       console.error('샘플 데이터 자동 로드 실패:', error);
  //     }
  //   };

  //   loadSampleDataIfNeeded();
  // }, []);

  const renderContent = () => {
    if (activeTab === 'events') {
      return <EventManagement />;
    } else {
      return <InstructorPaymentConfirmation />;
    }
  };

  return (
    <div>
      <PageHeader
        title="행사 관리"
        subtitle="행사 정보를 관리하고 강사비 지급 확인서를 작성합니다."
        icon={CalendarIcon}
      />

      <div className="border-b border-slate-200 dark:border-slate-700 mb-4">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('events')}
            className={`${
              activeTab === 'events'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            행사 관리
          </button>
          <button
            onClick={() => setActiveTab('confirmation')}
            className={`${
              activeTab === 'confirmation'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            강사비 지급 확인서
          </button>
        </nav>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
        {renderContent()}
      </div>
    </div>
  );
};

export default EventManagementPage;
