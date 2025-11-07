/**
 * @file types/members.ts
 * @description 구성원(직원, 강사, 거래처 등) 및 구성원 관리 관련 타입 정의
 */

/**
 * Member (구성원) 인터페이스
 * 구성원(직원, 활동가, 강사, 거래처 등) 한 명의 데이터가 어떤 속성들로 이루어져야 하는지를 정의합니다.
 * Firestore 'members' 컬렉션에 저장되는 문서의 구조
 */
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

/**
 * RoleCategory 인터페이스
 * 구성원 관리에서 사용하는 구분(role) 옵션을 관리하기 위한 타입
 */
export interface RoleCategory {
  label: string;        // 카테고리 이름 (예: "조합원 역할", "근로 형태")
  roles: string[];      // 이 카테고리에 속한 구분 목록
}

/**
 * DepartmentCategory 인터페이스
 * 구성원 관리에서 사용하는 부서(department) 옵션을 관리하기 위한 타입
 */
export interface DepartmentCategory {
  label: string;        // 카테고리 이름 (예: "활동가", "조직")
  departments: string[]; // 이 카테고리에 속한 부서 목록
}

/**
 * MemberOptionsSettings 인터페이스
 * Firestore에 저장될 전체 구성원 옵션 설정
 */
export interface MemberOptionsSettings {
  roleCategories: Record<string, RoleCategory>;      // 구분 카테고리들 (키: 카테고리 ID)
  departmentCategories: Record<string, DepartmentCategory>; // 부서 카테고리들 (키: 카테고리 ID)
  createdAt?: string;   // 생성 날짜
  updatedAt?: string;   // 수정 날짜
}
