/**
 * @file App.tsx
 * @description 이 파일은 애플리케이션의 최상위(Root) 컴포넌트입니다.
 * 전체적인 레이아웃 구조(사이드바 + 메인 컨텐츠)를 정의하고,
 * URL 경로에 따라 어떤 페이지를 보여줄지 결정하는 라우팅(Routing) 설정을 담당합니다.
 * 모든 페이지 컴포넌트들은 이 App 컴포넌트 안에서 렌더링됩니다.
 * 
 * @summary
 * 1. React 및 라우팅 관련 라이브러리, 공통 컴포넌트들을 임포트합니다.
 * 2. `React.lazy`를 사용하여 페이지 컴포넌트들을 동적으로 임포트(코드 스플리팅)합니다.
 * 3. `useState` 훅을 사용하여 모바일 사이드바의 열림/닫힘 상태를 관리합니다.
 * 4. 데스크톱/모바일 반응형 레이아웃을 구성합니다.
 * 5. `Suspense`와 `Routes`를 사용하여 URL 경로에 맞는 페이지 컴포넌트를 렌더링합니다.
 */

// React와 필요한 라이브러리, 컴포넌트들을 가져옵니다.
import React, { useState, Suspense, lazy } from 'react'; // React의 핵심 기능과 'useState', 'Suspense', 'lazy'를 가져옵니다.
import { Routes, Route, Link } from 'react-router-dom'; // 페이지 이동(라우팅)을 위한 컴포넌트들을 가져옵니다.
import Sidebar from './components/Sidebar'; // 사이드바 컴포넌트
import { ALL_NAV_LINKS } from './constants'; // 내비게이션 링크 정보를 담고 있는 상수
import { Bars3Icon, SparklesIcon } from './components/Icons'; // 아이콘 컴포넌트들
import Loader from './components/Loader'; // 로딩 스피너 컴포넌트

// 페이지 컴포넌트들을 React.lazy를 사용하여 동적으로 임포트합니다.
// 이렇게 하면 사용자가 해당 페이지에 처음 접속할 때만 해당 페이지의 코드를 불러옵니다. (코드 스플리팅)
// 이를 통해 초기 로딩 속도를 향상시킬 수 있습니다.
const HomePage = lazy(() => import('./pages/HomePage'));
const TextToolsPage = lazy(() => import('./pages/TextToolsPage'));
const AiCalculatorPage = lazy(() => import('./pages/AiCalculatorPage'));
const AnnouncementPage = lazy(() => import('./pages/AnnouncementPage'));
const TaxCalculatorPage = lazy(() => import('./pages/TaxCalculatorPage'));
const HrManagementPage = lazy(() => import('./pages/HrManagementPage'));
const DevNotesPage = lazy(() => import('./pages/DevNotesPage'));
const FavoriteLinksPage = lazy(() => import('./pages/FavoriteLinksPage'));
const ManualPage = lazy(() => import('./pages/ManualPage'));
const PromptEditorPage = lazy(() => import('./pages/PromptEditorPage'));
const NewsBriefingPage = lazy(() => import('./pages/NewsBriefingPage'));


// App 컴포넌트를 정의합니다. React.FC는 이 함수가 React 함수형 컴포넌트임을 명시합니다.
const App: React.FC = () => {
  // 모바일 화면에서 사이드바가 열려있는지 여부를 관리하는 상태(state)를 만듭니다.
  // 'isMobileSidebarOpen'은 현재 상태값(true 또는 false)이고, 'setMobileSidebarOpen'은 이 값을 변경하는 함수입니다.
  // useState(false)는 초기 상태값을 false(닫힘)로 설정합니다.
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // 이 컴포넌트가 화면에 그릴 내용을 JSX 문법으로 작성하여 반환합니다.
  return (
    // 전체 앱을 감싸는 div. flex와 h-screen 클래스로 전체 화면을 채우는 레이아웃을 만듭니다.
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      {/* 사이드바 컴포넌트를 렌더링합니다. 모바일 상태와 상태 변경 함수를 props로 전달합니다. */}
      <Sidebar isMobileOpen={isMobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />
      
      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 모바일 화면용 헤더. md(중간 크기) 화면 이상에서는 숨겨집니다. (md:hidden) */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0">
          {/* 햄버거 메뉴 버튼. 클릭하면 모바일 사이드바를 엽니다. */}
          <button onClick={() => setMobileSidebarOpen(true)} className="p-1 text-slate-500 dark:text-slate-400">
            <Bars3Icon className="h-6 w-6" />
          </button>
          {/* 앱 로고와 이름. <Link> 컴포넌트를 사용해 클릭하면 홈('/')으로 이동하도록 합니다. */}
          <Link to="/" className="text-lg font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
            <SparklesIcon className="h-5 w-5" /> Gemini 도우미
          </Link>
          {/* 헤더의 좌우 균형을 맞추기 위한 빈 공간. 햄버거 버튼과 같은 너비를 가집니다. */}
          <div className="w-7"/>
        </header>
        
        {/* 스크롤 가능한 메인 컨텐츠 영역 */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* 컨텐츠의 최대 너비를 제한하여 큰 화면에서도 가독성이 좋게 만듭니다. */}
          <div className="max-w-7xl mx-auto">
            {/* 
              <Suspense>는 lazy 로딩된 컴포넌트가 로드될 때까지 fallback UI(여기서는 Loader)를 보여줍니다.
              만약 TextToolsPage 코드를 불러오는 데 1초가 걸린다면, 그 1초 동안 사용자에게는 로딩 스피너가 보이게 됩니다.
            */}
            <Suspense fallback={<div className="flex justify-center items-center h-full"><Loader /></div>}>
              {/* <Routes>는 URL 경로에 따라 어떤 <Route>를 보여줄지 결정하는 컨테이너입니다. */}
              <Routes>
                {/* 각 <Route>는 특정 경로(path)와 그 경로에서 보여줄 컴포넌트(element)를 연결합니다. */}
                <Route path="/" element={<HomePage />} />
                <Route path={ALL_NAV_LINKS.textTools.path} element={<TextToolsPage />} />
                <Route path={ALL_NAV_LINKS.aiCalculator.path} element={<AiCalculatorPage />} />
                <Route path={ALL_NAV_LINKS.announcement.path} element={<AnnouncementPage />} />
                <Route path={ALL_NAV_LINKS.newsBriefing.path} element={<NewsBriefingPage />} />
                <Route path={ALL_NAV_LINKS.prompts.path} element={<PromptEditorPage />} />
                <Route path={ALL_NAV_LINKS.tax.path} element={<TaxCalculatorPage />} />
                <Route path={ALL_NAV_LINKS.hr.path} element={<HrManagementPage />} />
                <Route path={ALL_NAV_LINKS.devNotes.path} element={<DevNotesPage />} />
                <Route path={ALL_NAV_LINKS.links.path} element={<FavoriteLinksPage />} />
                <Route path={ALL_NAV_LINKS.manual.path} element={<ManualPage />} />
              </Routes>
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
};

// App 컴포넌트를 다른 파일에서 사용할 수 있도록 내보냅니다.
export default App;
