import React, { useState, useEffect } from 'react';
import { memberOptionsService } from '../src/firebase/firestore-service';
import type { MemberOptionsSettings, RoleCategory, DepartmentCategory } from '../types';
import { PencilSquareIcon, TrashIcon, PlusIcon } from './Icons';

const MemberOptionsManager: React.FC = () => {
  const [options, setOptions] = useState<MemberOptionsSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRoleCategory, setEditingRoleCategory] = useState<string | null>(null);
  const [editingDepartmentCategory, setEditingDepartmentCategory] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = memberOptionsService.subscribe(async (data) => {
      if (data.length > 0) {
        const settingsData = data.find((d: any) => d.id === 'memberOptions');
        if (settingsData) {
          setOptions(settingsData as MemberOptionsSettings);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!options) return;

    try {
      await memberOptionsService.update('memberOptions', {
        ...options,
        updatedAt: new Date().toISOString()
      });
      alert('설정이 저장되었습니다.');
    } catch (error) {
      console.error('Failed to save options:', error);
      alert('저장에 실패했습니다.');
    }
  };

  // Role Category 관리
  const addRoleCategory = () => {
    if (!options) return;
    const newKey = `category_${Date.now()}`;
    setOptions({
      ...options,
      roleCategories: {
        ...options.roleCategories,
        [newKey]: { label: '새 카테고리', roles: [] }
      }
    });
    setEditingRoleCategory(newKey);
  };

  const deleteRoleCategory = (key: string) => {
    if (!options || !window.confirm('이 카테고리를 삭제하시겠습니까?')) return;
    const { [key]: _, ...rest } = options.roleCategories;
    setOptions({ ...options, roleCategories: rest });
  };

  const updateRoleCategoryLabel = (key: string, label: string) => {
    if (!options) return;
    setOptions({
      ...options,
      roleCategories: {
        ...options.roleCategories,
        [key]: { ...options.roleCategories[key], label }
      }
    });
  };

  const addRole = (categoryKey: string) => {
    if (!options) return;
    const newRole = prompt('새로운 구분을 입력하세요:');
    if (!newRole || newRole.trim() === '') return;

    setOptions({
      ...options,
      roleCategories: {
        ...options.roleCategories,
        [categoryKey]: {
          ...options.roleCategories[categoryKey],
          roles: [...options.roleCategories[categoryKey].roles, newRole.trim()]
        }
      }
    });
  };

  const deleteRole = (categoryKey: string, roleIndex: number) => {
    if (!options || !window.confirm('이 구분을 삭제하시겠습니까?')) return;

    const updatedRoles = options.roleCategories[categoryKey].roles.filter((_, idx) => idx !== roleIndex);
    setOptions({
      ...options,
      roleCategories: {
        ...options.roleCategories,
        [categoryKey]: {
          ...options.roleCategories[categoryKey],
          roles: updatedRoles
        }
      }
    });
  };

  const updateRole = (categoryKey: string, roleIndex: number, newValue: string) => {
    if (!options) return;

    const updatedRoles = [...options.roleCategories[categoryKey].roles];
    updatedRoles[roleIndex] = newValue;
    setOptions({
      ...options,
      roleCategories: {
        ...options.roleCategories,
        [categoryKey]: {
          ...options.roleCategories[categoryKey],
          roles: updatedRoles
        }
      }
    });
  };

  // Department Category 관리
  const addDepartmentCategory = () => {
    if (!options) return;
    const newKey = `category_${Date.now()}`;
    setOptions({
      ...options,
      departmentCategories: {
        ...options.departmentCategories,
        [newKey]: { label: '새 카테고리', departments: [] }
      }
    });
    setEditingDepartmentCategory(newKey);
  };

  const deleteDepartmentCategory = (key: string) => {
    if (!options || !window.confirm('이 카테고리를 삭제하시겠습니까?')) return;
    const { [key]: _, ...rest } = options.departmentCategories;
    setOptions({ ...options, departmentCategories: rest });
  };

  const updateDepartmentCategoryLabel = (key: string, label: string) => {
    if (!options) return;
    setOptions({
      ...options,
      departmentCategories: {
        ...options.departmentCategories,
        [key]: { ...options.departmentCategories[key], label }
      }
    });
  };

  const addDepartment = (categoryKey: string) => {
    if (!options) return;
    const newDepartment = prompt('새로운 부서/활동을 입력하세요:');
    if (!newDepartment || newDepartment.trim() === '') return;

    setOptions({
      ...options,
      departmentCategories: {
        ...options.departmentCategories,
        [categoryKey]: {
          ...options.departmentCategories[categoryKey],
          departments: [...options.departmentCategories[categoryKey].departments, newDepartment.trim()]
        }
      }
    });
  };

  const deleteDepartment = (categoryKey: string, deptIndex: number) => {
    if (!options || !window.confirm('이 부서/활동을 삭제하시겠습니까?')) return;

    const updatedDepartments = options.departmentCategories[categoryKey].departments.filter((_, idx) => idx !== deptIndex);
    setOptions({
      ...options,
      departmentCategories: {
        ...options.departmentCategories,
        [categoryKey]: {
          ...options.departmentCategories[categoryKey],
          departments: updatedDepartments
        }
      }
    });
  };

  const updateDepartment = (categoryKey: string, deptIndex: number, newValue: string) => {
    if (!options) return;

    const updatedDepartments = [...options.departmentCategories[categoryKey].departments];
    updatedDepartments[deptIndex] = newValue;
    setOptions({
      ...options,
      departmentCategories: {
        ...options.departmentCategories,
        [categoryKey]: {
          ...options.departmentCategories[categoryKey],
          departments: updatedDepartments
        }
      }
    });
  };

  if (isLoading) {
    return <div className="text-center py-10">로딩 중...</div>;
  }

  if (!options) {
    return <div className="text-center py-10">설정을 불러올 수 없습니다.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">구성원 옵션 관리</h2>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          저장
        </button>
      </div>

      {/* 구분(Role) 관리 */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">구분 관리</h3>
          <button
            onClick={addRoleCategory}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            <PlusIcon className="h-5 w-5" />
            카테고리 추가
          </button>
        </div>

        <div className="space-y-4">
          {Object.entries(options.roleCategories).map(([key, category]) => (
            <div key={key} className="border border-slate-300 dark:border-slate-600 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <input
                  type="text"
                  value={category.label}
                  onChange={(e) => updateRoleCategoryLabel(key, e.target.value)}
                  className="text-lg font-medium bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-primary-500 outline-none px-2"
                />
                <button
                  onClick={() => deleteRoleCategory(key)}
                  className="text-red-500 hover:text-red-700"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-2">
                {category.roles.map((role, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => updateRole(key, idx, e.target.value)}
                      className="flex-grow p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700"
                    />
                    <button
                      onClick={() => deleteRole(key, idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addRole(key)}
                  className="w-full py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-md text-slate-500 dark:text-slate-400 hover:border-primary-500 hover:text-primary-500"
                >
                  + 구분 추가
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 부서/활동(Department) 관리 */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">부서/활동 관리</h3>
          <button
            onClick={addDepartmentCategory}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            <PlusIcon className="h-5 w-5" />
            카테고리 추가
          </button>
        </div>

        <div className="space-y-4">
          {Object.entries(options.departmentCategories).map(([key, category]) => (
            <div key={key} className="border border-slate-300 dark:border-slate-600 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <input
                  type="text"
                  value={category.label}
                  onChange={(e) => updateDepartmentCategoryLabel(key, e.target.value)}
                  className="text-lg font-medium bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-primary-500 outline-none px-2"
                />
                <button
                  onClick={() => deleteDepartmentCategory(key)}
                  className="text-red-500 hover:text-red-700"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-2">
                {category.departments.map((dept, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={dept}
                      onChange={(e) => updateDepartment(key, idx, e.target.value)}
                      className="flex-grow p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700"
                    />
                    <button
                      onClick={() => deleteDepartment(key, idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addDepartment(key)}
                  className="w-full py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-md text-slate-500 dark:text-slate-400 hover:border-primary-500 hover:text-primary-500"
                >
                  + 부서/활동 추가
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-8 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-lg font-medium"
        >
          변경사항 저장
        </button>
      </div>
    </div>
  );
};

export default MemberOptionsManager;
