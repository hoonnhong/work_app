import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import type { Settlement, EmployeeSettlement, ClientSettlement, ActivitySettlement, Employee } from '../types';
import { PencilSquareIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon, SelectorIcon, ClipboardDocumentIcon, CheckIcon } from './Icons';
import { settlementService } from '../src/firebase/firestore-service';
import { downloadSettlementSampleExcel, parseSettlementExcelFile, validateSettlementExcelFile } from '../utils/settlementExcelUtils';


// --- Helper & Sub-components ---

const formatCurrency = (value: number) => new Intl.NumberFormat('ko-KR').format(Math.floor(value));

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

const InputField: React.FC<{ label: string; name: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; required?: boolean; readOnly?: boolean; }> = 
({ label, name, value, onChange, type = 'text', required = false, readOnly = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
        <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            required={required}
            readOnly={readOnly}
            className="mt-1 block w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 read-only:bg-slate-200 dark:read-only:bg-slate-600"
        />
    </div>
);

const SettlementModal: React.FC<{ settlement: Settlement; employees: Employee[]; onSave: (settle: Settlement) => void; onClose: () => void; onAddEmployee?: () => void; }> = ({ settlement, employees, onSave, onClose, onAddEmployee }) => {
    const [formData, setFormData] = useState<any>(settlement);
    const [nameSearch, setNameSearch] = useState(settlement.name || '');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const nameDropdownRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (nameDropdownRef.current && !nameDropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (formData.category === '활동비' || formData.category === '강사비') {
            const fee = parseFloat(formData.fee) || 0;

            let incomeTaxRate = 0;
            if (formData.incomeType === '사업소득') {
                incomeTaxRate = 0.03;
            } else if (formData.incomeType === '기타소득') {
                incomeTaxRate = 0.08;
            }

            const calculatedIncomeTax = fee > 0 ? Math.floor((fee * incomeTaxRate) / 10) * 10 : 0;
            const calculatedLocalTax = fee > 0 ? Math.floor((calculatedIncomeTax * 0.1) / 10) * 10 : 0;

            if (calculatedIncomeTax !== formData.incomeTax || calculatedLocalTax !== formData.localTax) {
                 setFormData((prev: any) => ({
                    ...prev,
                    incomeTax: calculatedIncomeTax,
                    localTax: calculatedLocalTax,
                }));
            }
        }
    }, [formData.fee, formData.incomeType, formData.category, formData.incomeTax, formData.localTax]);

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(nameSearch.toLowerCase())
    );

    const handleNameSelect = (name: string) => {
        setNameSearch(name);
        setFormData({ ...formData, name });
        setIsDropdownOpen(false);
    };

    const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNameSearch(e.target.value);
        setFormData({ ...formData, name: e.target.value });
        setIsDropdownOpen(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'incomeType') {
            setFormData({ ...formData, [name]: value as '사업소득' | '기타소득' });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };
    const handleNumChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [e.target.name]: parseFloat(e.target.value) || 0 });
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };
    
    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const category = e.target.value;
        const base = { id: formData.id, date: formData.date, name: formData.name, category };
        if (category === '직원') setFormData({ ...base, salary: 0, bonus: 0, overtimePay: 0, nationalPension: 0, healthInsurance: 0, employmentInsurance: 0, longTermCareInsurance: 0, pensionSupport: 0, employmentSupport: 0, incomeTax: 0, localTax: 0 });
        if (category === '거래처') setFormData({ ...base, transactionAmount: 0 });
        if (category === '활동비' || category === '강사비') setFormData({ ...base, incomeType: '사업소득', fee: 0, incomeTax: 0, localTax: 0 });
    };

    return (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
                 <h2 className="text-2xl font-bold">{settlement.id ? '정산 내역 수정' : '새 정산 추가'}</h2>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <InputField label="날짜" name="date" type="date" value={formData.date} onChange={handleChange} required/>
                     <div className="relative" ref={nameDropdownRef}>
                         <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">이름/거래처명</label>
                         <input
                             id="name"
                             name="name"
                             type="text"
                             value={nameSearch}
                             onChange={handleNameInputChange}
                             onFocus={() => setIsDropdownOpen(true)}
                             placeholder="이름을 입력하거나 선택하세요"
                             required
                             className="mt-1 block w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700"
                         />
                         {isDropdownOpen && (
                             <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg max-h-60 overflow-auto">
                                 {filteredEmployees.length > 0 ? (
                                     filteredEmployees.map(emp => (
                                         <div
                                             key={emp.id}
                                             onClick={() => handleNameSelect(emp.name)}
                                             className="px-3 py-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                                         >
                                             {emp.name}
                                         </div>
                                     ))
                                 ) : (
                                     <div className="px-3 py-4 text-center">
                                         <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                                             검색 결과가 없습니다
                                         </p>
                                         {onAddEmployee && (
                                             <button
                                                 type="button"
                                                 onClick={() => {
                                                     setIsDropdownOpen(false);
                                                     onClose();
                                                     onAddEmployee();
                                                 }}
                                                 className="px-4 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700"
                                             >
                                                 + 구성원 추가하기
                                             </button>
                                         )}
                                     </div>
                                 )}
                             </div>
                         )}
                     </div>
                     <div>
                         <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">구분</label>
                         <select name="category" value={formData.category} onChange={handleCategoryChange} className="mt-1 block w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700">
                             <option value="직원">직원</option>
                             <option value="거래처">거래처</option>
                             <option value="활동비">활동비</option>
                             <option value="강사비">강사비</option>
                         </select>
                     </div>
                 </div>
                 <hr className="my-4"/>
                 {formData.category === '직원' && (
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         <InputField label="급여" name="salary" type="number" value={String(formData.salary)} onChange={handleNumChange}/>
                         <InputField label="상여금" name="bonus" type="number" value={String(formData.bonus)} onChange={handleNumChange}/>
                         <InputField label="초과근무수당" name="overtimePay" type="number" value={String(formData.overtimePay)} onChange={handleNumChange}/>
                         <InputField label="국민연금" name="nationalPension" type="number" value={String(formData.nationalPension)} onChange={handleNumChange}/>
                         <InputField label="건강보험" name="healthInsurance" type="number" value={String(formData.healthInsurance)} onChange={handleNumChange}/>
                         <InputField label="고용보험" name="employmentInsurance" type="number" value={String(formData.employmentInsurance)} onChange={handleNumChange}/>
                         <InputField label="장기요양보험" name="longTermCareInsurance" type="number" value={String(formData.longTermCareInsurance)} onChange={handleNumChange}/>
                         <InputField label="연금지원" name="pensionSupport" type="number" value={String(formData.pensionSupport)} onChange={handleNumChange}/>
                         <InputField label="고용지원" name="employmentSupport" type="number" value={String(formData.employmentSupport)} onChange={handleNumChange}/>
                         <InputField label="소득세" name="incomeTax" type="number" value={String(formData.incomeTax)} onChange={handleNumChange}/>
                         <InputField label="지방세" name="localTax" type="number" value={String(formData.localTax)} onChange={handleNumChange}/>
                     </div>
                 )}
                 {formData.category === '거래처' && (
                     <InputField label="거래대금" name="transactionAmount" type="number" value={String(formData.transactionAmount)} onChange={handleNumChange}/>
                 )}
                 {(formData.category === '활동비' || formData.category === '강사비') && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">소득 종류</label>
                             <select name="incomeType" value={formData.incomeType} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700">
                                 <option value="사업소득">사업소득 (3.3%)</option>
                                 <option value="기타소득">기타소득 (8.8%)</option>
                             </select>
                         </div>
                         <InputField label="활동비/강사비" name="fee" type="number" value={String(formData.fee)} onChange={handleNumChange}/>
                         <InputField label="소득세 (자동계산)" name="incomeTax" type="number" value={String(formData.incomeTax)} onChange={handleNumChange} readOnly/>
                         <InputField label="지방세 (자동계산)" name="localTax" type="number" value={String(formData.localTax)} onChange={handleNumChange} readOnly/>
                     </div>
                 )}
                 <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 rounded-md">취소</button>
                    <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md">저장</button>
                </div>
            </form>
        </div>
       </div>
    );
};

