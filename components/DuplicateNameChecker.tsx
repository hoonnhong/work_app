import React, { useState, useMemo } from 'react';
import type { Employee } from '../types';
import { TrashIcon, CheckIcon, XMarkIcon } from './Icons';

interface DuplicateGroup {
    name: string;
    employees: Employee[];
}

const DuplicateNameChecker: React.FC<{
    employees: Employee[];
    onDelete: (id: number) => Promise<void>;
    onClose: () => void;
}> = ({ employees, onDelete, onClose }) => {
    const [selectedForDeletion, setSelectedForDeletion] = useState<Set<number>>(new Set());
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [deleteInProgress, setDeleteInProgress] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // 동명이인을 찾아서 그룹화
    const duplicateGroups = useMemo(() => {
        const groups: Record<string, Employee[]> = {};

        employees.forEach(emp => {
            if (!groups[emp.name]) {
                groups[emp.name] = [];
            }
            groups[emp.name].push(emp);
        });

        // 2명 이상의 동명이인만 필터링
        const filtered = Object.entries(groups)
            .filter(([name, emps]) => emps.length > 1)
            .map(([name, emps]) => ({
                name,
                employees: emps.sort((a, b) => a.id - b.id)
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

        // 검색어 필터링
        if (searchTerm) {
            return filtered.filter(group =>
                group.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered;
    }, [employees, searchTerm]);

    const handleSelectForDeletion = (id: number) => {
        const newSet = new Set(selectedForDeletion);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedForDeletion(newSet);
    };

    const handleSelectAll = (name: string, employees: Employee[]) => {
        const allIds = employees.map(e => e.id);
        const newSet = new Set(selectedForDeletion);

        if (allIds.every(id => newSet.has(id))) {
            // 전부 선택되어 있으면 전부 해제
            allIds.forEach(id => newSet.delete(id));
        } else {
            // 일부만 선택되어 있으면 전부 선택
            allIds.forEach(id => newSet.add(id));
        }

        setSelectedForDeletion(newSet);
    };

    const handleToggleGroup = (name: string) => {
        const newSet = new Set(expandedGroups);
        if (newSet.has(name)) {
            newSet.delete(name);
        } else {
            newSet.add(name);
        }
        setExpandedGroups(newSet);
    };

    const handleDeleteSelected = async () => {
        if (selectedForDeletion.size === 0) {
            alert('삭제할 구성원을 선택해주세요.');
            return;
        }

        if (!window.confirm(`${selectedForDeletion.size}명의 구성원을 삭제하시겠습니까?`)) {
            return;
        }

        setDeleteInProgress(true);
        try {
            for (const id of Array.from(selectedForDeletion)) {
                await onDelete(id);
            }
            setSelectedForDeletion(new Set());
            alert('선택된 구성원이 삭제되었습니다.');
        } catch (error) {
            console.error('Failed to delete employees:', error);
            alert('구성원 삭제 중 오류가 발생했습니다.');
        } finally {
            setDeleteInProgress(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">동명이인 검색 및 중복 관리</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* 검색창 */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="이름으로 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700"
                    />
                </div>

                {/* 동명이인 목록 */}
                <div className="flex-1 overflow-y-auto mb-4">
                    {duplicateGroups.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                            {searchTerm
                                ? `"${searchTerm}"에 해당하는 동명이인이 없습니다.`
                                : '동명이인이 없습니다.'}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {duplicateGroups.map(group => (
                                <div
                                    key={group.name}
                                    className="border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden"
                                >
                                    {/* 그룹 헤더 */}
                                    <div
                                        className="bg-slate-50 dark:bg-slate-700 p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600"
                                        onClick={() => handleToggleGroup(group.name)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="font-semibold text-lg">{group.name}</div>
                                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                                    ({group.employees.length}명)
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSelectAll(group.name, group.employees);
                                                    }}
                                                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                                                >
                                                    전체 선택
                                                </button>
                                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                                    {expandedGroups.has(group.name) ? '▼' : '▶'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 그룹 내용 */}
                                    {expandedGroups.has(group.name) && (
                                        <div className="divide-y dark:divide-slate-700">
                                            {group.employees.map(emp => (
                                                <div key={emp.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700">
                                                    <div className="flex items-start gap-4">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedForDeletion.has(emp.id)}
                                                            onChange={() => handleSelectForDeletion(emp.id)}
                                                            className="h-4 w-4 mt-1 rounded border-slate-300 text-red-600 focus:ring-red-500"
                                                        />
                                                        <div className="flex-1">
                                                            <div className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                                                                {emp.name}
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                                <div><span className="font-medium">주민등록번호:</span> {emp.residentRegistrationNumber || '미등록'}</div>
                                                                <div><span className="font-medium">구분:</span> {emp.role?.join(', ') || '미등록'}</div>
                                                                <div><span className="font-medium">부서:</span> {emp.department || '미등록'}</div>
                                                                <div><span className="font-medium">전화:</span> {emp.phone || '미등록'}</div>
                                                                <div><span className="font-medium">이메일:</span> {emp.email || '미등록'}</div>
                                                                <div><span className="font-medium">상태:</span> {emp.isActive === false ? '비활성' : '활성'}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 하단 버튼 */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-300 dark:border-slate-600">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                        {selectedForDeletion.size > 0 && `${selectedForDeletion.size}명 선택됨`}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-slate-200 dark:bg-slate-600 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500"
                        >
                            닫기
                        </button>
                        <button
                            onClick={handleDeleteSelected}
                            disabled={selectedForDeletion.size === 0 || deleteInProgress}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <TrashIcon className="h-4 w-4" />
                            선택한 구성원 삭제 ({selectedForDeletion.size})
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DuplicateNameChecker;
