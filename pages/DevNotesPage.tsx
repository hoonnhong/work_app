/**
 * @file DevNotesPage.tsx
 * @description 이 파일은 '개발 노트' 페이지 컴포넌트입니다.
 * 개발 관련 아이디어나 버그, 작업 내역 등을 기록하고 관리하는 간단한 노트 앱 기능을 제공합니다.
 * 사용자는 노트를 추가, 수정, 삭제할 수 있습니다.
 * 데이터는 페이지 로드 시 JSON 파일에서 불러오며, 변경 사항은 현재 세션에서만 유지됩니다.
 */

// React와 필요한 기능, 컴포넌트, 타입들을 가져옵니다.
import React, { useState, useEffect, useMemo } from 'react';
import { ALL_NAV_LINKS } from '../constants'; // 내비게이션 링크 상수
import PageHeader from '../components/PageHeader'; // 페이지 상단 제목 컴포넌트
import type { DevNote, DevNoteCategory, DevNotePriority } from '../types'; // DevNote 데이터 타입
import { PencilSquareIcon, TrashIcon } from '../components/Icons'; // 수정, 삭제 아이콘
import Loader from '../components/Loader'; // 로딩 스피너
import { devNoteService, deleteField } from '../src/firebase/firestore-service';

// 뷰 모드 타입 정의
type ViewMode = 'card' | 'table';
// 정렬 기준 타입 정의
type SortBy = 'date' | 'title' | 'tag' | 'category' | 'priority';

