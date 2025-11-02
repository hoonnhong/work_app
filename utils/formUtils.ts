/**
 * @file formUtils.ts
 * @description 폼 관련 유틸리티 함수들
 */

/**
 * textarea에서 Ctrl+Enter 또는 Cmd+Enter로 폼 제출을 처리하는 핸들러
 * @param event - 키보드 이벤트
 * @param onSubmit - 제출 시 실행할 콜백 함수
 */
export const handleTextareaKeyDown = (
  event: React.KeyboardEvent<HTMLTextAreaElement>,
  onSubmit: () => void
) => {
  // Ctrl+Enter (Windows/Linux) 또는 Cmd+Enter (Mac)
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault(); // 기본 줄바꿈 방지
    onSubmit(); // 폼 제출
  }
};
