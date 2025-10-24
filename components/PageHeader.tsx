/**
 * @file PageHeader.tsx
 * @description 이 파일은 각 페이지의 상단에 표시되는 공통 헤더 컴포넌트입니다.
 * 페이지의 제목, 부제목, 그리고 해당 페이지를 나타내는 아이콘을 일관된 디자인으로 보여주는 역할을 합니다.
 * 이렇게 공통 컴포넌트로 만들어두면 여러 페이지에서 반복적인 코드 작성 없이 쉽게 재사용할 수 있습니다.
 * 
 * @summary
 * 1. `PageHeaderProps` 인터페이스를 통해 부모 컴포넌트로부터 받을 데이터(props)의 타입을 정의합니다.
 * 2. 부모로부터 `title`, `subtitle`, `icon`을 props로 받아 UI를 렌더링합니다.
 * 3. Tailwind CSS를 사용하여 그라데이션 배경, 둥근 모서리 등 세련된 스타일을 적용합니다.
 */

// React 라이브러리를 가져옵니다.
import React from 'react';

// PageHeader 컴포넌트가 부모로부터 받을 데이터(props)의 타입을 정의합니다.
// 'props'는 부모 컴포넌트가 자식 컴포넌트에게 데이터를 전달하는 방법입니다.
interface PageHeaderProps {
  title: string; // 페이지의 주 제목 (문자열 타입)
  subtitle: string; // 페이지에 대한 간단한 설명 (부제목, 문자열 타입)
  icon: React.ComponentType<{ className?: string }>; // 페이지를 상징하는 아이콘 컴포넌트. React 컴포넌트 자체를 타입으로 지정합니다.
}

// PageHeader 컴포넌트를 정의합니다.
// props로 `title`, `subtitle`, 그리고 아이콘 컴포넌트 자체(별칭을 `Icon`으로 지정)를 받습니다.
const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, icon: Icon }) => {
  // 컴포넌트가 화면에 그릴 내용을 JSX로 반환합니다.
  return (
    // 헤더 전체를 감싸는 div. 그라데이션 배경, 둥근 모서리, 그림자 등 스타일을 Tailwind CSS 클래스로 적용합니다.
    <div className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg">
      <div className="flex items-center gap-3 sm:gap-4">
        {/* 아이콘을 감싸는 div. 반투명한 흰색 배경과 둥근 모양을 가집니다. */}
        <div className="bg-white/20 p-2 sm:p-3 rounded-full">
          {/* 부모로부터 전달받은 아이콘 컴포넌트(Icon)를 렌더링합니다. className을 전달하여 크기를 조절합니다. */}
          <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
        </div>
        {/* 제목과 부제목을 감싸는 div */}
        <div>
          {/* 부모로부터 전달받은 title을 h1 태그로 렌더링합니다. */}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
          {/* 부모로부터 전달받은 subtitle을 p 태그로 렌더링합니다. */}
          <p className="mt-1 text-base sm:text-lg text-primary-200">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

// PageHeader 컴포넌트를 다른 파일에서 사용할 수 있도록 내보냅니다.
export default PageHeader;
