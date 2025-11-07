import React, { useState, useEffect, useRef } from 'react';
import { Event, Member } from '../types';
import { FirestoreService } from '../src/firebase/firestore-service';
import { PrinterIcon, DocumentDownloadIcon } from './Icons';
import InstructorPaymentConfirmationLayout from './InstructorPaymentConfirmationLayout';
import html2pdf from 'html2pdf.js';

const eventService = new FirestoreService<Event>('events');
const employeeService = new FirestoreService<Member>('members');

interface PaymentConfirmationData {
  eventId: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  location: string;
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

const InstructorPaymentConfirmation: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [employees, setEmployees] = useState<Member[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedInstructorIndex, setSelectedInstructorIndex] = useState<number>(-1); // -1: 주강사, 0+: 추가강사
  const [paymentData, setPaymentData] = useState<PaymentConfirmationData | null>(null);
  const [instructorFee, setInstructorFee] = useState<number>(0);
  const printRef = useRef<HTMLDivElement>(null);

  // 실시간 구독 설정
  useEffect(() => {
    const unsubscribeEvents = eventService.subscribe((data) => {
      // 각 행사 정보를 처리하고, ID가 없는 행사에 자동으로 ID 부여
      const fixedEvents = data.map((e, idx) => {
        let fixedEvent = { ...e };

        // ID가 없으면 자동으로 생성
        if (!fixedEvent.id || fixedEvent.id.trim() === '') {
          fixedEvent.id = `evt_auto_${Date.now()}_${idx}`;
        }

        return fixedEvent;
      });

      setEvents(fixedEvents);
    });

    const unsubscribeEmployees = employeeService.subscribe((data) => {
      // 구성원의 ID를 명시적으로 숫자로 변환
      const membersWithNumericIds = data.map((member) => ({
        ...member,
        id: typeof member.id === 'string' ? parseInt(member.id, 10) : member.id,
      }));
      setEmployees(membersWithNumericIds);
    });

    return () => {
      unsubscribeEvents();
      unsubscribeEmployees();
    };
  }, []);

  // 행사 선택시 강사 정보 자동 로드
  useEffect(() => {
    if (selectedEventId && events.length > 0 && employees.length > 0) {
      const selectedEvent = events.find((e) => e.id === selectedEventId);
      if (selectedEvent) {
        // 행사 선택시 자동으로 첫 번째 강사 선택
        if (selectedInstructorIndex === -1 && (!selectedEvent.instructorPayments || selectedEvent.instructorPayments.length === 0)) {
          // 추가 강사가 없는 경우 주강사는 자동으로 -1로 설정됨
        }

        // 주강사 또는 추가강사 선택
        let instructorId: number = 0;
        let fee: number = 0;
        let incomeType: '사업소득' | '기타소득' = selectedEvent.incomeType as '사업소득' | '기타소득';

        if (selectedInstructorIndex === -1) {
          // 주강사
          instructorId = selectedEvent.instructorId || 0;
          fee = instructorFee || selectedEvent.instructorFee || 0;
          incomeType = selectedEvent.incomeType as '사업소득' | '기타소득';
        } else if (selectedEvent.instructorPayments && selectedInstructorIndex < selectedEvent.instructorPayments.length) {
          // 추가강사
          const additionalInstructor = selectedEvent.instructorPayments[selectedInstructorIndex];
          instructorId = additionalInstructor.instructorId;
          fee = additionalInstructor.instructorFee;
          incomeType = additionalInstructor.incomeType as '사업소득' | '기타소득';
        }

        const instructor = employees.find((emp) => emp.id === instructorId);
        if (instructor && instructorId > 0) {
          const rate = incomeType === '사업소득' ? 0.033 : 0.088;
          const deductionAmount = fee * rate;
          const localDeductionAmount = fee * 0.01; // 지방세 1%
          const netAmount = fee - deductionAmount - localDeductionAmount;

          setPaymentData({
            eventId: selectedEvent.id,
            eventName: selectedEvent.eventName,
            eventDate: selectedEvent.eventDate,
            eventTime: selectedEvent.eventTime,
            location: selectedEvent.location || '',
            topic: selectedEvent.topic,
            instructorName: instructor.name,
            instructorPhone: instructor.phone,
            instructorIdNumber: instructor.residentRegistrationNumber,
            instructorBankName: instructor.bankName,
            instructorAccountNumber: instructor.accountNumber,
            incomeType: incomeType,
            instructorFee: fee,
            incomeDeductionRate: rate * 100,
            incomeDeductionAmount: Math.round(deductionAmount),
            localDeductionAmount: Math.round(localDeductionAmount),
            netAmount: Math.round(netAmount),
          });
          // 주강사인 경우 초기값으로 설정
          if (selectedInstructorIndex === -1 && !instructorFee) {
            setInstructorFee(selectedEvent.instructorFee || 0);
          }
        } else {
          setPaymentData(null);
        }
      }
    }
  }, [selectedEventId, selectedInstructorIndex, instructorFee, events, employees]);

