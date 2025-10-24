/**
 * @file Sidebar.tsx
 * @description 이 파일은 애플리케이션의 왼쪽에 표시되는 사이드바(내비게이션 메뉴) 컴포넌트입니다.
 * 사용자는 이 사이드바를 통해 앱의 여러 페이지로 쉽게 이동할 수 있습니다.
 * 데스크톱 화면에서는 확장/축소 기능을 제공하고, 모바일 화면에서는 화면 밖에서 나타나는 형태로 동작합니다.
 * `constants/index.ts` 파일의 `SIDEBAR_STRUCTURE` 상수를 사용하여 메뉴 구조를 동적으로 생성합니다.
 */

// React와 필요한 기능들, 라이브러리들을 가져옵니다.
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom'; // NavLink는 현재 활성화된 링크에 스타일을 적용하기 쉬운 Link 컴포넌트입니다. useLocation은 현재 URL 정보를 가져옵니다.
import { SIDEBAR_STRUCTURE } from '../constants'; // 사이드바 메뉴 구조를 정의한 상수
import { ChevronLeftIcon, SparklesIcon, ChevronDownIcon } from './Icons'; // 아이콘 컴포넌트들

// Sidebar 컴포넌트가 부모 컴포넌트(App.tsx)로부터 받을 props의 타입을 정의합니다.
interface SidebarProps {
  isMobileOpen: boolean; // 모바일 사이드바가 열려있는지 여부
  setMobileOpen: (isOpen: boolean) => void; // 모바일 사이드바의 열림/닫힘 상태를 변경하는 함수
}

