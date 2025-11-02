import * as XLSX from 'xlsx';
import type { Settlement, EmployeeSettlement, ClientSettlement, ActivitySettlement } from '../types';

/**
 * 샘플 엑셀 파일 생성 및 다운로드 (시트별 구분)
 */
export const downloadSettlementSampleExcel = () => {
  const workbook = XLSX.utils.book_new();

  // === 직원 정산 시트 ===
  const employeeSampleData = [
    {
      '날짜': '2025-01-15',
      '이름': '홍길동',
      '급여': 3000000,
      '상여금': 500000,
      '초과근무수당': 200000,
      '국민연금': 166500,
      '건강보험': 119700,
      '고용보험': 59200,
      '장기요양보험': 13170,
      '연금지원': 166500,
      '고용지원': 59200,
      '소득세': 150000,
      '지방세': 15000
    },
    {
      '날짜': '2025-01-15',
      '이름': '김영희',
      '급여': 2500000,
      '상여금': 0,
      '초과근무수당': 0,
      '국민연금': 138750,
      '건강보험': 99750,
      '고용보험': 49300,
      '장기요양보험': 10970,
      '연금지원': 138750,
      '고용지원': 49300,
      '소득세': 120000,
      '지방세': 12000
    }
  ];

  const employeeSheet = XLSX.utils.json_to_sheet(employeeSampleData);
  employeeSheet['!cols'] = [
    { wch: 12 }, // 날짜
    { wch: 10 }, // 이름
    { wch: 12 }, // 급여
    { wch: 12 }, // 상여금
    { wch: 14 }, // 초과근무수당
    { wch: 12 }, // 국민연금
    { wch: 12 }, // 건강보험
    { wch: 12 }, // 고용보험
    { wch: 14 }, // 장기요양보험
    { wch: 12 }, // 연금지원
    { wch: 12 }, // 고용지원
    { wch: 10 }, // 소득세
    { wch: 10 }  // 지방세
  ];
  XLSX.utils.book_append_sheet(workbook, employeeSheet, '직원');

  // === 거래처 정산 시트 ===
  const clientSampleData = [
    {
      '날짜': '2025-01-20',
      '거래처명': '(주)ABC컴퍼니',
      '거래대금': 5000000
    },
    {
      '날짜': '2025-01-25',
      '거래처명': '(주)XYZ파트너스',
      '거래대금': 3000000
    }
  ];

  const clientSheet = XLSX.utils.json_to_sheet(clientSampleData);
  clientSheet['!cols'] = [
    { wch: 12 }, // 날짜
    { wch: 20 }, // 거래처명
    { wch: 15 }  // 거래대금
  ];
  XLSX.utils.book_append_sheet(workbook, clientSheet, '거래처');

  // === 활동비 정산 시트 ===
  const activitySampleData = [
    {
      '날짜': '2025-01-10',
      '이름': '박강사',
      '소득종류': '사업소득',
      '활동비/강사비': 1000000
    },
    {
      '날짜': '2025-01-12',
      '이름': '이활동가',
      '소득종류': '기타소득',
      '활동비/강사비': 500000
    }
  ];

  const activitySheet = XLSX.utils.json_to_sheet(activitySampleData);
  activitySheet['!cols'] = [
    { wch: 12 }, // 날짜
    { wch: 10 }, // 이름
    { wch: 12 }, // 소득종류
    { wch: 15 }  // 활동비/강사비
  ];
  XLSX.utils.book_append_sheet(workbook, activitySheet, '활동비_강사비');

  // 파일 다운로드
  XLSX.writeFile(workbook, `정산_샘플_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * 엑셀 파일에서 정산 데이터 파싱
 */
export const parseSettlementExcelFile = (file: File): Promise<Settlement[]> => {
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
        const allSettlements: Settlement[] = [];

        // 직원 시트 파싱
        if (workbook.SheetNames.includes('직원')) {
          const employeeSheet = workbook.Sheets['직원'];
          const employeeData = XLSX.utils.sheet_to_json(employeeSheet, { defval: '' });

          employeeData.forEach((row: any, index: number) => {
            const name = String(row['이름'] || '').trim();
            if (!name) return; // 이름이 없으면 스킵

            const settlement: EmployeeSettlement = {
              id: Date.now() + index,
              date: String(row['날짜'] || '').trim(),
              name,
              category: '직원',
              salary: Number(row['급여']) || 0,
              bonus: Number(row['상여금']) || 0,
              overtimePay: Number(row['초과근무수당']) || 0,
              nationalPension: Number(row['국민연금']) || 0,
              healthInsurance: Number(row['건강보험']) || 0,
              employmentInsurance: Number(row['고용보험']) || 0,
              longTermCareInsurance: Number(row['장기요양보험']) || 0,
              pensionSupport: Number(row['연금지원']) || 0,
              employmentSupport: Number(row['고용지원']) || 0,
              incomeTax: Number(row['소득세']) || 0,
              localTax: Number(row['지방세']) || 0
            };

            allSettlements.push(settlement);
          });
        }

        // 거래처 시트 파싱
        if (workbook.SheetNames.includes('거래처')) {
          const clientSheet = workbook.Sheets['거래처'];
          const clientData = XLSX.utils.sheet_to_json(clientSheet, { defval: '' });

          clientData.forEach((row: any, index: number) => {
            const name = String(row['거래처명'] || '').trim();
            if (!name) return;

            const settlement: ClientSettlement = {
              id: Date.now() + index + 10000,
              date: String(row['날짜'] || '').trim(),
              name,
              category: '거래처',
              transactionAmount: Number(row['거래대금']) || 0
            };

            allSettlements.push(settlement);
          });
        }

        // 활동비/강사비 시트 파싱
        if (workbook.SheetNames.includes('활동비_강사비')) {
          const activitySheet = workbook.Sheets['활동비_강사비'];
          const activityData = XLSX.utils.sheet_to_json(activitySheet, { defval: '' });

          activityData.forEach((row: any, index: number) => {
            const name = String(row['이름'] || '').trim();
            if (!name) return;

            const incomeTypeStr = String(row['소득종류'] || '사업소득').trim();
            const incomeType: '사업소득' | '기타소득' =
              incomeTypeStr === '기타소득' ? '기타소득' : '사업소득';

            // 구분: 활동비 또는 강사비 (기본값: 활동비)
            const categoryStr = String(row['구분'] || '활동비').trim();
            const category: '활동비' | '강사비' =
              categoryStr === '강사비' ? '강사비' : '활동비';

            const fee = Number(row['활동비/강사비']) || 0;

            // 소득세, 지방세 자동 계산
            let incomeTaxRate = 0;
            if (incomeType === '사업소득') {
              incomeTaxRate = 0.03; // 3%
            } else if (incomeType === '기타소득') {
              incomeTaxRate = 0.08; // 8%
            }

            const calculatedIncomeTax = fee > 0 ? Math.floor((fee * incomeTaxRate) / 10) * 10 : 0;
            const calculatedLocalTax = fee > 0 ? Math.floor((calculatedIncomeTax * 0.1) / 10) * 10 : 0;

            const settlement: ActivitySettlement = {
              id: Date.now() + index + 20000,
              date: String(row['날짜'] || '').trim(),
              name,
              category,
              incomeType,
              fee,
              incomeTax: calculatedIncomeTax,
              localTax: calculatedLocalTax
            };

            allSettlements.push(settlement);
          });
        }

        if (allSettlements.length === 0) {
          reject(new Error('유효한 정산 데이터가 없습니다. 최소한 이름/거래처명과 날짜는 입력되어야 합니다.'));
          return;
        }

        resolve(allSettlements);
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
export const validateSettlementExcelFile = (file: File): { valid: boolean; error?: string } => {
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