  // 강사 선택 자동화 (행사 선택시 1명의 강사만 있으면 자동 선택)
  useEffect(() => {
    if (selectedEventId && events.length > 0 && employees.length > 0) {
      const instructorsList = getInstructorsForEvent(selectedEventId);
      if (instructorsList.length === 1 && selectedInstructorIndex !== instructorsList[0].id) {
        console.log('[Auto-select] Single instructor found, auto-selecting:', instructorsList[0].name);
        setSelectedInstructorIndex(instructorsList[0].id);
      }
    }
  }, [selectedEventId, events, employees]);

  // PDF 저장
  const handleDownloadPDF = () => {
    if (!printRef.current || !paymentData) {
      alert('강사비 정보를 먼저 선택해주세요.');
      return;
    }

    const element = printRef.current;
    const opt = {
      margin: [10, 20, 10, 20], // top, left, bottom, right in mm
      filename: `강사비지급확인서_${paymentData.instructorName}_${paymentData.eventDate}.pdf`,
      image: { type: 'png', quality: 0.98 },
      html2canvas: {
        scale: 2,
        allowTaint: true,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        letterRendering: true,
        precision: 15
      },
      jsPDF: {
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      }
    };

    html2pdf().set(opt).from(element).save();
  };

  // 프린트
  const handlePrint = () => {
    if (!printRef.current || !paymentData) {
      alert('강사비 정보를 먼저 선택해주세요.');
      return;
    }

    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write('<html><head><title>강사비 지급 확인서</title>');
      printWindow.document.write('<style>');
      printWindow.document.write(`
        body { font-family: 'Arial', sans-serif; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        .title { text-align: center; font-size: 28px; font-weight: bold; margin-bottom: 30px; }
        .info-section { margin-bottom: 20px; }
        .info-row { display: flex; margin-bottom: 10px; }
        .info-label { width: 150px; font-weight: bold; }
        .info-value { flex: 1; border-bottom: 1px solid #000; padding-bottom: 2px; }
        table { width: 100%; border-collapse: collapse; margin-top: 30px; }
        th, td { border: 1px solid #000; padding: 8px; text-align: center; }
        th { background-color: #f0f0f0; font-weight: bold; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; }
        .consent-section { margin-top: 30px; padding: 15px; border: 1px solid #000; }
        .checkbox { margin-right: 10px; }
        .signature-area { margin-top: 40px; text-align: center; }
        .signature-line { width: 100px; border-top: 1px solid #000; margin: 20px auto; }
      `);
      printWindow.document.write('</style></head><body>');
      printWindow.document.write(printRef.current.innerHTML);
      printWindow.document.write('</body></html>');
      printWindow.document.close();

      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  // 선택된 행사의 강사 목록 가져오기
  const getInstructorsForEvent = (eventId: string): Array<{ id: number; name: string }> => {
    if (!eventId || !events || !employees || employees.length === 0) {
      return [];
    }

    const event = events.find((e) => e.id === eventId);
    if (!event) {
      return [];
    }

    const instructors: Array<{ id: number; name: string }> = [];

    // 주강사 추가 - 숫자 ID만 사용
    if (event.instructorId && event.instructorId > 0) {
      // 단순히 숫자 비교만 수행
      const mainInstructor = employees.find((emp) => {
        const empIdNum = Number(emp.id);
        const eventIdNum = Number(event.instructorId);
        return empIdNum === eventIdNum;
      });

      if (mainInstructor) {
        instructors.push({
          id: -1,
          name: `${mainInstructor.name} (주강사)`,
        });
      }
    }

    // 추가 강사 추가
    if (event.instructorPayments && event.instructorPayments.length > 0) {
      event.instructorPayments.forEach((payment, index) => {
        // 단순히 숫자 비교만 수행
        const instructor = employees.find((emp) => Number(emp.id) === Number(payment.instructorId));

        if (instructor) {
          instructors.push({
            id: index,
            name: `${instructor.name} (추가강사)`,
          });
        }
      });
    }

    return instructors;
  };

  return (
    <div className="space-y-4">
      {/* 행사 선택 영역 */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 행사 드롭다운 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              행사 선택 *
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => {
                setSelectedEventId(e.target.value);
                setSelectedInstructorIndex(-1);
                setInstructorFee(0);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            >
              <option value="">행사를 선택하세요</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.eventName} ({event.eventDate})
                </option>
              ))}
            </select>
          </div>

