/**
 * @file TaxCalculatorPage.tsx
 * @description 이 파일은 '원천징수/부가세 계산기' 페이지 컴포넌트입니다.
 * 사용자는 소득 유형(사업, 기타, 부가세)을 선택하고 금액을 입력하여 세금을 계산할 수 있으며,
 * 계산된 내역을 목록에 추가하여 합계를 통합적으로 관리할 수 있습니다.
 */

// React와 필요한 기능, 컴포넌트, 타입들을 가져옵니다.
import React, { useState, useMemo } from 'react';
import { ALL_NAV_LINKS } from '../constants'; // 내비게이션 링크 상수
import PageHeader from '../components/PageHeader'; // 페이지 상단 제목 컴포넌트
import { ClipboardDocumentIcon, CheckIcon, TrashIcon } from '../components/Icons'; // 아이콘

// 원천징수 계산 한 건의 데이터 타입을 정의합니다.
interface WithholdingCalculation {
  type: 'withholding';
  id: number;
  incomeType: 'business' | 'other';
  amount: number; // 지급액
  withholdingTax: number; // 소득세
  localTax: number; // 지방소득세
  totalDeduction: number; // 총 공제액
  netPayment: number; // 실지급액
}

// 부가세 계산 한 건의 데이터 타입을 정의합니다.
interface VatCalculation {
  type: 'vat';
  id: number;
  amount: number; // 공급가액
  vat: number; // 부가세
  totalWithVat: number; // 부가세 포함 금액
}

// 두 종류의 계산을 모두 포함하는 통합 타입(Union Type)
type Calculation = WithholdingCalculation | VatCalculation;