// Sidebar 컴포넌트를 정의합니다.
const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, setMobileOpen }) => {
    // `useState` 훅을 사용하여 컴포넌트 내부의 상태를 관리합니다.
    // 1. `isExpanded`: 데스크톱 화면에서 사이드바가 확장되었는지 여부 (기본값: true)
    const [isExpanded, setIsExpanded] = useState(true);
    // 2. `openGroups`: 어떤 메뉴 그룹이 열려있는지를 관리하는 객체 (예: { 'AI 도구': true })
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
    
    // `useLocation` 훅을 사용하여 현재 페이지의 경로 정보를 가져옵니다.
    const location = useLocation();

    // `useEffect` 훅은 특정 값이 변경될 때마다 특정 작업을 수행합니다.
    // 여기서는 페이지 경로(location.pathname)가 바뀔 때마다 실행됩니다.
    // 현재 경로에 따라 활성화된 그룹을 자동으로 열어주는 로직입니다.
    useEffect(() => {
        // SIDEBAR_STRUCTURE 배열에서 현재 URL과 일치하는 링크를 포함하는 그룹을 찾습니다.
        const activeGroup = SIDEBAR_STRUCTURE.find(item => 
            item.type === 'group' && item.links.some(link => location.pathname === link.path)
        );
        // 만약 그런 그룹을 찾았다면,
        if (activeGroup && activeGroup.type === 'group') {
            // `setOpenGroups`를 사용하여 해당 그룹의 상태를 '열림(true)'으로 설정합니다.
            setOpenGroups(prev => ({ ...prev, [activeGroup.name]: true }));
        }
    }, [location.pathname]); // `location.pathname`이 바뀔 때마다 이 effect를 다시 실행합니다.

    // 메뉴 그룹을 열고 닫는 함수입니다.
    const toggleGroup = (groupName: string) => {
        setOpenGroups(prev => ({...prev, [groupName]: !prev[groupName]}));
    };
    
    // 재사용을 위해 사이드바 링크 아이템을 별도의 작은 컴포넌트로 만듭니다.
    const SidebarLink: React.FC<{ link: { path: string; icon: React.FC<any>; name: string } }> = ({ link }) => (
        <NavLink
            to={link.path}
            onClick={() => setMobileOpen(false)} // 링크 클릭 시 모바일 사이드바를 닫습니다.
            // `className` prop에 함수를 전달하면, `isActive` 상태에 따라 동적으로 클래스를 적용할 수 있습니다.
            className={({ isActive }) => 
                `flex items-center gap-4 p-4 text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-slate-700 transition-colors duration-200 ${
                    isActive ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-300 font-semibold' : '' // 활성화된 링크 스타일
                } ${isExpanded ? 'justify-start pl-6' : 'justify-center'}` // 확장/축소 시 스타일
            }
        >
            <link.icon className="h-6 w-6 shrink-0" />
            {isExpanded && <span className="font-medium">{link.name}</span>}
        </NavLink>
    );

    // 컴포넌트가 화면에 그릴 내용을 JSX로 반환합니다.
    return (
        <>
             {/* 모바일 화면에서 사이드바가 열렸을 때, 뒷배경을 어둡게 처리하는 오버레이 div입니다. */}
             {isMobileOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                    onClick={() => setMobileOpen(false)} // 배경 클릭 시 사이드바를 닫습니다.
                    aria-hidden="true"
                />
            )}
            {/* 사이드바 본체. `aside` 태그를 사용합니다. */}
            <aside className={`bg-white dark:bg-slate-800 shadow-lg flex flex-col h-full fixed z-40 md:relative md:z-auto transition-transform md:transition-all duration-300 ease-in-out w-64 ${isExpanded ? 'md:w-64' : 'md:w-20'} ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                {/* 사이드바 헤더 (로고, 확장/축소 버튼) */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 h-16">
                    {isExpanded && <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2"><SparklesIcon className="h-6 w-6" /> Gemini 도우미</h1>}
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 hidden md:block ${isExpanded ? '' : 'mx-auto'}`}
                    >
                        <ChevronLeftIcon className={`h-6 w-6 transition-transform duration-300 ${isExpanded ? '' : 'rotate-180'}`} />
                    </button>
                </div>
                {/* 내비게이션 메뉴 */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden">
                    <ul className="py-4">
                        {/* SIDEBAR_STRUCTURE 배열을 순회하며 각 항목을 렌더링합니다. */}
                        {SIDEBAR_STRUCTURE.map((item, index) => (
                            <li key={index}>
                                {/* item.type에 따라 단일 링크 또는 그룹을 렌더링합니다. */}
                                {item.type === 'link' ? (
                                    <NavLink
                                        to={item.path}
                                        onClick={() => setMobileOpen(false)}
                                        className={({ isActive }) => 
                                            `flex items-center gap-4 p-4 text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-slate-700 transition-colors duration-200 ${
                                                isActive ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-300 font-semibold border-r-4 border-primary-500' : ''
                                            } ${isExpanded ? 'justify-start' : 'justify-center'}`
                                        }
                                    >
                                        <item.icon className="h-6 w-6 shrink-0" />
                                        {isExpanded && <span className="font-medium">{item.name}</span>}
                                    </NavLink>
                                ) : ( // 'group' 타입일 경우
                                    <div>
                                        <button 
                                            onClick={() => toggleGroup(item.name)}
                                            className={`w-full flex items-center gap-4 p-4 text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-slate-700 transition-colors duration-200 ${isExpanded ? 'justify-between' : 'justify-center'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <item.icon className="h-6 w-6 shrink-0" />
                                                {isExpanded && <span className="font-bold">{item.name}</span>}
                                            </div>
                                            {isExpanded && <ChevronDownIcon className={`h-5 w-5 shrink-0 transition-transform ${openGroups[item.name] ? 'rotate-180' : ''}`} />}
                                        </button>
                                        {/* 그룹의 열림/닫힘 상태에 따라 하위 링크 목록을 보여주거나 숨깁니다. `max-h`를 이용한 애니메이션 효과를 적용합니다. */}
                                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded && openGroups[item.name] ? 'max-h-96' : 'max-h-0'}`}>
                                            <ul>
                                                {item.links.map(link => (
                                                    <li key={link.name}>
                                                       <SidebarLink link={link}/>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
