import React, { useState } from 'react';
import { Application, InterviewSchedule } from '../../types';
import { StorageService } from '../../services/storage';
import { X, Calendar, Clock, MapPin, Check, User } from 'lucide-react';

interface InterviewSchedulerModalProps {
  application: Application | null;
  onClose: () => void;
  onSuccess: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const InterviewSchedulerModal: React.FC<InterviewSchedulerModalProps> = ({
  application,
  onClose,
  onSuccess,
  onShowToast,
}) => {
  if (!application) return null;

  const [date, setDate] = useState(application.interviewSchedule?.date || '2026-10-06');
  const [time, setTime] = useState(application.interviewSchedule?.time || '18:30');
  const [location, setLocation] = useState(
    application.interviewSchedule?.location || '학생회관 408호 동아리실 (또는 비대면 온라인)'
  );
  const [interviewerNotes, setInterviewerNotes] = useState(
    application.interviewSchedule?.interviewerNotes || ''
  );

  // Check if applicant provided time slots in answers
  const requestedSlots = application.answers['q_interview_slots'] || [];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time || !location.trim()) {
      onShowToast('면접 일시와 장소를 모두 입력해주세요.', 'error');
      return;
    }

    const schedule: InterviewSchedule = {
      date,
      time,
      location,
      interviewerNotes,
    };

    StorageService.saveInterviewSchedule(application.id, schedule);
    onSuccess();
    onShowToast(`${application.applicant.name} 지원자의 면접 일정이 배정되었습니다.`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-neutral-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-700" />
            <h3 className="text-base font-bold text-neutral-950">면접 전형 일정 배정</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          {/* Target Applicant Info */}
          <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-100 space-y-1">
            <p className="font-semibold text-neutral-900">
              대상자: {application.applicant.name} ({application.applicant.department}, {application.applicant.studentId})
            </p>
            {Array.isArray(requestedSlots) && requestedSlots.length > 0 && (
              <div className="text-[11px] text-purple-900 pt-1">
                <span className="font-medium">지원자가 응답한 가능 시간대: </span>
                <span>{requestedSlots.join(', ')}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-800 mb-1">
                면접 날짜 <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-800 mb-1">
                면접 시간 <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-neutral-800 mb-1">
              면접 장소 또는 비대면 접속 링크 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="예: 학생회관 408호 또는 meet.google.com/xyz-abcd-efg"
              required
              className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-neutral-800 mb-1">
              지원자 안내 메모 및 질문 유의사항 (선택)
            </label>
            <textarea
              rows={3}
              value={interviewerNotes}
              onChange={(e) => setInterviewerNotes(e.target.value)}
              placeholder="지원자에게 전달할 준비물이나 심사위원이 주의할 사항을 기재하세요."
              className="w-full p-2.5 bg-white border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1 px-4 py-1.5 font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-md transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>면접 일정 확정 & 대상자 배정</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
