import React from 'react';
import { Member } from '../types';
import { PlusIcon, TrashIcon } from './Icons';

interface InstructorPayment {
  instructorId: number;
  instructorFee: number | string;
  incomeType: string;
}

interface MultiInstructorPaymentFormProps {
  payments: InstructorPayment[];
  employees: Member[];
  onAddPayment: () => void;
  onUpdatePayment: (index: number, field: keyof InstructorPayment, value: any) => void;
  onRemovePayment: (index: number) => void;
}

const MultiInstructorPaymentForm: React.FC<MultiInstructorPaymentFormProps> = ({
  payments,
  employees,
  onAddPayment,
  onUpdatePayment,
  onRemovePayment,
}) => {
  return (
    <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          추가 강사비 (선택사항)
        </label>
        <button
          type="button"
          onClick={onAddPayment}
          className="flex items-center gap-1 px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
        >
          <PlusIcon className="w-4 h-4" />
          강사 추가
        </button>
      </div>

      {/* 추가된 강사 목록 */}
      {payments.length > 0 && (
        <div className="space-y-2 bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
          {payments.map((payment, index) => (
            <div key={index} className="flex gap-2 items-start bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-600">
              <div className="flex-1 space-y-2">
                {/* 강사 선택 */}
                <select
                  value={payment.instructorId}
                  onChange={(e) => onUpdatePayment(index, 'instructorId', Number(e.target.value))}
                  className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                >
                  <option value={0}>강사를 선택하세요</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>

                <div className="flex gap-2">
                  {/* 강사비 */}
                  <input
                    type="number"
                    value={payment.instructorFee}
                    onChange={(e) => onUpdatePayment(index, 'instructorFee', Number(e.target.value))}
                    placeholder="강사비"
                    className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />

                  {/* 소득 종류 */}
                  <select
                    value={payment.incomeType}
                    onChange={(e) => onUpdatePayment(index, 'incomeType', e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  >
                    <option value="">선택</option>
                    <option value="사업소득">사업소득</option>
                    <option value="기타소득">기타소득</option>
                  </select>

                  {/* 삭제 버튼 */}
                  <button
                    type="button"
                    onClick={() => onRemovePayment(index)}
                    className="px-2 py-1 text-red-600 hover:bg-red-100 rounded dark:text-red-400 dark:hover:bg-red-900"
                    title="삭제"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiInstructorPaymentForm;
