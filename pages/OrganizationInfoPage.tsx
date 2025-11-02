/**
 * @file OrganizationInfoPage.tsx
 * @description 조합의 중요한 정보(계좌, 사업자번호, 비밀번호 등)를 관리하는 페이지입니다.
 * 민감한 정보는 마스터 비밀번호로 암호화되어 저장되고, 확인할 때만 복호화됩니다.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ALL_NAV_LINKS } from '../constants';
import PageHeader from '../components/PageHeader';
import type { BankAccountInfo, BusinessInfo, PasswordInfo, OrganizationInfoCategory } from '../types';
import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
  EyeSlashIcon,
  ClipboardDocumentIcon,
  KeyIcon,
  BanknotesIcon,
  BuildingLibraryIcon
} from '../components/Icons';
import Loader from '../components/Loader';
import {
  bankAccountService,
  businessInfoService,
  passwordInfoService
} from '../src/firebase/firestore-service';
import { encrypt, decrypt, isEncrypted } from '../utils/encryption';

// 탭 컴포넌트
type TabType = '계좌정보' | '사업자정보' | '비밀번호';

const OrganizationInfoPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('계좌정보');
  const [isLoading, setIsLoading] = useState(true);

  // 각 카테고리별 데이터
  const [bankAccounts, setBankAccounts] = useState<BankAccountInfo[]>([]);
  const [businessInfos, setBusinessInfos] = useState<BusinessInfo[]>([]);
  const [passwords, setPasswords] = useState<PasswordInfo[]>([]);

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [modalCategory, setModalCategory] = useState<TabType>('계좌정보');

  // 마스터 비밀번호 관련
  const [masterPassword, setMasterPassword] = useState('');
  const [showMasterPasswordInput, setShowMasterPasswordInput] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<Set<string>>(new Set());

  // Firestore 실시간 데이터 구독
  useEffect(() => {
    setIsLoading(true);

    const unsubscribeBankAccounts = bankAccountService.subscribe((data) => {
      setBankAccounts(data.sort((a, b) =>
        new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      ));
    });

    const unsubscribeBusinessInfos = businessInfoService.subscribe((data) => {
      setBusinessInfos(data.sort((a, b) =>
        new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      ));
    });

    const unsubscribePasswords = passwordInfoService.subscribe((data) => {
      setPasswords(data.sort((a, b) =>
        new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      ));
      setIsLoading(false);
    });

    return () => {
      unsubscribeBankAccounts();
      unsubscribeBusinessInfos();
      unsubscribePasswords();
    };
  }, []);

  // 모달 열기
  const openModal = (category: TabType, item?: any) => {
    setModalCategory(category);
    setEditingItem(item || null);
    setIsModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  // 저장
  const handleSave = async (data: any) => {
    try {
      if (modalCategory === '계좌정보') {
        if (editingItem) {
          await bankAccountService.update(editingItem.id, data);
        } else {
          await bankAccountService.add(data);
        }
      } else if (modalCategory === '사업자정보') {
        if (editingItem) {
          await businessInfoService.update(editingItem.id, data);
        } else {
          await businessInfoService.add(data);
        }
      } else {
        if (editingItem) {
          await passwordInfoService.update(editingItem.id, data);
        } else {
          await passwordInfoService.add(data);
        }
      }
      closeModal();
    } catch (error) {
      console.error('Error saving data:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  // 삭제
  const handleDelete = async (category: TabType, id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      if (category === '계좌정보') {
        await bankAccountService.delete(id);
      } else if (category === '사업자정보') {
        await businessInfoService.delete(id);
      } else {
        await passwordInfoService.delete(id);
      }
    } catch (error) {
      console.error('Error deleting data:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  // 비밀번호 표시/숨김
  const togglePasswordVisibility = (id: string, encryptedPassword: string) => {
    if (revealedPasswords.has(id)) {
      // 이미 공개된 경우 숨김
      const newSet = new Set(revealedPasswords);
      newSet.delete(id);
      setRevealedPasswords(newSet);
    } else {
      // 비밀번호 입력 요청
      const inputPassword = prompt('마스터 비밀번호를 입력하세요:');
      if (!inputPassword) return;

      try {
        decrypt(encryptedPassword, inputPassword);
        const newSet = new Set(revealedPasswords);
        newSet.add(id);
        setRevealedPasswords(newSet);
        setMasterPassword(inputPassword);
      } catch (error) {
        alert('비밀번호가 올바르지 않습니다.');
      }
    }
  };

  // 클립보드에 복사
  const copyToClipboard = async (text: string, isEncrypted: boolean = false) => {
    try {
      let textToCopy = text;

      if (isEncrypted) {
        const inputPassword = prompt('마스터 비밀번호를 입력하세요:');
        if (!inputPassword) return;
        textToCopy = decrypt(text, inputPassword);
      }

      await navigator.clipboard.writeText(textToCopy);
      alert('클립보드에 복사되었습니다.');
    } catch (error) {
      console.error('Copy error:', error);
      alert('복사에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={ALL_NAV_LINKS.organizationInfo.name}
        subtitle="조합의 계좌, 사업자번호, 비밀번호 등 중요한 정보를 안전하게 관리하세요."
        icon={ALL_NAV_LINKS.organizationInfo.icon}
      />

      {/* 탭 메뉴 */}
      <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
        <nav className="flex space-x-8">
          {(['계좌정보', '사업자정보', '비밀번호'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* 추가 버튼 */}
      <div className="mb-6">
        <button
          onClick={() => openModal(activeTab)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          {activeTab} 추가
        </button>
      </div>

      {/* 컨텐츠 영역 */}
      {activeTab === '계좌정보' && (
        <BankAccountList
          accounts={bankAccounts}
          onEdit={(item) => openModal('계좌정보', item)}
          onDelete={(id) => handleDelete('계좌정보', id)}
          onCopy={copyToClipboard}
          onTogglePassword={togglePasswordVisibility}
          revealedPasswords={revealedPasswords}
          masterPassword={masterPassword}
        />
      )}

      {activeTab === '사업자정보' && (
        <BusinessInfoList
          businessInfos={businessInfos}
          onEdit={(item) => openModal('사업자정보', item)}
          onDelete={(id) => handleDelete('사업자정보', id)}
          onCopy={copyToClipboard}
        />
      )}

      {activeTab === '비밀번호' && (
        <PasswordList
          passwords={passwords}
          onEdit={(item) => openModal('비밀번호', item)}
          onDelete={(id) => handleDelete('비밀번호', id)}
          onCopy={copyToClipboard}
          onTogglePassword={togglePasswordVisibility}
          revealedPasswords={revealedPasswords}
          masterPassword={masterPassword}
        />
      )}

      {/* 모달 */}
      {isModalOpen && (
        <Modal
          category={modalCategory}
          item={editingItem}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

// 계좌 정보 리스트
const BankAccountList: React.FC<{
  accounts: BankAccountInfo[];
  onEdit: (item: BankAccountInfo) => void;
  onDelete: (id: string) => void;
  onCopy: (text: string, isEncrypted: boolean) => void;
  onTogglePassword: (id: string, password: string) => void;
  revealedPasswords: Set<string>;
  masterPassword: string;
}> = ({ accounts, onEdit, onDelete, onCopy, onTogglePassword, revealedPasswords, masterPassword }) => {
  if (accounts.length === 0) {
    return <EmptyState message="등록된 계좌 정보가 없습니다." />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {accounts.map((account) => (
        <div key={account.id} className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <BanknotesIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                {account.accountName}
              </h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(account)}
                className="p-1 text-slate-500 hover:text-primary-600 dark:hover:text-primary-400"
              >
                <PencilSquareIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => onDelete(account.id.toString())}
                className="p-1 text-slate-500 hover:text-red-600 dark:hover:text-red-400"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <InfoRow label="은행" value={account.bankName} onCopy={() => onCopy(account.bankName, false)} />
            <InfoRow label="계좌번호" value={account.accountNumber} onCopy={() => onCopy(account.accountNumber, false)} />

            {account.accountPassword && (
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-600 dark:text-slate-400">계좌 비밀번호</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-800 dark:text-slate-200 font-medium">
                    {revealedPasswords.has(account.id.toString())
                      ? decrypt(account.accountPassword, masterPassword)
                      : '••••••'}
                  </span>
                  <button
                    onClick={() => onTogglePassword(account.id.toString(), account.accountPassword!)}
                    className="p-1 text-slate-500 hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    {revealedPasswords.has(account.id.toString())
                      ? <EyeSlashIcon className="h-4 w-4" />
                      : <EyeIcon className="h-4 w-4" />
                    }
                  </button>
                  {revealedPasswords.has(account.id.toString()) && (
                    <button
                      onClick={() => onCopy(decrypt(account.accountPassword!, masterPassword), false)}
                      className="p-1 text-slate-500 hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      <ClipboardDocumentIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {account.description && (
              <div className="pt-2 text-slate-600 dark:text-slate-400">
                {account.description}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// 사업자 정보 리스트
const BusinessInfoList: React.FC<{
  businessInfos: BusinessInfo[];
  onEdit: (item: BusinessInfo) => void;
  onDelete: (id: string) => void;
  onCopy: (text: string, isEncrypted: boolean) => void;
}> = ({ businessInfos, onEdit, onDelete, onCopy }) => {
  if (businessInfos.length === 0) {
    return <EmptyState message="등록된 사업자 정보가 없습니다." />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {businessInfos.map((info) => (
        <div key={info.id} className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <BuildingLibraryIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                {info.businessName}
              </h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(info)}
                className="p-1 text-slate-500 hover:text-primary-600 dark:hover:text-primary-400"
              >
                <PencilSquareIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => onDelete(info.id.toString())}
                className="p-1 text-slate-500 hover:text-red-600 dark:hover:text-red-400"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <InfoRow label="사업자번호" value={info.businessNumber} onCopy={() => onCopy(info.businessNumber, false)} />
            {info.corporateNumber && (
              <InfoRow label="법인번호" value={info.corporateNumber} onCopy={() => onCopy(info.corporateNumber, false)} />
            )}
            {info.description && (
              <div className="pt-2 text-slate-600 dark:text-slate-400">
                {info.description}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// 비밀번호 리스트
const PasswordList: React.FC<{
  passwords: PasswordInfo[];
  onEdit: (item: PasswordInfo) => void;
  onDelete: (id: string) => void;
  onCopy: (text: string, isEncrypted: boolean) => void;
  onTogglePassword: (id: string, password: string) => void;
  revealedPasswords: Set<string>;
  masterPassword: string;
}> = ({ passwords, onEdit, onDelete, onCopy, onTogglePassword, revealedPasswords, masterPassword }) => {
  if (passwords.length === 0) {
    return <EmptyState message="등록된 비밀번호 정보가 없습니다." />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {passwords.map((pwd) => (
        <div key={pwd.id} className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <KeyIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                {pwd.serviceName}
              </h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(pwd)}
                className="p-1 text-slate-500 hover:text-primary-600 dark:hover:text-primary-400"
              >
                <PencilSquareIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => onDelete(pwd.id.toString())}
                className="p-1 text-slate-500 hover:text-red-600 dark:hover:text-red-400"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            {pwd.username && <InfoRow label="아이디" value={pwd.username} onCopy={() => onCopy(pwd.username!, false)} />}
            {pwd.url && <InfoRow label="URL" value={pwd.url} onCopy={() => onCopy(pwd.url!, false)} />}

            {pwd.password && (
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-600 dark:text-slate-400">비밀번호</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-800 dark:text-slate-200 font-medium font-mono">
                    {revealedPasswords.has(pwd.id.toString())
                      ? decrypt(pwd.password, masterPassword)
                      : '••••••••'}
                  </span>
                  <button
                    onClick={() => onTogglePassword(pwd.id.toString(), pwd.password!)}
                    className="p-1 text-slate-500 hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    {revealedPasswords.has(pwd.id.toString())
                      ? <EyeSlashIcon className="h-4 w-4" />
                      : <EyeIcon className="h-4 w-4" />
                    }
                  </button>
                  {revealedPasswords.has(pwd.id.toString()) && (
                    <button
                      onClick={() => onCopy(decrypt(pwd.password!, masterPassword), false)}
                      className="p-1 text-slate-500 hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      <ClipboardDocumentIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {pwd.description && (
              <div className="pt-2 text-slate-600 dark:text-slate-400">
                {pwd.description}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// 정보 행 컴포넌트
const InfoRow: React.FC<{ label: string; value: string; onCopy: () => void }> = ({ label, value, onCopy }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
    <span className="text-slate-600 dark:text-slate-400">{label}</span>
    <div className="flex items-center gap-2">
      <span className="text-slate-800 dark:text-slate-200 font-medium">{value}</span>
      <button
        onClick={onCopy}
        className="p-1 text-slate-500 hover:text-primary-600 dark:hover:text-primary-400"
      >
        <ClipboardDocumentIcon className="h-4 w-4" />
      </button>
    </div>
  </div>
);

// 빈 상태 컴포넌트
const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="text-center py-12 text-slate-500 dark:text-slate-400">
    {message}
  </div>
);

// 모달 컴포넌트
const Modal: React.FC<{
  category: TabType;
  item: any;
  onSave: (data: any) => void;
  onClose: () => void;
}> = ({ category, item, onSave, onClose }) => {
  const [formData, setFormData] = useState<any>(item || {});
  const [masterPassword, setMasterPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 비밀번호 필드가 있고 값이 있으면 암호화
    const dataToSave = { ...formData };

    if (category === '계좌정보' && formData.accountPassword) {
      if (!masterPassword) {
        alert('비밀번호를 암호화하려면 마스터 비밀번호를 입력하세요.');
        return;
      }
      dataToSave.accountPassword = encrypt(formData.accountPassword, masterPassword);
    }

    if (category === '비밀번호' && formData.password) {
      if (!masterPassword) {
        alert('비밀번호를 암호화하려면 마스터 비밀번호를 입력하세요.');
        return;
      }
      dataToSave.password = encrypt(formData.password, masterPassword);
    }

    onSave(dataToSave);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">
            {item ? `${category} 수정` : `${category} 추가`}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {category === '계좌정보' && (
              <>
                <FormInput
                  label="계좌 이름"
                  required
                  value={formData.accountName || ''}
                  onChange={(v) => setFormData({ ...formData, accountName: v })}
                  placeholder="예: 주거래 통장"
                />
                <FormInput
                  label="은행명"
                  required
                  value={formData.bankName || ''}
                  onChange={(v) => setFormData({ ...formData, bankName: v })}
                  placeholder="예: 국민은행"
                />
                <FormInput
                  label="계좌번호"
                  required
                  value={formData.accountNumber || ''}
                  onChange={(v) => setFormData({ ...formData, accountNumber: v })}
                  placeholder="예: 123456-78-901234"
                />
                <FormInput
                  label="계좌 비밀번호 (선택)"
                  type="password"
                  value={formData.accountPassword || ''}
                  onChange={(v) => setFormData({ ...formData, accountPassword: v })}
                  placeholder="4자리 숫자"
                />
                {formData.accountPassword && (
                  <FormInput
                    label="마스터 비밀번호"
                    type="password"
                    required
                    value={masterPassword}
                    onChange={setMasterPassword}
                    placeholder="암호화에 사용할 비밀번호"
                  />
                )}
                <FormTextarea
                  label="설명 (선택)"
                  value={formData.description || ''}
                  onChange={(v) => setFormData({ ...formData, description: v })}
                  placeholder="추가 설명"
                />
              </>
            )}

            {category === '사업자정보' && (
              <>
                <FormInput
                  label="사업자명"
                  required
                  value={formData.businessName || ''}
                  onChange={(v) => setFormData({ ...formData, businessName: v })}
                  placeholder="예: 주식회사 OOO"
                />
                <FormInput
                  label="사업자번호"
                  required
                  value={formData.businessNumber || ''}
                  onChange={(v) => setFormData({ ...formData, businessNumber: v })}
                  placeholder="예: 123-45-67890"
                />
                <FormInput
                  label="법인번호 (선택)"
                  value={formData.corporateNumber || ''}
                  onChange={(v) => setFormData({ ...formData, corporateNumber: v })}
                  placeholder="예: 110111-1234567"
                />
                <FormTextarea
                  label="설명 (선택)"
                  value={formData.description || ''}
                  onChange={(v) => setFormData({ ...formData, description: v })}
                  placeholder="추가 설명"
                />
              </>
            )}

            {category === '비밀번호' && (
              <>
                <FormInput
                  label="서비스명"
                  required
                  value={formData.serviceName || ''}
                  onChange={(v) => setFormData({ ...formData, serviceName: v })}
                  placeholder="예: 관리자 페이지"
                />
                <FormInput
                  label="아이디/사용자명 (선택)"
                  value={formData.username || ''}
                  onChange={(v) => setFormData({ ...formData, username: v })}
                  placeholder="예: admin"
                />
                <FormInput
                  label="비밀번호 (선택)"
                  type="password"
                  value={formData.password || ''}
                  onChange={(v) => setFormData({ ...formData, password: v })}
                  placeholder="비밀번호"
                />
                {formData.password && (
                  <FormInput
                    label="마스터 비밀번호"
                    type="password"
                    required
                    value={masterPassword}
                    onChange={setMasterPassword}
                    placeholder="암호화에 사용할 비밀번호"
                  />
                )}
                <FormInput
                  label="URL (선택)"
                  value={formData.url || ''}
                  onChange={(v) => setFormData({ ...formData, url: v })}
                  placeholder="예: https://example.com"
                />
                <FormTextarea
                  label="설명 (선택)"
                  value={formData.description || ''}
                  onChange={(v) => setFormData({ ...formData, description: v })}
                  placeholder="추가 설명"
                />
              </>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                저장
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg transition-colors"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// 폼 입력 컴포넌트
const FormInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}> = ({ label, value, onChange, type = 'text', required = false, placeholder = '' }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
    />
  </div>
);

// 폼 텍스트영역 컴포넌트
const FormTextarea: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}> = ({ label, value, onChange, placeholder = '' }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
      {label}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
    />
  </div>
);

export default OrganizationInfoPage;
