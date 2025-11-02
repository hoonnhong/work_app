/**
 * @file FavoriteLinksPage.tsx
 * @description 이 파일은 '자주 가는 사이트' 페이지 컴포넌트입니다.
 * 사용자가 유용한 웹사이트 링크를 카테고리별로 정리하고 관리할 수 있는 북마크 기능을 제공합니다.
 * 링크를 추가, 수정, 삭제하는 기능을 포함하고 있습니다.
 * 데이터는 페이지 로드 시 JSON 파일에서 불러오며, 변경 사항은 현재 세션에서만 유지됩니다.
 */

// React와 필요한 기능, 컴포넌트, 타입들을 가져옵니다.
import React, { useState, useMemo, useEffect } from 'react';
import { ALL_NAV_LINKS } from '../constants'; // 내비게이션 링크 상수
import PageHeader from '../components/PageHeader'; // 페이지 상단 제목 컴포넌트
import type { FavoriteLink } from '../types'; // FavoriteLink 데이터 타입
import { PencilSquareIcon, TrashIcon } from '../components/Icons'; // 수정, 삭제 아이콘
import Loader from '../components/Loader'; // 로딩 스피너
import { favoriteUrlService } from '../src/firebase/firestore-service';

// 뷰 모드 타입 정의
type ViewMode = 'card' | 'table';

