/**
 * @file constants/index.ts
 * @description 이 파일은 애플리케이션 전체에서 공통적으로 사용되는 상수(변하지 않는 값)들을 모아놓은 곳입니다.
 * 예를 들어, 사이드바에 표시될 메뉴 목록, 사용할 수 있는 AI 모델 종류 등이 여기에 정의됩니다.
 * 이렇게 상수를 한 곳에 모아두면, 여러 곳에서 동일한 값을 사용할 때 오타를 방지하고,
 * 나중에 값을 변경해야 할 때 이 파일 한 곳만 수정하면 되므로 유지보수가 매우 편리해집니다.
 */

// 아이콘 컴포넌트들을 가져옵니다. 각 메뉴 항목 옆에 표시될 아이콘들입니다.
import { HomeIcon, PencilIcon, CalculatorIcon, MegaphoneIcon, BanknotesIcon, UserGroupIcon, CodeBracketIcon, LinkIcon, QuestionMarkCircleIcon, WrenchScrewdriverIcon, NewspaperIcon, SparklesIcon, BriefcaseIcon, Cog6ToothIcon } from '../components/Icons';

// ALL_NAV_LINKS: 모든 내비게이션 링크의 정보를 담은 중앙 객체입니다.
// 각 링크는 { 이름, 경로, 아이콘 } 형태의 객체로 구성됩니다.
// 이 객체는 라우팅(App.tsx), 홈 페이지 카드 생성(HomePage.tsx), 사이드바 메뉴(Sidebar.tsx) 등
// 여러 곳에서 일관된 데이터 소스로 사용됩니다.
export const ALL_NAV_LINKS = {
    home: { name: '홈', path: '/', icon: HomeIcon },
    textTools: { name: '글쓰기 도우미', path: '/text-tools', icon: PencilIcon },
    aiCalculator: { name: 'AI 계산기', path: '/ai-calculator', icon: CalculatorIcon },
    announcement: { name: '안내 문자 생성', path: '/announcement', icon: MegaphoneIcon },
    newsBriefing: { name: '뉴스브리핑', path: '/news-briefing', icon: NewspaperIcon },
    prompts: { name: '프롬프트 편집기', path: '/prompts', icon: WrenchScrewdriverIcon },
    tax: { name: '원천징수 계산기', path: '/tax-calculator', icon: BanknotesIcon },
    hr: { name: '구성원 관리', path: '/hr-management', icon: UserGroupIcon },
    devNotes: { name: '개발 노트', path: '/dev-notes', icon: CodeBracketIcon },
    links: { name: '자주 가는 사이트', path: '/links', icon: LinkIcon },
    manual: { name: '사용 설명서', path: '/manual', icon: QuestionMarkCircleIcon },
};

// SIDEBAR_STRUCTURE: 사이드바의 실제 구조와 순서를 정의하는 배열입니다.
// 이 배열을 순회하여 사이드바 UI를 동적으로 생성합니다.
// 'link' 타입은 단일 메뉴 항목을, 'group' 타입은 하위 링크를 포함하는 확장 가능한 메뉴 그룹을 나타냅니다.
export const SIDEBAR_STRUCTURE = [
  {
    // `type: 'link' as const` 처럼 `as const`를 추가하면 TypeScript가 이 값의 타입을 'string'이 아닌
    // 리터럴 타입 'link'로 정확하게 추론합니다. 이는 타입스크립트의 타입 안정성을 높여줍니다.
    type: 'link' as const,
    // `...ALL_NAV_LINKS.home`은 ALL_NAV_LINKS.home 객체의 모든 속성(name, path, icon)을 여기에 복사해 넣는다는 의미입니다.
    ...ALL_NAV_LINKS.home
  },
  {
    type: 'group' as const,
    name: 'AI 도구',
    icon: SparklesIcon,
    links: [
      ALL_NAV_LINKS.textTools,
      ALL_NAV_LINKS.aiCalculator,
      ALL_NAV_LINKS.announcement,
      ALL_NAV_LINKS.newsBriefing,
      ALL_NAV_LINKS.prompts,
    ]
  },
  {
    type: 'group' as const,
    name: '업무 관리',
    icon: BriefcaseIcon,
    links: [
      ALL_NAV_LINKS.tax,
      ALL_NAV_LINKS.hr,
    ]
  },
  {
    type: 'group' as const,
    name: '리소스 및 기타',
    icon: Cog6ToothIcon,
    links: [
      ALL_NAV_LINKS.devNotes,
      ALL_NAV_LINKS.links,
      ALL_NAV_LINKS.manual,
    ]
  }
];


// MODELS: 사용자가 선택할 수 있는 Gemini AI 모델의 목록입니다.
// 각 모델은 사용자가 화면에서 볼 이름(name)과 API 호출 시 실제로 사용될 모델 식별자(value)를 가지고 있습니다.
export const MODELS = [
    { name: 'Gemini 2.5 Flash Lite', value: 'gemini-flash-lite-latest' },
    { name: 'Gemini 2.5 Flash', value: 'gemini-2.5-flash' },
    { name: 'Gemini 2.5 Pro', value: 'gemini-2.5-pro' },
];

// DEFAULT_MODEL: 앱이 처음 실행될 때 또는 localStorage에 저장된 값이 없을 때 기본으로 선택될 AI 모델을 지정합니다.
export const DEFAULT_MODEL = 'gemini-2.5-flash';
