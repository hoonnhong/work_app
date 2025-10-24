/**
 * @file types/index.ts
 * @description 이 파일은 TypeScript를 사용하는 우리 앱에서 데이터의 '모양(shape)'을 정의하는 곳입니다.
 * 예를 들어 '직원(Employee)' 데이터는 반드시 `id`, `name`, `email` 등의 속성을 가져야 하며, 
 * `id`는 숫자(`number`), `name`은 문자열(`string`)이어야 한다고 여기서 약속(정의)합니다.
 * 이렇게 데이터 타입을 미리 정의해두면, 코드를 작성할 때 실수를 줄이고(예: 오타 방지), 
 * 데이터 구조를 명확하게 알 수 있어 개발 효율성이 크게 향상됩니다.
 */


// `interface`는 객체의 구조를 정의하는 TypeScript의 키워드입니다.

// 'Employee' 인터페이스는 직원 한 명의 데이터가 어떤 속성들로 이루어져야 하는지를 정의합니다.
export interface Employee {
  id: number;           // 각 직원을 구분하기 위한 고유 번호 (숫자 타입)
  name: string;         // 직원의 이름 (문자열 타입)
  residentRegistrationNumber: string; // 주민등록번호
  role: string[];       // 직책 (배열 형태로 여러 직책을 가질 수 있음, 예: ['활동가', '이사'])
  department: string;   // 소속 부서
  email: string;        // 이메일 주소
  phone: string;        // 전화번호
  address: string;      // 주소
  bankName: string;     // 계좌 은행 이름
  accountNumber: string;// 계좌번호
  notes: string;        // 기타 추가 사항
}

// 'DevNote' 인터페이스는 개발 노트 한 개의 데이터 구조를 정의합니다.
export interface DevNote {
  id: number;           // 각 노트를 구분하기 위한 고유 번호
  title: string;        // 노트의 제목
  content: string;      // 노트의 내용
  tags: string[];       // 노트를 분류하기 위한 태그 (문자열 배열)
  created_at: string;   // 노트 작성 날짜 (예: "2023-10-27")
}

// 'FavoriteLink' 인터페이스는 자주 가는 사이트 링크 한 개의 데이터 구조를 정의합니다.
export interface FavoriteLink {
    id: number;         // 각 링크를 구분하기 위한 고유 번호
    title: string;      // 링크의 제목 (예: "React 공식 문서")
    url: string;        // 실제 웹사이트 주소 (URL)
    category: string;   // 링크를 분류하기 위한 카테고리 (예: "개발", "디자인")
}

// 'NewsArticle' 인터페이스는 뉴스 브리핑에서 가져온 뉴스 기사 한 개의 데이터 구조를 정의합니다.
export interface NewsArticle {
  date: string;         // 기사 발행 날짜
  mediaOutlet: string;  // 언론사 이름
  title: string;        // 기사 제목
  summary: string;      // 기사 요약 내용
  url: string;          // 원문 기사 링크 (URL)
}

// 'GeneratedPrompt' 인터페이스는 'AI 프롬프트 생성기'의 AI 응답 데이터 구조를 정의합니다.
export interface GeneratedPrompt {
  korean: string;       // AI가 생성한 한국어 프롬프트
  english: string;      // AI가 생성한 영어 프롬프트
}

// 'RefinedTextResult' 인터페이스는 '문장 다듬기' 기능의 AI 응답 데이터 구조를 정의합니다.
export interface RefinedTextResult {
  recommendations: string[]; // 추천 문장 3개를 담는 배열
  explanation: string;       // 수정 방향에 대한 설명
}

// 'SpellCheckResult' 인터페이스는 '맞춤법 검사' 기능의 AI 응답 데이터 구조를 정의합니다.
export interface SpellCheckResult {
  correctedText: string;     // 교정된 전체 텍스트
  explanation: string;       // 수정 사항에 대한 설명
}

//--- 정산 관리 타입 정의 ---//
// 각 정산 유형별로 필요한 속성을 정의하여 데이터의 일관성을 유지합니다.

// 'EmployeeSettlement' 인터페이스는 직원 급여 정산 데이터의 구조를 정의합니다.
export interface EmployeeSettlement {
  id: number;
  date: string;
  name: string;
  category: '직원'; // 카테고리를 '직원'이라는 특정 문자열로 고정합니다.
  salary: number; // 급여
  bonus: number; // 상여금
  overtimePay: number; // 초과근무수당
  nationalPension: number; // 국민연금
  healthInsurance: number; // 건강보험
  employmentInsurance: number; // 고용보험
  longTermCareInsurance: number; // 장기요양보험료
  pensionSupport: number; // 연금사회보험료지원금
  employmentSupport: number; // 고용사회보험료지원금
  incomeTax: number; // 소득세
  localTax: number; // 지방세
}

// 'ClientSettlement' 인터페이스는 거래처 대금 정산 데이터의 구조를 정의합니다.
export interface ClientSettlement {
  id: number;
  date: string;
  name: string;
  category: '거래처';
  transactionAmount: number; // 거래대금
}

// 'ActivitySettlement' 인터페이스는 활동비/강사비 정산 데이터의 구조를 정의합니다.
export interface ActivitySettlement {
  id: number;
  date: string;
  name: string;
  category: '활동비' | '강사비'; // 카테고리는 '활동비' 또는 '강사비' 중 하나여야 합니다.
  incomeType: '사업소득' | '기타소득'; // 소득 유형은 '사업소득' 또는 '기타소득' 중 하나여야 합니다.
  fee: number; // 활동비 또는 강사비
  incomeTax: number; // 소득세
  localTax: number; // 지방세
}

// `type` 키워드는 새로운 타입을 만드는 데 사용됩니다.
// `Settlement` 타입은 위에서 정의한 3가지 정산 타입을 모두 포함하는 'Union(합집합)' 타입입니다.
// 이렇게 하면 `Settlement` 타입의 변수는 세 가지 형태 중 어떤 것이든 가질 수 있습니다.
export type Settlement = EmployeeSettlement | ClientSettlement | ActivitySettlement;
