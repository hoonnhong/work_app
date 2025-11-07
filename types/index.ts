/**
 * @file types/index.ts
 * @description 이 파일은 TypeScript를 사용하는 우리 앱에서 데이터의 '모양(shape)'을 정의하는 곳입니다.
 * 예를 들어 '직원(Employee)' 데이터는 반드시 `id`, `name`, `email` 등의 속성을 가져야 하며, 
 * `id`는 숫자(`number`), `name`은 문자열(`string`)이어야 한다고 여기서 약속(정의)합니다.
 * 이렇게 데이터 타입을 미리 정의해두면, 코드를 작성할 때 실수를 줄이고(예: 오타 방지), 
 * 데이터 구조를 명확하게 알 수 있어 개발 효율성이 크게 향상됩니다.
 */


// `interface`는 객체의 구조를 정의하는 TypeScript의 키워드입니다.

// 'Member' 인터페이스는 구성원(직원, 활동가, 강사, 거래처 등) 한 명의 데이터가 어떤 속성들로 이루어져야 하는지를 정의합니다.
export interface Member {
  id: number;           // 각 구성원을 구분하기 위한 고유 번호 (숫자 타입)
  name: string;         // 구성원의 이름 (문자열 타입)
  residentRegistrationNumber: string; // 주민등록번호
  role: string[];       // 구분 (배열 형태로 여러 구분을 가질 수 있음, 예: ['활동가', '이사'])
  department: string;   // 소속 부서
  email: string;        // 이메일 주소
  phone: string;        // 전화번호
  address: string;      // 주소
  bankName: string;     // 계좌 은행 이름
  accountNumber: string;// 계좌번호
  notes: string;        // 기타 추가 사항
  isActive?: boolean;   // 활성 상태 (true: 활성, false: 비활성)
  createdAt?: string;   // 생성 날짜 (ISO 8601 형식)
}

// 하위 호환성을 위한 별칭
export type Employee = Member;

// 개발 노트 카테고리 타입
export type DevNoteCategory = '에러' | '개선' | '추가기능' | '새기능';

// 개발 노트 우선순위 타입
export type DevNotePriority = '높음' | '보통' | '낮음';

// 'DevNote' 인터페이스는 개발 노트 한 개의 데이터 구조를 정의합니다.
export interface DevNote {
  id: number;           // 각 노트를 구분하기 위한 고유 번호
  title: string;        // 노트의 제목
  content: string;      // 노트의 내용
  tags: string[];       // 노트를 분류하기 위한 태그 (문자열 배열)
  category?: DevNoteCategory; // 카테고리 (에러, 개선, 추가기능, 새기능)
  priority?: DevNotePriority; // 우선순위 (높음, 보통, 낮음)
  created_at: string;   // 노트 작성 날짜 (예: "2023-10-27")
  completed?: boolean;  // 완료 여부
  completedAt?: string; // 완료 날짜 (ISO 8601 형식)
  createdAt?: string;   // 생성 날짜 (ISO 8601 형식)
}

