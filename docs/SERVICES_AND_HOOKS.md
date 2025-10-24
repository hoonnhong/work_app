# Gemini 미니 도우미: 서비스 및 훅 명세서

이 문서는 UI와 비즈니스 로직을 분리하고, 코드 재사용성을 높이는 데 핵심적인 역할을 하는 서비스(Services)와 커스텀 훅(Custom Hooks)에 대해 설명합니다.

---

## 🧠 핵심 개념 (Core Concepts)

### "래퍼 (Wrapper) 함수"란 무엇인가요?
"래퍼"는 '포장지'처럼 무언가를 감싸는 것을 의미합니다. 래퍼 함수는 **다른 함수를 감싸서 추가적인 기능을 더해주는 함수**입니다.

이 프로젝트의 `geminiService.ts` 파일에서, `refineText`나 `translateText` 같은 함수들이 바로 래퍼 함수입니다. 이 함수들은 핵심 기능인 `runJsonPrompt` 또는 `runTextPrompt` 함수를 "포장"합니다.

-   **왜 사용하나요?**
    핵심 함수들은 어떤 요청이든 처리할 수 있는 범용 함수입니다. `refineText` 함수는 "이 텍스트를 다듬어 줘:" 와 같은 특정 명령어를 미리 준비해서 핵심 함수에 전달하는 역할을 합니다. 덕분에 각 페이지 컴포넌트에서는 복잡한 명령어를 만들 필요 없이 `refineText("다듬을 문장", "전문적으로", ...)`처럼 간단하게 함수를 호출할 수 있습니다. 즉, 코드를 더 간결하고 이해하기 쉽게 만들어줍니다.

### "커스텀 훅 (Custom Hook)"이란 무엇인가요?
훅(Hook)은 React 컴포넌트에서 상태(State)나 생명주기 같은 특별한 기능들을 사용할 수 있게 해주는 함수입니다. (예: `useState`, `useEffect`)

커스텀 훅은 `use`로 시작하는 이름을 가진, **우리가 직접 만든 훅**입니다. 여러 컴포넌트에서 반복적으로 사용되는 로직을 하나의 함수로 뽑아내어 재사용하기 위해 만듭니다.

-   **왜 사용하나요?**
    예를 들어, API를 호출할 때마다 우리는 '로딩 중' 상태, '데이터' 상태, '에러' 상태를 관리해야 합니다. 이 로직은 모든 페이지에서 반복됩니다. `useGemini` 커스텀 훅은 이 반복되는 상태 관리 로직을 하나로 묶어줍니다. 덕분에 각 페이지 컴포넌트는 `const { data, isLoading, error, execute } = useGemini(...)` 한 줄만으로 이 모든 기능을 가져와 사용할 수 있어 코드가 매우 깔끔해집니다.

---

## 🔧 서비스 (Services)

### `services/geminiService.ts`

이 파일은 Google Gemini API와의 모든 통신을 중앙에서 관리하는 역할을 합니다. 컴포넌트는 이 서비스에 정의된 함수를 호출하기만 하면 되므로, API 호출의 구체적인 구현을 알 필요가 없습니다.

#### 주요 함수

**`runJsonPrompt<T>(prompt: string, model: string, schema?: any): Promise<T>`** 및 **`runTextPrompt(prompt: string, model: string): Promise<string>`**

-   **역할**: Gemini API에 `generateContent` 요청을 보내는 핵심 비동기 함수들입니다. 모든 기능별 API 함수 내부에서 호출됩니다. `runJsonPrompt`는 JSON 응답을, `runTextPrompt`는 텍스트 응답을 처리합니다.
-   **주요 매개변수 (Parameters)**:
    -   `prompt` (string): AI 모델에게 전달할 완전한 질문 또는 명령. `{변수}` 형태의 플레이스홀더가 모두 채워진 상태여야 합니다.
    -   `model` (string): 사용할 AI 모델의 식별자 (예: 'gemini-2.5-flash').
    -   `schema` (object, optional): `runJsonPrompt`에서 사용. AI가 반환할 JSON의 구조를 정의하여 더 안정적인 응답을 유도합니다.
