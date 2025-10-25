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
    
    // `useMemo` 훅은 `links` 배열이 변경될 때만 링크들을 카테고리별로 다시 그룹핑합니다.
    // 이렇게 하면 `links` 상태가 바뀌지 않는 불필요한 리렌더링 시에는 복잡한 계산을 건너뛸 수 있어 성능에 도움이 됩니다.
    const categories = useMemo(() => {
        // 링크들을 담을 빈 객체를 만듭니다. 예: { '개발': [...], '디자인': [...] }
        const grouped: { [key: string]: FavoriteLink[] } = {};
        // 모든 링크를 순회하면서
        links.forEach(link => {
            // 해당 링크의 카테고리가 아직 grouped 객체에 없으면, 빈 배열을 만들어줍니다.
            if (!grouped[link.category]) {
                grouped[link.category] = [];
            }
            // 해당 카테고리 배열에 현재 링크를 추가합니다.
            grouped[link.category].push(link);
        });
        // 그룹핑이 완료된 객체를 반환합니다.
        return grouped;
    }, [links]); // `links` 배열이 변경될 때만 이 함수를 다시 실행합니다.

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

            <div className="flex flex-wrap justify-end mb-4 gap-2">
                <button onClick={handleAddNew} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">새 링크 추가</button>
            </div>

            {isLoading ? <Loader/> : (
                <div className="space-y-8">
                    {/* 카테고리가 하나라도 있으면 목록을 보여주고, 없으면 안내 메시지를 보여줍니다. */}
                    {Object.keys(categories).length > 0 ? 
                     // `Object.keys(categories)`로 카테고리 이름 배열을 만들고, 정렬한 뒤 순회합니다.
                     Object.keys(categories).sort().map(category => (
                        <div key={category}>
                            <h3 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100 border-b-2 border-primary-500 pb-2">{category}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* 해당 카테고리에 속한 링크들을 순회하며 렌더링합니다. */}
                                {categories[category].map(link => (
                                    <div key={link.id} className="group relative bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-all border border-slate-200 dark:border-slate-700">
                                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="block">
                                            <h4 className="font-bold text-primary-600 dark:text-primary-400 group-hover:underline pr-12">{link.title}</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{link.url}</p>
                                        </a>
                                        {/* 마우스를 올렸을 때만 수정/삭제 버튼이 보이도록 설정합니다. */}
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
                    )) : (
                        <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <p className="text-slate-500 dark:text-slate-400">저장된 링크가 없습니다.</p>
                            <p className="text-slate-500 dark:text-slate-400 mt-2">'새 링크 추가' 버튼을 눌러 시작하세요.</p>
                        </div>
                    )}
                </div>
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