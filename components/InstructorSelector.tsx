import React from 'react';
import { Member } from '../types';
import { PlusIcon } from './Icons';

interface InstructorSelectorProps {
  instructorSearchInput: string;
  showInstructorDropdown: boolean;
  filteredInstructors: Member[];
  onSearchChange: (value: string) => void;
  onSelect: (instructorId: number, instructorName: string) => void;
  onDropdownToggle: (show: boolean) => void;
  onAddMember: () => void;
  employeesLoading?: boolean;
}

const InstructorSelector: React.FC<InstructorSelectorProps> = ({
  instructorSearchInput,
  showInstructorDropdown,
  filteredInstructors,
  onSearchChange,
  onSelect,
  onDropdownToggle,
  onAddMember,
  employeesLoading = false,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        강사
      </label>

      <div className="relative">
        <input
          type="text"
          value={instructorSearchInput}
          onChange={(e) => {
            onSearchChange(e.target.value);
            onDropdownToggle(true);
          }}
          onFocus={() => onDropdownToggle(true)}
          onBlur={() => {
            // 약간의 딜레이를 주어 드롭다운 선택 후 닫기
            setTimeout(() => onDropdownToggle(false), 200);
          }}
          placeholder="강사명을 입력하세요"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
        />

        {/* 강사 선택 드롭다운 */}
        {showInstructorDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
            {filteredInstructors.length > 0 ? (
              filteredInstructors.map((emp) => (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => onSelect(emp.id, emp.name)}
                  className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-600 border-b border-slate-200 dark:border-slate-600 last:border-b-0 text-slate-900 dark:text-slate-100"
                >
                  {emp.name}
                </button>
              ))
            ) : (
              <div className="space-y-2 p-2">
                <div className="px-4 py-2 text-slate-500 dark:text-slate-400 text-sm text-center">
                  {employeesLoading ? '구성원 데이터를 불러오는 중...' : '검색 결과가 없습니다'}
                </div>
                {!employeesLoading && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDropdownToggle(false);
                      onAddMember();
                    }}
                    className="w-full px-4 py-2 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 flex items-center justify-center gap-1"
                  >
                    <PlusIcon className="w-4 h-4" />
                    구성원 추가
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorSelector;
