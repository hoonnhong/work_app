import * as XLSX from 'xlsx';
import type { Employee } from '../types';

/**
 * 샘플 엑셀 파일 생성 및 다운로드
 */
export const downloadSampleExcel = () => {
  // 샘플 데이터
  const sampleData = [
    {
      '이름': '홍길동',
      '주민등록번호': '900101-1234567',
      '구분': '자문의,교육팀장',
      '부서/활동': '의료팀',
      '이메일': 'hong@example.com',
      '전화번호': '010-1234-5678',
      '주소': '서울시 강남구',
      '은행': '국민은행',
      '계좌번호': '123-456-789012',
      '기타 사항': '비고란입니다'
    },
    {
      '이름': '김영희',
      '주민등록번호': '910202-2345678',
      '구분': '공중보건의',
      '부서/활동': '건강지킴이 4기',
      '이메일': 'kim@example.com',
      '전화번호': '010-2345-6789',
      '주소': '서울시 서초구',
      '은행': '신한은행',
      '계좌번호': '234-567-890123',
      '기타 사항': ''
    }
  ];

  // 워크북 생성
  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '구성원 목록');

  // 열 너비 설정
  const columnWidths = [
    { wch: 10 }, // 이름
    { wch: 18 }, // 주민등록번호
    { wch: 20 }, // 구분
    { wch: 15 }, // 부서/활동
    { wch: 25 }, // 이메일
    { wch: 15 }, // 전화번호
    { wch: 30 }, // 주소
    { wch: 12 }, // 은행
    { wch: 18 }, // 계좌번호
    { wch: 30 }  // 기타 사항
  ];
  worksheet['!cols'] = columnWidths;

  // 파일 다운로드
  XLSX.writeFile(workbook, `구성원_샘플_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * 엑셀 파일에서 구성원 데이터 파싱
 */
export const parseExcelFile = (file: File): Promise<Employee[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error('파일을 읽을 수 없습니다.'));
          return;
        }

        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // 엑셀 데이터를 JSON으로 변환
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        // Employee 타입으로 변환
        const employees: Employee[] = jsonData.map((row: any, index: number) => {
          // 구분 필드를 배열로 변환 (쉼표로 구분)
          const roleString = String(row['구분'] || '').trim();
          const roles = roleString ? roleString.split(',').map(r => r.trim()).filter(r => r) : [];

          return {
            id: Date.now() + index, // 임시 ID (저장 시 새로운 ID 생성)
            name: String(row['이름'] || '').trim(),
            residentRegistrationNumber: String(row['주민등록번호'] || '').trim(),
            role: roles,
            department: String(row['부서/활동'] || '').trim(),
            email: String(row['이메일'] || '').trim(),
            phone: String(row['전화번호'] || '').trim(),
            address: String(row['주소'] || '').trim(),
            bankName: String(row['은행'] || '').trim(),
            accountNumber: String(row['계좌번호'] || '').trim(),
            notes: String(row['기타 사항'] || '').trim(),
            isActive: true
          };
        });

        // 유효성 검사 - 이름이 있는 행만 포함
        const validEmployees = employees.filter(emp => emp.name);

        if (validEmployees.length === 0) {
          reject(new Error('유효한 데이터가 없습니다. 최소한 이름은 입력되어야 합니다.'));
          return;
        }

        resolve(validEmployees);
      } catch (error) {
        reject(new Error('엑셀 파일 파싱 중 오류가 발생했습니다: ' + (error as Error).message));
      }
    };

    reader.onerror = () => {
      reject(new Error('파일을 읽는 중 오류가 발생했습니다.'));
    };

    reader.readAsBinaryString(file);
  });
};

/**
 * 엑셀 파일 유효성 검사
 */
export const validateExcelFile = (file: File): { valid: boolean; error?: string } => {
  // 파일 확장자 체크
  const allowedExtensions = ['.xlsx', '.xls'];
  const fileName = file.name.toLowerCase();
  const isValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

  if (!isValidExtension) {
    return { valid: false, error: '엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.' };
  }

  // 파일 크기 체크 (10MB 제한)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { valid: false, error: '파일 크기는 10MB를 초과할 수 없습니다.' };
  }

  return { valid: true };
};
