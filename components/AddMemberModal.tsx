import React, { useState } from 'react';
import { Member } from '../types';
import { FirestoreService } from '../src/firebase/firestore-service';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newMember: Member) => void;
}

// Firestore 서비스 초기화 - 구성원(Member) 컬렉션과 상호작용
const firestoreMemberService = new FirestoreService<Member>('members');

const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    residentRegistrationNumber: '',
    bankName: '',
    accountNumber: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      residentRegistrationNumber: '',
      bankName: '',
      accountNumber: '',
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAddMember = async () => {
    if (!formData.name.trim()) {
      alert('이름은 필수 항목입니다.');
      return;
    }

    try {
      await firestoreMemberService.add(formData);

      // 성공 메시지 표시
      alert('구성원이 추가되었습니다.');
      handleClose();

      // 콜백 호출 (부모 컴포넌트에서 필요시 자동 선택)
      if (onSuccess) {
        onSuccess({ ...formData, id: Date.now() } as Member);
      }
    } catch (error) {
      console.error('구성원 추가 오류:', error);
      alert('구성원 추가 중 오류가 발생했습니다.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          새 구성원 추가
        </h2>

        <div className="space-y-4">
          {/* 이름 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              이름 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="이름을 입력하세요"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>

          {/* 전화번호 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              전화번호
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="전화번호를 입력하세요"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>

          {/* 주민등록번호 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              주민등록번호
            </label>
            <input
              type="text"
              value={formData.residentRegistrationNumber}
              onChange={(e) => setFormData({ ...formData, residentRegistrationNumber: e.target.value })}
              placeholder="주민등록번호를 입력하세요"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>

          {/* 은행명 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              은행명
            </label>
            <input
              type="text"
              value={formData.bankName}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              placeholder="은행명을 입력하세요"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>

          {/* 계좌번호 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              계좌번호
            </label>
            <input
              type="text"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              placeholder="계좌번호를 입력하세요"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleAddMember}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
          >
            추가
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;
