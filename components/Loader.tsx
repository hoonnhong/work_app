/**
 * @file Loader.tsx
 * @description 이 파일은 데이터 로딩 중에 사용자에게 대기 상태임을 알려주는 로딩 스피너(빙글빙글 돌아가는 아이콘) 컴포넌트입니다.
 * AI 응답을 기다리거나 데이터를 불러오는 등 시간이 걸리는 작업이 진행 중일 때 화면에 표시됩니다.
 * 작고 재사용 가능한 컴포넌트로 만들어 여러 곳에서 쉽게 사용할 수 있습니다.
 */

// React 라이브러리를 가져옵니다.
import React from 'react';

// Loader 컴포넌트를 정의합니다. React.FC는 이 함수가 React 함수형 컴포넌트임을 명시합니다.
const Loader: React.FC = () => (
  // 로딩 아이콘을 중앙에 배치하기 위한 flexbox 컨테이너입니다.
  // `py-4`는 상하 패딩을 추가합니다.
  <div className="flex justify-center items-center py-4">
    {/* 
      이 div가 실제로 빙글빙글 돌아가는 스피너입니다.
      - `animate-spin`: Tailwind CSS가 제공하는 회전 애니메이션 클래스입니다. 이 클래스 하나로 회전 효과가 적용됩니다.
      - `rounded-full`: 원 모양으로 만듭니다.
      - `h-10 w-10`: 높이와 너비를 지정합니다.
      - `border-b-2`: 아래쪽(bottom) 테두리만 두께를 2로 설정합니다.
      - `border-primary-500`: 테두리 색상을 우리가 설정한 primary 색상으로 지정합니다.
      이 클래스들의 조합으로, 아래쪽만 색이 있는 원이 계속 회전하면서 로딩 중인 것처럼 보이게 됩니다.
    */}
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
  </div>
);

// Loader 컴포넌트를 다른 파일에서 사용할 수 있도록 내보냅니다.
export default Loader;