// DevNotesPage 컴포넌트를 정의합니다.
const DevNotesPage: React.FC = () => {
  // `useState` 훅을 사용하여 컴포넌트의 상태(state)를 관리합니다.
  // 1. `notes`: 노트 목록 배열을 저장합니다.
  const [notes, setNotes] = useState<DevNote[]>([]);
  // 2. `isLoading`: 데이터를 불러오는 중인지 여부를 저장합니다.
  const [isLoading, setIsLoading] = useState(true);
  // 3. `isModalOpen`: 노트 추가/수정 모달이 열려있는지 여부를 저장합니다.
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 4. `editingNote`: 현재 수정 중인 노트 정보를 저장합니다.
  const [editingNote, setEditingNote] = useState<DevNote | null>(null);
  // 5. `viewMode`: 카드형/표형식 뷰 모드를 저장합니다.
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  // 6. `sortBy`: 정렬 기준을 저장합니다.
  const [sortBy, setSortBy] = useState<SortBy>('date');
  // 7. `selectedTag`: 필터링할 태그를 저장합니다.
  const [selectedTag, setSelectedTag] = useState<string>('');
  // 8. `selectedCategory`: 필터링할 카테고리를 저장합니다.
  const [selectedCategory, setSelectedCategory] = useState<DevNoteCategory | ''>('');
  // 9. `selectedPriority`: 필터링할 우선순위를 저장합니다.
  const [selectedPriority, setSelectedPriority] = useState<DevNotePriority | ''>('');
  // 10. `completedFilter`: 완료 상태 필터 ('all', 'completed', 'incomplete')
  const [completedFilter, setCompletedFilter] = useState<'all' | 'completed' | 'incomplete'>('incomplete');
  
  // Firestore 실시간 데이터 구독
  useEffect(() => {
    setIsLoading(true);

    // 개발 노트 데이터 실시간 구독
    const unsubscribe = devNoteService.subscribe((data) => {
      setNotes(data);
      setIsLoading(false);
    });

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      unsubscribe();
    };
  }, []);

  // 모든 태그 목록 추출 (중복 제거)
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach(note => {
      note.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [notes]);

  // 필터링 및 정렬된 노트 목록
  const filteredAndSortedNotes = useMemo(() => {
    let filtered = [...notes];

    // 완료 상태 필터링
    if (completedFilter === 'completed') {
      filtered = filtered.filter(note => note.completed === true);
    } else if (completedFilter === 'incomplete') {
      filtered = filtered.filter(note => note.completed !== true);
    }

    // 태그 필터링
    if (selectedTag) {
      filtered = filtered.filter(note => note.tags.includes(selectedTag));
    }

    // 카테고리 필터링
    if (selectedCategory) {
      filtered = filtered.filter(note => note.category === selectedCategory);
    }

    // 우선순위 필터링
    if (selectedPriority) {
      filtered = filtered.filter(note => note.priority === selectedPriority);
    }

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'tag':
          const aTag = a.tags[0] || '';
          const bTag = b.tags[0] || '';
          return aTag.localeCompare(bTag);
        case 'category':
          const categoryOrder = { '에러': 1, '개선': 2, '추가기능': 3, '새기능': 4 };
          const aCategory = a.category ? categoryOrder[a.category] : 999;
          const bCategory = b.category ? categoryOrder[b.category] : 999;
          return aCategory - bCategory;
        case 'priority':
          const priorityOrder = { '높음': 1, '보통': 2, '낮음': 3 };
          const aPriority = a.priority ? priorityOrder[a.priority] : 999;
          const bPriority = b.priority ? priorityOrder[b.priority] : 999;
          return aPriority - bPriority;
        default:
          return 0;
      }
    });

    return filtered;
  }, [notes, completedFilter, selectedTag, selectedCategory, selectedPriority, sortBy]);

  // '수정' 아이콘 클릭 시 실행될 함수입니다.
  const handleEdit = (note: DevNote) => {
    setEditingNote(note); // 수정할 노트 정보를 상태에 저장
    setIsModalOpen(true); // 모달 열기
  };
  
  // '삭제' 아이콘 클릭 시 실행될 함수입니다.
  const handleDelete = async (id: number) => {
    if (window.confirm('이 노트를 정말로 삭제하시겠습니까?')) {
      try {
        await devNoteService.delete(String(id));
      } catch (error) {
        console.error('Failed to delete note:', error);
        alert('노트 삭제에 실패했습니다.');
      }
    }
  };

  // 모달에서 '저장' 버튼 클릭 시 실행될 함수입니다.
  const handleSave = async (note: DevNote) => {
    try {
      if (note.id) {
        // 기존 노트 수정
        await devNoteService.update(String(note.id), {
          ...note,
          completed: note.completed || false
        });
        // 수정 후에는 모달 닫기
        setIsModalOpen(false);
        setEditingNote(null);
      } else {
        // 새 노트 추가
        const newNote = {
          ...note,
          id: Date.now(),
          created_at: new Date().toISOString().split('T')[0],
          completed: false
        };
        await devNoteService.setWithId(String(newNote.id), newNote);
        // 새 노트 추가 후에는 모달을 열린 상태로 유지하고 입력 필드만 초기화
        setEditingNote({
          id: 0,
          title: '',
          content: '',
          tags: [],
          created_at: '',
          completed: false,
          category: undefined,
          priority: undefined
        });
      }
    } catch (error) {
      console.error('Failed to save note:', error);
      alert('노트 저장에 실패했습니다.');
    }
  };

  // '새 노트 추가' 버튼 클릭 시 실행될 함수입니다.
  const handleAddNew = () => {
    // `editingNote` 상태를 빈 노트 정보로 설정하여 모달이 '추가' 모드로 열리게 합니다.
    setEditingNote({
      id: 0,
      title: '',
      content: '',
      tags: [],
      created_at: '',
      completed: false,
      category: undefined,
      priority: undefined
    });
    setIsModalOpen(true);
  };

  // 완료 상태 토글 함수
  const handleToggleComplete = async (note: DevNote) => {
    try {
      const newCompletedState = !note.completed;
      const updateData: any = {
        completed: newCompletedState
      };

      if (newCompletedState) {
        // 완료 상태로 변경 시 현재 날짜 저장
        updateData.completedAt = new Date().toISOString();
      } else {
        // 미완료 상태로 변경 시 completedAt 필드 삭제
        updateData.completedAt = deleteField();
      }

      await devNoteService.update(String(note.id), updateData);
    } catch (error) {
      console.error('Failed to update note:', error);
      alert('노트 업데이트에 실패했습니다.');
    }
  };

  return (
    <div>
      <PageHeader
        title={ALL_NAV_LINKS.devNotes.name}
        subtitle="개발 작업, 버그, 아이디어를 기록하고 관리하세요."
        icon={ALL_NAV_LINKS.devNotes.icon}
      />

      {/* 컨트롤 패널: 뷰 모드 전환, 정렬, 필터, 추가 버튼 */}
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

          {/* 정렬 선택 */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm"
          >
            <option value="date">날짜순</option>
            <option value="priority">우선순위순</option>
            <option value="category">카테고리순</option>
            <option value="title">제목순</option>
            <option value="tag">태그순</option>
          </select>

          {/* 완료 상태 필터 */}
          <select
            value={completedFilter}
            onChange={(e) => setCompletedFilter(e.target.value as 'all' | 'completed' | 'incomplete')}
            className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm"
          >
            <option value="incomplete">미완료만</option>
            <option value="all">전체</option>
            <option value="completed">완료만</option>
          </select>

          {/* 카테고리 필터 */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as DevNoteCategory | '')}
            className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm"
          >
            <option value="">모든 카테고리</option>
            <option value="에러">에러</option>
            <option value="개선">개선</option>
            <option value="추가기능">추가기능</option>
            <option value="새기능">새기능</option>
          </select>

          {/* 우선순위 필터 */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value as DevNotePriority | '')}
            className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm"
          >
            <option value="">모든 우선순위</option>
            <option value="높음">높음</option>
            <option value="보통">보통</option>
            <option value="낮음">낮음</option>
          </select>

          {/* 태그 필터 */}
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm"
          >
            <option value="">모든 태그</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>

        {/* 새 노트 추가 버튼 */}
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          새 노트 추가
        </button>
      </div>

      {isLoading ? <Loader /> : (
        <>
          {filteredAndSortedNotes.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <p className="text-slate-500 dark:text-slate-400">
                {selectedTag ? `'${selectedTag}' 태그가 있는 노트가 없습니다.` : '저장된 노트가 없습니다.'}
              </p>
              <p className="text-slate-500 dark:text-slate-400 mt-2">'새 노트 추가' 버튼을 눌러 시작하세요.</p>
            </div>
          ) : viewMode === 'card' ? (
            // 카드형 뷰
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedNotes.map(note => (
                <div
                  key={note.id}
                  className={`bg-white dark:bg-slate-800 p-5 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 flex flex-col justify-between ${
                    note.completed ? 'opacity-60' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className={`text-lg font-bold text-slate-800 dark:text-slate-100 ${note.completed ? 'line-through' : ''}`}>
                        {note.title}
                      </h3>
                      <div className="flex gap-1 flex-shrink-0">
                        {note.priority && (
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                            note.priority === '높음' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                            note.priority === '보통' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' :
                            'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                          }`}>
                            {note.priority}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 items-center mb-2">
                      <p className="text-sm text-slate-500 dark:text-slate-400">{note.created_at}</p>
                      {note.completedAt && (
                        <span className="text-sm text-green-600 dark:text-green-400">
                          (완료: {new Date(note.completedAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          })})
                        </span>
                      )}
                      {note.category && (
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                          note.category === '에러' ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                          note.category === '개선' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                          note.category === '추가기능' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                          'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {note.category}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mb-3 whitespace-pre-wrap">{note.content}</p>
                    <div className="flex flex-wrap gap-2">
                      {note.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <button onClick={() => handleEdit(note)} className="text-blue-500 hover:text-blue-700">
                      <PencilSquareIcon className="h-5 w-5"/>
                    </button>
                    <button onClick={() => handleDelete(note.id)} className="text-red-500 hover:text-red-700">
                      <TrashIcon className="h-5 w-5"/>
                    </button>
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
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-200 w-12">완료</th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                      onClick={() => setSortBy('priority')}
                    >
                      <div className="flex items-center gap-1">
                        우선순위
                        {sortBy === 'priority' && <span className="text-primary-600 dark:text-primary-400">▼</span>}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                      onClick={() => setSortBy('category')}
                    >
                      <div className="flex items-center gap-1">
                        카테고리
                        {sortBy === 'category' && <span className="text-primary-600 dark:text-primary-400">▼</span>}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                      onClick={() => setSortBy('title')}
                    >
                      <div className="flex items-center gap-1">
                        제목
                        {sortBy === 'title' && <span className="text-primary-600 dark:text-primary-400">▼</span>}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors w-32"
                      onClick={() => setSortBy('tag')}
                    >
                      <div className="flex items-center gap-1">
                        태그
                        {sortBy === 'tag' && <span className="text-primary-600 dark:text-primary-400">▼</span>}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-200 w-24">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredAndSortedNotes.map(note => (
                    <tr key={note.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 ${note.completed ? 'opacity-60' : ''}`}>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={note.completed || false}
                          onChange={() => handleToggleComplete(note)}
                          className="w-4 h-4 text-primary-600 bg-slate-100 border-slate-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                        />
                      </td>
                      <td className="px-4 py-3">
                        {note.priority ? (
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            note.priority === '높음' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                            note.priority === '보통' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' :
                            'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                          }`}>
                            {note.priority}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {note.category ? (
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            note.category === '에러' ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                            note.category === '개선' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                            note.category === '추가기능' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                            'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                          }`}>
                            {note.category}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 text-xs">-</span>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-slate-900 dark:text-slate-100 font-medium ${note.completed ? 'line-through' : ''}`}>
                        {note.title}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {note.tags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(note)}
                            className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                            title="자세히 보기"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEdit(note)}
                            className="text-blue-500 hover:text-blue-700"
                            title="수정"
                          >
                            <PencilSquareIcon className="h-5 w-5"/>
                          </button>
                          <button
                            onClick={() => handleDelete(note.id)}
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

       {/* 노트 추가/수정 모달 */}
       {isModalOpen && editingNote && <NoteModal note={editingNote} onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};


// 노트 추가/수정 모달 컴포넌트의 props 타입을 정의합니다.
interface ModalProps {
    note: DevNote;
    onSave: (note: DevNote) => void;
    onClose: () => void;
}

// 노트 추가/수정을 위한 모달 컴포넌트입니다.
const NoteModal: React.FC<ModalProps> = ({ note, onSave, onClose }) => {
    // 모달 내부의 폼 데이터를 관리하는 상태입니다.
    // 태그 배열을 쉼표로 구분된 문자열로 변환하여 입력 필드에서 편집하기 쉽게 만듭니다.
    const [formData, setFormData] = useState({...note, tags: note.tags.join(', ')});

    // note prop이 변경될 때마다 formData 업데이트
    useEffect(() => {
        setFormData({...note, tags: note.tags.join(', ')});
    }, [note]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // 저장 시에는 쉼표로 구분된 태그 문자열을 다시 배열로 변환하여 저장합니다.
        onSave({
            ...formData,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4">{note.id ? '노트 수정' : '새 노트 추가'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">제목</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700"/>
                    </div>
                     <div>
                        <label htmlFor="content" className="block text-sm font-medium text-slate-700 dark:text-slate-300">내용</label>
                        <textarea name="content" value={formData.content} onChange={handleChange} rows={4} className="mt-1 block w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">카테고리</label>
                            <select
                                name="category"
                                value={formData.category || ''}
                                onChange={handleChange}
                                className="mt-1 block w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700"
                            >
                                <option value="">선택 안함</option>
                                <option value="에러">에러</option>
                                <option value="개선">개선</option>
                                <option value="추가기능">추가기능</option>
                                <option value="새기능">새기능</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="priority" className="block text-sm font-medium text-slate-700 dark:text-slate-300">우선순위</label>
                            <select
                                name="priority"
                                value={formData.priority || ''}
                                onChange={handleChange}
                                className="mt-1 block w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700"
                            >
                                <option value="">선택 안함</option>
                                <option value="높음">높음</option>
                                <option value="보통">보통</option>
                                <option value="낮음">낮음</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="tags" className="block text-sm font-medium text-slate-700 dark:text-slate-300">태그 (쉼표로 구분)</label>
                        <input type="text" name="tags" value={formData.tags} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700"/>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 rounded-md">취소</button>
                        <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md">저장</button>
                    </div>
                </form>
            </div>
        </div>
    )
}


export default DevNotesPage;