const settlementTableColumns = [
    { key: 'date', label: '날짜', defaultVisible: true, sortable: true },
    { key: 'name', label: '이름', defaultVisible: true, sortable: true },
    { key: 'category', label: '구분', defaultVisible: true, sortable: true },
    { key: 'settlementType', label: '정산구분', defaultVisible: true, sortable: false },
    { key: 'payment', label: '지급액', defaultVisible: true, sortable: true, isCurrency: true, alignRight: true },
    { key: 'deduction', label: '공제액', defaultVisible: true, sortable: true, isCurrency: true, alignRight: true },
    { key: 'netPay', label: '실지급액', defaultVisible: true, sortable: true, isCurrency: true, alignRight: true },
    { key: 'postDeductionPay', label: '공제후급여', defaultVisible: false, sortable: true, isCurrency: true, alignRight: true },
    { key: 'totalSupport', label: '총 지원금', defaultVisible: false, sortable: true, isCurrency: true, alignRight: true },
    // 직원 상세
    { key: 'salary', label: '급여', defaultVisible: false, sortable: true, isCurrency: true, alignRight: true },
    { key: 'bonus', label: '상여금', defaultVisible: false, sortable: true, isCurrency: true, alignRight: true },
    { key: 'overtimePay', label: '초과근무', defaultVisible: false, sortable: true, isCurrency: true, alignRight: true },
    { key: 'nationalPension', label: '국민연금', defaultVisible: false, sortable: true, isCurrency: true, alignRight: true },
    { key: 'healthInsurance', label: '건강보험', defaultVisible: false, sortable: true, isCurrency: true, alignRight: true },
    { key: 'employmentInsurance', label: '고용보험', defaultVisible: false, sortable: true, isCurrency: true, alignRight: true },
    { key: 'longTermCareInsurance', label: '장기요양', defaultVisible: false, sortable: true, isCurrency: true, alignRight: true },
    { key: 'pensionSupport', label: '연금지원', defaultVisible: false, sortable: true, isCurrency: true, alignRight: true },
    { key: 'employmentSupport', label: '고용지원', defaultVisible: false, sortable: true, isCurrency: true, alignRight: true },
    { key: 'incomeTax', label: '소득세', defaultVisible: false, sortable: true, isCurrency: true, alignRight: true },
    { key: 'localTax', label: '지방세', defaultVisible: false, sortable: true, isCurrency: true, alignRight: true },
    // 거래처
    { key: 'transactionAmount', label: '거래대금', defaultVisible: false, sortable: true, isCurrency: true, alignRight: true },
    // 활동비/강사비
    { key: 'fee', label: '활동/강사비', defaultVisible: false, sortable: true, isCurrency: true, alignRight: true },
    { key: 'incomeType', label: '소득종류', defaultVisible: false, sortable: true },
];


