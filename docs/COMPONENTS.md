# Gemini 미니 도우미: 컴포넌트 명세서

이 문서는 "Gemini 미니 도우미" 앱을 구성하는 주요 React 컴포넌트들의 역할, 속성(Props), 그리고 내부 상태(State)에 대해 설명합니다.

---

## 1. `App.tsx` (최상위 컴포넌트)

-   **역할**: 애플리케이션의 전체적인 뼈대를 구성합니다. 사이드바와 메인 콘텐츠 영역으로 레이아웃을 나누고, URL 주소에 따라 적절한 페이지를 보여주는 라우팅(페이지 전환)을 담당합니다.
-   **주요 변수 및 상태 (State)**:
    -   `isMobileSidebarOpen` (boolean): 모바일 환경(작은 화면)에서 사이드바 메뉴가 열려있는지 여부를 저장하는 상태 변수입니다. `true`이면 열려있고, `false`이면 닫혀있습니다.

## 2. `Sidebar.tsx` (내비게이션)

-   **역할**: 앱의 모든 페이지로 이동할 수 있는 내비게이션 메뉴를 제공하는 사이드바 컴포넌트입니다. 데스크톱에서는 확장/축소, 모바일에서는 화면 밖에서 나타나는 형태로 동작합니다.
-   **주요 속성 (Props)**:
    -   `isMobileOpen` (boolean): 부모 컴포넌트(`App.tsx`)로부터 전달받는 모바일 사이드바의 현재 열림/닫힘 상태입니다.
    -   `setMobileOpen` (function): 부모 컴포넌트의 `isMobileSidebarOpen` 상태를 변경하는 함수입니다.
-   **주요 변수 및 상태 (State)**:
    -   `isExpanded` (boolean): 데스크톱 화면에서 사이드바가 넓게 확장되어 있는지(아이콘+텍스트), 아니면 좁게 축소되어 있는지(아이콘만)를 관리합니다.
    -   `openGroups` (object): 메뉴 그룹들 중 어떤 그룹이 펼쳐져 있는지를 기록하는 객체입니다. (예: `{ 'AI 도구': true }`)

## 3. `PageHeader.tsx` (공통 UI)

-   **역할**: 각 페이지 상단에 일관된 디자인으로 제목, 부제목, 아이콘을 표시하는 공통 헤더 컴포넌트입니다.
-   **주요 속성 (Props)**:
    -   `title` (string): 페이지의 주 제목으로 표시될 텍스트입니다.
    -   `subtitle` (string): 페이지 제목 아래에 표시될 간단한 설명 텍스트입니다.
    -   `icon` (React.ComponentType): 페이지를 상징하는 아이콘 컴포넌트 자체를 전달받습니다.

## 4. `ResultDisplay.tsx` (공통 UI)

-   **역할**: AI의 응답 결과를 사용자에게 보여주는 공통 컴포넌트입니다. API 호출의 3가지 상태(로딩 중, 에러 발생, 데이터 수신 완료)에 따라 다른 UI를 렌더링합니다.
-   **주요 속성 (Props)**:
    -   `isLoading` (boolean): 로딩 중인지 여부를 나타냅니다. `true`이면 로딩 스피너를 보여줍니다.
    -   `error` (string | null): 에러가 발생했을 경우, 에러 메시지 텍스트를 담습니다.
    -   `data` (string | null): API 호출이 성공했을 때, 표시할 결과 데이터를 담습니다.
    -   `title` (string, optional): 결과 창의 제목으로 표시될 텍스트입니다. (기본값: "결과")
    -   `actions` (React.ReactNode, optional): 제목 옆에 표시될 추가적인 버튼 등의 UI 요소를 전달받습니다.

## 5. `MarkdownRenderer.tsx` (유틸리티)

-   **역할**: 마크다운(Markdown) 형식의 텍스트를 스타일이 적용된 HTML로 변환하여 보여줍니다. XSS 공격 방지를 위한 HTML 소독(Sanitization) 및 수학 공식(KaTeX) 렌더링 기능도 포함합니다.
-   **주요 속성 (Props)**:
    -   `content` (string): 마크다운 형식의 텍스트 내용입니다.

## 6. `Loader.tsx` (공통 UI)

-   **역할**: 데이터 로딩 중에 표시되는 간단한 스피너(빙글빙글 돌아가는 아이콘) 컴포넌트입니다.
-   **주요 속성 (Props)**: 없음.

## 7. `Icons.tsx` (자원)

-   **역할**: 앱 전체에서 사용되는 모든 SVG 아이콘을 재사용 가능한 React 컴포넌트 형태로 모아놓은 파일입니다.
-   **주요 속성 (Props)**:
    -   `className`, `onClick` 등 표준 SVG 속성을 전달받아 아이콘의 크기, 색상, 동작을 제어할 수 있습니다.

## 8. `PromptEditor.tsx` (공통 UI)

-   **역할**: 각 AI 기능 페이지 내에서 해당 기능이 사용하는 AI 프롬프트를 직접 확인하고 수정할 수 있는 아코디언(Accordion) 형태의 컴포넌트입니다.
-   **주요 속성 (Props)**:
    -   `promptKey` (string): 수정할 프롬프트의 키 값입니다. (예: 'refine', 'translate')
    -   `title` (string): 프롬프트 입력창 위에 표시될 제목입니다.
-   **주요 변수 및 상태 (State)**:
    -   `currentPrompt` (string): 사용자가 편집 중인 프롬프트의 내용입니다.
    -   `isOpen` (boolean): 아코디언 메뉴의 펼침/닫힘 상태입니다.
    -   `showSuccess` (boolean): 저장 성공 메시지를 잠시 표시할지 여부입니다.

## 9. `ModelSelector.tsx` (공통 UI)

-   **역할**: 사용자가 여러 Gemini AI 모델 중에서 하나를 선택할 수 있도록 해주는 드롭다운 메뉴 컴포넌트입니다. 선택된 모델은 앱 전역 상태로 관리됩니다.
-   **주요 속성 (Props)**: 없음.

## 10. 페이지 컴포넌트 (`HomePage.tsx`, `HrManagementPage.tsx` 등)

-   **역할**: 각 URL 경로에 해당하는 메인 컨텐츠를 구성하는 컴포넌트들입니다.
    -   `PageHeader`를 사용하여 페이지 제목을 표시합니다.
    -   사용자 입력을 받기 위한 폼(form), 버튼, 입력 필드 등을 포함합니다.
    -   필요에 따라 `useGemini` 훅을 사용하여 AI 서비스를 호출합니다.
    -   `ResultDisplay` 또는 커스텀 UI를 사용하여 결과를 표시합니다.
    -   각 페이지에 필요한 자체적인 상태(예: 입력 필드 값, 모달 열림 여부)를 `useState`를 통해 관리합니다.
