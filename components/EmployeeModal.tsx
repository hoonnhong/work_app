import React, { useState } from 'react';
import type { Employee, MemberOptionsSettings } from '../types';

const InputField: React.FC<{
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    required?: boolean;
}> = ({ label, name, value, onChange, type = 'text', required = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
        <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            required={required}
            className="mt-1 block w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700"
        />
    </div>
);

const TextAreaField: React.FC<{
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}> = ({ label, name, value, onChange }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
        <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            rows={3}
            className="mt-1 block w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700"
        />
    </div>
);

const EmployeeModal: React.FC<{
    employee: Employee;
    onSave: (emp: Employee) => void;
    onClose: () => void;
    memberOptions: MemberOptionsSettings | null;
    onSaveAndContinue?: (emp: Employee) => void;
}> = ({ employee, onSave, onClose, memberOptions, onSaveAndContinue }) => {
    const [formData, setFormData] = useState({...employee});
    const [selectedRoles, setSelectedRoles] = useState<string[]>(employee.role || []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleToggle = (role: string) => {
        setSelectedRoles(prev =>
            prev.includes(role)
                ? prev.filter(r => r !== role)
                : [...prev, role]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            role: selectedRoles,
            isActive: formData.isActive !== undefined ? formData.isActive : true
        });
    };

    const handleSaveAndContinue = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSaveAndContinue) {
            onSaveAndContinue({
                ...formData,
                role: selectedRoles,
                isActive: formData.isActive !== undefined ? formData.isActive : true
            });
        }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60] p-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-2xl font-bold">{employee.id ? '구성원 정보 수정' : '새 구성원 추가'}</h2>

                {/* 기본 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="이름" name="name" value={formData.name} onChange={handleChange} required />
                    <InputField label="주민등록번호" name="residentRegistrationNumber" value={formData.residentRegistrationNumber} onChange={handleChange} />
                </div>

                {/* 구분 (다중 선택) */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">구분 (중복 선택 가능)</label>
                    <div className="space-y-3 p-4 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700">
                        {memberOptions && memberOptions.roleCategories ? (
                            Object.entries(memberOptions.roleCategories).map(([key, category]) => (
                                <div key={key}>
                                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">{category.label}</div>
                                    <div className="flex flex-wrap gap-3">
                                        {category.roles.map(role => (
                                            <label key={role} className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRoles.includes(role)}
                                                    onChange={() => handleRoleToggle(role)}
                                                    className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                                />
                                                <span className="text-sm">{role}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-500 dark:text-slate-400">구분 옵션을 불러오는 중...</p>
                        )}
                    </div>
                </div>

                {/* 부서/활동 */}
                <div>
                    <label htmlFor="department" className="block text-sm font-medium text-slate-700 dark:text-slate-300">부서/활동</label>
                    <select
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700"
                    >
                        <option value="">선택하세요</option>
                        {memberOptions && memberOptions.departmentCategories && Object.entries(memberOptions.departmentCategories).map(([key, category]) => (
                            <optgroup key={key} label={category.label}>
                                {category.departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">또는 직접 입력할 수 있습니다</p>
                    <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        placeholder="직접 입력 (예: 건강지킴이 4기)"
                        className="mt-2 block w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 text-sm"
                    />
                </div>

                {/* 연락처 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="이메일" name="email" type="email" value={formData.email} onChange={handleChange} />
                    <InputField label="전화번호" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
                </div>
                <InputField label="주소" name="address" value={formData.address} onChange={handleChange} />

                {/* 계좌 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="은행" name="bankName" value={formData.bankName} onChange={handleChange} />
                    <InputField label="계좌번호" name="accountNumber" value={formData.accountNumber} onChange={handleChange} />
                </div>
                <div>
                    <label htmlFor="isActive" className="block text-sm font-medium text-slate-700 dark:text-slate-300">상태</label>
                    <select
                        id="isActive"
                        name="isActive"
                        value={formData.isActive === false ? 'false' : 'true'}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                        className="mt-1 block w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700"
                    >
                        <option value="true">활성</option>
                        <option value="false">비활성</option>
                    </select>
                </div>
                <TextAreaField label="기타 사항" name="notes" value={formData.notes} onChange={handleChange} />
                <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 rounded-md">취소</button>
                    {onSaveAndContinue && (
                        <button type="button" onClick={handleSaveAndContinue} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">정산 추가</button>
                    )}
                    <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">저장</button>
                </div>
            </form>
        </div>
      </div>
    );
};

export default EmployeeModal;
