import React, { useState } from 'react';
import { Application, ApplicationStatus, EvaluationCriteria, ApplicantEvaluation, InterviewSchedule } from '../../types';
import { StorageService } from '../../services/storage';
import {
  X,
  Star,
  Calendar,
  CheckCircle,
  Copy,
  ExternalLink,
  Clock,
  Phone,
  Mail,
  User,
  MessageSquare,
  FileCheck,
  Send,
} from 'lucide-react';

interface ApplicantDetailModalProps {
  application: Application | null;
  onClose: () => void;
  onUpdate: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onOpenScheduler: (app: Application) => void;
}

export const ApplicantDetailModal: React.FC<ApplicantDetailModalProps> = ({
  application,
  onClose,
  onUpdate,
  onShowToast,
  onOpenScheduler,
}) => {
  if (!application) return null;

  const [activeTab, setActiveTab] = useState<'answers' | 'eval' | 'templates'>('answers');

  // Evaluation states
  const [criteria, setCriteria] = useState<EvaluationCriteria>(
    application.evaluation?.criteria || {
      passion: 35,
      competency: 35,
      attendance: 18,
    }
  );
  const [evalNotes, setEvalNotes] = useState(application.evaluation?.notes || '');
  const [reviewerName, setReviewerName] = useState(
    application.evaluation?.reviewedBy || '동아리 운영진'
  );

  const totalScore = criteria.passion + criteria.competency + criteria.attendance;

  const handleSaveEvaluation = () => {
    const evalData: ApplicantEvaluation = {
      score: totalScore,
      criteria,
      notes: evalNotes,
      reviewedBy: reviewerName,
      reviewedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
    StorageService.saveEvaluation(application.id, evalData);
    onUpdate();
    onShowToast(`심사 점수(${totalScore}점) 및 평가 메모가 저장되었습니다.`, 'success');
  };

  const handleStatusChange = (newStatus: ApplicationStatus, statusName: string) => {
    StorageService.updateApplicationStatus(application.id, newStatus);
    onUpdate();
    onShowToast(`지원자 상태가 '${statusName}'(으)로 변경되었습니다.`, 'success');
  };

  const copyTemplateToClipboard = (text: string, title: string) => {
    navigator.clipboard.writeText(text);
    onShowToast(`${title} 내용이 클립보드에 복사되었습니다.`, 'success');
  };

  // Pre-generated templates
  const interviewMsg = `[${application.clubName}] 서류 전형 합격 및 면접 전형 안내
안녕하세요, ${application.applicant.name}님!
${application.clubName} 신입 부원 모집에 지원해주셔서 진심으로 감사드립니다.

귀하의 지원서를 면밀히 검토한 결과, 1차 서류 전형에 합격하셨음을 기쁜 마음으로 안내드립니다.
아래 면접 일정을 확인해주시기 바랍니다.

- 면접 일시: ${application.interviewSchedule?.date || '추후 공지'} ${application.interviewSchedule?.time || ''}
- 면접 장소: ${application.interviewSchedule?.location || '동아리방'}
- 준비 사항: 편안한 복장 및 신분증 지참

일정 변경이 필요하신 경우 회신 부탁드립니다.
감사합니다.
${application.clubName} 운영진 드림`;

  const acceptMsg = `[${application.clubName}] 최종 합격 축하 및 신입부원 환영 안내
축하합니다! ${application.applicant.name}님,
${application.clubName} 2026학년도 신규 부원 모집에 최종 합격하셨습니다.

앞으로 함께 열정을 나누며 멋진 활동을 펼쳐나갈 수 있기를 기대합니다.
신입부원 오리엔테이션(OT) 및 정기 모임 관련 상세 안내는 단체 카카오톡방 초대를 통해 개별 안내드릴 예정입니다.

- 문의: ${application.clubName} 운영진`;

  const rejectMsg = `[${application.clubName}] 지원 결과 안내
안녕하세요, ${application.applicant.name}님.
${application.clubName} 모집에 소중한 시간을 내어 지원해주셔서 깊이 감사드립니다.

뛰어난 역량과 열정을 지닌 많은 지원자분들과 함께한 가운데, 한정된 선발 인원으로 인해 안타깝게도 이번에는 ${application.applicant.name}님을 모시지 못하게 되었습니다.

비록 이번 기회에는 함께하지 못하지만, 지원자님의 열정과 도전을 늘 응원하겠습니다.
감사합니다.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-xl border border-neutral-200 overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <span>{application.clubName}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">{application.id}</span>
                <span aria-hidden="true">·</span>
                <span>접수 {application.submittedAt}</span>
              </div>
              <h2 className="text-xl font-bold text-neutral-950 flex items-center gap-2 mt-0.5">
                <span>{application.applicant.name}</span>
                <span className="text-xs font-normal text-neutral-500">
                  ({application.applicant.department}, {application.applicant.grade})
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenScheduler(application)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-md transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>면접 일정 배정</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Status Bar */}
        <div className="px-6 py-3 bg-white border-b border-neutral-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-neutral-500">현재 상태:</span>
            <span className="font-semibold text-neutral-900 px-2 py-0.5 bg-neutral-100 rounded">
              {application.status}
            </span>
            {application.evaluation && (
              <span className="flex items-center gap-1 text-amber-700 font-semibold ml-2">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>총점 {application.evaluation.score}점</span>
              </span>
            )}
          </div>

          {/* Quick status transitions */}
          <div className="flex items-center gap-1">
            <span className="text-neutral-400 mr-1 text-[11px]">상태 변경:</span>
            <button
              onClick={() => handleStatusChange('reviewing', '서류심사중')}
              className={`px-2 py-1 rounded text-[11px] ${
                application.status === 'reviewing'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              서류심사중
            </button>
            <button
              onClick={() => handleStatusChange('doc_passed', '서류통과')}
              className={`px-2 py-1 rounded text-[11px] ${
                application.status === 'doc_passed'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              서류통과
            </button>
            <button
              onClick={() => handleStatusChange('accepted', '최종합격')}
              className={`px-2 py-1 rounded text-[11px] ${
                application.status === 'accepted'
                  ? 'bg-emerald-700 text-white font-bold'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              최종합격
            </button>
            <button
              onClick={() => handleStatusChange('rejected', '불합격')}
              className={`px-2 py-1 rounded text-[11px] ${
                application.status === 'rejected'
                  ? 'bg-rose-700 text-white font-semibold'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
              }`}
            >
              불합격
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 px-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab('answers')}
            className={`py-2.5 px-4 border-b-2 transition-colors ${
              activeTab === 'answers'
                ? 'border-neutral-950 text-neutral-950 font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            지원서 응답 상세
          </button>
          <button
            onClick={() => setActiveTab('eval')}
            className={`py-2.5 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'eval'
                ? 'border-neutral-950 text-neutral-950 font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <span>심사 평가표 & 메모</span>
            {application.evaluation && (
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-2.5 px-4 border-b-2 transition-colors ${
              activeTab === 'templates'
                ? 'border-neutral-950 text-neutral-950 font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            안내 메시지 발송 템플릿
          </button>
        </div>

        {/* Modal Scroll Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          {/* TAB 1: Answers */}
          {activeTab === 'answers' && (
            <div className="space-y-6">
              {/* Applicant Profile Bar */}
              <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-neutral-500 block text-[11px]">학번</span>
                  <span className="font-mono font-medium text-neutral-900">{application.applicant.studentId}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">소속 학과 / 학년</span>
                  <span className="font-medium text-neutral-900">{application.applicant.department} ({application.applicant.grade})</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">휴대폰 번호</span>
                  <span className="font-mono font-medium text-neutral-900">{application.applicant.phone}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">이메일 주소</span>
                  <span className="font-mono text-neutral-900 truncate block">{application.applicant.email}</span>
                </div>
              </div>

              {/* Interview schedule if set */}
              {application.interviewSchedule && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-purple-900 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-purple-700" />
                    <span>배정된 면접 일정</span>
                  </div>
                  <p className="text-neutral-800">
                    <strong>일시:</strong> {application.interviewSchedule.date} {application.interviewSchedule.time} · <strong>장소:</strong> {application.interviewSchedule.location}
                  </p>
                  {application.interviewSchedule.interviewerNotes && (
                    <p className="text-neutral-600 text-[11px]">
                      메모: {application.interviewSchedule.interviewerNotes}
                    </p>
                  )}
                </div>
              )}

              {/* Answers List */}
              <div className="space-y-4">
                <h4 className="font-semibold text-neutral-950 text-sm">지원서 작성 문항 응답</h4>
                {Object.entries(application.answers).map(([key, value], idx) => {
                  const isLink = typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'));
                  return (
                    <div key={key} className="p-4 bg-white border border-neutral-200 rounded-lg space-y-2">
                      <div className="flex items-center justify-between text-neutral-800 font-semibold">
                        <span>문항. {key}</span>
                      </div>

                      {isLink ? (
                        <div className="flex items-center gap-2">
                          <a
                            href={value as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:underline font-mono text-xs break-all"
                          >
                            <span>{value as string}</span>
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          </a>
                        </div>
                      ) : Array.isArray(value) ? (
                        <div className="flex flex-wrap gap-1.5">
                          {value.map((item, i) => (
                            <span key={i} className="px-2 py-1 bg-neutral-100 rounded text-neutral-800 font-medium">
                              {item}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-neutral-700 whitespace-pre-wrap leading-relaxed">
                          {value || '(응답 없음)'}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Evaluation Rubric */}
          {activeTab === 'eval' && (
            <div className="space-y-6">
              <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-neutral-900 text-sm">정량 심사 배점표 (100점 만점)</h4>
                  <div className="text-right">
                    <span className="text-xs text-neutral-500">평가 총점: </span>
                    <strong className="text-xl font-bold font-mono text-neutral-950 tabular-nums">
                      {totalScore}
                    </strong>
                    <span className="text-neutral-500"> / 100점</span>
                  </div>
                </div>

                {/* Criterion 1: Passion (0~40) */}
                <div className="space-y-1.5 bg-white p-3 rounded border border-neutral-200">
                  <div className="flex items-center justify-between font-medium">
                    <span>1. 지원 동기 및 활동 열정 (배점 40점)</span>
                    <span className="font-mono font-bold text-neutral-900">{criteria.passion}점</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={criteria.passion}
                    onChange={(e) =>
                      setCriteria((prev) => ({ ...prev, passion: Number(e.target.value) }))
                    }
                    className="w-full accent-neutral-900 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-400">
                    <span>부족 (0점)</span>
                    <span>보통 (20점)</span>
                    <span>매우 우수 (40점)</span>
                  </div>
                </div>

                {/* Criterion 2: Competency (0~40) */}
                <div className="space-y-1.5 bg-white p-3 rounded border border-neutral-200">
                  <div className="flex items-center justify-between font-medium">
                    <span>2. 지원 분야 직무/파트 역량 및 포트폴리오 (배점 40점)</span>
                    <span className="font-mono font-bold text-neutral-900">{criteria.competency}점</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={criteria.competency}
                    onChange={(e) =>
                      setCriteria((prev) => ({ ...prev, competency: Number(e.target.value) }))
                    }
                    className="w-full accent-neutral-900 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-400">
                    <span>기초 단계 (0점)</span>
                    <span>성장 가능성 (20점)</span>
                    <span>즉시 기여 가능 (40점)</span>
                  </div>
                </div>

                {/* Criterion 3: Attendance / Teamwork (0~20) */}
                <div className="space-y-1.5 bg-white p-3 rounded border border-neutral-200">
                  <div className="flex items-center justify-between font-medium">
                    <span>3. 정기 모임 참석 가능 여부 및 협업 태도 (배점 20점)</span>
                    <span className="font-mono font-bold text-neutral-900">{criteria.attendance}점</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={criteria.attendance}
                    onChange={(e) =>
                      setCriteria((prev) => ({ ...prev, attendance: Number(e.target.value) }))
                    }
                    className="w-full accent-neutral-900 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-400">
                    <span>불확실 (0점)</span>
                    <span>성실함 확인 (20점)</span>
                  </div>
                </div>

                {/* Reviewer Notes */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-neutral-900">
                    심사위원 종합 평가 의견 및 면접 질문 제안
                  </label>
                  <textarea
                    rows={4}
                    value={evalNotes}
                    onChange={(e) => setEvalNotes(e.target.value)}
                    placeholder="지원서 검토 소감, 면접 때 물어볼 핵심 질문, 타 심사위원과 공유할 메모를 작성해주세요."
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900 leading-relaxed text-xs"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500">평가자:</span>
                    <input
                      type="text"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      placeholder="운영진 이름"
                      className="px-2 py-1 bg-white border border-neutral-300 rounded text-xs w-32"
                    />
                  </div>

                  <button
                    onClick={handleSaveEvaluation}
                    className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors"
                  >
                    평가 점수 및 메모 저장
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Message Templates */}
          {activeTab === 'templates' && (
            <div className="space-y-5">
              <p className="text-neutral-600">
                지원자에게 문자(SMS), 카카오톡, 또는 이메일로 전송할 합격/면접 안내문 양식입니다. '복사'를 눌러 편리하게 활용하세요.
              </p>

              {/* Template 1: Interview Invite */}
              <div className="p-4 bg-white border border-neutral-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-purple-900 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>서류 통과 및 면접 일정 안내문</span>
                  </h4>
                  <button
                    onClick={() => copyTemplateToClipboard(interviewMsg, '면접 안내문')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    <span>내용 복사</span>
                  </button>
                </div>
                <pre className="p-3 bg-neutral-50 rounded border border-neutral-100 text-[11px] font-sans whitespace-pre-wrap leading-relaxed text-neutral-800">
                  {interviewMsg}
                </pre>
              </div>

              {/* Template 2: Acceptance */}
              <div className="p-4 bg-white border border-neutral-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>최종 합격 축하 및 OT 안내문</span>
                  </h4>
                  <button
                    onClick={() => copyTemplateToClipboard(acceptMsg, '최종 합격문')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    <span>내용 복사</span>
                  </button>
                </div>
                <pre className="p-3 bg-neutral-50 rounded border border-neutral-100 text-[11px] font-sans whitespace-pre-wrap leading-relaxed text-neutral-800">
                  {acceptMsg}
                </pre>
              </div>

              {/* Template 3: Rejection */}
              <div className="p-4 bg-white border border-neutral-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-neutral-700">불합격 정중 위로 안내문</h4>
                  <button
                    onClick={() => copyTemplateToClipboard(rejectMsg, '불합격 안내문')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    <span>내용 복사</span>
                  </button>
                </div>
                <pre className="p-3 bg-neutral-50 rounded border border-neutral-100 text-[11px] font-sans whitespace-pre-wrap leading-relaxed text-neutral-700">
                  {rejectMsg}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-100 rounded-md transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
