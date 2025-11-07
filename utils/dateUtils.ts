/**
 * 날짜 형식 변환 유틸리티
 */

/**
 * YYYY-MM-DD 형식의 날짜를 YY-MM-DD(요일) 형식으로 변환
 * @param dateString - YYYY-MM-DD 형식의 날짜 문자열
 * @returns YY-MM-DD(요일) 형식의 문자열 (예: 25-11-25(화))
 */
export const formatEventDate = (dateString: string): string => {
  if (!dateString) return '';

  // YYYY-MM-DD 형식을 파싱
  const [year, month, day] = dateString.split('-');

  if (!year || !month || !day) return dateString;

  // YY 형식으로 변환 (마지막 2자리)
  const yy = year.slice(-2);

  // Date 객체 생성 (월은 0부터 시작하므로 -1)
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

  // 요일 배열
  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = dayOfWeek[date.getDay()];

  return `${yy}-${month}-${day}(${weekday})`;
};

/**
 * 날짜와 시간을 YY-MM-DD(요일) HH:mm 형식으로 변환
 * @param dateString - YYYY-MM-DD 형식의 날짜 문자열
 * @param timeString - HH:mm 형식의 시간 문자열
 * @returns YY-MM-DD(요일) HH:mm 형식의 문자열 (예: 25-11-25(화) 16:48)
 */
export const formatEventDateTime = (dateString: string, timeString: string): string => {
  if (!dateString) return '';

  // 날짜 부분 포맷
  const formattedDate = formatEventDate(dateString);

  // 시간이 있으면 추가
  if (timeString && timeString.trim()) {
    return `${formattedDate} ${timeString}`;
  }

  return formattedDate;
};

/**
 * 날짜 문자열이 유효한지 확인
 * @param dateString - 확인할 날짜 문자열
 * @returns 유효하면 true, 아니면 false
 */
export const isValidDate = (dateString: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;

  const [year, month, day] = dateString.split('-').map(Number);

  // 월이 1-12 사이인지 확인
  if (month < 1 || month > 12) return false;

  // 일이 1-31 사이인지 확인
  if (day < 1 || day > 31) return false;

  // 실제 유효한 날짜인지 확인
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year &&
         date.getMonth() === month - 1 &&
         date.getDate() === day;
};
