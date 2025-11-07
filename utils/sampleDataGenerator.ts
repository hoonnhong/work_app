/**
 * @file sampleDataGenerator.ts
 * @description 행사관리와 강사비 지급 확인서 기능을 테스트하기 위한 샘플 데이터를 생성합니다.
 * 다양한 행사 유형(강좌, 교육, 조합원행사 등)과 강사 유무를 포함합니다.
 */

import { Event, Member } from '../types';
import { FirestoreService } from '../src/firebase/firestore-service';

const eventService = new FirestoreService<Event>('events');
const employeeService = new FirestoreService<Member>('members');

/**
 * 샘플 강사/구성원 데이터
 */
export const SAMPLE_INSTRUCTORS: Omit<Member, 'createdAt'>[] = [
  {
    id: 1001,
    name: '김민준',
    residentRegistrationNumber: '880315-1234567',
    role: ['강사'],
    department: '교육담당',
    email: 'kim.minjun@example.com',
    phone: '010-1234-5678',
    address: '서울시 강남구 테헤란로 123',
    bankName: '국민은행',
    accountNumber: '123-456-789012',
    notes: '요리 강사, 매월 2회 강좌 진행',
    isActive: true,
  },
  {
    id: 1002,
    name: '이수정',
    residentRegistrationNumber: '850722-2345678',
    role: ['강사'],
    department: '교육담당',
    email: 'lee.sujeong@example.com',
    phone: '010-2345-6789',
    address: '서울시 서초구 반포대로 456',
    bankName: '우리은행',
    accountNumber: '234-567-890123',
    notes: '건강관리 강사',
    isActive: true,
  },
  {
    id: 1003,
    name: '박진호',
    residentRegistrationNumber: '780903-3456789',
    role: ['강사', '활동가'],
    department: '교육담당',
    email: 'park.jinho@example.com',
    phone: '010-3456-7890',
    address: '부산시 해운대구 우동 789',
    bankName: '신한은행',
    accountNumber: '345-678-901234',
    notes: '경영 강사, 조합 이사',
    isActive: true,
  },
  {
    id: 1004,
    name: '최영미',
    residentRegistrationNumber: '920511-4567890',
    role: ['강사'],
    department: '교육담당',
    email: 'choi.youngmi@example.com',
    phone: '010-4567-8901',
    address: '대구시 중구 동성로 111',
    bankName: '하나은행',
    accountNumber: '456-789-012345',
    notes: '문화예술 강사',
    isActive: true,
  },
];

/**
 * 샘플 행사 데이터
 * 다양한 유형의 행사를 포함합니다:
 * 1. 강좌 (강사 있음)
 * 2. 교육/세미나 (강사 있음)
 * 3. 조합원행사 (강사 없거나 선택사항)
 * 4. 워크샵 (여러 강사)
 */