// FavoriteLinksPage 컴포넌트를 정의합니다.
const FavoriteLinksPage: React.FC = () => {
    // `useState` 훅을 사용하여 컴포넌트의 상태(state)를 관리합니다.
    // 1. `links`: 링크 목록 배열을 저장합니다.
    const [links, setLinks] = useState<FavoriteLink[]>([]);
    // 2. `isLoading`: 데이터를 불러오는 중인지 여부를 저장합니다.
    const [isLoading, setIsLoading] = useState(true);
    // 3. `isModalOpen`: 링크 추가/수정 모달이 열려있는지 여부를 저장합니다.
    const [isModalOpen, setIsModalOpen] = useState(false);
    // 4. `editingLink`: 현재 수정 중인 링크 정보를 저장합니다.
    const [editingLink, setEditingLink] = useState<FavoriteLink | null>(null);
    // 5. `viewMode`: 카드형/표형식 뷰 모드를 저장합니다.
    const [viewMode, setViewMode] = useState<ViewMode>('card');
    // 6. `selectedCategory`: 필터링할 카테고리를 저장합니다.
    const [selectedCategory, setSelectedCategory] = useState<string>('전체');

    // Firestore 실시간 데이터 구독
    useEffect(() => {
        setIsLoading(true);

        // 즐겨찾기 링크 데이터 실시간 구독
        const unsubscribe = favoriteUrlService.subscribe((data) => {
            setLinks(data);
            setIsLoading(false);
        });

        // 컴포넌트 언마운트 시 구독 해제
        return () => {
            unsubscribe();
        };
    }, []);
    
    // 모든 카테고리 목록 추출
    const allCategories = useMemo(() => {
        const categorySet = new Set<string>();
        links.forEach(link => categorySet.add(link.category));
        return ['전체', ...Array.from(categorySet).sort()];
    }, [links]);

    // 필터링된 링크
    const filteredLinks = useMemo(() => {
        if (selectedCategory === '전체') {
            return links;
        }
        return links.filter(link => link.category === selectedCategory);
    }, [links, selectedCategory]);

    // `useMemo` 훅은 `filteredLinks` 배열이 변경될 때만 링크들을 카테고리별로 다시 그룹핑합니다.
    const categories = useMemo(() => {
        // 링크들을 담을 빈 객체를 만듭니다. 예: { '개발': [...], '디자인': [...] }
        const grouped: { [key: string]: FavoriteLink[] } = {};
        // 모든 링크를 순회하면서
        filteredLinks.forEach(link => {
            // 해당 링크의 카테고리가 아직 grouped 객체에 없으면, 빈 배열을 만들어줍니다.
            if (!grouped[link.category]) {
                grouped[link.category] = [];
            }
            // 해당 카테고리 배열에 현재 링크를 추가합니다.
            grouped[link.category].push(link);
        });
        // 그룹핑이 완료된 객체를 반환합니다.
        return grouped;
    }, [filteredLinks]); // `filteredLinks` 배열이 변경될 때만 이 함수를 다시 실행합니다.

    // '수정' 아이콘 클릭 시 실행될 함수입니다.
    const handleEdit = (link: FavoriteLink) => {
        setEditingLink(link);
        setIsModalOpen(true);
    };

    // '삭제' 아이콘 클릭 시 실행될 함수입니다.
    const handleDelete = async (id: number) => {
        if (window.confirm('이 링크를 정말로 삭제하시겠습니까?')) {
            try {
                await favoriteUrlService.delete(String(id));
            } catch (error) {
                console.error('Failed to delete link:', error);
                alert('링크 삭제에 실패했습니다.');
            }
        }
    };

    // 모달에서 '저장' 버튼 클릭 시 실행될 함수입니다.
    const handleSave = async (link: FavoriteLink) => {
        try {
            if (link.id) {
                // 기존 링크 수정
                await favoriteUrlService.update(String(link.id), link);
            } else {
                // 새 링크 추가
                const newId = Date.now();
                await favoriteUrlService.setWithId(String(newId), { ...link, id: newId });
            }
            setIsModalOpen(false);
            setEditingLink(null);
        } catch (error) {
            console.error('Failed to save link:', error);
            alert('링크 저장에 실패했습니다.');
        }
    };

    // '새 링크 추가' 버튼 클릭 시 실행될 함수입니다.
    const handleAddNew = () => {
        setEditingLink({ id: 0, title: '', url: '', category: '' });
        setIsModalOpen(true);
    };

    return (
        <div>
            <PageHeader
                title={ALL_NAV_LINKS.links.name}
                subtitle="자주 사용하는 웹사이트를 정리하고 접속하세요."
                icon={ALL_NAV_LINKS.links.icon}
            />

            {/* 컨트롤 패널: 뷰 모드 전환, 카테고리 필터, 추가 버튼 */}
            <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
                <div className="flex flex-wrap items-center gap-3">
                    {/* 뷰 모드 전환 버튼 */}
                    <div className="flex bg-slate-200 dark:bg-slate-700 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('card')}
                            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                                viewMode === 'card'
                                    ? 'bg-white dark:bg-slate-600 text-primary-600 dark:text-primary-400 shadow'
                                    : 'text-slate-600 dark:text-slate-300'
                            }`}
                        >
                            카드형
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                                viewMode === 'table'
                                    ? 'bg-white dark:bg-slate-600 text-primary-600 dark:text-primary-400 shadow'
                                    : 'text-slate-600 dark:text-slate-300'
                            }`}
                        >
                            표형식
                        </button>
                    </div>

                    {/* 카테고리 필터 */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm"
                    >
                        {allCategories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>

                {/* 새 링크 추가 버튼 */}
                <button
                    onClick={handleAddNew}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                    새 링크 추가
                </button>
            </div>

            {isLoading ? <Loader/> : (
                <>
                    {filteredLinks.length === 0 ? (
                        <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <p className="text-slate-500 dark:text-slate-400">
                                {selectedCategory !== '전체' ? `'${selectedCategory}' 카테고리에 링크가 없습니다.` : '저장된 링크가 없습니다.'}
                            </p>
                            <p className="text-slate-500 dark:text-slate-400 mt-2">'새 링크 추가' 버튼을 눌러 시작하세요.</p>
                        </div>
                    ) : viewMode === 'card' ? (
                        // 카드형 뷰
                        <div className="space-y-8">
                            {Object.keys(categories).sort().map(category => (
                                <div key={category}>
                                    <h3 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100 border-b-2 border-primary-500 pb-2">{category}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {categories[category].map(link => (
                                            <div key={link.id} className="group relative bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-all border border-slate-200 dark:border-slate-700">
                                                <a href={link.url} target="_blank" rel="noopener noreferrer" className="block">
                                                    <h4 className="font-bold text-primary-600 dark:text-primary-400 group-hover:underline pr-12">{link.title}</h4>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{link.url}</p>
                                                </a>
                                                <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleEdit(link)} className="p-1.5 bg-slate-100/80 dark:bg-slate-900/80 rounded-full text-blue-500 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                        <PencilSquareIcon className="h-4 w-4"/>
                                                    </button>
                                                    <button onClick={() => handleDelete(link.id)} className="p-1.5 bg-slate-100/80 dark:bg-slate-900/80 rounded-full text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500">
                                                        <TrashIcon className="h-4 w-4"/>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        // 표형식 뷰
                        <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow-md">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">카테고리</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">제목</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">URL</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-200 w-24">작업</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {filteredLinks.map(link => (
                                        <tr key={link.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 text-xs font-medium bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 rounded-full">
                                                    {link.category}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-900 dark:text-slate-100 font-medium">
                                                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">
                                                    {link.title}
                                                </a>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-sm truncate max-w-xs">
                                                {link.url}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(link)}
                                                        className="text-blue-500 hover:text-blue-700"
                                                        title="수정"
                                                    >
                                                        <PencilSquareIcon className="h-5 w-5"/>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(link.id)}
                                                        className="text-red-500 hover:text-red-700"
                                                        title="삭제"
                                                    >
                                                        <TrashIcon className="h-5 w-5"/>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}


            {isModalOpen && editingLink && <LinkModal link={editingLink} onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

// 링크 추가/수정 모달의 props 타입을 정의합니다.
interface ModalProps {
    link: FavoriteLink;
    onSave: (link: FavoriteLink) => void;
    onClose: () => void;
}

// 링크 추가/수정을 위한 모달 컴포넌트입니다.
const LinkModal: React.FC<ModalProps> = ({ link, onSave, onClose }) => {
    const [formData, setFormData] = useState(link);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">{link.id ? '링크 수정' : '새 링크 추가'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">제목</label>
                        <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 focus:ring-primary-500 focus:border-primary-500"/>
                    </div>
                    <div>
                        <label htmlFor="url" className="block text-sm font-medium text-slate-700 dark:text-slate-300">URL</label>
                        <input type="url" name="url" id="url" value={formData.url} onChange={handleChange} required placeholder="https://example.com" className="mt-1 block w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 focus:ring-primary-500 focus:border-primary-500"/>
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">카테고리</label>
                        <input type="text" name="category" id="category" value={formData.category} onChange={handleChange} required className="mt-1 block w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 focus:ring-primary-500 focus:border-primary-500"/>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500">취소</button>
                        <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">저장</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default FavoriteLinksPage;