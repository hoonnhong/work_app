/**
 * @file HrManagementPage.tsx
 * @description 이 파일은 '구성원 관리' 페이지의 최상위 컨테이너 컴포넌트입니다.
 * '구성원 목록' 탭과 '정산 관리' 탭 사이의 전환을 관리하고,
 * 각 탭에 해당하는 세부 구현은 EmployeeManagement와 SettlementManagement 컴포넌트에 위임합니다.
 */
import React, { useState, useEffect } from 'react';
import { ALL_NAV_LINKS } from '../constants';
import PageHeader from '../components/PageHeader';
import EmployeeManagement from '../components/EmployeeManagement';
import SettlementManagement from '../components/SettlementManagement';
import Loader from '../components/Loader';
import type { Employee, Settlement } from '../types';

const HrManagementPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'employees' | 'settlements'>('employees');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [settlements, setSettlements] = useState<Settlement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 데이터 로딩 로직
    useEffect(() => {
        const initializeData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [empResponse, settleResponse] = await Promise.all([
                    fetch('./data/hr_management.json'),
                    fetch('./data/settlements.json')
                ]);
                if (!empResponse.ok) throw new Error('Failed to fetch HR data');
                if (!settleResponse.ok) throw new Error('Failed to fetch settlement data');
                
                const empData = await empResponse.json();
                const settleData = await settleResponse.json();
                
                setEmployees(empData);
                setSettlements(settleData);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Unknown error occurred';
                console.error("Failed to load HR data:", message);
                setError(message);
                setEmployees([]);
                setSettlements([]);
            } finally {
                setIsLoading(false);
            }
        };
        initializeData();
    }, []);

    const renderContent = () => {
        if (isLoading) return <div className="flex justify-center items-center py-10"><Loader /></div>;
        if (error) return <div className="text-center py-10 text-red-500">데이터 로딩 실패: {error}</div>;

        if (activeTab === 'employees') {
            return <EmployeeManagement initialEmployees={employees} />;
        } else {
            return <SettlementManagement initialSettlements={settlements} />;
        }
    };
    
    return (
        <div>
            <PageHeader
                title={ALL_NAV_LINKS.hr.name}
                subtitle="구성원 정보와 정산 내역을 통합적으로 관리합니다."
                icon={ALL_NAV_LINKS.hr.icon}
            />
            
            <div className="border-b border-slate-200 dark:border-slate-700 mb-4">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button onClick={() => setActiveTab('employees')} className={`${activeTab === 'employees' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>구성원 목록</button>
                    <button onClick={() => setActiveTab('settlements')} className={`${activeTab === 'settlements' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>정산 관리</button>
                </nav>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
                {renderContent()}
            </div>
        </div>
    );
};

export default HrManagementPage;