-   **반환값 (Returns)**: `Promise<T>` 또는 `Promise<string>`. AI 모델이 생성한 응답을 담은 프로미스(비동기 작업의 결과)를 반환합니다.

---

**기능별 래퍼(Wrapper) 함수**

아래 함수들은 각 기능 페이지의 요구사항에 맞게 프롬프트를 가공한 후, 핵심 함수들을 호출하는 역할을 합니다.

-   **`refineText(text, tone, customPrompt, model)`**: 문장 다듬기 요청.
-   **`spellCheck(text, customPrompt, model)`**: 맞춤법 검사 요청.
-   **`compareWords(word1, word2, customPrompt, model)`**: 두 단어 비교 요청.
-   **`translateText(text, targetLanguage, customPrompt, model)`**: 번역 요청.
-   **`getWordDefinition(word, customPrompt, model)`**: 단어 뜻풀이 요청.
-   **`findWordsForDescription(description, customPrompt, model)`**: 설명에 맞는 단어 추천 요청.
-   **`calculateExpression(expression, customPrompt, model)`**: AI 계산기 요청.
-   **`generateAnnouncement(details, customPrompt, model)`**: 안내 문자 생성 요청.
-   **`generatePrompt(details, customPrompt, model)`**: AI를 이용한 프롬프트 생성 요청. `{ korean: string, english: string }` 형태의 객체를 반환합니다.
-   **`getNewsBriefing(details, customPrompt, model)`**: 뉴스 브리핑 요청. `NewsArticle[]` (뉴스 기사 객체 배열)을 반환합니다.

---

## 🎣 커스텀 훅 (Custom Hooks)

커스텀 훅은 React 컴포넌트 로직을 재사용 가능한 함수로 추출하는 방법입니다. 상태 관리, API 호출 등 반복적인 로직을 훅으로 만들어 코드를 더 깔끔하고 간결하게 유지합니다.

### `hooks/useGemini.ts`

**`useGemini<T>(apiFunc: (...args: any[]) => Promise<T>)`**

-   **역할**: Gemini API 호출과 관련된 3가지 상태(데이터, 로딩, 에러)를 매우 편리하게 관리해주는 훅입니다.
-   **매개변수 (Parameter)**:
    -   `apiFunc`: `geminiService.ts`에 정의된 비동기 API 함수 (예: `refineText`, `translateText`).
-   **반환값 (Returns)**: 객체 `{ data, isLoading, error, execute }`
    -   `data` (T | null): API 호출이 성공했을 때 받아온 데이터. 제네릭 타입 `T`에 따라 타입이 결정됩니다.
    -   `isLoading` (boolean): API 응답을 기다리는 동안 `true`가 됩니다. 로딩 스피너를 보여줄 때 사용합니다.
    -   `error` (string | null): API 호출 중 오류가 발생했을 때 에러 메시지를 저장합니다.
    -   `execute` (function): `apiFunc`를 실제로 실행하는 함수. 이 함수를 호출하면 API 요청이 시작됩니다.

### `hooks/usePrompts.ts`

**`usePrompts()`**

-   **역할**: `PromptContext`에 저장된 전역 프롬프트 데이터에 쉽게 접근할 수 있도록 해주는 훅입니다.
-   **매개변수**: 없음.
-   **반환값**: 객체 `{ prompts, savePrompts, isLoading }`
    -   `prompts` (Prompts): 현재 저장된 모든 프롬프트 데이터 객체.
    -   `savePrompts` (function): 변경된 프롬프트 객체를 저장하는 함수.
    -   `isLoading` (boolean): 초기 프롬프트 로딩 여부.

### `hooks/useModel.ts`

**`useModel()`**

-   **역할**: `ModelContext`에 저장된 전역 AI 모델 선택값에 쉽게 접근할 수 있도록 해주는 훅입니다.
-   **매개변수**: 없음.
-   **반환값**: 객체 `{ selectedModel, setSelectedModel }`
    -   `selectedModel` (string): 현재 선택된 모델의 식별자.
    -   `setSelectedModel` (function): 모델을 변경하는 함수.