export const SAMPLE_EVENTS: Omit<Event, 'createdAt' | 'updatedAt'>[] = [
  // 강좌 타입
  {
    id: 'evt_cooking_001',
    eventName: '2025년 1월 요리 강좌',
    topic: '계절 요리와 건강한 식단',
    eventDate: '2025-01-15',
    eventTime: '14:00',
    endDate: '2025-01-15',
    endTime: '16:30',
    instructorId: 1001,
    instructorFee: 300000,
    incomeType: '기타소득',
  },
  {
    id: 'evt_cooking_002',
    eventName: '2025년 2월 요리 강좌',
    topic: '발효식품 만들기',
    eventDate: '2025-02-19',
    eventTime: '14:00',
    instructorId: 1001,
    instructorFee: 350000,
    incomeType: '기타소득',
  },

  // 건강관리 교육
  {
    id: 'evt_health_001',
    eventName: '직장인 건강관리 세미나',
    topic: '스트레스 관리와 운동법',
    eventDate: '2025-01-22',
    eventTime: '10:00',
    instructorId: 1002,
    instructorFee: 250000,
    incomeType: '기타소득',
  },
  {
    id: 'evt_health_002',
    eventName: '여성 건강 교육',
    topic: '갱년기 관리와 영양',
    eventDate: '2025-02-10',
    eventTime: '15:00',
    instructorId: 1002,
    instructorFee: 400000,
    incomeType: '사업소득',
  },

  // 경영 세미나 (강사)
  {
    id: 'evt_business_001',
    eventName: '소상공인 경영 전략 워크샵',
    topic: '마케팅 전략과 디지털 전환',
    eventDate: '2025-01-29',
    eventTime: '09:00',
    instructorId: 1003,
    instructorFee: 500000,
    incomeType: '사업소득',
  },
  {
    id: 'evt_business_002',
    eventName: '재정관리 특강',
    topic: '세무 절감과 자금 관리',
    eventDate: '2025-02-26',
    eventTime: '10:00',
    instructorId: 1003,
    instructorFee: 450000,
    incomeType: '사업소득',
  },

  // 문화예술 강좌
  {
    id: 'evt_culture_001',
    eventName: '초보자 미술 강좌',
    topic: '수채화 기초',
    eventDate: '2025-01-20',
    eventTime: '13:00',
    instructorId: 1004,
    instructorFee: 280000,
    incomeType: '기타소득',
  },
  {
    id: 'evt_culture_002',
    eventName: '공예 워크샵',
    topic: '천연 염색 기법',
    eventDate: '2025-02-14',
    eventTime: '14:00',
    instructorId: 1004,
    instructorFee: 320000,
    incomeType: '기타소득',
  },

  // 조합원 행사 (강사 지정 필수 - 행사 주최자를 강사로 지정)
  {
    id: 'evt_assembly_001',
    eventName: '2025 신년 총회',
    topic: '조합 운영 방향 및 2025 계획 발표',
    eventDate: '2025-01-10',
    eventTime: '10:00',
    instructorId: 1003,
    instructorFee: 0,
    incomeType: '기타소득',
  },
  {
    id: 'evt_assembly_002',
    eventName: '분기별 조합원 교육',
    topic: '최신 정책 설명과 권리 안내',
    eventDate: '2025-01-25',
    eventTime: '14:00',
    instructorId: 1001,
    instructorFee: 150000,
    incomeType: '기타소득',
  },
  {
    id: 'evt_assembly_003',
    eventName: '조합원 네트워킹 행사',
    topic: '구성원 간 교류 및 협력 기회 마련',
    eventDate: '2025-02-07',
    eventTime: '18:00',
    instructorId: 1002,
    instructorFee: 0,
    incomeType: '기타소득',
  },

  // 특별 행사 (컨퍼런스, 페스티벌 등)
  {
    id: 'evt_conference_001',
    eventName: '2025 협동조합 컨퍼런스',
    topic: '사회적경제와 상생의 가치',
    eventDate: '2025-02-03',
    eventTime: '09:00',
    instructorId: 1003,
    instructorFee: 600000,
    incomeType: '사업소득',
  },
  {
    id: 'evt_conference_002',
    eventName: '지역 중소기업 교류 포럼',
    topic: '지역 경제 활성화 전략',
    eventDate: '2025-02-20',
    eventTime: '14:00',
    instructorId: 1001,
    instructorFee: 380000,
    incomeType: '기타소득',
  },

  // 일회성 프로젝트 기반 행사
  {
    id: 'evt_project_001',
    eventName: '환경 인식 개선 캠페인',
    topic: '지속가능한 생활 실천 방법',
    eventDate: '2025-01-31',
    eventTime: '11:00',
    instructorId: 1004,
    instructorFee: 200000,
    incomeType: '기타소득',
  },
  {
    id: 'evt_project_002',
    eventName: '청년 창업가 멘토링',
    topic: '성공적인 창업을 위한 조언',
    eventDate: '2025-02-15',
    eventTime: '16:00',
    instructorId: 1003,
    instructorFee: 550000,
    incomeType: '사업소득',
  },

  // 다중 강사 워크샵 예시
  {
    id: 'evt_workshop_multi_001',
    eventName: '종합 경영 워크샵 (2일)',
    topic: '마케팅, 재무, 인사 전략 통합 교육',
    eventDate: '2025-02-24',
    eventTime: '09:00',
    endDate: '2025-02-25',
    endTime: '17:00',
    instructorId: 1003,
    instructorFee: 500000,
    incomeType: '사업소득',
    instructorPayments: [
      {
        instructorId: 1001,
        instructorFee: 400000,
        incomeType: '기타소득',
      },
      {
        instructorId: 1002,
        instructorFee: 350000,
        incomeType: '기타소득',
      },
    ],
  },
];

/**
 * Firestore에 샘플 강사 데이터를 추가하는 함수
 */
export async function addSampleInstructors(): Promise<void> {
  try {
    console.log('샘플 강사 데이터 추가 시작...');

    for (const instructor of SAMPLE_INSTRUCTORS) {
      // 항상 저장 (기존 데이터 덮어쓰기)
      // 숫자 ID를 포함하여 저장 (강사 조회시 numeric ID 사용)
      const instructorData = {
        ...instructor,
        id: instructor.id, // 숫자 ID를 반드시 포함해야 함
      };
      await employeeService.setWithId(instructor.id.toString(), instructorData as any);
      console.log(`✓ 강사 추가/업데이트: ${instructor.name} (ID: ${instructor.id})`);
    }

    console.log('샘플 강사 데이터 추가 완료!');
  } catch (error) {
    console.error('강사 데이터 추가 오류:', error);
    throw error;
  }
}

/**
 * Firestore에 샘플 행사 데이터를 추가하는 함수
 */
export async function addSampleEvents(): Promise<void> {
  try {
    console.log('샘플 행사 데이터 추가 시작...');

    for (const event of SAMPLE_EVENTS) {
      // 항상 저장 (기존 데이터 덮어쓰기)
      // id는 따로 저장하고, 문서 ID로 사용
      const { id, ...eventData } = event;
      await eventService.setWithId(id, eventData as any);
      console.log(`✓ 행사 추가/업데이트: ${event.eventName} (ID: ${id})`);
    }

    console.log('샘플 행사 데이터 추가 완료!');
  } catch (error) {
    console.error('행사 데이터 추가 오류:', error);
    throw error;
  }
}

