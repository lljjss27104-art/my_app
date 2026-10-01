import React from 'react';
import { Club } from '../../types';
import { X, Calendar, MapPin, DollarSign, Clock, User, Mail, Phone, CheckCircle } from 'lucide-react';

interface ClubDetailModalProps {
  club: Club | null;
  onClose: () => void;
  onStartApplication: (club: Club) => void;
}

export const ClubDetailModal: React.FC<ClubDetailModalProps> = ({
  club,
  onClose,
  onStartApplication,
}) => {
  if (!club) return null;

  const isRecruiting = club.activeStatus === 'recruiting';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl border border-neutral-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header Banner */}
        <div className="relative aspect-21/9 bg-neutral-100 border-b border-neutral-100">
          <img
            src={club.coverImage}
            alt={club.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-neutral-950/30" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/80 hover:bg-white text-neutral-800 transition-colors shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute bottom-4 left-5 right-5 text-white">
            <div className="flex items-center gap-2 text-xs font-medium mb-1">
              <span className="bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs">
                {club.category}
              </span>
              <span>·</span>
              <span className="bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs">
                {isRecruiting ? '모집 진행중' : '모집 마감'}
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">{club.name}</h2>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-neutral-700">
          {/* Summary */}
          <div>
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
              동아리 소개
            </h3>
            <p className="text-base text-neutral-900 font-medium leading-relaxed">
              {club.shortDesc}
            </p>
            <p className="mt-2 text-neutral-600 leading-relaxed whitespace-pre-line text-xs sm:text-sm">
              {club.fullDesc}
            </p>
          </div>

          {/* Key Requirements */}
          <div>
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              지원 자격 및 필수 요건
            </h3>
            <ul className="space-y-2">
              {club.requirements.map((req, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-800">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Activity Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                <Calendar className="w-3.5 h-3.5" />
                <span>모집 기간</span>
              </div>
              <p className="text-xs font-mono tabular-nums text-neutral-900 font-medium">
                {club.recruitmentPeriod.start} ~ {club.recruitmentPeriod.end}
              </p>
            </div>

            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                <Clock className="w-3.5 h-3.5" />
                <span>정기 모임 일정</span>
              </div>
              <p className="text-xs text-neutral-900 font-medium">
                {club.regularMeetingTime}
              </p>
            </div>

            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                <MapPin className="w-3.5 h-3.5" />
                <span>동아리방 / 활동 장소</span>
              </div>
              <p className="text-xs text-neutral-900 font-medium truncate">
                {club.location}
              </p>
            </div>

            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                <DollarSign className="w-3.5 h-3.5" />
                <span>동아리 회비</span>
              </div>
              <p className="text-xs text-neutral-900 font-medium truncate">
                {club.membershipFee}
              </p>
            </div>
          </div>

          {/* Contact Person */}
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-neutral-600">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-neutral-400" />
              <span>대표자: <strong className="text-neutral-900">{club.leaderName}</strong></span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-neutral-400" />
                {club.contactEmail}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-neutral-400" />
                {club.contactPhone}
              </span>
            </div>
          </div>

          {/* Application Form Questions Preview */}
          <div>
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              지원서 작성 문항 미리보기 ({club.questions.length}개 문항)
            </h3>
            <div className="space-y-2 border border-neutral-200 rounded-lg divide-y divide-neutral-100 bg-neutral-50/50">
              {club.questions.map((q, idx) => (
                <div key={q.id} className="p-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-900">Q{idx + 1}. {q.label}</span>
                    {q.required && <span className="text-rose-500 font-bold">*</span>}
                    <span className="text-neutral-400 text-[11px]">({q.type})</span>
                  </div>
                  {q.description && (
                    <p className="text-neutral-500 mt-0.5 text-[11px]">{q.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-100 rounded-md transition-colors"
          >
            닫기
          </button>
          <button
            onClick={() => {
              onClose();
              onStartApplication(club);
            }}
            disabled={!isRecruiting}
            className={`px-5 py-2 text-xs font-semibold rounded-md transition-colors ${
              isRecruiting
                ? 'bg-neutral-900 hover:bg-neutral-800 text-white shadow-xs'
                : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
            }`}
          >
            {isRecruiting ? '지금 지원서 작성하기' : '모집이 마감되었습니다'}
          </button>
        </div>
      </div>
    </div>
  );
};