          {/* 강사 선택 드롭다운 */}
          {selectedEventId && (() => {
            const instructorsList = getInstructorsForEvent(selectedEventId);
            const hasMultipleInstructors = instructorsList.length > 1;

            return (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  강사 선택 {hasMultipleInstructors && '*'}
                </label>
                {hasMultipleInstructors ? (
                  // 2명 이상의 강사가 있는 경우: 드롭다운 표시
                  <select
                    value={selectedInstructorIndex}
                    onChange={(e) => {
                      setSelectedInstructorIndex(Number(e.target.value));
                      setInstructorFee(0);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  >
                    <option value={-1}>강사를 선택하세요</option>
                    {instructorsList.map((instructor) => (
                      <option key={instructor.id} value={instructor.id}>
                        {instructor.name}
                      </option>
                    ))}
                  </select>
                ) : instructorsList.length === 1 ? (
                  // 1명의 강사만 있는 경우: 읽기 전용 필드로 표시
                  <div className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 dark:bg-slate-700 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium">
                    {instructorsList[0].name}
                  </div>
                ) : (
                  // 강사 정보를 불러오는 중
                  <div className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 dark:bg-slate-700 dark:border-slate-600 text-slate-500 dark:text-slate-400">
                    {employees.length === 0 ? '구성원 데이터를 불러오는 중...' : '강사를 찾을 수 없습니다'}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* 주강사인 경우만 강사료 입력 필드 표시 */}
        {selectedEventId && selectedInstructorIndex === -1 && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              강사료 (선택사항 - 입력시 이 금액으로 확인서 작성)
            </label>
            <input
              type="number"
              value={instructorFee}
              onChange={(e) => setInstructorFee(Number(e.target.value))}
              placeholder="강사료를 입력하세요"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>
        )}
      </div>

      {/* 버튼 영역 */}
      {paymentData && (
        <div className="flex gap-3">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
          >
            <DocumentDownloadIcon className="w-5 h-5" />
            PDF 저장
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            <PrinterIcon className="w-5 h-5" />
            프린트
          </button>
        </div>
      )}

      {/* 강사비 지급 확인서 */}
      {paymentData && (
        <InstructorPaymentConfirmationLayout ref={printRef} paymentData={paymentData} />
      )}

      {!paymentData && selectedEventId && (
        <div className="bg-amber-50 dark:bg-amber-900 border border-amber-200 dark:border-amber-700 rounded-lg p-4 text-amber-800 dark:text-amber-200">
          강사료를 입력해주세요.
        </div>
      )}

      {!selectedEventId && (
        <div className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-4 text-center text-slate-600 dark:text-slate-400">
          행사를 선택하고 강사료를 입력하면 강사비 지급 확인서가 표시됩니다.
        </div>
      )}
    </div>
  );
};

export default InstructorPaymentConfirmation;
