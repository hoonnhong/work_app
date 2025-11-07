import React, { useState, useEffect } from 'react';
import { Event, Member } from '../types';
import { FirestoreService } from '../src/firebase/firestore-service';
import { PencilSquareIcon, TrashIcon, PlusIcon, ChevronDownIcon } from './Icons';

const eventService = new FirestoreService<Event>('events');
const employeeService = new FirestoreService<Member>('members');

interface SortConfig {
  key: keyof Event;
  direction: 'asc' | 'desc';
}

interface ColumnVisibility {
  eventName: boolean;
  topic: boolean;
  eventDate: boolean;
  eventTime: boolean;
  instructorName: boolean;
  instructorFee: boolean;
  incomeType: boolean;
  actions: boolean;
}

const EventManagement: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [employees, setEmployees] = useState<Member[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'eventDate', direction: 'desc' });
  const [visibleColumns, setVisibleColumns] = useState<ColumnVisibility>({
    eventName: true,
    topic: true,
    eventDate: true,
    eventTime: true,
    instructorName: true,
    instructorFee: true,
    incomeType: true,
    actions: true,
  });
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [instructorSearchInput, setInstructorSearchInput] = useState('');
  const [showInstructorDropdown, setShowInstructorDropdown] = useState(false);
  const [timePeriod, setTimePeriod] = useState<'AM' | 'PM'>('AM');
  const [timeHour, setTimeHour] = useState('');
  const [timeMinute, setTimeMinute] = useState('00');
  const [endTimePeriod, setEndTimePeriod] = useState<'AM' | 'PM'>('AM');
  const [endTimeHour, setEndTimeHour] = useState('');
  const [endTimeMinute, setEndTimeMinute] = useState('00');
  const [hasEndDateTime, setHasEndDateTime] = useState(false);
  const [formData, setFormData] = useState({
    eventName: '',
    topic: '',
    eventDate: '',
    eventTime: '',
    location: '',
    endDate: '',
    endTime: '',
    instructorId: '',
    instructorFee: '',
    incomeType: '' as any,
  });
  const [instructorPayments, setInstructorPayments] = useState<Array<{
    instructorId: number;
    instructorFee: number | string;
    incomeType: string;
  }>>([]);

  // 실시간 구독 설정
  useEffect(() => {
    const unsubscribeEvents = eventService.subscribe((data) => {
      setEvents(data);
    });

    const unsubscribeEmployees = employeeService.subscribe((data) => {
      // 구성원의 ID를 명시적으로 숫자로 변환
      const membersWithNumericIds = data.map((member) => ({
        ...member,
        id: typeof member.id === 'string' ? parseInt(member.id, 10) : member.id,
      }));
      setEmployees(membersWithNumericIds);
    });

    return () => {
      unsubscribeEvents();
      unsubscribeEmployees();
    };
  }, []);

  // 정렬 함수
  const getSortedEvents = () => {
    const sorted = [...events].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // null/undefined 처리
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // 문자열 비교
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }

      // 숫자/기타 비교
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  };

  // 정렬 핸들러
  const handleSort = (key: keyof Event) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // 모달 열기 (신규)
  const handleAddNew = () => {
    setEditingEvent(null);
    setFormData({
      eventName: '',
      topic: '',
      eventDate: '',
      eventTime: '',
      location: '',
      endDate: '',
      endTime: '',
      instructorId: '',
      instructorFee: '',
      incomeType: '',
    });
    setInstructorSearchInput('');
    setShowInstructorDropdown(false);
    setTimePeriod('AM');
    setTimeHour('');
    setTimeMinute('00');
    setHasEndDateTime(false);
    setEndTimePeriod('AM');
    setEndTimeHour('');
    setEndTimeMinute('00');
    setInstructorPayments([]);
    setIsModalOpen(true);
  };

  // 모달 열기 (수정)
  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    const instructorName = getInstructorName(event.instructorId);

    // 시간 파싱 (HH:mm 형식을 AM/PM, hour, minute으로 변환)
    const [hours, minutes] = event.eventTime.split(':').map(Number);
    let period: 'AM' | 'PM' = hours < 12 ? 'AM' : 'PM';
    let displayHour = hours === 0 ? 12 : (hours > 12 ? hours - 12 : hours);

    // 마침 시간 파싱 (endTime이 있으면 파싱)
    let endPeriod: 'AM' | 'PM' = 'AM';
    let endHour = '';
    let endMinute = '00';
    if (event.endTime) {
      const [endHours, endMinutes] = event.endTime.split(':').map(Number);
      endPeriod = endHours < 12 ? 'AM' : 'PM';
      endHour = String(endHours === 0 ? 12 : (endHours > 12 ? endHours - 12 : endHours));
      endMinute = String(endMinutes).padStart(2, '0');
    }

    setFormData({
      eventName: event.eventName,
      topic: event.topic,
      eventDate: event.eventDate,
      eventTime: event.eventTime,
      location: event.location || '',
      endDate: event.endDate || '',
      endTime: event.endTime || '',
      instructorId: String(event.instructorId),
      instructorFee: String(event.instructorFee),
      incomeType: event.incomeType,
    });
    setInstructorSearchInput(instructorName !== '강사 정보 없음' ? instructorName : '');
    setShowInstructorDropdown(false);
    setTimePeriod(period);
    setTimeHour(String(displayHour));
    setTimeMinute(String(minutes).padStart(2, '0'));
    setHasEndDateTime(!!event.endDate && !!event.endTime);
    setEndTimePeriod(endPeriod);
    setEndTimeHour(endHour);
    setEndTimeMinute(endMinute);
    setInstructorPayments(event.instructorPayments || []);
    setIsModalOpen(true);
  };

  // 폼 입력 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 저장
  const handleSave = async () => {
    if (!formData.eventName || !formData.eventDate || !formData.instructorId) {
      alert('행사명, 행사 날짜, 강사는 필수 항목입니다.');
      return;
    }

    // AM/PM, hour, minute을 24시간 형식의 HH:mm으로 변환 (시작시간)
    let eventTime24h = '00:00'; // 기본값
    if (timeHour) {
      let hours = parseInt(timeHour);
      if (timePeriod === 'PM' && hours !== 12) {
        hours += 12;
      } else if (timePeriod === 'AM' && hours === 12) {
        hours = 0;
      }
      eventTime24h = `${String(hours).padStart(2, '0')}:${timeMinute}`;
    }

    // 마침시간 변환 (endTime도 24시간 형식으로)
    let endTime24h = '';
    if (hasEndDateTime && endTimeHour && formData.endDate) {
      let endHours = parseInt(endTimeHour);
      if (endTimePeriod === 'PM' && endHours !== 12) {
        endHours += 12;
      } else if (endTimePeriod === 'AM' && endHours === 12) {
        endHours = 0;
      }
      endTime24h = `${String(endHours).padStart(2, '0')}:${endTimeMinute}`;
    }

    // formData에 변환된 시간 업데이트
    const updatedFormData = {
      ...formData,
      eventTime: eventTime24h,
      endTime: endTime24h,
    };

    try {
      const eventDataWithoutId = {
        eventName: updatedFormData.eventName,
        topic: updatedFormData.topic,
        eventDate: updatedFormData.eventDate,
        eventTime: updatedFormData.eventTime,
        endDate: hasEndDateTime ? updatedFormData.endDate : undefined,
        endTime: hasEndDateTime ? updatedFormData.endTime : undefined,
        instructorId: Number(updatedFormData.instructorId),
        instructorFee: Number(updatedFormData.instructorFee),
        incomeType: updatedFormData.incomeType,
        instructorPayments: instructorPayments.length > 0 ? instructorPayments.map(p => ({
          instructorId: p.instructorId,
          instructorFee: Number(p.instructorFee),
          incomeType: p.incomeType,
        })) : undefined,
        updatedAt: new Date().toISOString(),
      };

      if (editingEvent) {
        // 수정
        await eventService.update(editingEvent.id, eventDataWithoutId);
      } else {
        // 신규 추가 - 자동 생성된 ID로 저장
        const newEventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await (eventService as any).setWithId(newEventId, eventDataWithoutId);
      }

      setIsModalOpen(false);
      setEditingEvent(null);
      setFormData({
        eventName: '',
        topic: '',
        eventDate: '',
        eventTime: '',
        location: '',
        endDate: '',
        endTime: '',
        instructorId: '',
        instructorFee: '',
        incomeType: '',
      });
      setInstructorSearchInput('');
      setShowInstructorDropdown(false);
      setTimePeriod('AM');
      setTimeHour('');
      setTimeMinute('00');
      setHasEndDateTime(false);
      setEndTimePeriod('AM');
      setEndTimeHour('');
      setEndTimeMinute('00');
      setInstructorPayments([]);
    } catch (error) {
      console.error('저장 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  // 삭제
  const handleDelete = async (id: string) => {
    if (!id || id.trim() === '') {
      alert('이 행사는 ID가 없어서 삭제할 수 없습니다. Firestore에서 수동으로 삭제해주세요.');
      return;
    }
    if (window.confirm('이 행사를 삭제하시겠습니까?')) {
      try {
        await eventService.delete(id);
      } catch (error) {
        console.error('삭제 오류:', error);
        alert('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // 강사명 조회
  const getInstructorName = (instructorId: number): string => {
    // 숫자 ID와 문자열 ID 모두 비교
    const instructor = employees.find((e) => e.id === instructorId || String(e.id) === String(instructorId));
    return instructor ? instructor.name : '강사 정보 없음';
  };

  // 검색어에 따라 필터링된 강사 목록 조회
  const getFilteredInstructors = () => {
    if (!instructorSearchInput.trim()) {
      return employees;
    }
    return employees.filter((emp) =>
      emp.name.toLowerCase().includes(instructorSearchInput.toLowerCase())
    );
  };

  // 강사 선택 핸들러
  const handleSelectInstructor = (instructorId: number, instructorName: string) => {
    setFormData((prev) => ({
      ...prev,
      instructorId: String(instructorId),
    }));
    setInstructorSearchInput(instructorName);
    setShowInstructorDropdown(false);
  };

  // 강사 검색 입력 핸들러
  const handleInstructorSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInstructorSearchInput(e.target.value);
    setShowInstructorDropdown(true);
    setFormData((prev) => ({
      ...prev,
      instructorId: '',
    }));
  };

  const sortedEvents = getSortedEvents();

  return (
    <div className="space-y-4">
      {/* 버튼 영역 */}
      <div className="flex justify-between items-center">
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
        >
          <PlusIcon className="w-5 h-5" />
          새 행사 추가
        </button>

        {/* 열 표시 설정 */}
        <div className="relative">
          <button
            onClick={() => setShowColumnMenu(!showColumnMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
          >
            <ChevronDownIcon className="w-5 h-5" />
            열 표시
          </button>

          {showColumnMenu && (
            <div className="absolute right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-2 z-50">
              {(Object.keys(visibleColumns) as Array<keyof ColumnVisibility>).map((col) => (
                <label key={col} className="flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleColumns[col]}
                    onChange={(e) =>
                      setVisibleColumns((prev) => ({
                        ...prev,
                        [col]: e.target.checked,
                      }))
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {col === 'eventName' && '행사명'}
                    {col === 'topic' && '주제'}
                    {col === 'eventDate' && '날짜'}
                    {col === 'eventTime' && '시간'}
                    {col === 'instructorName' && '강사명'}
                    {col === 'instructorFee' && '강사비'}
                    {col === 'incomeType' && '소득 종류'}
                    {col === 'actions' && '작업'}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <tr>
              {visibleColumns.eventName && (
                <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700" onClick={() => handleSort('eventName')}>
                  행사명 {sortConfig.key === 'eventName' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
              )}
              {visibleColumns.topic && (
                <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700" onClick={() => handleSort('topic')}>
                  주제 {sortConfig.key === 'topic' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
              )}
              {visibleColumns.eventDate && (
                <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700" onClick={() => handleSort('eventDate')}>
                  날짜 {sortConfig.key === 'eventDate' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
              )}
              {visibleColumns.eventTime && (
                <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700" onClick={() => handleSort('eventTime')}>
                  시간 {sortConfig.key === 'eventTime' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
              )}
              {visibleColumns.instructorName && (
                <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700" onClick={() => handleSort('instructorId')}>
                  강사명 {sortConfig.key === 'instructorId' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
              )}
              {visibleColumns.instructorFee && (
                <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700" onClick={() => handleSort('instructorFee')}>
                  강사비 {sortConfig.key === 'instructorFee' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
              )}
              {visibleColumns.incomeType && (
                <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700" onClick={() => handleSort('incomeType')}>
                  소득 종류 {sortConfig.key === 'incomeType' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
              )}
              {visibleColumns.actions && (
                <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-300">작업</th>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedEvents.map((event, index) => (
              <tr key={event.id} className={`border-t border-slate-200 dark:border-slate-700 ${index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-700'} hover:bg-slate-100 dark:hover:bg-slate-600`}>
                {visibleColumns.eventName && <td className="px-4 py-3 text-slate-900 dark:text-slate-100">{event.eventName}</td>}
                {visibleColumns.topic && <td className="px-4 py-3 text-slate-900 dark:text-slate-100">{event.topic}</td>}
                {visibleColumns.eventDate && <td className="px-4 py-3 text-slate-900 dark:text-slate-100">{event.eventDate}</td>}
                {visibleColumns.eventTime && <td className="px-4 py-3 text-slate-900 dark:text-slate-100">{event.eventTime}</td>}
                {visibleColumns.instructorName && <td className="px-4 py-3 text-slate-900 dark:text-slate-100">{getInstructorName(event.instructorId)}</td>}
                {visibleColumns.instructorFee && <td className="px-4 py-3 text-right text-slate-900 dark:text-slate-100">{event.instructorFee ? event.instructorFee.toLocaleString() : '0'}</td>}
                {visibleColumns.incomeType && <td className="px-4 py-3 text-slate-900 dark:text-slate-100">{event.incomeType}</td>}
                {visibleColumns.actions && (
                  <td className="px-4 py-3 text-center space-x-2">
                    <button
                      onClick={() => handleEdit(event)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-primary-600 hover:bg-primary-100 rounded dark:text-primary-400 dark:hover:bg-primary-900"
                      title="수정"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-red-600 hover:bg-red-100 rounded dark:text-red-400 dark:hover:bg-red-900"
                      title="삭제"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedEvents.length === 0 && (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          등록된 행사가 없습니다.
        </div>
      )}

      {/* 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-lg max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              {editingEvent ? '행사 수정' : '새 행사 추가'}
            </h2>

            <div className="space-y-4">
              {/* 행사명 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  행사명 *
                </label>
                <input
                  type="text"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleInputChange}
                  placeholder="행사명을 입력하세요"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
              </div>

              {/* 주제 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  주제
                </label>
                <textarea
                  name="topic"
                  value={formData.topic}
                  onChange={handleInputChange}
                  placeholder="주제를 입력하세요"
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
              </div>

              {/* 행사 날짜 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  행사 날짜 *
                </label>
                <input
                  type="date"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
              </div>

              {/* 행사 시간 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  행사 시간
                </label>
                <div className="flex gap-2">
                  {/* AM/PM 선택 */}
                  <select
                    value={timePeriod}
                    onChange={(e) => setTimePeriod(e.target.value as 'AM' | 'PM')}
                    className="w-20 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  >
                    <option value="AM">오전</option>
                    <option value="PM">오후</option>
                  </select>

                  {/* 시간 선택 */}
                  <select
                    value={timeHour}
                    onChange={(e) => setTimeHour(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  >
                    <option value="">시</option>
                    {Array.from({ length: 12 }, (_, i) => {
                      const hour = i + 1;
                      return (
                        <option key={hour} value={String(hour)}>
                          {String(hour).padStart(2, '0')}시
                        </option>
                      );
                    })}
                  </select>

                  {/* 분 선택 (30분 단위) */}
                  <select
                    value={timeMinute}
                    onChange={(e) => setTimeMinute(e.target.value)}
                    className="w-20 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  >
                    <option value="00">00분</option>
                    <option value="30">30분</option>
                  </select>
                </div>
              </div>

              {/* 장소 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  장소
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="행사 장소를 입력하세요"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
              </div>

              {/* 마침 시간 설정 */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasEndDateTime}
                    onChange={(e) => setHasEndDateTime(e.target.checked)}
                    className="w-4 h-4 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 rounded"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    마침 날짜/시간 설정
                  </span>
                </label>
              </div>

              {/* 마침 날짜 및 시간 (hasEndDateTime이 true일 때만 표시) */}
              {hasEndDateTime && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      마침 날짜
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      마침 시간
                    </label>
                    <div className="flex gap-2">
                      {/* AM/PM 선택 */}
                      <select
                        value={endTimePeriod}
                        onChange={(e) => setEndTimePeriod(e.target.value as 'AM' | 'PM')}
                        className="w-20 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      >
                        <option value="AM">오전</option>
                        <option value="PM">오후</option>
                      </select>

                      {/* 시간 선택 */}
                      <select
                        value={endTimeHour}
                        onChange={(e) => setEndTimeHour(e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      >
                        <option value="">시</option>
                        {Array.from({ length: 12 }, (_, i) => {
                          const hour = i + 1;
                          return (
                            <option key={hour} value={String(hour)}>
                              {String(hour).padStart(2, '0')}시
                            </option>
                          );
                        })}
                      </select>

                      {/* 분 선택 (30분 단위) */}
                      <select
                        value={endTimeMinute}
                        onChange={(e) => setEndTimeMinute(e.target.value)}
                        className="w-20 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      >
                        <option value="00">00분</option>
                        <option value="30">30분</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* 강사 선택 - 검색 가능한 입력 */}
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  강사 *
                </label>
                <input
                  type="text"
                  value={instructorSearchInput}
                  onChange={handleInstructorSearchChange}
                  onFocus={() => setShowInstructorDropdown(true)}
                  placeholder="강사명을 입력하거나 선택하세요"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />

                {/* 강사 검색 결과 드롭다운 */}
                {showInstructorDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {getFilteredInstructors().length > 0 ? (
                      getFilteredInstructors().map((emp) => (
                        <button
                          key={emp.id}
                          type="button"
                          onClick={() => handleSelectInstructor(emp.id, emp.name)}
                          className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-600 border-b border-slate-200 dark:border-slate-600 last:border-b-0 text-slate-900 dark:text-slate-100"
                        >
                          {emp.name}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-slate-500 dark:text-slate-400 text-sm">
                        검색 결과가 없습니다
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 강사비 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  강사비 (원)
                </label>
                <input
                  type="number"
                  name="instructorFee"
                  value={formData.instructorFee}
                  onChange={handleInputChange}
                  placeholder="강사비를 입력하세요"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
              </div>

              {/* 소득 종류 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  소득 종류
                </label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="incomeType"
                      value=""
                      checked={formData.incomeType === ''}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                    />
                    <span className="text-slate-700 dark:text-slate-300">해당사항없음</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="incomeType"
                      value="사업소득"
                      checked={formData.incomeType === '사업소득'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                    />
                    <span className="text-slate-700 dark:text-slate-300">사업소득</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="incomeType"
                      value="기타소득"
                      checked={formData.incomeType === '기타소득'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                    />
                    <span className="text-slate-700 dark:text-slate-300">기타소득</span>
                  </label>
                </div>
              </div>

              {/* 다중 강사비 관리 */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    추가 강사비 (선택사항)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      // 강사 추가 모달/섹션을 위한 상태 추가 가능
                      const newInstructor = {
                        instructorId: 0,
                        instructorFee: '',
                        incomeType: '',
                      };
                      setInstructorPayments([...instructorPayments, newInstructor]);
                    }}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
                  >
                    <PlusIcon className="w-4 h-4" />
                    강사 추가
                  </button>
                </div>

                {/* 추가된 강사 목록 */}
                {instructorPayments.length > 0 && (
                  <div className="space-y-2 bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
                    {instructorPayments.map((payment, index) => (
                      <div key={index} className="flex gap-2 items-start bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-600">
                        <div className="flex-1 space-y-2">
                          {/* 강사 선택 */}
                          <select
                            value={payment.instructorId}
                            onChange={(e) => {
                              const newPayments = [...instructorPayments];
                              newPayments[index].instructorId = Number(e.target.value);
                              setInstructorPayments(newPayments);
                            }}
                            className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                          >
                            <option value={0}>강사를 선택하세요</option>
                            {employees.map((emp) => (
                              <option key={emp.id} value={emp.id}>
                                {emp.name}
                              </option>
                            ))}
                          </select>

                          <div className="flex gap-2">
                            {/* 강사비 */}
                            <input
                              type="number"
                              value={payment.instructorFee}
                              onChange={(e) => {
                                const newPayments = [...instructorPayments];
                                newPayments[index].instructorFee = Number(e.target.value);
                                setInstructorPayments(newPayments);
                              }}
                              placeholder="강사비"
                              className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            />

                            {/* 소득 종류 */}
                            <select
                              value={payment.incomeType}
                              onChange={(e) => {
                                const newPayments = [...instructorPayments];
                                newPayments[index].incomeType = e.target.value;
                                setInstructorPayments(newPayments);
                              }}
                              className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            >
                              <option value="">선택</option>
                              <option value="사업소득">사업소득</option>
                              <option value="기타소득">기타소득</option>
                            </select>

                            {/* 삭제 버튼 */}
                            <button
                              type="button"
                              onClick={() => {
                                const newPayments = instructorPayments.filter((_, i) => i !== index);
                                setInstructorPayments(newPayments);
                              }}
                              className="px-2 py-1 text-red-600 hover:bg-red-100 rounded dark:text-red-400 dark:hover:bg-red-900"
                              title="삭제"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManagement;
