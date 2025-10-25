import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Employee, MemberOptionsSettings } from '../types';
import { PencilSquareIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon, SelectorIcon, ClipboardDocumentIcon, CheckIcon } from './Icons';
import { employeeService, memberOptionsService } from '../src/firebase/firestore-service';

// --- Helper & Sub-components ---

const MultiSelectCombobox: React.FC<{
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder: string;
}> = ({ options, selected, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const ref = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(option => 
        option.toLowerCase().includes(searchTerm.toLowerCase()) && !selected.includes(option)
    );

    const toggleOption = (option: string) => {
        onChange(selected.includes(option) ? selected.filter(item => item !== option) : [...selected, option]);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        if (!isOpen) setIsOpen(true);
    };
    
    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchTerm && !selected.includes(searchTerm)) {
            e.preventDefault();
            onChange([...selected, searchTerm]);
            setSearchTerm('');
        }
    };

    return (
        <div className="relative w-full" ref={ref}>
            <div className="flex flex-wrap gap-1 items-center p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700">
                {selected.map(item => (
                    <span key={item} className="flex items-center gap-1 bg-primary-200 dark:bg-primary-800 text-sm px-2 py-0.5 rounded">
                        {item}
                        <button onClick={() => toggleOption(item)} className="text-primary-700 dark:text-primary-300">×</button>
                    </span>
                ))}
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}
                    onFocus={() => setIsOpen(true)}
                    placeholder={selected.length === 0 ? placeholder : ''}
                    className="flex-grow bg-transparent outline-none p-1"
                />
            </div>
            {isOpen && (
                <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredOptions.map(option => (
                        <li key={option} onClick={() => { toggleOption(option); setSearchTerm(''); }} className="px-3 py-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700">
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const SortableHeader: React.FC<{
    label: string;
    sortKey: string;
    sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
    onSort: (key: string) => void;
    className?: string;
}> = ({ label, sortKey, sortConfig, onSort, className }) => {
    const isSorted = sortConfig?.key === sortKey;
    const direction = isSorted ? sortConfig.direction : null;

    return (
        <th scope="col" className={`px-4 py-3 cursor-pointer ${className}`} onClick={() => onSort(sortKey)}>
            <div className="flex items-center gap-1">
                {label}
                {isSorted ? (
                    direction === 'asc' ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />
                ) : (
                    <SelectorIcon className="h-4 w-4 text-slate-400" />
                )}
            </div>
        </th>
    );
};

const InputField: React.FC<{ label: string; name: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; required?: boolean; }> = 
({ label, name, value, onChange, type = 'text', required = false }) => (
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

const TextAreaField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; }> = 
({ label, name, value, onChange }) => (
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
}> = ({ employee, onSave, onClose, memberOptions }) => {
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

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
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
                        {memberOptions && Object.entries(memberOptions.roleCategories).map(([key, category]) => (
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
                        ))}
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
                        {memberOptions && Object.entries(memberOptions.departmentCategories).map(([key, category]) => (
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
                    <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md">저장</button>
                </div>
            </form>
        </div>
      </div>
    );
};

const employeeTableColumns = [
    { key: 'name', label: '이름', defaultVisible: true, sortable: true },
    { key: 'role', label: '구분', defaultVisible: true, sortable: true, isArray: true },
    { key: 'department', label: '부서', defaultVisible: true, sortable: true },
    { key: 'phone', label: '전화번호', defaultVisible: true, sortable: false },
    { key: 'email', label: '이메일', defaultVisible: false, sortable: false },
    { key: 'residentRegistrationNumber', label: '주민등록번호', defaultVisible: false, sortable: false },
    { key: 'address', label: '주소', defaultVisible: false, sortable: false },
    { key: 'bankName', label: '은행', defaultVisible: false, sortable: false },
    { key: 'accountNumber', label: '계좌번호', defaultVisible: false, sortable: false },
    { key: 'notes', label: '기타 사항', defaultVisible: false, sortable: false },
];

// --- Main Component ---

const EmployeeManagement: React.FC<{ initialEmployees: Employee[] }> = ({ initialEmployees }) => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [memberOptions, setMemberOptions] = useState<MemberOptionsSettings | null>(null);
    const [filters, setFilters] = useState<{ name: string[], role: string[], department: string[], status: string }>({ name: [], role: [], department: [], status: 'all' });
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'name', direction: 'asc' });
    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
        employeeTableColumns.reduce((acc, col) => ({ ...acc, [col.key]: col.defaultVisible }), {})
    );
    const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false);
    const columnSelectorRef = useRef<HTMLDivElement>(null);
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
    const [isCopying, setIsCopying] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Employee | null>(null);

    // Firestore 구독: initialEmployees가 변경될 때마다 업데이트
    useEffect(() => {
        setEmployees(initialEmployees);
    }, [initialEmployees]);

    // Load member options from Firestore
    useEffect(() => {
        const unsubscribe = memberOptionsService.subscribe((data) => {
            if (data.length > 0) {
                const settingsData = data.find((d: any) => d.id === 'memberOptions');
                if (settingsData) {
                    setMemberOptions(settingsData as MemberOptionsSettings);
                }
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isColumnSelectorOpen && columnSelectorRef.current && !columnSelectorRef.current.contains(event.target as Node)) {
                setIsColumnSelectorOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isColumnSelectorOpen]);

    const filteredAndSortedEmployees = useMemo(() => {
        let filtered = [...employees];

        if (filters.name.length > 0) {
            filtered = filtered.filter(e => filters.name.some(name => e.name.toLowerCase().includes(name.toLowerCase())));
        }
        if (filters.department.length > 0) {
            filtered = filtered.filter(e => filters.department.includes(e.department));
        }
        if (filters.role.length > 0) {
            filtered = filtered.filter(e => filters.role.some(role => e.role.includes(role)));
        }
        // 재직 상태 필터
        if (filters.status === 'active') {
            filtered = filtered.filter(e => e.isActive !== false); // undefined 또는 true인 경우
        } else if (filters.status === 'inactive') {
            filtered = filtered.filter(e => e.isActive === false);
        }

        if (sortConfig) {
            filtered.sort((a, b) => {
                const aValue = a[sortConfig.key as keyof Employee];
                const bValue = b[sortConfig.key as keyof Employee];
                if (Array.isArray(aValue) && Array.isArray(bValue)) {
                    const aStr = aValue.join(', ');
                    const bStr = bValue.join(', ');
                    return sortConfig.direction === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
                }
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [employees, filters, sortConfig]);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleAddNew = () => {
        setEditingItem({ id: 0, name: '', residentRegistrationNumber: '', role: [], department: '', email: '', phone: '', address: '', bankName: '', accountNumber: '', notes: '' });
        setIsModalOpen(true);
    };

    const handleEdit = (item: Employee) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };
    
    const handleDelete = async (id: number) => {
        if(window.confirm('정말로 삭제하시겠습니까?')) {
            try {
                await employeeService.delete(String(id));
            } catch (error) {
                console.error('Failed to delete employee:', error);
                alert('구성원 삭제에 실패했습니다.');
            }
        }
    };

    const handleSave = async (item: Employee) => {
        try {
            if (item.id) {
                // 업데이트
                await employeeService.update(String(item.id), item);
            } else {
                // 새로 추가
                const newId = Date.now();
                await employeeService.setWithId(String(newId), { ...item, id: newId });
            }
            setIsModalOpen(false);
            setEditingItem(null);
        } catch (error) {
            console.error('Failed to save employee:', error);
            alert('구성원 저장에 실패했습니다.');
        }
    };

    const handleCopy = (text: string, type: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setIsCopying(type);
            setTimeout(() => setIsCopying(null), 2000);
        });
    };
    
    const handleExportCSV = () => {
        const visibleCols = employeeTableColumns.filter(col => visibleColumns[col.key]);
        const header = visibleCols.map(col => `"${col.label}"`).join(',');
        const rows = filteredAndSortedEmployees.map(item =>
            visibleCols.map(col => {
                let value = (item as any)[col.key];
                if (col.isArray && Array.isArray(value)) {
                    value = value.join(', ');
                }
                return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
            }).join(',')
        );
        
        const csvContent = [header, ...rows].join('\n');
        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `employees_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const handleCopySelected = () => {
        const visibleCols = employeeTableColumns.filter(col => visibleColumns[col.key]);
        const textToCopy = filteredAndSortedEmployees
            .filter(item => selectedItems.has(item.id))
            .map(item => 
                visibleCols.map(col => {
                    let value = (item as any)[col.key];
                    if (col.isArray && Array.isArray(value)) {
                        return value.join(', ');
                    }
                    return value;
                }).join('\t')
            )
            .join('\n');
        
        handleCopy(textToCopy, 'selectedCopy');
    };
    
    const handleSelectItem = (id: number) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedItems(new Set(filteredAndSortedEmployees.map(s => s.id)));
        } else {
            setSelectedItems(new Set());
        }
    };
    
    const unique = (key: keyof Employee) => [...new Set(employees.flatMap(e => e[key]))] as string[];
    const visibleColsList = employeeTableColumns.filter(c => visibleColumns[c.key]);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">구성원 목록</h3>
                <button onClick={handleAddNew} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">새 구성원 추가</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <MultiSelectCombobox options={unique('name')} selected={filters.name} onChange={v => setFilters(f => ({...f, name: v}))} placeholder="이름 검색..." />
                <MultiSelectCombobox options={unique('role')} selected={filters.role} onChange={v => setFilters(f => ({...f, role: v}))} placeholder="구분 검색..." />
                <MultiSelectCombobox options={unique('department')} selected={filters.department} onChange={v => setFilters(f => ({...f, department: v}))} placeholder="부서 검색..." />
                <div>
                    <select
                        value={filters.status}
                        onChange={e => setFilters(f => ({...f, status: e.target.value}))}
                        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700"
                    >
                        <option value="all">전체</option>
                        <option value="active">활성</option>
                        <option value="inactive">비활성</option>
                    </select>
                </div>
            </div>
            <div className="flex flex-wrap items-center justify-end mb-4 gap-2">
                <div className="relative" ref={columnSelectorRef}>
                    <button onClick={() => setIsColumnSelectorOpen(!isColumnSelectorOpen)} className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600">
                        열 선택 <ChevronDownIcon className="h-4 w-4" />
                    </button>
                    {isColumnSelectorOpen && (
                        <div className="absolute z-20 right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-md shadow-lg border dark:border-slate-600 max-h-80 overflow-y-auto">
                            {employeeTableColumns.map(col => (
                                <label key={col.key} className="flex items-center px-4 py-2 text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700">
                                    <input type="checkbox" checked={visibleColumns[col.key]} onChange={() => setVisibleColumns(prev => ({ ...prev, [col.key]: !prev[col.key] }))} className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                                    <span className="ml-3">{col.label}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
                <button onClick={handleCopySelected}
                    disabled={selectedItems.size === 0}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isCopying === 'selectedCopy' ? <CheckIcon className="h-5 w-5 text-green-500" /> : <ClipboardDocumentIcon className="h-5 w-5" />}
                    선택 복사 ({selectedItems.size})
                </button>
                <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 text-sm bg-green-500 text-white rounded-md hover:bg-green-600">
                    CSV로 내보내기
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                        <tr>
                            <th scope="col" className="p-4">
                                <input type="checkbox"
                                    checked={filteredAndSortedEmployees.length > 0 && selectedItems.size === filteredAndSortedEmployees.length}
                                    onChange={handleSelectAll}
                                    className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                            </th>
                            {visibleColsList.map(col =>
                                col.sortable ? (
                                    <SortableHeader key={col.key} label={col.label} sortKey={col.key} sortConfig={sortConfig} onSort={handleSort} />
                                ) : (
                                    <th key={col.key} scope="col" className="px-4 py-3">{col.label}</th>
                                )
                            )}
                            <th scope="col" className="px-4 py-3">관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedEmployees.map(emp => (
                            <tr key={emp.id} className={`border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 ${selectedItems.has(emp.id) ? 'bg-primary-50 dark:bg-primary-900/50' : 'bg-white dark:bg-slate-800'}`}>
                                <td className="p-4">
                                    <input type="checkbox" checked={selectedItems.has(emp.id)} onChange={() => handleSelectItem(emp.id)} className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                                </td>
                                {visibleColsList.map(col => (
                                    <td key={col.key} className="px-4 py-3">
                                        {col.isArray ? (emp[col.key as keyof Employee] as string[]).join(', ') : emp[col.key as keyof Employee]}
                                    </td>
                                ))}
                                <td className="px-4 py-3">
                                    <div className="flex space-x-2">
                                        <button onClick={() => handleEdit(emp)} className="text-blue-500 hover:text-blue-700"><PencilSquareIcon className="h-5 w-5"/></button>
                                        <button onClick={() => handleDelete(emp.id)} className="text-red-500 hover:text-red-700"><TrashIcon className="h-5 w-5"/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredAndSortedEmployees.length === 0 && (
                    <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                        해당하는 구성원이 없습니다.
                    </div>
                 )}
            </div>
            {isModalOpen && editingItem && (
                <EmployeeModal employee={editingItem} onSave={handleSave} onClose={() => setIsModalOpen(false)} memberOptions={memberOptions} />
            )}
        </div>
    );
};

export default EmployeeManagement;
