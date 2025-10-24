/**
 * @file DevNotesPage.tsx
 * @description 이 파일은 '개발 노트' 페이지 컴포넌트입니다.
 * 개발 관련 아이디어나 버그, 작업 내역 등을 기록하고 관리하는 간단한 노트 앱 기능을 제공합니다.
 * 사용자는 노트를 추가, 수정, 삭제할 수 있습니다.
 * 데이터는 페이지 로드 시 JSON 파일에서 불러오며, 변경 사항은 현재 세션에서만 유지됩니다.
 */

// React와 필요한 기능, 컴포넌트, 타입들을 가져옵니다.
import React, { useState, useEffect } from 'react';
import { ALL_NAV_LINKS } from '../constants'; // 내비게이션 링크 상수
import PageHeader from '../components/PageHeader'; // 페이지 상단 제목 컴포넌트
import type { DevNote } from '../types'; // DevNote 데이터 타입
import { PencilSquareIcon, TrashIcon } from '../components/Icons'; // 수정, 삭제 아이콘
import Loader from '../components/Loader'; // 로딩 스피너

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
  
  // `useEffect` 훅을 사용하여 컴포넌트가 처음 렌더링될 때 JSON 파일에서 노트 데이터를 불러옵니다.
  useEffect(() => {
    // 노트 데이터를 초기화하는 비동기 함수입니다.
    const initializeNotes = async () => {
      setIsLoading(true); // 로딩 시작
      try {
        // fetch API를 사용하여 public 폴더의 dev_note.json 파일을 가져옵니다.
        const response = await fetch('./data/dev_note.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch dev_note.json: ${response.statusText}`);
        }
        const defaultNotes = await response.json(); // JSON 데이터를 JavaScript 객체로 변환
        setNotes(defaultNotes); // 불러온 데이터를 `notes` 상태에 저장
      } catch (error) {
        console.error("Failed to initialize notes:", error);
        setNotes([]); // 에러 발생 시 빈 배열로 설정
      } finally {
        setIsLoading(false); // 로딩 완료
      }
    };

    initializeNotes(); // 함수 실행
  }, []); // 의존성 배열이 비어있으므로, 컴포넌트가 처음 마운트될 때 한 번만 실행됩니다.

  // '수정' 아이콘 클릭 시 실행될 함수입니다.
  const handleEdit = (note: DevNote) => {
    setEditingNote(note); // 수정할 노트 정보를 상태에 저장
    setIsModalOpen(true); // 모달 열기
  };
  
  // '삭제' 아이콘 클릭 시 실행될 함수입니다.
  const handleDelete = (id: number) => {
    if (window.confirm('이 노트를 정말로 삭제하시겠습니까?')) {
        // 삭제할 노트를 제외한 나머지 노트들로 새 배열을 만들어 상태를 업데이트합니다.
        setNotes(notes.filter(note => note.id !== id));
    }
  };

  // 모달에서 '저장' 버튼 클릭 시 실행될 함수입니다.
  const handleSave = (note: DevNote) => {
    if (note.id) { // 노트 ID가 있으면 (기존 노트 수정)
      // `map`을 사용하여 ID가 일치하는 노트만 새 정보로 교체합니다.
      setNotes(notes.map(n => n.id === note.id ? note : n));
    } else { // 노트 ID가 없으면 (새 노트 추가)
      const newNote = {
        ...note,
        id: Date.now(), // 현재 시간을 고유 ID로 사용
        created_at: new Date().toISOString().split('T')[0] // 오늘 날짜를 생성일로 지정
      };
      // 새 노트를 기존 노트 목록의 맨 앞에 추가합니다.
      setNotes([newNote, ...notes]);
    }
    setIsModalOpen(false); // 모달 닫기
    setEditingNote(null); // 수정 중인 노트 정보 초기화
  };

  // '새 노트 추가' 버튼 클릭 시 실행될 함수입니다.
  const handleAddNew = () => {
    // `editingNote` 상태를 빈 노트 정보로 설정하여 모달이 '추가' 모드로 열리게 합니다.
    setEditingNote({ id: 0, title: '', content: '', tags: [], created_at: '' });
    setIsModalOpen(true);
  };

  return (
    <div>
      <PageHeader 
        title={ALL_NAV_LINKS.devNotes.name} 
        subtitle="개발 작업, 버그, 아이디어를 기록하고 관리하세요."
        icon={ALL_NAV_LINKS.devNotes.icon}
      />
      <div className="flex flex-wrap justify-end mb-4 gap-2">
        <button onClick={handleAddNew} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">새 노트 추가</button>
      </div>
      
      {isLoading ? <Loader /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 노트가 하나도 없으면 안내 메시지를 보여줍니다. */}
          {notes.length === 0 ? (
            <div className="md:col-span-2 lg:col-span-3 text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <p className="text-slate-500 dark:text-slate-400">저장된 노트가 없습니다.</p>
              <p className="text-slate-500 dark:text-slate-400 mt-2">'새 노트 추가' 버튼을 눌러 시작하세요.</p>
            </div>
          ) : (
            // `notes` 배열을 순회하며 각 노트를 카드 형태로 렌더링합니다.
            notes.map(note => (
              <div key={note.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{note.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-2">{note.created_at}</p>
                  {/* `whitespace-pre-wrap` 클래스는 줄바꿈과 공백을 그대로 표시해줍니다. */}
                  <p className="text-slate-600 dark:text-slate-300 mb-3 whitespace-pre-wrap">{note.content}</p>
                  <div className="flex flex-wrap gap-2">
                    {/* 태그 배열을 순회하며 각 태그를 렌더링합니다. */}
                    {note.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                    <button onClick={() => handleEdit(note)} className="text-blue-500 hover:text-blue-700"><PencilSquareIcon className="h-5 w-5"/></button>
                    <button onClick={() => handleDelete(note.id)} className="text-red-500 hover:text-red-700"><TrashIcon className="h-5 w-5"/></button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

       {/* `isModalOpen`과 `editingNote`가 유효할 때만 모달을 렌더링합니다. */}
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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