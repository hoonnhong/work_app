import React from 'react';

interface PaymentConfirmationData {
  eventId: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  location?: string;
  topic: string;
  instructorName: string;
  instructorPhone: string;
  instructorIdNumber: string;
  instructorBankName: string;
  instructorAccountNumber: string;
  incomeType: '사업소득' | '기타소득';
  instructorFee: number;
  incomeDeductionRate: number;
  incomeDeductionAmount: number;
  localDeductionAmount: number;
  netAmount: number;
}

interface InstructorPaymentConfirmationLayoutProps {
  paymentData: PaymentConfirmationData;
  ref?: React.Ref<HTMLDivElement>;
}

const InstructorPaymentConfirmationLayout = React.forwardRef<
  HTMLDivElement,
  InstructorPaymentConfirmationLayoutProps
>(({ paymentData }, ref) => {
  return (
    <div
      ref={ref}
      className="bg-white text-black"
      style={{
        // ========== PDF 컨테이너 기본 설정 ==========
        // A4용지 가로 210mm 중 좌우 20mm 여백을 뺀 170mm 너비
        width: '170mm',
        maxWidth: '170mm',
        // 화면에서 중앙 정렬
        margin: '0 auto',
        // PDF 내부 여백 없음 (여백은 PDF 생성 시 margin으로 처리)
        padding: '0',
        boxSizing: 'border-box',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12pt',
        lineHeight: '1.25',
        overflow: 'visible',
        position: 'relative'
      }}
    >
      {/* ========== 1. 조합명 영역 ==========
          경남산청의료복지사회적협동조합 이름 표시
          수정가능: fontSize(12pt), marginBottom(2mm)
      */}
      <div style={{ textAlign: 'center', marginBottom: '2mm', fontSize: '12pt', fontWeight: 'bold' }}>
        경남산청의료복지사회적협동조합
      </div>

      {/* ========== 2. 제목 영역 ==========
          "강사비 지급 확인서" 제목 + 아래 구분선
          수정가능: fontSize(18pt), marginBottom(5mm), paddingBottom(3mm), borderBottom 색상
      */}
      <div style={{ textAlign: 'center', marginBottom: '5mm', paddingBottom: '3mm', borderBottom: '1px solid #000' }}>
        <h1 style={{ fontSize: '18pt', fontWeight: 'bold', margin: '0' }}>강사비 지급 확인서</h1>
      </div>

      {/* ========== 3. 상단 정보 영역 ==========
          강의명, 강의일시, 장소, 강의주제 4줄 표시
          수정가능:
          - marginBottom: 이 섹션 아래 여백 (3mm)
          - gap: 각 줄 사이 간격 (2mm)
          - 첫번째 컬럼(label) 너비: 50mm
      */}
      <div style={{ marginBottom: '3mm', display: 'grid', gridTemplateColumns: '1fr', gap: '2mm' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '50mm 1fr', gap: '2px', alignItems: 'flex-start' }}>
          <span style={{ fontWeight: 'bold', fontSize: '13pt' }}>□ 강의명</span>
          <div style={{ paddingBottom: '0.5px', minHeight: '14px', fontSize: '13pt' }}>: {paymentData.eventName}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '50mm 1fr', gap: '2px', alignItems: 'flex-start' }}>
          <span style={{ fontWeight: 'bold', fontSize: '13pt' }}>□ 강의일시</span>
          <div style={{ paddingBottom: '0.5px', minHeight: '14px', fontSize: '13pt' }}>: {paymentData.eventDate} {paymentData.eventTime}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '50mm 1fr', gap: '2px', alignItems: 'flex-start' }}>
          <span style={{ fontWeight: 'bold', fontSize: '13pt' }}>□ 장소</span>
          <div style={{ paddingBottom: '0.5px', minHeight: '14px', fontSize: '13pt' }}>: {paymentData.location || ''}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '50mm 1fr', gap: '2px', alignItems: 'flex-start' }}>
          <span style={{ fontWeight: 'bold', fontSize: '13pt' }}>□ 강의주제</span>
          <div style={{ paddingBottom: '0.5px', minHeight: '14px', fontSize: '13pt' }}>: {paymentData.topic}</div>
        </div>
      </div>

      {/* ========== 4. 강사 정보 영역 ==========
          성함, 주민등록번호, 연락처, 지급금액, 입금계좌 5줄 표시
          수정가능:
          - marginBottom: 이 섹션 아래 여백 (3mm)
          - gridTemplateColumns: 50mm(label) 1fr(내용) 40mm(서명)
          - 각 줄 marginBottom: 1.2mm (행간)
      */}
      <div style={{ marginBottom: '3mm', fontSize: '13pt' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '50mm 1fr', gap: '2px', alignItems: 'flex-start', marginBottom: '1.2mm' }}>
          <span style={{ fontSize: '13pt' }}>  - 성함</span>
          <div style={{ paddingBottom: '1px', minHeight: '14px', fontSize: '13pt' }}>: {paymentData.instructorName}  (서명)</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '50mm 1fr', gap: '2px', alignItems: 'flex-start', marginBottom: '1.2mm' }}>
          <span style={{ fontSize: '13pt' }}>  - 주민등록번호</span>
          <div style={{ paddingBottom: '0.5px', minHeight: '14px', fontSize: '13pt' }}>: {paymentData.instructorIdNumber}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '50mm 1fr', gap: '2px', alignItems: 'flex-start', marginBottom: '1.2mm' }}>
          <span style={{ fontSize: '13pt' }}>  - 연락처</span>
          <div style={{ paddingBottom: '0.5px', minHeight: '14px', fontSize: '13pt' }}>: {paymentData.instructorPhone}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '50mm 1fr', gap: '2px', alignItems: 'flex-start', marginBottom: '1.2mm' }}>
          <span style={{ fontSize: '13pt' }}>  - 지급금액</span>
          <div style={{ paddingBottom: '0.5px', minHeight: '14px', fontSize: '13pt' }}>: {paymentData.instructorFee.toLocaleString()}원(원천징수 후 실지급 {paymentData.netAmount.toLocaleString()}원)</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '50mm 1fr', gap: '2px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '13pt' }}>  - 입금계좌</span>
          <div style={{ paddingBottom: '0.5px', minHeight: '14px', fontSize: '13pt' }}>: {paymentData.instructorBankName} {paymentData.instructorAccountNumber}</div>
        </div>
      </div>

      {/* ========== 5. 구분선 ==========
          상단 정보와 테이블 사이의 구분선
          수정가능: borderTop(선 스타일), margin(위아래 여백 2mm)
      */}
      <div style={{ borderTop: '1px solid #000', margin: '2mm 0' }}></div>

      {/* ========== 6. 강사료 계산 테이블 ==========
          강사명, 강의일자, 강사료, 원천징수 공제액 등을 표시하는 메인 테이블
          수정가능:
          - marginBottom: 테이블 아래 여백 (2mm)
          - fontSize: 테이블 글자 크기 (10pt)
          - 각 컬럼 너비는 colgroup의 width 값으로 조정 (12%, 16% 등)
      */}
      <div style={{ marginBottom: '2mm', fontSize: '10pt', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', height: 'auto' }}>
          {/* 컬럼 너비 설정: 8개 컬럼
              1. 강사명 (12%)
              2. 강의일자 (16%)
              3. 강사료 (12%)
              4-6. 원천징수 공제액 (3개, 각 12%)
              7. 실지급액 (12%)
              8. 비고 (12%)
          */}
          <colgroup>
            <col style={{ width: '12%' }} />
            <col style={{ width: '16%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} />
          </colgroup>
          <thead>
            {/* 테이블 헤더 - 1번째 행: 메인 헤더 (높이 12mm) */}
            <tr style={{ height: '12mm' }}>
              {/* 수정 예시: fontSize를 11pt로 늘리거나, padding을 3mm로 변경 가능 */}
              <th style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold', backgroundColor: '#f0f0f0', fontSize: '10pt', wordWrap: 'break-word', verticalAlign: 'middle', textAlign: 'center', lineHeight: '1.2' }}>강사명</th>
              <th style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold', backgroundColor: '#f0f0f0', fontSize: '10pt', wordWrap: 'break-word', verticalAlign: 'middle', textAlign: 'center', lineHeight: '1.2' }}>강의일자<br/>(강의시간)</th>
              <th style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold', backgroundColor: '#f0f0f0', fontSize: '10pt', wordWrap: 'break-word', verticalAlign: 'middle', textAlign: 'center', lineHeight: '1.2' }}>강사료<br/>(A)</th>
              <th colSpan={3} style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold', backgroundColor: '#f0f0f0', fontSize: '10pt', wordWrap: 'break-word', verticalAlign: 'middle', textAlign: 'center', lineHeight: '1.2' }}>원천징수 공제액</th>
              <th style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold', backgroundColor: '#f0f0f0', fontSize: '10pt', wordWrap: 'break-word', verticalAlign: 'middle', textAlign: 'center', lineHeight: '1.2' }}>실지급액<br/>(A-B)</th>
              <th style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold', backgroundColor: '#f0f0f0', fontSize: '10pt', wordWrap: 'break-word', verticalAlign: 'middle', textAlign: 'center', lineHeight: '1.2' }}>비고</th>
            </tr>
            <tr style={{ height: '10mm' }}>
              <th colSpan={3} style={{ border: '1px solid #000', padding: '2mm', verticalAlign: 'middle' }}></th>
              <th style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold', fontSize: '10pt', verticalAlign: 'middle', textAlign: 'center', lineHeight: '1.2' }}>계(B)</th>
              <th style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold', fontSize: '10pt', verticalAlign: 'middle', textAlign: 'center', lineHeight: '1.2' }}>소득세</th>
              <th style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold', fontSize: '10pt', verticalAlign: 'middle', textAlign: 'center', lineHeight: '1.2' }}>지방<br/>소득세</th>
              <th colSpan={2} style={{ border: '1px solid #000', padding: '2mm', verticalAlign: 'middle' }}></th>
            </tr>
          </thead>
          <tbody>
            {/* 테이블 데이터 행 - 실제 강사료 정보 표시 (높이 13mm) */}
            <tr style={{ height: '13mm' }}>
              {/* 강사명 - 중앙 정렬 */}
              <td style={{ border: '1px solid #000', padding: '2mm', fontSize: '10pt', wordWrap: 'break-word', verticalAlign: 'middle', textAlign: 'center', lineHeight: '1.2' }}>{paymentData.instructorName}</td>
              <td style={{ border: '1px solid #000', padding: '2mm', fontSize: '10pt', wordWrap: 'break-word', verticalAlign: 'middle', textAlign: 'center', lineHeight: '1.2' }}>
                {paymentData.eventDate}<br/>({paymentData.eventTime})
              </td>
              <td style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold', fontSize: '10pt', verticalAlign: 'middle', textAlign: 'right', lineHeight: '1.2' }}>
                {paymentData.instructorFee.toLocaleString()}
              </td>
              <td style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold', fontSize: '10pt', verticalAlign: 'middle', textAlign: 'right', lineHeight: '1.2' }}>
                {(paymentData.incomeDeductionAmount + paymentData.localDeductionAmount).toLocaleString()}
              </td>
              <td style={{ border: '1px solid #000', padding: '2mm', fontSize: '10pt', verticalAlign: 'middle', textAlign: 'right', lineHeight: '1.2' }}>
                {paymentData.incomeDeductionAmount.toLocaleString()}
              </td>
              <td style={{ border: '1px solid #000', padding: '2mm', fontSize: '10pt', verticalAlign: 'middle', textAlign: 'right', lineHeight: '1.2' }}>
                {paymentData.localDeductionAmount.toLocaleString()}
              </td>
              <td style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold', fontSize: '10pt', verticalAlign: 'middle', textAlign: 'right', lineHeight: '1.2' }}>
                {paymentData.netAmount.toLocaleString()}
              </td>
              <td style={{ border: '1px solid #000', padding: '2mm', verticalAlign: 'middle', textAlign: 'center', lineHeight: '1.2' }}></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ========== 7. 주의사항 영역 ==========
          월 125,000원 초과지급 시 원천징수 안내
          수정가능:
          - backgroundColor: 배경색 (#f9f9f9 - 연회색)
          - padding: 내부 여백 (1.5mm)
          - marginBottom: 아래 여백 (1.5mm)
          - fontSize: 글자 크기 (11pt)
      */}
      <div style={{ backgroundColor: '#f9f9f9', border: '1px solid #000', padding: '1.5mm', marginBottom: '1.5mm', fontSize: '11pt' }}>
        <p style={{ margin: '0', fontWeight: 'bold' }}>
          ※ 동일인 월125,000원 초과지급 시 원천징수({paymentData.incomeType === '사업소득' ? '사업소득 3.3%' : '기타소득 8.8%'})
        </p>
      </div>

      {/* ========== 8. 동의 영역 ==========
          개인정보처리방침 안내 및 동의 체크박스
          수정가능:
          - padding: 전체 여백 (2mm)
          - marginBottom: 아래 여백 (1.5mm)
          - 내부 섹션의 gap: 좌우 2개 박스 간격 (1mm)
          - checkbox 섹션 gridTemplateColumns: 4개 동의/미동의 열
      */}
      <div style={{ border: '1px solid #000', padding: '2mm', marginBottom: '1.5mm', fontSize: '10pt' }}>
        {/* 동의 제목 */}
        <h3 style={{ fontWeight: 'bold', marginBottom: '1mm', lineHeight: '1.2', fontSize: '10pt', margin: '0' }}>경남산청의료복지사회적협동조합<br/>개인정보처리방침 안내및 개인정보수집 동의서</h3>

        {/* 동의 안내 텍스트 - 2줄 */}
        <div style={{ fontSize: '10pt', marginBottom: '1mm', lineHeight: '1.1' }}>
          <p style={{ margin: '0.3mm 0' }}>○ 귀하는 개인정보제공을 거부할 수 있습니다. 단, 이 경우 경남산청의료복지사회적협동조합은 수당을 지급하지 않게 됩니다.</p>
          <p style={{ margin: '0.3mm 0' }}>○ 제공된 개인정보는 소득세법에 따라 제공일자가 포함된 회계연도를 기준으로 5년간 보관되며, 관련법령에 따라 신고의 의무가 있거나, 적법한 요청이 있는 경우를 제외하고는 제3자에게 제공하지 않습니다.</p>
        </div>

        {/* 개인정보 처리 항목 - 2개 박스 좌우 배치 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1mm', marginBottom: '1mm' }}>
          <div style={{ border: '1px solid #000', padding: '1mm' }}>
            <p style={{ fontWeight: 'bold', fontSize: '10pt', margin: '0 0 0.3mm 0' }}>[개인정보 처리]</p>
            <p style={{ fontSize: '10pt', margin: '0', lineHeight: '1.1' }}>본인은 경남산청의료복지사회적협동조합의 개인 정보처리 방침에 동의하며, 수당 지급을 위하여 성명, 소속 및 직위, 주소, 은행 및 계좌정보 등의 개인정보를 경남산청의료복지사회적협동조합과 관련부서에 제공하는 것에 동의합니다.</p>
          </div>
          <div style={{ border: '1px solid #000', padding: '1mm' }}>
            <p style={{ fontWeight: 'bold', fontSize: '10pt', margin: '0 0 0.3mm 0' }}>[고유식별정보의 처리]</p>
            <p style={{ fontSize: '10pt', margin: '0', lineHeight: '1.1' }}>본인은 소득세법에 따른 소득신고를 위하여 본인의 고유식별번호(주민등록번호)를 경남산청의료복지사회적협동조합과 관련부서에 제공하는 것에 동의합니다.</p>
          </div>
        </div>

        {/* 동의 체크박스 - 4개 (동의/미동의 × 2개 항목) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1mm' }}>
          <div style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center', fontSize: '10pt' }}>
            <input type="checkbox" style={{ marginRight: '1mm' }} />
            동의
          </div>
          <div style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center', fontSize: '10pt' }}>
            <input type="checkbox" style={{ marginRight: '1mm' }} />
            미동의
          </div>
          <div style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center', fontSize: '10pt' }}>
            <input type="checkbox" style={{ marginRight: '1mm' }} />
            동의
          </div>
          <div style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center', fontSize: '10pt' }}>
            <input type="checkbox" style={{ marginRight: '1mm' }} />
            미동의
          </div>
        </div>
      </div>

      {/* ========== 9. 정보주체 서명 영역 ==========
          서명란 표시
          수정가능:
          - marginTop: 위 여백 (2mm)
          - width: 서명선 너비 (50mm)
          - height: 서명 공간 높이 (15mm)
          - fontSize: 라벨 글자 크기 (8pt-9pt)
      */}
      <div style={{ textAlign: 'right', marginTop: '2mm', fontSize: '9pt' }}>
        <div style={{ display: 'inline-block' }}>
          <p style={{ margin: '0 0 2mm 0', fontWeight: 'bold', fontSize: '8pt' }}>정보주체 서명</p>
          <div style={{ width: '50mm', height: '15mm', borderBottom: '1px solid #000' }}></div>
        </div>
      </div>
    </div>
  );
});

InstructorPaymentConfirmationLayout.displayName = 'InstructorPaymentConfirmationLayout';

export default InstructorPaymentConfirmationLayout;
