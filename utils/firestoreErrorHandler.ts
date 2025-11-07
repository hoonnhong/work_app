/**
 * @file firestoreErrorHandler.ts
 * @description Firestore 연결 오류 처리 유틸리티
 */

/**
 * Firestore 연결이 브라우저 확장 프로그램에 의해 차단되었는지 확인
 */
export const isBlockedByBrowser = (error: any): boolean => {
  if (typeof error === 'string') {
    return error.includes('ERR_BLOCKED_BY_CLIENT') ||
           error.includes('blocked by client');
  }

  if (error?.message) {
    return error.message.includes('ERR_BLOCKED_BY_CLIENT') ||
           error.message.includes('blocked by client') ||
           error.message.includes('Network request failed');
  }

  return false;
};

/**
 * 사용자에게 친절한 오류 메시지 반환
 */
export const getFirestoreErrorMessage = (error: any): string => {
  if (isBlockedByBrowser(error)) {
    return '⚠️ 연결이 차단되었습니다.\n\n' +
           '광고 차단기나 개인정보 보호 확장 프로그램이 Firestore 연결을 차단하고 있습니다.\n\n' +
           '해결 방법:\n' +
           '1. 이 사이트에서 광고 차단기를 비활성화하거나\n' +
           '2. *.googleapis.com을 허용 목록에 추가해주세요.';
  }

  if (error?.code === 'permission-denied') {
    return '권한이 거부되었습니다. 로그인 상태를 확인해주세요.';
  }

  if (error?.code === 'unavailable') {
    return '서비스에 일시적으로 연결할 수 없습니다. 잠시 후 다시 시도해주세요.';
  }

  return `오류가 발생했습니다: ${error?.message || '알 수 없는 오류'}`;
};

/**
 * Firestore 연결 상태 확인
 */
export const checkFirestoreConnection = async (): Promise<boolean> => {
  try {
    // 간단한 연결 테스트
    const testUrl = 'https://firestore.googleapis.com/';
    const response = await fetch(testUrl, { mode: 'no-cors' });
    return true;
  } catch (error) {
    console.warn('Firestore connection check failed:', error);
    return false;
  }
};
