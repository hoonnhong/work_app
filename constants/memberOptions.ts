/**
 * @file constants/memberOptions.ts
 * @description 구성원 관리에서 사용하는 구분과 부서/활동 옵션을 정의합니다.
 */

// 구분 (role) - 다중 선택 가능
export const MEMBER_ROLES = {
  // 조합원 역할
  DIRECTOR: '이사',
  AUDITOR: '감사',
  DELEGATE: '대의원',

  // 근로 형태
  EMPLOYEE: '직원',
  ACTIVIST: '활동가',
  INSTRUCTOR: '강사',
  VOLUNTEER: '자원봉사자',

  // 거래 관계
  CLIENT: '거래처',
} as const;

// 구분 카테고리별 그룹화
export const ROLE_CATEGORIES = {
  cooperative: {
    label: '조합원 역할',
    roles: [MEMBER_ROLES.DIRECTOR, MEMBER_ROLES.AUDITOR, MEMBER_ROLES.DELEGATE],
  },
  work: {
    label: '근로 형태',
    roles: [MEMBER_ROLES.EMPLOYEE, MEMBER_ROLES.ACTIVIST, MEMBER_ROLES.INSTRUCTOR, MEMBER_ROLES.VOLUNTEER],
  },
  business: {
    label: '거래 관계',
    roles: [MEMBER_ROLES.CLIENT],
  },
} as const;

// 모든 구분 옵션 배열
export const ALL_ROLES = Object.values(MEMBER_ROLES);

// 부서/활동 (department) - 단일 선택 또는 직접 입력
export const DEPARTMENT_OPTIONS = {
  // 활동가 관련
  HEALTH_KEEPER_1: '건강지킴이 1기',
  HEALTH_KEEPER_2: '건강지킴이 2기',
  HEALTH_KEEPER_3: '건강지킴이 3기',
  SHORT_TERM: '단기근로',

  // 조직
  OFFICE: '사무국',
  BOARD: '이사회',

  // 기타
  OTHER: '기타',
} as const;

// 부서 카테고리별 그룹화
export const DEPARTMENT_CATEGORIES = {
  activist: {
    label: '활동가',
    departments: [
      DEPARTMENT_OPTIONS.HEALTH_KEEPER_1,
      DEPARTMENT_OPTIONS.HEALTH_KEEPER_2,
      DEPARTMENT_OPTIONS.HEALTH_KEEPER_3,
      DEPARTMENT_OPTIONS.SHORT_TERM,
    ],
  },
  organization: {
    label: '조직',
    departments: [
      DEPARTMENT_OPTIONS.OFFICE,
      DEPARTMENT_OPTIONS.BOARD,
    ],
  },
  other: {
    label: '기타',
    departments: [DEPARTMENT_OPTIONS.OTHER],
  },
} as const;

// 모든 부서 옵션 배열
export const ALL_DEPARTMENTS = Object.values(DEPARTMENT_OPTIONS);
