import React, { useState } from 'react';
import { Club, FormQuestion, QuestionType } from '../../types';
import { StorageService } from '../../services/storage';
import {
  X,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Check,
  Eye,
  Settings,
  ListPlus,
  Type,
  AlignLeft,
  CheckSquare,
  Link2,
} from 'lucide-react';

interface FormBuilderModalProps {
  club: Club | null;
  onClose: () => void;
  onSaveSuccess: (updatedClub: Club) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const FormBuilderModal: React.FC<FormBuilderModalProps> = ({
  club,
  onClose,
  onSaveSuccess,
  onShowToast,
}) => {
  if (!club) return null;

  const [activeTab, setActiveTab] = useState<'questions' | 'announcement' | 'preview'>('questions');

  // Announcement fields
  const [name, setName] = useState(club.name);
  const [shortDesc, setShortDesc] = useState(club.shortDesc);
  const [fullDesc, setFullDesc] = useState(club.fullDesc);
  const [startDate, setStartDate] = useState(club.recruitmentPeriod.start);
  const [endDate, setEndDate] = useState(club.recruitmentPeriod.end);
  const [regularMeetingTime, setRegularMeetingTime] = useState(club.regularMeetingTime);
  const [membershipFee, setMembershipFee] = useState(club.membershipFee);
  const [location, setLocation] = useState(club.location);
  const [targetCount, setTargetCount] = useState(club.targetRecruitCount || 20);
  const [requirementsText, setRequirementsText] = useState(club.requirements.join('\n'));

  // Questions fields
  const [questions, setQuestions] = useState<FormQuestion[]>([...club.questions]);
  const [editingQuestion, setEditingQuestion] = useState<FormQuestion | null>(null);

  // New question form state
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState<QuestionType>('textarea');
  const [newDesc, setNewDesc] = useState('');
  const [newRequired, setNewRequired] = useState(true);
  const [newPlaceholder, setNewPlaceholder] = useState('');
  const [newOptionsText, setNewOptionsText] = useState('항목 1\n항목 2\n항목 3');

  const handleAddQuestion = () => {
    if (!newLabel.trim()) {
      onShowToast('문항 질문 내용을 입력해주세요.', 'error');
      return;
    }

    const options = ['select', 'radio', 'checkbox', 'timeSlot'].includes(newType)
      ? newOptionsText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;

    const newQ: FormQuestion = {
      id: `q_${Date.now().toString(36)}`,
      label: newLabel.trim(),
      type: newType,
      description: newDesc.trim() || undefined,
      required: newRequired,
      placeholder: newPlaceholder.trim() || undefined,
      options,
      maxChars: newType === 'textarea' ? 1000 : undefined,
    };

    setQuestions([...questions, newQ]);
    // Reset form
    setNewLabel('');
    setNewDesc('');
    setNewPlaceholder('');
    onShowToast('새 지원서 문항이 추가되었습니다.', 'success');
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
    onShowToast('문항이 삭제되었습니다.', 'info');
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= questions.length) return;
    const copy = [...questions];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, moved);
    setQuestions(copy);
  };

  const handleToggleRequired = (id: string) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, required: !q.required } : q))
    );
  };

  const handleSaveAll = () => {
    const updatedClub: Club = {
      ...club,
      name,
      shortDesc,
      fullDesc,
      recruitmentPeriod: {
        start: startDate,
        end: endDate,
      },
      regularMeetingTime,
      membershipFee,
      location,
      targetRecruitCount: Number(targetCount) || 20,
      requirements: requirementsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      questions,
    };

    StorageService.saveClub(updatedClub);
    onSaveSuccess(updatedClub);
    onShowToast('동아리 공고 및 지원서 양식 변경 사항이 저장되었습니다!', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-xl border border-neutral-200 overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-500 font-medium">{club.name}</span>
            <h2 className="text-lg font-bold text-neutral-950">지원서 양식 & 모집 공고 편집기</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveAll}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>변경 사항 저장</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 px-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab('questions')}
            className={`py-2.5 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'questions'
                ? 'border-neutral-950 text-neutral-950 font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <ListPlus className="w-3.5 h-3.5" />
            <span>지원서 문항 빌더 ({questions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('announcement')}
            className={`py-2.5 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'announcement'
                ? 'border-neutral-950 text-neutral-950 font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>모집 공고 & 활동 정보</span>
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`py-2.5 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'border-neutral-950 text-neutral-950 font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>지원자 화면 미리보기</span>
          </button>
        </div>

        {/* Modal Scroll Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          {/* TAB 1: Questions Builder */}
          {activeTab === 'questions' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Existing Questions List */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-neutral-900 text-sm">
                    현재 지원서 문항 ({questions.length}개)
                  </h3>
                  <span className="text-[11px] text-neutral-400">순서 조정 및 필수 여부 토글</span>
                </div>

                <div className="space-y-2">
                  {questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-3 bg-white border border-neutral-200 rounded-lg space-y-2 hover:border-neutral-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-neutral-900">
                              Q{idx + 1}. {q.label}
                            </span>
                            {q.required && (
                              <span className="text-rose-500 font-bold text-xs">*</span>
                            )}
                          </div>
                          {q.description && (
                            <p className="text-[11px] text-neutral-500 mt-0.5">{q.description}</p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleRequired(q.id)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                              q.required
                                ? 'bg-neutral-900 text-white'
                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                            }`}
                          >
                            {q.required ? '필수' : '선택'}
                          </button>
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveQuestion(idx, 'up')}
                            className="p-1 rounded text-neutral-400 hover:text-neutral-800 disabled:opacity-20"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === questions.length - 1}
                            onClick={() => handleMoveQuestion(idx, 'down')}
                            className="p-1 rounded text-neutral-400 hover:text-neutral-800 disabled:opacity-20"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1 rounded text-rose-500 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Meta badge */}
                      <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
                        <span className="px-1.5 py-0.5 bg-neutral-100 rounded">타입: {q.type}</span>
                        {q.options && <span>선택지 {q.options.length}개</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Question Panel */}
              <div className="lg:col-span-5 bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-4">
                <h4 className="font-bold text-neutral-900 text-sm flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-neutral-900" />
                  <span>새 맞춤 문항 추가</span>
                </h4>

                <div>
                  <label className="block font-semibold text-neutral-800 mb-1">
                    질문 내용 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="예: 관심 있는 프로젝트 주제는?"
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-800 mb-1">응답 형식 (타입)</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as QuestionType)}
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900"
                  >
                    <option value="textarea">장문 서술형 (자기소개, 지원동기 등)</option>
                    <option value="text">단답형 한 줄 입력</option>
                    <option value="select">드롭다운 단일 선택 (파트, 분야)</option>
                    <option value="radio">라디오 단일 선택 (참석 여부 등)</option>
                    <option value="checkbox">체크박스 다중 선택</option>
                    <option value="timeSlot">면접 가능 시간대 다중 선택</option>
                    <option value="link">외부 링크 (Github, 포트폴리오 URL)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-800 mb-1">
                    질문 부연 설명 (선택)
                  </label>
                  <input
                    type="text"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="지원자가 답변 시 참고할 가이드"
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900"
                  />
                </div>

                {['select', 'radio', 'checkbox', 'timeSlot'].includes(newType) && (
                  <div>
                    <label className="block font-semibold text-neutral-800 mb-1">
                      선택 항목 목록 (줄바꿈으로 구분)
                    </label>
                    <textarea
                      rows={3}
                      value={newOptionsText}
                      onChange={(e) => setNewOptionsText(e.target.value)}
                      placeholder="항목1&#10;항목2&#10;항목3"
                      className="w-full p-2 bg-white border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900 font-mono text-[11px]"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-neutral-800">
                    <input
                      type="checkbox"
                      checked={newRequired}
                      onChange={(e) => setNewRequired(e.target.checked)}
                      className="w-4 h-4 text-neutral-900 rounded border-neutral-300"
                    />
                    <span className="font-semibold">필수 응답으로 설정</span>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="w-full py-2 px-3 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors"
                >
                  문항 추가하기
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Announcement & Info */}
          {activeTab === 'announcement' && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <label className="block font-semibold text-neutral-800 mb-1">동아리 명칭</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-800 mb-1">한 줄 요약 소개</label>
                <input
                  type="text"
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-800 mb-1">상세 모집 공고 내용</label>
                <textarea
                  rows={4}
                  value={fullDesc}
                  onChange={(e) => setFullDesc(e.target.value)}
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-800 mb-1">모집 시작일</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-800 mb-1">모집 마감일</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-800 mb-1">정기 모임 일정</label>
                  <input
                    type="text"
                    value={regularMeetingTime}
                    onChange={(e) => setRegularMeetingTime(e.target.value)}
                    placeholder="매주 목요일 18:30"
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-800 mb-1">선발 예정 정원</label>
                  <input
                    type="number"
                    value={targetCount}
                    onChange={(e) => setTargetCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-800 mb-1">활동 장소 / 동아리방</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-800 mb-1">회비 안내</label>
                  <input
                    type="text"
                    value={membershipFee}
                    onChange={(e) => setMembershipFee(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-800 mb-1">
                  지원 자격 및 필수 요건 (줄바꿈으로 구분)
                </label>
                <textarea
                  rows={3}
                  value={requirementsText}
                  onChange={(e) => setRequirementsText(e.target.value)}
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-md leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 3: Preview */}
          {activeTab === 'preview' && (
            <div className="max-w-2xl mx-auto bg-neutral-50 p-6 rounded-xl border border-neutral-200 space-y-6">
              <div className="border-b border-neutral-200 pb-3">
                <span className="text-[11px] text-neutral-500 font-medium">{club.category}</span>
                <h3 className="text-xl font-bold text-neutral-900">{name} 지원서 미리보기</h3>
                <p className="text-xs text-neutral-600 mt-1">{shortDesc}</p>
              </div>

              {/* Questions preview */}
              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div key={q.id} className="p-3 bg-white border border-neutral-200 rounded-md space-y-1.5">
                    <label className="block font-semibold text-neutral-900">
                      {idx + 1}. {q.label} {q.required && <span className="text-rose-500 font-bold">*</span>}
                    </label>
                    {q.description && (
                      <p className="text-[11px] text-neutral-500">{q.description}</p>
                    )}

                    <div className="pt-1">
                      {q.type === 'text' && (
                        <div className="p-2 bg-neutral-50 border border-neutral-200 rounded text-neutral-400">
                          {q.placeholder || '답변 입력창'}
                        </div>
                      )}
                      {q.type === 'textarea' && (
                        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded text-neutral-400 h-20">
                          {q.placeholder || '상세 서술형 답변 입력창'}
                        </div>
                      )}
                      {q.type === 'select' && (
                        <div className="p-2 bg-neutral-50 border border-neutral-200 rounded text-neutral-500">
                          드롭다운 선택지 ({q.options?.join(', ')})
                        </div>
                      )}
                      {['radio', 'checkbox', 'timeSlot'].includes(q.type) && (
                        <div className="space-y-1">
                          {q.options?.map((opt) => (
                            <div key={opt} className="flex items-center gap-2 text-neutral-700">
                              <span className="w-3 h-3 rounded-full border border-neutral-300 inline-block" />
                              <span>{opt}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-100 rounded-md transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSaveAll}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors shadow-xs"
          >
            변경 사항 저장 완료
          </button>
        </div>
      </div>
    </div>
  );
};