// TaxCalculatorPage 컴포넌트를 정의합니다.
const TaxCalculatorPage: React.FC = () => {
  // `useState` 훅을 사용하여 컴포넌트의 상태(state)를 관리합니다.
  const [incomeType, setIncomeType] = useState<'business' | 'other' | 'vat'>('business'); // 선택된 소득 유형
  const [amount, setAmount] = useState<string>(''); // 사용자가 입력한 금액
  const [calculations, setCalculations] = useState<Calculation[]>([]); // 계산 내역 목록
  const [copiedField, setCopiedField] = useState<{ id: number | 'total'; field: string } | null>(null); // 어떤 항목이 복사되었는지 추적
  const [isTotalTextCopied, setIsTotalTextCopied] = useState<boolean>(false); // 합계 텍스트가 복사되었는지 추적
  
  // 세율 정보를 상수로 정의합니다.
  const rates = {
    business: { withholding: 0.03, local: 0.003 }, // 사업소득: 3.3%
    other: { withholding: 0.08, local: 0.008 } // 기타소득: 8.8% (필요경비 60% 제외 후 22%로, 실제로는 지급액의 8.8%)
  };

  // `useMemo` 훅을 사용하여 `amount`나 `incomeType`이 변경될 때만 계산을 다시 수행합니다.
  // 이는 불필요한 재계산을 방지하여 성능을 최적화합니다.
  const currentCalculation = useMemo(() => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return null; // 유효하지 않은 입력은 null 반환

    if (incomeType === 'vat') {
      const vat = Math.floor((numAmount * 0.1) / 10) * 10; // 부가세 (10원 단위 절사)
      const totalWithVat = numAmount + vat;
      return { type: 'vat' as const, vat, totalWithVat };
    } 
    
    // 원천징수 계산
    const rate = incomeType === 'business' ? rates.business.withholding : rates.other.withholding;
    const withholdingTax = Math.floor((numAmount * rate) / 10) * 10; // 소득세 (10원 단위 절사)
    const localTax = Math.floor((withholdingTax * 0.1) / 10) * 10; // 지방소득세 (소득세의 10%, 10원 단위 절사)
    const totalDeduction = withholdingTax + localTax;
    const netPayment = numAmount - totalDeduction;
    return { type: 'withholding' as const, withholdingTax, localTax, totalDeduction, netPayment };
    
  }, [amount, incomeType, rates.business, rates.other]); // 의존성 배열: 이 값들이 바뀔 때만 재계산
  
  // '목록에 추가' 버튼 클릭 시 실행될 함수입니다.
  const addCalculation = () => {
    const numAmount = parseFloat(amount);
    if (!currentCalculation || isNaN(numAmount)) return;

    // 현재 계산 결과와 입력값을 바탕으로 새 계산 객체를 만듭니다.
    let newCalc: Calculation;
    if (currentCalculation.type === 'vat') {
      newCalc = {
        type: 'vat',
        id: Date.now(), // 고유 ID로 현재 시간을 사용
        amount: numAmount,
        vat: currentCalculation.vat,
        totalWithVat: currentCalculation.totalWithVat,
      };
    } else { // withholding
      newCalc = {
        type: 'withholding',
        id: Date.now(),
        incomeType: incomeType as 'business' | 'other',
        amount: numAmount,
        withholdingTax: currentCalculation.withholdingTax,
        localTax: currentCalculation.localTax,
        totalDeduction: currentCalculation.totalDeduction,
        netPayment: currentCalculation.netPayment,
      };
    }
    // 기존 목록에 새 계산 내역을 추가합니다.
    setCalculations(prev => [...prev, newCalc]);
    // 입력창을 비웁니다.
    setAmount('');
  };
  
  // 계산 내역 삭제 함수
  const handleDelete = (id: number) => {
    setCalculations(prev => prev.filter(calc => calc.id !== id));
  };

  // 숫자를 통화 형식(세 자리마다 쉼표)으로 변환하는 헬퍼 함수입니다.
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ko-KR').format(Math.floor(value));
  };
  
  // `useMemo`를 사용하여 `calculations` 목록이 바뀔 때만 합계를 다시 계산합니다.
  const total = useMemo(() => calculations.reduce((acc, curr) => {
    if (curr.type === 'withholding') {
        acc.baseAmount += curr.amount;
        acc.tax1 += curr.withholdingTax;
        acc.tax2 += curr.localTax;
        acc.totalTax += curr.totalDeduction;
        acc.finalAmount += curr.netPayment;
    } else if (curr.type === 'vat') {
        acc.baseAmount += curr.amount;
        acc.tax1 += curr.vat; // 부가세는 tax1에 합산
        acc.totalTax += curr.vat;
        acc.finalAmount += curr.totalWithVat;
    }
    return acc;
  }, { baseAmount: 0, tax1: 0, tax2: 0, totalTax: 0, finalAmount: 0 }), [calculations]);

  // 클립보드 복사 관련 함수들
  const handleCopyValue = (value: number, id: number | 'total', field: string) => {
    navigator.clipboard.writeText(String(Math.floor(value))).then(() => {
      setCopiedField({ id, field });
      setTimeout(() => setCopiedField(null), 2000); // 2초 후 복사 완료 상태 초기화
    }).catch(err => {
      console.error('클립보드 복사에 실패했습니다:', err);
    });
  };
  
  const handleCopyTotalText = () => {
    if (calculations.length === 0) return;
    const textToCopy = `
[계산 합계]
- 총 지급액/공급가액: ${formatCurrency(total.baseAmount)} 원
- 총 공제액/부가세: ${formatCurrency(total.totalTax)} 원
- 총 실지급액/포함금액: ${formatCurrency(total.finalAmount)} 원
    `.trim().replace(/^\s+/gm, ''); // 템플릿 리터럴의 불필요한 공백 제거
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsTotalTextCopied(true);
      setTimeout(() => setIsTotalTextCopied(false), 2000);
    });
  };

  // 재사용을 위한 복사 버튼 컴포넌트
  const CopyButton: React.FC<{ value: number; calcId: number | 'total'; fieldName: string }> = ({ value, calcId, fieldName }) => (
    <button 
      onClick={() => handleCopyValue(value, calcId, fieldName)} 
      className="p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300" 
      aria-label={`${fieldName} 복사`}
    >
      {/* 현재 복사된 항목인지 확인하여 아이콘을 변경합니다. */}
      {copiedField?.id === calcId && copiedField?.field === fieldName 
        ? <CheckIcon className="h-4 w-4 text-green-500" /> 
        : <ClipboardDocumentIcon className="h-4 w-4" />}
    </button>
  );

  return (
    <div>
      <PageHeader 
        title={ALL_NAV_LINKS.tax.name} 
        subtitle="사업 소득, 기타 소득 원천세 및 부가세를 계산하고 목록에 추가하여 관리하세요."
        icon={ALL_NAV_LINKS.tax.icon}
      />
      
      <div className="space-y-8">
        {/* 계산기 입력 영역 */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-semibold mb-4">원천징수/부가세 계산기</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">소득 유형</label>
              <select 
                value={incomeType}
                onChange={(e) => setIncomeType(e.target.value as 'business' | 'other' | 'vat')}
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700"
              >
                <option value="business">사업 소득 (3.3%)</option>
                <option value="other">기타 소득 (8.8%)</option>
                <option value="vat">부가세 (10%)</option>
              </select>
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {incomeType === 'vat' ? '공급가액 (VAT 제외 금액)' : '지급액'}
              </label>
              <input 
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700"
              />
            </div>
          </div>

          {/* 실시간 계산 결과 표시 */}
          {currentCalculation && (
            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg space-y-2">
              {currentCalculation.type === 'withholding' ? (
                <>
                    <p className="flex justify-between"><span>소득세 (원천징수):</span> <span>{formatCurrency(currentCalculation.withholdingTax)}</span></p>
                    <p className="flex justify-between"><span>지방소득세:</span> <span>{formatCurrency(currentCalculation.localTax)}</span></p>
                    <p className="flex justify-between font-bold text-red-500"><span>총 공제액:</span> <span>{formatCurrency(currentCalculation.totalDeduction)}</span></p>
                    <hr className="my-2 border-slate-300 dark:border-slate-600"/>
                    <p className="flex justify-between font-bold text-primary-600"><span>실지급액:</span> <span>{formatCurrency(currentCalculation.netPayment)}</span></p>
                </>
              ) : (
                <>
                    <p className="flex justify-between"><span>부가세 (10%):</span> <span className="text-red-500">{formatCurrency(currentCalculation.vat)}</span></p>
                    <hr className="my-2 border-slate-300 dark:border-slate-600"/>
                    <p className="flex justify-between font-bold text-primary-600"><span>부가세 포함 금액:</span> <span>{formatCurrency(currentCalculation.totalWithVat)}</span></p>
                </>
              )}
            </div>
          )}

          <button onClick={addCalculation} disabled={!currentCalculation} className="mt-6 w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-slate-400">
            목록에 추가
          </button>
        </div>
        
        {/* 계산 내역 목록 및 합계 */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">계산 내역</h3>
            {calculations.length > 0 && (
                <button onClick={handleCopyTotalText} disabled={isTotalTextCopied} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:bg-slate-200" aria-label="합계 복사">
                  {isTotalTextCopied ? (<><CheckIcon className="h-4 w-4 text-green-500" /> 복사 완료!</>) : (<><ClipboardDocumentIcon className="h-4 w-4" /> 합계 복사</>)}
                </button>
            )}
          </div>
          <div>
            {calculations.length === 0 ? (
              <p className="text-slate-400 text-center py-10">계산 내역이 여기에 표시됩니다.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                        <tr>
                            <th scope="col" className="px-6 py-3">구분</th>
                            <th scope="col" className="px-6 py-3 text-right">지급액/공급가액</th>
                            <th scope="col" className="px-6 py-3 text-right">소득세/부가세</th>
                            <th scope="col" className="px-6 py-3 text-right">지방소득세</th>
                            <th scope="col" className="px-6 py-3 text-right">총 공제액</th>
                            <th scope="col" className="px-6 py-3 text-right">실지급액/포함금액</th>
                            <th scope="col" className="px-6 py-3">관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {calculations.map(calc => (
                            <tr key={calc.id} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                    {calc.type === 'withholding' ? (calc.incomeType === 'business' ? '사업' : '기타') : '부가세'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {formatCurrency(calc.amount)}
                                    <CopyButton value={calc.amount} calcId={calc.id} fieldName="amount" />
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {formatCurrency(calc.type === 'withholding' ? calc.withholdingTax : calc.vat)}
                                    <CopyButton value={calc.type === 'withholding' ? calc.withholdingTax : calc.vat} calcId={calc.id} fieldName="tax1" />
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {calc.type === 'withholding' ? (
                                        <>
                                            {formatCurrency(calc.localTax)}
                                            <CopyButton value={calc.localTax} calcId={calc.id} fieldName="tax2" />
                                        </>
                                    ) : '-'}
                                </td>
                                <td className="px-6 py-4 text-right text-red-500">
                                    {formatCurrency(calc.type === 'withholding' ? calc.totalDeduction : calc.vat)}
                                    <CopyButton value={calc.type === 'withholding' ? calc.totalDeduction : calc.vat} calcId={calc.id} fieldName="totalDeduction" />
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-primary-600">
                                    {formatCurrency(calc.type === 'withholding' ? calc.netPayment : calc.totalWithVat)}
                                    <CopyButton value={calc.type === 'withholding' ? calc.netPayment : calc.totalWithVat} calcId={calc.id} fieldName="netPayment" />
                                </td>
                                <td className="px-6 py-4">
                                    <button onClick={() => handleDelete(calc.id)} className="text-red-500 hover:text-red-700">
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700">
                            <th scope="row" className="px-6 py-3 text-base">합계</th>
                            <td className="px-6 py-3 text-right">
                                {formatCurrency(total.baseAmount)}
                                <CopyButton value={total.baseAmount} calcId='total' fieldName='baseAmount' />
                            </td>
                            <td className="px-6 py-3 text-right">
                                {formatCurrency(total.tax1)}
                                <CopyButton value={total.tax1} calcId='total' fieldName='tax1' />
                            </td>
                            <td className="px-6 py-3 text-right">
                                {formatCurrency(total.tax2)}
                                <CopyButton value={total.tax2} calcId='total' fieldName='tax2' />
                            </td>
                            <td className="px-6 py-3 text-right text-red-500">
                                {formatCurrency(total.totalTax)}
                                <CopyButton value={total.totalTax} calcId='total' fieldName='totalTax' />
                            </td>
                            <td className="px-6 py-3 text-right text-primary-600">
                                {formatCurrency(total.finalAmount)}
                                <CopyButton value={total.finalAmount} calcId='total' fieldName='finalAmount' />
                            </td>
                            <td className="px-6 py-3"></td>
                        </tr>
                    </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxCalculatorPage;