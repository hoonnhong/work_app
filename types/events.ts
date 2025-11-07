/**
 * @file types/events.ts
 * @description 행사 관리와 강사비 관련 타입 정의
 */

/**
 * 강사 정보 타입 (구성원 목록에서 가져옴)
 */
export interface InstructorInfo {
  id: number;              // 강사 ID (구성원 ID)
  name: string;            // 강사명
  phone: string;           // 전화번호
  residentRegistrationNumber: string; // 주민번호
  bankName: string;        // 계좌 은행
  accountNumber: string;   // 계좌번호
}

/**
 * 강사 강사비 타입 (다중 강사 지원)
 */
export interface InstructorPayment {
  instructorId: number;    // 강사 ID
  instructorFee: number;   // 해당 강사의 강사비 (원)
  incomeType: '사업소득' | '기타소득' | ''; // 개별 강사의 소득 종류
}

/**
 * 행사 관리 타입
 * Firestore 'events' 컬렉션에 저장되는 문서의 구조
 */
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
