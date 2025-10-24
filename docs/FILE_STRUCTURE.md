# Gemini 미니 도우미: 파일 구조 안내서

이 문서는 "Gemini 미니 도우미" 애플리케이션의 전체 파일 및 폴더 구조를 설명하여, 코드베이스를 쉽게 탐색하고 이해할 수 있도록 돕습니다.

---

## 📁 최상위 디렉토리 (Root Directory)

-   `index.html`: 웹 애플리케이션의 **기본 HTML 뼈대**입니다. React 앱이 렌더링될 `<div id="root"></div>` 요소를 포함하며, 필요한 외부 라이브러리(Tailwind CSS, KaTeX 등)와 JavaScript 모듈을 불러옵니다.
-   `index.tsx`: 전체 React 애플리케이션의 **시작점 (Entry Point)** 입니다. `index.html`의 'root' 요소에 `<App />` 컴포넌트를 렌더링하고, 앱 전체의 Context Provider(데이터 공유)와 라우터(페이지 이동)를 설정합니다.
-   `App.tsx`: 애플리케이션의 **최상위(Root) 컴포넌트**입니다. 전체적인 레이아웃(사이드바 + 메인 컨텐츠)을 구성하고, URL 경로에 따라 어떤 페이지를 보여줄지 결정하는 라우팅(Routing)을 관리합니다.
-   `metadata.json`: 애플리케이션의 이름, 설명 등 메타데이터를 정의합니다.
-   `/docs`: 현재 읽고 있는 이 문서를 포함하여, 프로젝트에 대한 마크다운 형식의 설명서들이 위치하는 폴더입니다.

---

## 📂 `pages`

사용자가 브라우저에서 보게 되는 각각의 **페이지 단위 컴포넌트**들입니다. `App.tsx`의 라우팅 설정에 따라 특정 URL 경로에 맞는 페이지가 화면에 그려집니다.

-   `HomePage.tsx`: 앱의 메인 랜딩 페이지입니다.
-   `TextToolsPage.tsx`: '글쓰기 도우미'의 통합 페이지입니다. (문장 다듬기, 맞춤법 검사, 번역 등)
-   `AiCalculatorPage.tsx`: 자연어 기반 AI 계산기 페이지입니다.
-   `AnnouncementPage.tsx`: AI를 이용한 안내 문자 생성 페이지입니다.
-   `NewsBriefingPage.tsx`: AI를 이용한 뉴스 요약/브리핑 페이지입니다.
-   `TaxCalculatorPage.tsx`: 원천징수 계산기 페이지입니다.
-   `HrManagementPage.tsx`: 구성원 정보 및 정산 관리 페이지입니다.
-   `DevNotesPage.tsx`: 개발 노트 관리 페이지입니다.
-   `FavoriteLinksPage.tsx`: 자주 가는 사이트(북마크) 관리 페이지입니다.
-   `PromptEditorPage.tsx`: 모든 AI 프롬프트를 한 곳에서 관리하는 페이지입니다.
-   `ManualPage.tsx`: 앱 사용 설명서 페이지입니다.

---

## 📂 `components`

여러 페이지에서 **재사용되는 UI 조각들**, 즉 React 컴포넌트들이 위치합니다.

-   `Sidebar.tsx`: 앱 왼쪽에 위치하는 내비게이션 메뉴입니다.
-   `PageHeader.tsx`: 각 페이지 상단에 표시되는 제목, 부제목, 아이콘 영역입니다.
-   `ResultDisplay.tsx`: AI의 응답 결과를 (로딩/에러/성공) 상태에 따라 보여주는 공통 컴포넌트입니다.
-   `MarkdownRenderer.tsx`: 마크다운 텍스트를 HTML로 변환하여 예쁘게 보여주는 컴포넌트입니다.
-   `Loader.tsx`: 데이터 로딩 중에 표시되는 스피너 아이콘입니다.
-   `Icons.tsx`: 앱 전체에서 사용되는 SVG 아이콘들을 React 컴포넌트 형태로 모아놓은 파일입니다.
-   `PromptEditor.tsx`: 각 AI 기능 페이지 내에서 해당 기능의 프롬프트를 수정할 수 있는 아코디언 형태의 UI 컴포넌트입니다.
-   `ModelSelector.tsx`: 사용자가 AI 모델을 선택할 수 있는 드롭다운 메뉴 컴포넌트입니다.

---

## 📂 `services`

API 호출과 같은 **외부 서비스와의 통신 로직**을 담당하는 파일이 위치합니다. 컴포넌트가 직접 API를 호출하지 않고, 이 서비스 파일을 통해 통신함으로써 코드의 역할을 명확히 분리합니다.

-   `geminiService.ts`: Google Gemini API와의 모든 통신을 중앙에서 관리합니다. 각 기능에 맞는 프롬프트를 구성하여 API를 호출하는 함수들이 정의되어 있습니다.

---

## 📂 `hooks`

반복되는 로직을 재사용 가능한 함수로 만든 **커스텀 훅(Custom Hooks)** 이 위치합니다. `use`로 시작하는 이름 규칙을 따릅니다.

-   `useGemini.ts`: Gemini API 호출과 관련된 상태(로딩, 데이터, 에러)를 편리하게 관리해주는 훅입니다.
-   `usePrompts.ts`: `PromptContext`에 쉽게 접근할 수 있게 해주는 훅입니다.
-   `useModel.ts`: `ModelContext`에 쉽게 접근할 수 있게 해주는 훅입니다.

---

## 📂 `context`

React의 Context API를 사용하여 앱의 **전역 상태(Global State)** 를 관리하는 파일들이 위치합니다. 이를 통해 props를 여러 단계로 전달할 필요 없이 앱의 모든 컴포넌트가 데이터에 접근할 수 있습니다.

-   `PromptContext.tsx`: AI 프롬프트 데이터를 앱 전체에서 공유하고, localStorage에 저장/관리하는 역할을 합니다.
-   `ModelContext.tsx`: 사용자가 선택한 AI 모델 정보를 앱 전체에서 공유하고, localStorage에 저장/관리하는 역할을 합니다.

---

## 📂 `types`

TypeScript에서 사용되는 **데이터 타입 정의**들이 위치합니다. 데이터의 구조를 미리 정의하여 코드의 안정성을 높입니다.

-   `index.ts`: 앱 전체에서 사용되는 `Employee`, `DevNote` 등과 같은 데이터의 형태(Shape)를 `interface`나 `type`으로 정의합니다.

---

## 📂 `constants`

애플리케이션 전체에서 **변하지 않는 값(상수)** 들을 모아놓은 파일이 위치합니다.

-   `index.ts`: 내비게이션 링크 정보, 사이드바 구조, AI 모델 목록 등과 같은 상수들을 정의합니다.

---

## 📂 `data`

앱의 초기 데이터나 데모용으로 사용되는 정적 JSON 파일들을 보관하는 곳입니다.

-   `prompts.json`: AI 기능에서 사용되는 기본 프롬프트들을 정의합니다.
-   `hr_management.json`: '구성원 관리' 페이지의 초기 구성원 목록 데이터입니다.
-   `settlements.json`: '구성원 관리' 페이지의 초기 정산 내역 데이터입니다.
-   `dev_note.json`: '개발 노트' 페이지의 초기 노트 데이터입니다.
-   `favorite_url.json`: '자주 가는 사이트' 페이지의 초기 링크 데이터입니다.
