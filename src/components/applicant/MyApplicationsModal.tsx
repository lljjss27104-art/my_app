import React, { useState } from 'react';
import { Application, ApplicationStatus } from '../../types';
import { StorageService } from '../../services/storage';
import { Search, Calendar, MapPin, CheckCircle, Clock, AlertCircle, X, ChevronRight, User } from 'lucide-react';

interface MyApplicationsModalProps {
  applications: Application[];
  onClose: () => void;
  onRefresh: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const MyApplicationsModal: React.FC<MyApplicationsModalProps> = ({
  applications,
  onClose,
  onRefresh,
  onShowToast,
}) => {
  const [studentId, setStudentId] = useState('');
  const [phoneLast4, setPhoneLast4] = useState('');
  const [searched, setSearched] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const matchedApplications = applications.filter((app) => {
    if (!studentId.trim()) return false;
    const matchId = app.applicant.studentId.trim() === studentId.trim();
    const cleanPhone = app.applicant.phone.replace(/[^0-9]/g, '');
    const matchPhone = !phoneLast4.trim() || cleanPhone.endsWith(phoneLast4.trim());
    return matchId && matchPhone;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    if (matchedApplications.length > 0) {
      setSelectedApp(matchedApplications[0]);
    } else {
      setSelectedApp(null);
    }
  };

  const handleQuickLookup = (id: string, phoneEnd: string) => {
    setStudentId(id);
    setPhoneLast4(phoneEnd);
    setSearched(true);
    const found = applications.find(
      (a) => a.applicant.studentId === id && a.applicant.phone.replace(/[^0-9]/g, '').endsWith(phoneEnd)
    );
    if (found) {
      setSelectedApp(found);
    }
  };

  const handleCancelApplication = (appId: string) => {
    if (window.confirm('정말로 지원서를 취소하시겠습니까? 취소 후에는 복구할 수 없습니다.')) {
      StorageService.deleteApplication(appId);
      onRefresh();
      setSelectedApp(null);
      onShowToast('지원서가 취소되었습니다.', 'info');
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    const map: Record<ApplicationStatus, { text: string; style: string }> = {
      submitted: { text: '접수 완료', style: 'bg-neutral-100 text-neutral-800' },
      reviewing: { text: '서류 심사 중', style: 'bg-blue-50 text-blue-800' },
      doc_passed: { text: '서류 합격', style: 'bg-emerald-50 text-emerald-800' },
      interview_scheduled: { text: '면접 대상자', style: 'bg-purple-50 text-purple-800' },
      accepted: { text: '최종 합격 🎉', style: 'bg-emerald-600 text-white' },
      rejected: { text: '불합격', style: 'bg-neutral-200 text-neutral-600' },
    };
    return map[status] || { text: status, style: 'bg-neutral-100 text-neutral-800' };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-xl border border-neutral-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div>
            <h2 className="text-lg font-bold text-neutral-950">내 지원서 및 합격 결과 조회</h2>
            <p className="text-xs text-neutral-500">
              학번과 휴대폰 번호 뒷자리로 접수한 지원서의 서류/면접 심사 진행 상황을 확인하세요.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  학번 (Student ID)
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="예: 2022147021"
                  required
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  휴대폰 번호 뒷자리 4자리
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={phoneLast4}
                  onChange={(e) => setPhoneLast4(e.target.value)}
                  placeholder="예: 9872"
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900 font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
              {/* Demo quick pills */}
              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <span>데모 바로조회:</span>
                <button
                  type="button"
                  onClick={() => handleQuickLookup('2022147021', '9872')}
                  className="px-2 py-0.5 bg-white border border-neutral-200 hover:border-neutral-400 rounded text-[11px] text-neutral-800"
                >
                  김민우(서류합격)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLookup('2023112045', '8893')}
                  className="px-2 py-0.5 bg-white border border-neutral-200 hover:border-neutral-400 rounded text-[11px] text-neutral-800"
                >
                  이서연(면접예정)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLookup('2024108821', '2045')}
                  className="px-2 py-0.5 bg-white border border-neutral-200 hover:border-neutral-400 rounded text-[11px] text-neutral-800"
                >
                  최유나(최종합격)
                </button>
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                <span>조회하기</span>
              </button>
            </div>
          </form>

          {/* Results Area */}
          {searched && (
            <div>
              {matchedApplications.length === 0 ? (
                <div className="text-center py-10 bg-neutral-50 rounded-lg border border-neutral-200">
                  <AlertCircle className="w-6 h-6 text-neutral-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-neutral-800">조회된 지원 내역이 없습니다.</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    입력하신 학번 또는 휴대폰 번호가 맞는지 다시 한 번 확인해주세요.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* If multiple, show selector */}
                  {matchedApplications.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {matchedApplications.map((app) => (
                        <button
                          key={app.id}
                          onClick={() => setSelectedApp(app)}
                          className={`px-3 py-1.5 text-xs rounded-md border text-left whitespace-nowrap transition-colors ${
                            selectedApp?.id === app.id
                              ? 'bg-neutral-900 text-white border-neutral-900'
                              : 'bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-50'
                          }`}
                        >
                          {app.clubName}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Selected Application Card */}
                  {selectedApp && (
                    <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-6">
                      {/* Title & Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-neutral-100">
                        <div>
                          <span className="text-xs text-neutral-500">지원 동아리</span>
                          <h3 className="text-xl font-bold text-neutral-950">{selectedApp.clubName}</h3>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            접수일시: {selectedApp.submittedAt} · 접수번호: {selectedApp.id}
                          </p>
                        </div>
                        <div>
                          <span
                            className={`inline-block px-3 py-1 text-xs font-semibold rounded ${
                              getStatusBadge(selectedApp.status).style
                            }`}
                          >
                            {getStatusBadge(selectedApp.status).text}
                          </span>
                        </div>
                      </div>

                      {/* Recruitment Step Progress Pipeline */}
                      <div className="py-2">
                        <div className="text-xs font-semibold text-neutral-700 mb-3">전형 진행 단계</div>
                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                          {/* Step 1: 접수 */}
                          <div className="p-2 rounded bg-neutral-100 border border-neutral-200 text-neutral-900 font-medium">
                            <span className="text-[10px] block text-neutral-500">1단계</span>
                            서류 접수 완료
                          </div>

                          {/* Step 2: 서류심사 */}
                          <div
                            className={`p-2 rounded border font-medium ${
                              ['reviewing', 'doc_passed', 'interview_scheduled', 'accepted', 'rejected'].includes(
                                selectedApp.status
                              )
                                ? 'bg-neutral-900 text-white border-neutral-900'
                                : 'bg-neutral-50 text-neutral-400 border-neutral-200'
                            }`}
                          >
                            <span className="text-[10px] block opacity-75">2단계</span>
                            서류 심사
                          </div>

                          {/* Step 3: 면접 */}
                          <div
                            className={`p-2 rounded border font-medium ${
                              ['interview_scheduled', 'accepted'].includes(selectedApp.status)
                                ? 'bg-neutral-900 text-white border-neutral-900'
                                : 'bg-neutral-50 text-neutral-400 border-neutral-200'
                            }`}
                          >
                            <span className="text-[10px] block opacity-75">3단계</span>
                            면접 전형
                          </div>

                          {/* Step 4: 최종선발 */}
                          <div
                            className={`p-2 rounded border font-medium ${
                              selectedApp.status === 'accepted'
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : selectedApp.status === 'rejected'
                                ? 'bg-neutral-200 text-neutral-600 border-neutral-300'
                                : 'bg-neutral-50 text-neutral-400 border-neutral-200'
                            }`}
                          >
                            <span className="text-[10px] block opacity-75">4단계</span>
                            {selectedApp.status === 'accepted'
                              ? '최종 합격'
                              : selectedApp.status === 'rejected'
                              ? '불합격'
                              : '최종 발표'}
                          </div>
                        </div>
                      </div>

                      {/* Interview Schedule Notice Card if present */}
                      {selectedApp.interviewSchedule && (
                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                            <Calendar className="w-4 h-4 text-purple-700" />
                            <span>면접 일정 안내</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-purple-950">
                            <div>
                              <span className="text-purple-700">일시:</span>{' '}
                              <strong>{selectedApp.interviewSchedule.date} {selectedApp.interviewSchedule.time}</strong>
                            </div>
                            <div>
                              <span className="text-purple-700">장소:</span>{' '}
                              <strong>{selectedApp.interviewSchedule.location}</strong>
                            </div>
                          </div>
                          {selectedApp.interviewSchedule.interviewerNotes && (
                            <p className="text-xs text-purple-800 bg-white/70 p-2 rounded">
                              안내사항: {selectedApp.interviewSchedule.interviewerNotes}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Official Notification Message if any */}
                      {selectedApp.statusNotificationNote && (
                        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-800">
                          <span className="font-semibold block mb-1 text-neutral-900">운영진 안내 메시지:</span>
                          <p className="whitespace-pre-line leading-relaxed">{selectedApp.statusNotificationNote}</p>
                        </div>
                      )}

                      {/* Submitted Details Review */}
                      <div className="space-y-3 pt-2">
                        <div className="text-xs font-semibold text-neutral-900">제출한 지원서 내용</div>
                        <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 text-xs space-y-1">
                          <p>
                            <strong>지원자:</strong> {selectedApp.applicant.name} ({selectedApp.applicant.department}, {selectedApp.applicant.grade})
                          </p>
                          <p>
                            <strong>연락처:</strong> {selectedApp.applicant.phone} · {selectedApp.applicant.email}
                          </p>
                        </div>

                        {/* Questions and Answers */}
                        <div className="space-y-2">
                          {Object.entries(selectedApp.answers).map(([key, val]) => (
                            <div key={key} className="p-2.5 bg-white border border-neutral-200 rounded text-xs">
                              <p className="font-semibold text-neutral-800">{key}</p>
                              <p className="text-neutral-600 mt-1 whitespace-pre-wrap">
                                {Array.isArray(val) ? val.join(', ') : val}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Cancel option */}
                      {selectedApp.status === 'submitted' && (
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleCancelApplication(selectedApp.id)}
                            className="px-3 py-1.5 text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors"
                          >
                            지원 취소하기
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-100 rounded-md transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
