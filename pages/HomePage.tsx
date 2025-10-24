/**
 * @file HomePage.tsx
 * @description 이 파일은 애플리케이션의 메인 랜딩 페이지(홈 화면) 컴포넌트입니다.
 * 사용자에게 환영 메시지를 보여주고, 앱이 제공하는 모든 기능들을 카드 형태로 나열하여
 * 각 기능 페이지로 쉽게 이동할 수 있도록 안내하는 역할을 합니다.
 */

// React 라이브러리와 페이지 이동을 위한 Link 컴포넌트, 내비게이션 링크 상수를 가져옵니다.
import React from 'react';
import { Link } from 'react-router-dom'; // 클릭하면 다른 페이지로 이동시켜주는 컴포넌트
import { ALL_NAV_LINKS } from '../constants'; // 앱의 모든 페이지 링크 정보가 담긴 객체

// 각 기능 카드를 만드는 작은 재사용 컴포넌트입니다.
// props로 link 객체를 받아서 카드 UI를 생성합니다.
const FeatureCard: React.FC<{ link: { name: string, path: string, icon: React.FC<{ className?: string }> } }> = ({ link }) => (
    // <Link> 컴포넌트로 전체 카드를 감싸서, 카드 어디를 클릭해도 해당 페이지로 이동하도록 만듭니다.
    <Link to={link.path} className="block group">
        {/* 카드 스타일링: 배경색, 둥근 모서리, 그림자, 마우스 올렸을 때(hover) 효과 등을 Tailwind CSS 클래스로 적용합니다. */}
        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200 dark:border-slate-700 h-full flex flex-col items-start">
            {/* 아이콘을 담는 부분 */}
            <div className="p-3 bg-primary-100 dark:bg-primary-900/50 rounded-lg text-primary-600 dark:text-primary-300 group-hover:bg-primary-200 dark:group-hover:bg-primary-800 transition-colors">
                {/* props로 받은 아이콘 컴포넌트를 렌더링합니다. */}
                <link.icon className="h-8 w-8" />
            </div>
            {/* 기능 이름(제목) */}
            <h3 className="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-100">{link.name}</h3>
            {/* 기능에 대한 간단한 설명 */}
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{link.name} 도구로 이동합니다.</p>
        </div>
    </Link>
);


// HomePage 컴포넌트의 본체입니다.
const HomePage: React.FC = () => {
    // `constants/index.ts`의 `ALL_NAV_LINKS` 객체에서 '홈' 링크를 제외한 나머지 모든 기능 링크들을 배열로 만듭니다.
    // 1. `Object.values(ALL_NAV_LINKS)`: ALL_NAV_LINKS의 값들(각 link 객체)로 배열을 만듭니다.
    // 2. `.filter()`: 배열을 순회하며 조건에 맞는 요소만 남깁니다. 여기서는 name이 '홈'이 아닌 것들만 선택합니다.
    const featureLinks = Object.values(ALL_NAV_LINKS).filter(link => link.name !== '홈');

    // 화면에 렌더링될 JSX를 반환합니다.
    return (
        <div>
            {/* 페이지 상단의 환영 메시지 섹션 */}
            <div className="text-center mb-12">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {/* 앱 이름 부분에만 특별한 색상(primary)을 적용하여 강조합니다. */}
                    <span className="text-primary-600 dark:text-primary-400">Gemini 미니 도우미</span>에 오신 것을 환영합니다
                </h1>
                <p className="mt-4 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                    Gemini로 구동되는 올인원 툴킷입니다. 시작하려면 아래 기능 중 하나를 선택하세요.
                </p>
            </div>
            
            {/* 기능 카드들을 그리드(격자) 형태로 보여주는 섹션 */}
            {/* 화면 크기에 따라 한 줄에 표시되는 카드 개수가 자동으로 조절됩니다 (반응형 디자인). */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* 
                  위에서 만든 `featureLinks` 배열을 `.map()`으로 순회하면서 각 링크에 대한 `FeatureCard` 컴포넌트를 생성합니다.
                  React에서 배열을 사용해 여러 요소를 렌더링할 때는 각 요소에 고유한 `key` prop을 지정해야 합니다.
                  React는 이 `key`를 사용하여 변경된 항목을 효율적으로 추적하고 업데이트합니다.
                */}
                {featureLinks.map(link => (
                    <FeatureCard key={link.name} link={link} />
                ))}
            </div>
        </div>
    );
};

// HomePage 컴포넌트를 다른 파일에서 사용할 수 있도록 내보냅니다.
export default HomePage;