/**
 * 비정상 InstructorId를 가진 행사 데이터를 수정하는 마이그레이션 함수
 * InstructorId가 너무 크거나 비정상적인 경우 기본값(1001)으로 수정
 */
export async function fixAbnormalEventInstructorIds(): Promise<void> {
  try {
    console.log('비정상 행사 데이터 수정 시작...');

    const allEvents = await eventService.getAll();
    let fixedCount = 0;
    let deletedCount = 0;

    for (const event of allEvents) {
      // ID가 비정상적으로 크거나 없는 경우 처리
      if (!event.id || event.id.trim() === '') {
        console.warn(`⚠️ Event ${event.eventName}의 ID가 없습니다. 삭제합니다.`);
        // 문서 ID 기반으로 삭제 시도 (모든 events 컬렉션의 문서를 순회해야 하므로 여기서는 스킵)
        continue;
      }

      const isAbnormal =
        !event.instructorId ||
        event.instructorId <= 0 ||
        (typeof event.instructorId === 'number' && event.instructorId > 10000);

      if (isAbnormal) {
        console.log(`📝 수정 중: ${event.eventName} (기존 instructorId: ${event.instructorId}) → 1001`);

        // InstructorId를 기본값(1001)으로 수정
        const updatedEvent = {
          ...event,
          instructorId: 1001,
        };

        await eventService.update(event.id, { instructorId: 1001 });
        fixedCount++;
        console.log(`✓ 수정 완료: ${event.eventName}`);
      }
    }

    console.log(`\n✅ 비정상 행사 데이터 수정 완료! (${fixedCount}개 수정됨)`);
  } catch (error) {
    console.error('행사 데이터 수정 오류:', error);
    throw error;
  }
}

/**
 * ID가 없는 행사 데이터를 정리하는 마이그레이션 함수
 * 저장된 id 필드가 비어있는 경우를 감지하고 유효한 ID를 부여합니다
 */
export async function fixEventsWithoutStoredId(): Promise<void> {
  try {
    console.log('저장된 ID가 없는 행사 데이터 정리 시작...');

    // 직접 Firestore 쿼리로 모든 행사 문서를 조회
    const { getDocs, collection } = await import('firebase/firestore');
    const { db } = await import('../src/firebase/config');

    const querySnapshot = await getDocs(collection(db, 'events'));
    let fixedCount = 0;

    for (const doc of querySnapshot.docs) {
      const eventData = doc.data();
      const docId = doc.id;

      // 저장된 id 필드가 비어있거나 없는 경우
      if (!eventData.id || eventData.id.trim() === '') {
        console.log(`📝 정리 중: ${eventData.eventName} (문서ID: ${docId}) - 저장된 ID 부여`);

        // 문서 ID를 저장된 id 필드에 설정
        await eventService.update(docId, { id: docId });
        fixedCount++;
        console.log(`✓ 정리 완료: ${eventData.eventName}`);
      }
    }

    console.log(`\n✅ 저장된 ID 없는 행사 데이터 정리 완료! (${fixedCount}개 정리됨)`);
  } catch (error) {
    console.error('행사 데이터 정리 오류:', error);
    throw error;
  }
}

/**
 * 모든 샘플 데이터를 추가하는 함수
 */
export async function addAllSampleData(): Promise<void> {
  try {
    await addSampleInstructors();
    await addSampleEvents();
    console.log('\n✅ 모든 샘플 데이터 추가 완료!');
  } catch (error) {
    console.error('샘플 데이터 추가 실패:', error);
    throw error;
  }
}

/**
 * 샘플 데이터 정보 조회 함수
 */
export function getSampleDataInfo(): {
  instructorCount: number;
  eventCount: number;
  eventTypes: string[];
  incomeTypes: string[];
} {
  const eventTypes = new Set(SAMPLE_EVENTS.map(e => {
    if (e.eventName.includes('강좌')) return '강좌';
    if (e.eventName.includes('세미나') || e.eventName.includes('특강')) return '세미나';
    if (e.eventName.includes('총회') || e.eventName.includes('교육') || e.eventName.includes('네트워킹') || e.eventName.includes('포럼')) return '조합원행사';
    if (e.eventName.includes('컨퍼런스')) return '컨퍼런스';
    if (e.eventName.includes('워크샵')) return '워크샵';
    return '기타';
  }));

  const incomeTypes = new Set(SAMPLE_EVENTS.map(e => e.incomeType));

  return {
    instructorCount: SAMPLE_INSTRUCTORS.length,
    eventCount: SAMPLE_EVENTS.length,
    eventTypes: Array.from(eventTypes),
    incomeTypes: Array.from(incomeTypes),
  };
}
