/**
 * @file index.tsx
 * @description 이 파일은 전체 React 애플리케이션의 시작점(Entry Point)입니다.
 * 웹 페이지의 'root'라는 ID를 가진 HTML 요소에 App 컴포넌트를 렌더링(화면에 그려줌)합니다.
 * 또한, 앱 전체에서 사용될 라우팅(페이지 이동) 기능과 전역 상태 관리(Context)를 설정합니다.
 * 
 * @summary
 * 1. React와 ReactDOM 라이브러리를 임포트합니다.
 * 2. 메인 App 컴포넌트와 라우팅, 전역 상태 관리 컴포넌트들을 임포트합니다.
 * 3. HTML의 'root' 요소를 찾아 React 애플리케이션의 렌더링 대상으로 지정합니다.
 * 4. React.StrictMode 안에서 앱 전체를 필요한 Provider 컴포넌트들로 감싸 렌더링합니다.
 */

// React 라이브러리에서 필요한 기능들을 가져옵니다.
import React from 'react'; // React의 핵심 기능 (컴포넌트 생성, 상태 관리 등)
import ReactDOM from 'react-dom/client'; // React 컴포넌트를 실제 웹 페이지(DOM)에 연결하는 기능
import App from './App'; // 우리가 만든 메인 애플리케이션 컴포넌트
import { HashRouter } from 'react-router-dom'; // 페이지 이동(라우팅)을 관리하는 기능. HashRouter는 URL에 '#'을 사용하여 서버 설정 없이도 라우팅을 가능하게 합니다.
import { PromptProvider } from './context/PromptContext'; // AI 프롬프트 데이터를 앱 전체에서 공유하는 기능 (Context Provider)
import { ModelProvider } from './context/ModelContext'; // AI 모델 선택값을 앱 전체에서 공유하는 기능 (Context Provider)

// index.html 파일에서 'root'라는 id를 가진 요소를 찾습니다. 이 곳이 우리 앱이 그려질 위치입니다.
const rootElement = document.getElementById('root');

// 만약 'root' 요소를 찾지 못하면 개발자가 실수를 바로 알 수 있도록 에러를 발생시킵니다.
if (!rootElement) {
  throw new Error("애플리케이션을 마운트할 'root' 요소를 찾을 수 없습니다.");
}

// 찾은 'root' 요소를 React가 관리할 수 있는 가상 DOM의 시작점으로 만듭니다.
// createRoot는 React 18부터 도입된 새로운 렌더링 API입니다.
const root = ReactDOM.createRoot(rootElement);

// root에 App 컴포넌트를 렌더링(화면에 그려줌)합니다.
root.render(
  // <React.StrictMode>는 개발 중에 잠재적인 문제를 감지하고 경고를 띄워주는 엄격 모드입니다.
  // 예를 들어, 오래된 API 사용이나 예상치 못한 부작용을 검사해줍니다. 프로덕션 빌드에서는 자동으로 비활성화됩니다.
  <React.StrictMode>
    {/* 
      <HashRouter>는 App 컴포넌트와 그 자식 컴포넌트들이 페이지 이동 기능을 사용할 수 있게 감싸줍니다.
      이 컴포넌트 하위에 있는 컴포넌트들은 URL 변경을 감지하고 그에 맞는 페이지를 보여줄 수 있습니다.
    */}
    <HashRouter>
      {/* 
        <PromptProvider>는 프롬프트 관련 데이터를 모든 컴포넌트가 공유할 수 있게 해줍니다.
        'Context'는 부모에서 자식으로 props를 계속 넘겨주지 않아도, 앱 전체에서 데이터를 공유할 수 있게 하는 React의 기능입니다.
      */}
      <PromptProvider>
        {/* <ModelProvider>는 사용자가 선택한 AI 모델 정보를 모든 컴포넌트가 공유할 수 있게 해줍니다. */}
        <ModelProvider>
          {/* <App /> 컴포넌트가 우리 애플리케이션의 본체입니다. */}
          <App />
        </ModelProvider>
      </PromptProvider>
    </HashRouter>
  </React.StrictMode>
);