// --- Main Component ---

const SettlementManagement: React.FC<{ initialSettlements: Settlement[]; employees: Employee[]; onAddEmployee?: () => void }> = ({ initialSettlements, employees, onAddEmployee }) => {
    const [settlements, setSettlements] = useState<Settlement[]>([]);
    const [filters, setFilters] = useState<{ date: string[], name: string[], category: string[], settlementType: string[] }>({ date: [], name: [], category: [], settlementType: [] });
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'date', direction: 'desc' });
    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
        settlementTableColumns.reduce((acc, col) => ({ ...acc, [col.key]: col.defaultVisible }), {})
    );
    const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false);
    const columnSelectorRef = useRef<HTMLDivElement>(null);
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
    const [isCopying, setIsCopying] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Settlement | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importPreview, setImportPreview] = useState<Settlement[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Firestore 구독: initialSettlements가 변경될 때마다 업데이트
    useEffect(() => {
        setSettlements(initialSettlements);
    }, [initialSettlements]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isColumnSelectorOpen && columnSelectorRef.current && !columnSelectorRef.current.contains(event.target as Node)) {
                setIsColumnSelectorOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isColumnSelectorOpen]);
    
    const getSettlementType = useCallback((item: Settlement) => {
        if (item.category === '직원') return '근로소득';
        if (item.category === '거래처') return '부가세';
        return (item as ActivitySettlement).incomeType;
    }, []);

    const processedSettlements = useMemo(() => {
        let filtered = [...settlements];

        if (filters.date.length > 0) {
            filtered = filtered.filter(s => filters.date.some(d => s.date.startsWith(d)));
        }
        if (filters.name.length > 0) {
            filtered = filtered.filter(s => filters.name.some(name => s.name.toLowerCase().includes(name.toLowerCase())));
        }
        if (filters.category.length > 0) {
            filtered = filtered.filter(s => filters.category.includes(s.category));
        }
        if (filters.settlementType.length > 0) {
            filtered = filtered.filter(s => {
                const type = getSettlementType(s);
                return filters.settlementType.includes(type);
            });
        }
        
        const sorted = [...filtered].sort((a, b) => {
            if (sortConfig) {
                const aVal = (a as any)[sortConfig.key];
                const bVal = (b as any)[sortConfig.key];
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

        return sorted.map(item => {
            let payment = 0, deduction = 0, netPay = 0, postDeductionPay = 0, totalSupport = 0;
            if (item.category === '직원') {
                const emp = item as EmployeeSettlement;
                payment = emp.salary + emp.bonus + emp.overtimePay;
                const totalSocialInsurance = emp.nationalPension + emp.healthInsurance + emp.employmentInsurance + emp.longTermCareInsurance;
                const totalTaxes = emp.incomeTax + emp.localTax;
                deduction = totalSocialInsurance + totalTaxes;
                postDeductionPay = payment - deduction;
                totalSupport = emp.pensionSupport + emp.employmentSupport;
                netPay = postDeductionPay + totalSupport;
            } else if (item.category === '거래처') {
                const client = item as ClientSettlement;
                payment = client.transactionAmount;
                deduction = Math.floor((client.transactionAmount * 0.1) / 10) * 10;
                netPay = payment + deduction;
            } else {
                const activity = item as ActivitySettlement;
                payment = activity.fee;
                deduction = activity.incomeTax + activity.localTax;
                netPay = payment - deduction;
            }
            return {
                ...item,
                settlementType: getSettlementType(item),
                payment, deduction, netPay, postDeductionPay, totalSupport,
                fee: 'fee' in item ? (item as ActivitySettlement).fee : 0,
                incomeType: 'incomeType' in item ? (item as ActivitySettlement).incomeType : '사업소득',
                transactionAmount: 'transactionAmount' in item ? (item as ClientSettlement).transactionAmount : 0,
                salary: 'salary' in item ? (item as EmployeeSettlement).salary : 0,
                bonus: 'bonus' in item ? (item as EmployeeSettlement).bonus : 0,
                overtimePay: 'overtimePay' in item ? (item as EmployeeSettlement).overtimePay : 0,
                nationalPension: 'nationalPension' in item ? (item as EmployeeSettlement).nationalPension : 0,
                healthInsurance: 'healthInsurance' in item ? (item as EmployeeSettlement).healthInsurance : 0,
                employmentInsurance: 'employmentInsurance' in item ? (item as EmployeeSettlement).employmentInsurance : 0,
                longTermCareInsurance: 'longTermCareInsurance' in item ? (item as EmployeeSettlement).longTermCareInsurance : 0,
                pensionSupport: 'pensionSupport' in item ? (item as EmployeeSettlement).pensionSupport : 0,
                employmentSupport: 'employmentSupport' in item ? (item as EmployeeSettlement).employmentSupport : 0,
                incomeTax: 'incomeTax' in item ? (item as EmployeeSettlement).incomeTax || (item as ActivitySettlement).incomeTax : 0,
                localTax: 'localTax' in item ? (item as EmployeeSettlement).localTax || (item as ActivitySettlement).localTax : 0,
            };
        });
    }, [settlements, filters, sortConfig, getSettlementType]);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleAddNew = () => {
        setEditingItem({ id: 0, date: new Date().toISOString().split('T')[0], name: '', category: '직원', salary: 0, bonus: 0, overtimePay: 0, nationalPension: 0, healthInsurance: 0, employmentInsurance: 0, longTermCareInsurance: 0, pensionSupport: 0, employmentSupport: 0, incomeTax: 0, localTax: 0 });
        setIsModalOpen(true);
    };

    const handleEdit = (item: Settlement) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };
    
    const handleDelete = async (id: number) => {
        if(window.confirm('정말로 삭제하시겠습니까?')) {
            try {
                await settlementService.delete(String(id));
            } catch (error) {
                console.error('Failed to delete settlement:', error);
                alert('정산 삭제에 실패했습니다.');
            }
        }
    };

    const handleSave = async (item: Settlement) => {
        try {
            if (item.id) {
                // 업데이트
                await settlementService.update(String(item.id), item);
            } else {
                // 새로 추가
                const newId = Date.now();
                await settlementService.setWithId(String(newId), { ...item, id: newId });
            }
            setIsModalOpen(false);
            setEditingItem(null);
        } catch (error) {
            console.error('Failed to save settlement:', error);
            alert('정산 저장에 실패했습니다.');
        }
    };

    const handleCopy = (text: string, type: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setIsCopying(type);
            setTimeout(() => setIsCopying(null), 2000);
        });
    };

    const handleExportCSV = () => {
        const visibleCols = settlementTableColumns.filter(col => visibleColumns[col.key]);
        const header = visibleCols.map(col => `"${col.label}"`).join(',');
        const rows = processedSettlements.map(item =>
            visibleCols.map(col => {
                const value = (item as any)[col.key];
                return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
            }).join(',')
        );

        const csvContent = [header, ...rows].join('\n');
        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `settlements_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const handleDownloadSample = () => {
        downloadSettlementSampleExcel();
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // 파일 유효성 검사
        const validation = validateSettlementExcelFile(file);
        if (!validation.valid) {
            alert(validation.error);
            return;
        }

        try {
            setIsImporting(true);
            const parsedSettlements = await parseSettlementExcelFile(file);
            setImportPreview(parsedSettlements);
        } catch (error) {
            console.error('Failed to parse settlement excel file:', error);
            alert((error as Error).message || '엑셀 파일을 읽는 중 오류가 발생했습니다.');
            setIsImporting(false);
        } finally {
            // input 초기화
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleConfirmImport = async () => {
        if (importPreview.length === 0) return;

        try {
            // 모든 정산 내역을 Firestore에 저장
            for (const settlement of importPreview) {
                const newId = Date.now() + Math.random(); // 고유 ID 생성
                await settlementService.setWithId(String(newId), { ...settlement, id: newId });
            }

            alert(`${importPreview.length}건의 정산 내역이 성공적으로 등록되었습니다.`);
            setImportPreview([]);
            setIsImporting(false);
        } catch (error) {
            console.error('Failed to import settlements:', error);
            alert('정산 내역 일괄 등록 중 오류가 발생했습니다.');
        }
    };

    const handleCancelImport = () => {
        setImportPreview([]);
        setIsImporting(false);
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
            setSelectedItems(new Set(processedSettlements.map(s => s.id)));
        } else {
            setSelectedItems(new Set());
        }
    };

    const unique = (key: keyof Settlement) => [...new Set(settlements.map(s => String(s[key])))] as string[];
    const settlementTypes = [...new Set(settlements.map(getSettlementType))];
    const dateOptions = [...new Set(settlements.flatMap(s => [s.date.substring(0, 4), s.date.substring(0, 7)]))].sort().reverse();
    const visibleColsList = settlementTableColumns.filter(c => visibleColumns[c.key]);

    return (
        <div>
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <h3 className="text-xl font-semibold">정산 관리</h3>
                <div className="flex gap-2 flex-wrap">
                    <button onClick={handleDownloadSample} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
                        샘플 엑셀 다운로드
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        엑셀 일괄 등록
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <button onClick={handleAddNew} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                        새 정산 추가
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <MultiSelectCombobox options={dateOptions} selected={filters.date} onChange={v => setFilters(f => ({...f, date: v}))} placeholder="날짜 (YYYY or YYYY-MM)..." />
                <MultiSelectCombobox options={unique('name')} selected={filters.name} onChange={v => setFilters(f => ({...f, name: v}))} placeholder="이름 검색..." />
                <MultiSelectCombobox options={unique('category')} selected={filters.category} onChange={v => setFilters(f => ({...f, category: v}))} placeholder="구분 검색..." />
                <MultiSelectCombobox options={settlementTypes} selected={filters.settlementType} onChange={v => setFilters(f => ({...f, settlementType: v}))} placeholder="정산구분 검색..." />
            </div>
            <div className="flex flex-wrap items-center justify-end mb-4 gap-2">
                <div className="relative" ref={columnSelectorRef}>
                    <button onClick={() => setIsColumnSelectorOpen(!isColumnSelectorOpen)} className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600">
                        열 선택 <ChevronDownIcon className="h-4 w-4" />
                    </button>
                    {isColumnSelectorOpen && (
                        <div className="absolute z-20 right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-md shadow-lg border dark:border-slate-600 max-h-80 overflow-y-auto">
                            {settlementTableColumns.map(col => (
                                <label key={col.key} className="flex items-center px-4 py-2 text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700">
                                    <input type="checkbox" checked={visibleColumns[col.key]} onChange={() => setVisibleColumns(prev => ({ ...prev, [col.key]: !prev[col.key] }))} className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                                    <span className="ml-3">{col.label}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
                <button onClick={() => handleCopy(
                    processedSettlements.filter(item => selectedItems.has(item.id))
                        .map(item => visibleColsList.map(col => (item as any)[col.key]).join('\t'))
                        .join('\n'), 'selectedCopy'
                    )}
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
                                    checked={processedSettlements.length > 0 && selectedItems.size === processedSettlements.length}
                                    onChange={handleSelectAll}
                                    className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                            </th>
                            {visibleColsList.map(col =>
                                col.sortable ? (
                                    <SortableHeader key={col.key} label={col.label} sortKey={col.key} sortConfig={sortConfig} onSort={handleSort} className={col.alignRight ? 'text-right' : ''} />
                                ) : (
                                    <th key={col.key} scope="col" className={`px-4 py-3 ${col.alignRight ? 'text-right' : ''}`}>{col.label}</th>
                                )
                            )}
                            <th scope="col" className="px-4 py-3">관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {processedSettlements.map(item => (
                            <tr key={item.id} className={`border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 ${selectedItems.has(item.id) ? 'bg-primary-50 dark:bg-primary-900/50' : 'bg-white dark:bg-slate-800'}`}>
                                <td className="p-4">
                                     <input type="checkbox" checked={selectedItems.has(item.id)} onChange={() => handleSelectItem(item.id)} className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                                </td>
                                {visibleColsList.map(col => (
                                    <td key={col.key} className={`px-4 py-3 ${col.alignRight ? 'text-right' : ''} ${col.key === 'name' ? 'font-medium text-slate-900 dark:text-white' : ''} ${col.key === 'deduction' ? 'text-red-500' : ''} ${col.key === 'netPay' ? 'font-bold text-primary-600' : ''}`}>
                                        {col.isCurrency ? formatCurrency((item as any)[col.key]) : (item as any)[col.key]}
                                    </td>
                                ))}
                                <td className="px-4 py-3">
                                    <div className="flex space-x-2">
                                        <button onClick={() => handleEdit(item)} className="text-blue-500 hover:text-blue-700"><PencilSquareIcon className="h-5 w-5"/></button>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700"><TrashIcon className="h-5 w-5"/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {processedSettlements.length === 0 && (
                    <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                        해당하는 정산 내역이 없습니다.
                    </div>
                 )}
            </div>
            {isModalOpen && editingItem && (
                <SettlementModal settlement={editingItem} employees={employees} onSave={handleSave} onClose={() => setIsModalOpen(false)} onAddEmployee={onAddEmployee} />
            )}

            {/* 일괄 등록 미리보기 모달 */}
            {isImporting && importPreview.length > 0 && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                        <h2 className="text-2xl font-bold mb-4">정산 일괄 등록 미리보기</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                            {importPreview.length}건의 정산 내역이 등록됩니다. 아래 내용을 확인하고 진행해주세요.
                        </p>

                        <div className="flex-1 overflow-auto mb-4 border border-slate-300 dark:border-slate-600 rounded-md">
                            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3">번호</th>
                                        <th className="px-4 py-3">날짜</th>
                                        <th className="px-4 py-3">이름</th>
                                        <th className="px-4 py-3">구분</th>
                                        <th className="px-4 py-3 text-right">지급액</th>
                                        <th className="px-4 py-3 text-right">공제액</th>
                                        <th className="px-4 py-3 text-right">실지급액</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {importPreview.map((settlement, idx) => {
                                        // 각 항목의 지급액, 공제액, 실지급액 계산
                                        let payment = 0, deduction = 0, netPay = 0;

                                        if (settlement.category === '직원') {
                                            const emp = settlement as EmployeeSettlement;
                                            payment = emp.salary + emp.bonus + emp.overtimePay;
                                            const totalSocialInsurance = emp.nationalPension + emp.healthInsurance + emp.employmentInsurance + emp.longTermCareInsurance;
                                            const totalTaxes = emp.incomeTax + emp.localTax;
                                            deduction = totalSocialInsurance + totalTaxes;
                                            const postDeductionPay = payment - deduction;
                                            const totalSupport = emp.pensionSupport + emp.employmentSupport;
                                            netPay = postDeductionPay + totalSupport;
                                        } else if (settlement.category === '거래처') {
                                            const client = settlement as ClientSettlement;
                                            payment = client.transactionAmount;
                                            deduction = Math.floor((client.transactionAmount * 0.1) / 10) * 10;
                                            netPay = payment + deduction;
                                        } else {
                                            const activity = settlement as ActivitySettlement;
                                            payment = activity.fee;
                                            deduction = activity.incomeTax + activity.localTax;
                                            netPay = payment - deduction;
                                        }

                                        return (
                                            <tr key={idx} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                                                <td className="px-4 py-3">{idx + 1}</td>
                                                <td className="px-4 py-3">{settlement.date}</td>
                                                <td className="px-4 py-3 font-medium">{settlement.name}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded text-xs ${
                                                        settlement.category === '직원' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                                                        settlement.category === '거래처' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                                        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                                                    }`}>
                                                        {settlement.category}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">{formatCurrency(payment)}</td>
                                                <td className="px-4 py-3 text-right text-red-500">{formatCurrency(deduction)}</td>
                                                <td className="px-4 py-3 text-right font-bold text-primary-600">{formatCurrency(netPay)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4 border-t border-slate-300 dark:border-slate-600">
                            <button
                                onClick={handleCancelImport}
                                className="px-6 py-2 bg-slate-200 dark:bg-slate-600 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleConfirmImport}
                                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                            >
                                {importPreview.length}건 등록하기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettlementManagement;