// 'FavoriteLink' 인터페이스는 자주 가는 사이트 링크 한 개의 데이터 구조를 정의합니다.
export interface FavoriteLink {
    id: number;         // 각 링크를 구분하기 위한 고유 번호
    title: string;      // 링크의 제목 (예: "React 공식 문서")
    url: string;        // 실제 웹사이트 주소 (URL)
    category: string;   // 링크를 분류하기 위한 카테고리 (예: "개발", "디자인")
    createdAt?: string; // 생성 날짜 (ISO 8601 형식)
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

// '맞춤법 검사'의 각 수정 항목에 대한 상세 구조를 정의합니다.
export interface CorrectionDetail {
  original: string;    // 원본 단어/구문
  corrected: string;   // 수정된 단어/구문
  explanation: string; // 수정 이유
}

// 'SpellCheckResult' 인터페이스는 '맞춤법 검사' 기능의 AI 응답 데이터 구조를 정의합니다.
export interface SpellCheckResult {
  checkedText: string;     // 교정된 전체 텍스트
  corrections: CorrectionDetail[]; // 수정 사항에 대한 상세 설명 객체의 배열
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
  createdAt?: string; // 생성 날짜 (ISO 8601 형식)
}

// 'ClientSettlement' 인터페이스는 거래처 대금 정산 데이터의 구조를 정의합니다.
export interface ClientSettlement {
  id: number;
  date: string;
  name: string;
  category: '거래처';
  transactionAmount: number; // 거래대금
  createdAt?: string; // 생성 날짜 (ISO 8601 형식)
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
  createdAt?: string; // 생성 날짜 (ISO 8601 형식)
}

// `type` 키워드는 새로운 타입을 만드는 데 사용됩니다.
// `Settlement` 타입은 위에서 정의한 3가지 정산 타입을 모두 포함하는 'Union(합집합)' 타입입니다.
// 이렇게 하면 `Settlement` 타입의 변수는 세 가지 형태 중 어떤 것이든 가질 수 있습니다.
export type Settlement = EmployeeSettlement | ClientSettlement | ActivitySettlement;

//--- 구성원 옵션 설정 타입 정의 ---//
// 구성원 관리에서 사용하는 구분(role)과 부서(department) 옵션을 관리하기 위한 타입입니다.

// 구분 카테고리 하나의 구조
export interface RoleCategory {
  label: string;        // 카테고리 이름 (예: "조합원 역할", "근로 형태")
  roles: string[];      // 이 카테고리에 속한 구분 목록
}

// 부서 카테고리 하나의 구조
export interface DepartmentCategory {
  label: string;        // 카테고리 이름 (예: "활동가", "조직")
  departments: string[]; // 이 카테고리에 속한 부서 목록
}

// Firestore에 저장될 전체 구성원 옵션 설정
export interface MemberOptionsSettings {
  roleCategories: Record<string, RoleCategory>;      // 구분 카테고리들 (키: 카테고리 ID)
  departmentCategories: Record<string, DepartmentCategory>; // 부서 카테고리들 (키: 카테고리 ID)
  createdAt?: string;   // 생성 날짜
  updatedAt?: string;   // 수정 날짜
}

//--- 조합 정보 관리 타입 정의 ---//
// 조합의 중요한 정보를 관리하기 위한 타입입니다.
// 비밀번호와 같은 민감한 정보는 암호화되어 저장됩니다.

// 계좌 정보 타입
export interface BankAccountInfo {
  id?: string;                // Firestore 문서 ID
  accountName: string;        // 계좌 이름 (예: "주거래 통장", "비상금 계좌")
  bankName: string;           // 은행명
  accountNumber: string;      // 계좌번호
  accountPassword?: string;   // 계좌 비밀번호 (암호화되어 저장)
  description?: string;       // 추가 설명
  createdAt?: string;
}

// 사업자 정보 타입
export interface BusinessInfo {
  id?: string;                // Firestore 문서 ID
  businessName: string;       // 사업자명
  businessNumber: string;     // 사업자번호
  corporateNumber?: string;   // 법인번호
  description?: string;       // 추가 설명
  createdAt?: string;
}

// 기타 비밀번호 정보 타입
export interface PasswordInfo {
  id?: string;                // Firestore 문서 ID
  serviceName: string;        // 서비스 이름 (예: "관리자 페이지", "클라우드 계정")
  username?: string;          // 아이디/사용자명
  password?: string;          // 비밀번호 (암호화되어 저장)
  url?: string;              // 관련 URL
  description?: string;       // 추가 설명
  createdAt?: string;
}

// 조합 정보 카테고리 타입 (Union Type)
export type OrganizationInfoCategory = '계좌정보' | '사업자정보' | '비밀번호';

//--- 행사 관리 타입 정의 ---//
// 행사 관리에서 사용하는 강사 정보와 행사 데이터 구조를 정의합니다.

// 강사 정보 타입 (구성원 목록에서 가져옴)
export interface InstructorInfo {
  id: number;              // 강사 ID (구성원 ID)
  name: string;            // 강사명
  phone: string;           // 전화번호
  residentRegistrationNumber: string; // 주민번호
  bankName: string;        // 계좌 은행
  accountNumber: string;   // 계좌번호
}

// 강사 강사비 타입 (다중 강사 지원)
export interface InstructorPayment {
  instructorId: number;    // 강사 ID
  instructorFee: number;   // 해당 강사의 강사비 (원)
  incomeType: '사업소득' | '기타소득' | ''; // 개별 강사의 소득 종류
}

// 행사 관리 타입
export interface Event {
  id: string;              // 행사 ID (Firestore 문서 ID)
  eventName: string;       // 행사명
  topic: string;           // 주제
  eventDate: string;       // 시작 날짜 (YYYY-MM-DD 형식)
  eventTime: string;       // 시작 시간 (HH:mm 형식)
  location?: string;       // 장소 (선택사항)

  // 마침 날짜/시간 (선택사항)
  endDate?: string;        // 마침 날짜 (YYYY-MM-DD 형식)
  endTime?: string;        // 마침 시간 (HH:mm 형식)

  // 강사 정보 - 기존 필드 (하위호환성)
  instructorId?: number;   // 주강사 ID (선택사항)
  instructorFee?: number;  // 주강사 강사비 (선택사항)
  incomeType?: '사업소득' | '기타소득' | ''; // 주강사 소득 종류

  // 강사 정보 - 새 필드 (다중 강사)
  instructorPayments?: InstructorPayment[]; // 강사별 강사비 정보

  createdAt?: string;      // 생성 날짜 (ISO 8601 형식)
  updatedAt?: string;      // 수정 날짜 (ISO 8601 형식)
}
