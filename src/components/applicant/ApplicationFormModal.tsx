import React, { useState, useEffect } from 'react';
import { Club, Application, ApplicantInfo, FormQuestion } from '../../types';
import { StorageService } from '../../services/storage';
import { X, Check, ArrowLeft, ArrowRight, Save, AlertCircle, FileText, CheckCircle2, Download, Table, Clock } from 'lucide-react';

interface ApplicationFormModalProps {
  club: Club | null;
  onClose: () => void;
  onSubmitSuccess: (application: Application) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ApplicationFormModal: React.FC<ApplicationFormModalProps> = ({
  club,
  onClose,
  onSubmitSuccess,
  onShowToast,
}) => {
  if (!club) return null;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [applicantInfo, setApplicantInfo] = useState<ApplicantInfo>({
    name: '',
    studentId: '',
    department: '',
    grade: '1학년',
    phone: '',
    email: '',
  });

  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedApplication, setSubmittedApplication] = useState<Application | null>(null);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = StorageService.getDraft(club.id);
    if (savedDraft) {
      if (savedDraft.applicantInfo) setApplicantInfo(savedDraft.applicantInfo);
      if (savedDraft.answers && typeof savedDraft.answers === 'object') {
        setAnswers(savedDraft.answers);
      }
      setDraftLoaded(true);
      onShowToast('이전에 작성 중이던 임시저장 내용을 불러왔습니다.', 'info');
    }
  }, [club.id]);

  // Handle draft manual save
  const handleSaveDraft = () => {
    StorageService.saveDraft(club.id, {
      applicantInfo,
      answers,
      savedAt: new Date().toISOString(),
    });
    onShowToast('작성 중인 지원서 내용이 임시저장되었습니다.', 'success');
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!applicantInfo.name.trim()) newErrors.name = '이름을 입력해주세요.';
    if (!applicantInfo.studentId.trim()) newErrors.studentId = '학번을 입력해주세요.';
    if (!applicantInfo.department.trim()) newErrors.department = '소속 학과를 입력해주세요.';
    if (!applicantInfo.phone.trim()) {
      newErrors.phone = '휴대폰 번호를 입력해주세요.';
    } else if (!/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(applicantInfo.phone.trim())) {
      newErrors.phone = '올바른 휴대폰 번호 형식을 입력해주세요 (예: 010-1234-5678).';
    }
    if (!applicantInfo.email.trim()) {
      newErrors.email = '이메일 주소를 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(applicantInfo.email.trim())) {
      newErrors.email = '올바른 이메일 주소 형식을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    club.questions.forEach((q) => {
      if (q.required) {
        const val = answers[q.id];
        if (val === undefined || val === null || val === '') {
          newErrors[q.id] = '필수 응답 항목입니다.';
        } else if (Array.isArray(val) && val.length === 0) {
          newErrors[q.id] = '최소 1개 이상 항목을 선택해주세요.';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) {
        handleSaveDraft();
        setStep(2);
      }
    } else if (step === 2) {
      if (validateStep2()) {
        handleSaveDraft();
        setStep(3);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms) {
      setErrors((prev) => ({ ...prev, terms: '개인정보 수집 및 이용에 동의해야 접수가 가능합니다.' }));
      return;
    }

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newAppId = `app_${Date.now().toString(36)}`;

    const newApplication: Application = {
      id: newAppId,
      clubId: club.id,
      clubName: club.name,
      submittedAt: formattedDate,
      updatedAt: formattedDate,
      applicant: applicantInfo,
      answers,
      status: 'submitted',
    };

    StorageService.saveApplication(newApplication);
    StorageService.clearDraft(club.id);
    setSubmittedApplication(newApplication);
    onSubmitSuccess(newApplication);
    onShowToast(`지원서가 접수되었으며, '${club.name}' 엑셀 시트에 자동 저장되었습니다!`, 'success');
  };

  // Safe functional updater for checkbox and time slots
  const handleToggleCheckbox = (qId: string, option: string) => {
    setAnswers((prev) => {
      const prevVal = prev[qId];
      const list: string[] = Array.isArray(prevVal)
        ? prevVal
        : typeof prevVal === 'string' && prevVal
        ? [prevVal]
        : [];
      const isChecked = list.includes(option);
      const updated = isChecked
        ? list.filter((item) => item !== option)
        : [...list, option];
      return { ...prev, [qId]: updated };
    });

    setErrors((prev) => {
      if (!prev[qId]) return prev;
      const copy = { ...prev };
      delete copy[qId];
      return copy;
    });
  };

  const handleSelectAllCheckboxes = (qId: string, options: string[]) => {
    setAnswers((prev) => ({ ...prev, [qId]: [...options] }));
    setErrors((prev) => {
      if (!prev[qId]) return prev;
      const copy = { ...prev };
      delete copy[qId];
      return copy;
    });
  };

  const handleClearAllCheckboxes = (qId: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: [] }));
  };

  // Safe functional updater for radio buttons
  const handleSelectRadio = (qId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: option }));
    setErrors((prev) => {
      if (!prev[qId]) return prev;
      const copy = { ...prev };
      delete copy[qId];
      return copy;
    });
  };

  const handleDownloadClubExcel = () => {
    const allApps = StorageService.getApplications();
    StorageService.exportSingleClubToExcel(club, allApps);
    onShowToast(`'${club.name}' 지원자 엑셀(.xlsx) 파일이 다운로드되었습니다.`, 'success');
  };

  // If already submitted in this session
  if (submittedApplication) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/50 backdrop-blur-xs">
        <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-neutral-200 p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-neutral-950">지원서 접수 & 엑셀 시트 저장 완료!</h3>
            <p className="text-xs text-neutral-600 mt-1">
              <strong>{club.name}</strong> 2026학년도 신규 부원 모집에 정상 접수되었으며, 해당 동아리의 엑셀 시트에 지원서 내용이 즉시 반영되었습니다.
            </p>
          </div>

          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 text-xs text-left space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span className="text-neutral-500">접수 번호</span>
              <span className="text-neutral-900 font-semibold">{submittedApplication.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">지원자</span>
              <span className="text-neutral-900">{submittedApplication.applicant.name} ({submittedApplication.applicant.studentId})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">접수 일시</span>
              <span className="text-neutral-900">{submittedApplication.submittedAt}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">저장 시트</span>
              <span className="text-emerald-700 font-semibold">{club.name} 시트</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <button
              type="button"
              onClick={handleDownloadClubExcel}
              className="w-full py-2 px-3 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>동아리 엑셀(.xlsx) 파일 다운로드</span>
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors"
            >
              확인 완료
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl border border-neutral-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <span>{club.name}</span>
              <span aria-hidden="true">·</span>
              <span>가입 신청서 작성</span>
            </div>
            <h2 className="text-lg font-bold text-neutral-950">
              {step === 1 && '1. 기본 인적사항 입력'}
              {step === 2 && '2. 동아리 맞춤 문항 작성'}
              {step === 3 && '3. 최종 검토 및 제출'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-600 bg-white border border-neutral-200 hover:bg-neutral-100 rounded-md transition-colors shadow-2xs"
            >
              <Save className="w-3 h-3 text-neutral-500" />
              <span>임시저장</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Indicator Progress */}
        <div className="grid grid-cols-3 border-b border-neutral-100 bg-white text-xs">
          <div
            className={`py-2 px-3 text-center border-b-2 font-medium transition-colors ${
              step === 1
                ? 'border-neutral-950 text-neutral-950 font-semibold'
                : 'border-transparent text-neutral-400'
            }`}
          >
            1. 인적사항
          </div>
          <div
            className={`py-2 px-3 text-center border-b-2 font-medium transition-colors ${
              step === 2
                ? 'border-neutral-950 text-neutral-950 font-semibold'
                : 'border-transparent text-neutral-400'
            }`}
          >
            2. 문항 응답 ({club.questions.length})
          </div>
          <div
            className={`py-2 px-3 text-center border-b-2 font-medium transition-colors ${
              step === 3
                ? 'border-neutral-950 text-neutral-950 font-semibold'
                : 'border-transparent text-neutral-400'
            }`}
          >
            3. 최종 확인
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* STEP 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 text-xs text-neutral-600">
                정확한 연락을 위해 성명, 학번, 휴대폰 번호 및 학교 이메일을 오타 없이 기재해주세요.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-800 mb-1">
                    이름 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={applicantInfo.name}
                    onChange={(e) => {
                      setApplicantInfo((p) => ({ ...p, name: e.target.value }));
                      if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                    }}
                    placeholder="홍길동"
                    className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900"
                  />
                  {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-800 mb-1">
                    학번 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={applicantInfo.studentId}
                    onChange={(e) => {
                      setApplicantInfo((p) => ({ ...p, studentId: e.target.value }));
                      if (errors.studentId) setErrors((prev) => ({ ...prev, studentId: '' }));
                    }}
                    placeholder="예: 2024123456"
                    className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900 font-mono"
                  />
                  {errors.studentId && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.studentId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-800 mb-1">
                    소속 학과 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={applicantInfo.department}
                    onChange={(e) => {
                      setApplicantInfo((p) => ({ ...p, department: e.target.value }));
                      if (errors.department) setErrors((prev) => ({ ...prev, department: '' }));
                    }}
                    placeholder="예: 컴퓨터공학과"
                    className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900"
                  />
                  {errors.department && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.department}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-800 mb-1">
                    학년 <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={applicantInfo.grade}
                    onChange={(e) =>
                      setApplicantInfo((p) => ({ ...p, grade: e.target.value as any }))
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900"
                  >
                    <option value="1학년">1학년</option>
                    <option value="2학년">2학년</option>
                    <option value="3학년">3학년</option>
                    <option value="4학년">4학년</option>
                    <option value="대학원생">대학원생</option>
                    <option value="휴학생">휴학생</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-800 mb-1">
                    휴대폰 번호 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={applicantInfo.phone}
                    onChange={(e) => {
                      setApplicantInfo((p) => ({ ...p, phone: e.target.value }));
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                    }}
                    placeholder="010-0000-0000"
                    className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900 font-mono"
                  />
                  {errors.phone && <p className="text-[11px] text-rose-500 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-800 mb-1">
                    이메일 주소 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={applicantInfo.email}
                    onChange={(e) => {
                      setApplicantInfo((p) => ({ ...p, email: e.target.value }));
                      if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                    }}
                    placeholder="example@univ.ac.kr"
                    className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900 font-mono"
                  />
                  {errors.email && <p className="text-[11px] text-rose-500 mt-1">{errors.email}</p>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Custom Questions */}
          {step === 2 && (
            <div className="space-y-6">
              {club.questions.map((question, idx) => {
                const qValue = answers[question.id];
                const error = errors[question.id];

                return (
                  <div key={question.id} className="space-y-1.5 pb-4 border-b border-neutral-100 last:border-b-0">
                    <label className="block text-xs font-semibold text-neutral-900">
                      {idx + 1}. {question.label}{' '}
                      {question.required && <span className="text-rose-500 font-bold">*</span>}
                    </label>
                    {question.description && (
                      <p className="text-[11px] text-neutral-500 leading-relaxed">
                        {question.description}
                      </p>
                    )}

                    {/* Render by Question Type */}
                    {question.type === 'text' && (
                      <input
                        type="text"
                        value={qValue || ''}
                        onChange={(e) => {
                          setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }));
                          if (error) setErrors((prev) => ({ ...prev, [question.id]: '' }));
                        }}
                        placeholder={question.placeholder || '답변을 입력해주세요'}
                        className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900"
                      />
                    )}

                    {question.type === 'link' && (
                      <input
                        type="url"
                        value={qValue || ''}
                        onChange={(e) => {
                          setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }));
                          if (error) setErrors((prev) => ({ ...prev, [question.id]: '' }));
                        }}
                        placeholder={question.placeholder || 'https://...'}
                        className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900 font-mono"
                      />
                    )}

                    {question.type === 'textarea' && (
                      <div>
                        <textarea
                          rows={4}
                          value={qValue || ''}
                          maxLength={question.maxChars || 1500}
                          onChange={(e) => {
                            setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }));
                            if (error) setErrors((prev) => ({ ...prev, [question.id]: '' }));
                          }}
                          placeholder={question.placeholder || '상세히 작성해주세요'}
                          className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900 leading-relaxed"
                        />
                        <div className="flex justify-end text-[11px] text-neutral-400 font-mono tabular-nums">
                          {(qValue || '').length} / {question.maxChars || 1500}자
                        </div>
                      </div>
                    )}

                    {question.type === 'select' && (
                      <select
                        value={qValue || ''}
                        onChange={(e) => {
                          setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }));
                          if (error) setErrors((prev) => ({ ...prev, [question.id]: '' }));
                        }}
                        className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900"
                      >
                        <option value="">선택해주세요</option>
                        {question.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}

                    {question.type === 'radio' && (
                      <div className="space-y-1.5 pt-1">
                        {(question.options || []).map((opt) => {
                          const isSelected = qValue === opt;
                          return (
                            <button
                              type="button"
                              key={opt}
                              onClick={() => handleSelectRadio(question.id, opt)}
                              className={`w-full flex items-center gap-2.5 text-xs p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-neutral-900 text-white border-neutral-900 font-medium'
                                  : 'bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-50'
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors shrink-0 ${
                                  isSelected
                                    ? 'border-white bg-white text-neutral-900'
                                    : 'border-neutral-300 bg-white'
                                }`}
                              >
                                {isSelected && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
                                )}
                              </div>
                              <span className="truncate">{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {(question.type === 'checkbox' || question.type === 'timeSlot') && (
                      <div className="space-y-2 pt-1">
                        {/* Checkbox Toolbar Header */}
                        <div className="flex items-center justify-between text-[11px] pb-1 border-b border-neutral-100">
                          <div className="flex items-center gap-1.5 text-neutral-500">
                            {question.type === 'timeSlot' ? (
                              <>
                                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                                <span className="font-medium text-neutral-700">면접 가능한 시간대를 모두 체크해주세요</span>
                              </>
                            ) : (
                              <span>다중 선택 체크박스</span>
                            )}
                            <span className="font-mono tabular-nums text-neutral-900 font-semibold ml-1">
                              (선택: {Array.isArray(qValue) ? qValue.length : 0}개)
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleSelectAllCheckboxes(question.id, question.options || [])
                              }
                              className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                            >
                              전체 선택
                            </button>
                            <span aria-hidden="true" className="text-neutral-300">·</span>
                            <button
                              type="button"
                              onClick={() => handleClearAllCheckboxes(question.id)}
                              className="text-[11px] text-neutral-400 hover:text-neutral-700 hover:underline cursor-pointer"
                            >
                              선택 해제
                            </button>
                          </div>
                        </div>

                        {/* Checkbox Options Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(question.options || []).map((opt) => {
                            const isChecked = Array.isArray(qValue) && qValue.includes(opt);
                            return (
                              <button
                                type="button"
                                key={opt}
                                role="checkbox"
                                aria-checked={isChecked}
                                onClick={() => handleToggleCheckbox(question.id, opt)}
                                className={`flex items-center justify-between gap-2.5 text-xs p-3 rounded-lg border text-left transition-all cursor-pointer select-none ${
                                  isChecked
                                    ? 'bg-indigo-50/80 border-indigo-400 text-indigo-950 font-semibold shadow-2xs'
                                    : 'bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {/* Custom Checkbox Square */}
                                  <div
                                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                                      isChecked
                                        ? 'bg-indigo-600 border-indigo-600 text-white'
                                        : 'border-neutral-300 bg-white text-transparent'
                                    }`}
                                  >
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </div>
                                  <span className="truncate">{opt}</span>
                                </div>

                                {isChecked && (
                                  <span className="text-[10px] text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded font-medium shrink-0">
                                    선택됨
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {error && <p className="text-[11px] text-rose-500 mt-1">{error}</p>}
                  </div>
                );
              })}
            </div>
          )}

          {/* STEP 3: Review & Submit */}
          {step === 3 && (
            <div className="space-y-5 text-xs text-neutral-700">
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <h4 className="font-semibold text-neutral-900 mb-2">지원서 요약 확인</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-neutral-500">성명:</span>{' '}
                    <strong className="text-neutral-900">{applicantInfo.name}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500">학번:</span>{' '}
                    <span className="font-mono">{applicantInfo.studentId}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">학과/학년:</span>{' '}
                    <span>{applicantInfo.department} / {applicantInfo.grade}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">연락처:</span>{' '}
                    <span className="font-mono">{applicantInfo.phone}</span>
                  </div>
                </div>
              </div>

              {/* Answers preview list */}
              <div className="space-y-3">
                <h4 className="font-semibold text-neutral-900">작성한 문항 답변</h4>
                {club.questions.map((q, idx) => {
                  const val = answers[q.id];
                  const displayVal = Array.isArray(val)
                    ? val.join(', ')
                    : typeof val === 'object' && val !== null
                    ? JSON.stringify(val)
                    : String(val || '(미작성)');

                  return (
                    <div key={q.id} className="p-2.5 bg-white border border-neutral-100 rounded-md">
                      <p className="font-medium text-neutral-800 text-[11px]">
                        {idx + 1}. {q.label}
                      </p>
                      <p className="text-neutral-600 mt-1 whitespace-pre-wrap leading-relaxed">
                        {displayVal}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Privacy consent checkbox */}
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => {
                      setAgreedTerms(e.target.checked);
                      if (errors.terms) setErrors((prev) => ({ ...prev, terms: '' }));
                    }}
                    className="w-4 h-4 mt-0.5 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-900"
                  />
                  <div className="text-neutral-700 leading-snug">
                    <span className="font-semibold text-neutral-900">
                      [필수] 동아리 가입 선발을 위한 개인정보 수집 및 이용 동의
                    </span>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      수집 항목: 성명, 학번, 소속 학과, 연락처, 이메일, 지원서 응답 내용 / 목적: 동아리 선발 심사 및 면접 안내 / 보유 기간: 당해 학기 선발 종료 후 파기
                    </p>
                  </div>
                </label>
                {errors.terms && <p className="text-[11px] text-rose-500">{errors.terms}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as any)}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-100 rounded-md transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>이전 단계</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                작성 취소
              </button>
            )}
          </div>

          <div>
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors shadow-xs"
              >
                <span>다음 단계</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>최종 지원서 제출하기</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
