import React, { useState } from 'react';
import { Club, Application } from '../../types';
import { ApplicantTable } from './ApplicantTable';
import { ApplicantDetailModal } from './ApplicantDetailModal';
import { InterviewSchedulerModal } from './InterviewSchedulerModal';
import { FormBuilderModal } from './FormBuilderModal';
import { ExcelSpreadsheetModal } from './ExcelSpreadsheetModal';
import {
  Users,
  Clock,
  UserCheck,
  Calendar,
  FileEdit,
  Share2,
  ExternalLink,
  ChevronDown,
  Building,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';

interface AdminDashboardProps {
  clubs: Club[];
  applications: Application[];
  activeClubId: string;
  onSelectClub: (clubId: string) => void;
  onRefresh: () => void;
  onOpenCreateClub: () => void;
  onViewApplicantMode: (club: Club) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  clubs,
  applications,
  activeClubId,
  onSelectClub,
  onRefresh,
  onOpenCreateClub,
  onViewApplicantMode,
  onShowToast,
}) => {
  const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);
  const [schedulerTarget, setSchedulerTarget] = useState<Application | null>(null);
  const [isFormBuilderOpen, setIsFormBuilderOpen] = useState(false);
  const [isExcelSpreadsheetOpen, setIsExcelSpreadsheetOpen] = useState(false);

  const currentClub = clubs.find((c) => c.id === activeClubId) || clubs[0];
  const clubApplications = applications.filter((app) => app.clubId === currentClub?.id);

  // Computed metrics
  const totalCount = clubApplications.length;
  const reviewingCount = clubApplications.filter((a) =>
    ['submitted', 'reviewing'].includes(a.status)
  ).length;
  const interviewCount = clubApplications.filter((a) =>
    ['doc_passed', 'interview_scheduled'].includes(a.status)
  ).length;
  const acceptedCount = clubApplications.filter((a) => a.status === 'accepted').length;
  const targetSlots = currentClub?.targetRecruitCount || 15;
  const competitionRate = targetSlots > 0 ? (totalCount / targetSlots).toFixed(1) : '-';

  const handleCopyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    onShowToast(`'${currentClub.name}' 지원서 접수 링크가 복사되었습니다.`, 'success');
  };

  if (!currentClub) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-neutral-500">등록된 동아리가 없습니다.</p>
        <button
          onClick={onOpenCreateClub}
          className="mt-4 px-4 py-2 bg-neutral-900 text-white rounded-md text-xs font-semibold"
        >
          첫 동아리 개설하기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Club Switcher Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
            <span className="font-semibold text-indigo-700">동아리 운영진 관리 센터</span>
            <span aria-hidden="true">·</span>
            <span>지원서 심사 & 선발</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-950">
              {currentClub.name}
            </h1>

            {/* Club Selector Dropdown */}
            {clubs.length > 1 && (
              <div className="relative">
                <select
                  value={currentClub.id}
                  onChange={(e) => onSelectClub(e.target.value)}
                  className="pl-2.5 pr-8 py-1 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900 cursor-pointer shadow-2xs"
                >
                  {clubs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({applications.filter((a) => a.clubId === c.id).length}명 지원)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onViewApplicantMode(currentClub)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-md transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
            <span>지원자 화면 보기</span>
          </button>

          <button
            onClick={handleCopyShareLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-md transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-neutral-500" />
            <span>신청 링크 복사</span>
          </button>

          <button
            onClick={() => setIsExcelSpreadsheetOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-md transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>동아리별 엑셀 시트 관리</span>
          </button>

          <button
            onClick={() => setIsFormBuilderOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors shadow-xs"
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>지원서 문항 & 공고 편집</span>
          </button>
        </div>
      </div>

      {/* Metrics Row (Strictly single-elevation, tabular numbers, no pills) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1 */}
        <div className="p-4 bg-white border border-neutral-200 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>총 지원자 수</span>
            <Users className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-neutral-950 font-mono tabular-nums">
            {totalCount}
            <span className="text-xs font-sans text-neutral-500 ml-1">명</span>
          </div>
          <p className="text-[11px] text-neutral-400">전체 접수 완료</p>
        </div>

        {/* Metric 2 */}
        <div className="p-4 bg-white border border-neutral-200 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>서류 심사 대기</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-neutral-950 font-mono tabular-nums">
            {reviewingCount}
            <span className="text-xs font-sans text-neutral-500 ml-1">명</span>
          </div>
          <p className="text-[11px] text-neutral-400">미평가 또는 검토 중</p>
        </div>

        {/* Metric 3 */}
        <div className="p-4 bg-white border border-neutral-200 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>면접 전형 대상</span>
            <Calendar className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-neutral-950 font-mono tabular-nums">
            {interviewCount}
            <span className="text-xs font-sans text-neutral-500 ml-1">명</span>
          </div>
          <p className="text-[11px] text-neutral-400">서류합격 및 일정배정</p>
        </div>

        {/* Metric 4 */}
        <div className="p-4 bg-white border border-neutral-200 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>최종 선발 확정</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-emerald-700 font-mono tabular-nums">
            {acceptedCount}
            <span className="text-xs font-sans text-neutral-500 ml-1">
              / {targetSlots}명 목표
            </span>
          </div>
          <p className="text-[11px] text-neutral-400">합격 통보 완료</p>
        </div>

        {/* Metric 5 */}
        <div className="p-4 bg-white border border-neutral-200 rounded-xl space-y-1 col-span-2 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>예상 경쟁률</span>
            <TrendingUp className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-neutral-950 font-mono tabular-nums">
            {competitionRate}
            <span className="text-xs font-sans text-neutral-500 ml-1">: 1</span>
          </div>
          <p className="text-[11px] text-neutral-400 font-mono">
            정원 {targetSlots}명 기준
          </p>
        </div>
      </div>

      {/* Main Applicant Management Table */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-950">
            지원자 심사 및 관리 대시보드
          </h2>
          <span className="text-xs text-neutral-500">
            지원자를 클릭하여 상세 지원서 확인 및 정량 평가를 진행하세요.
          </span>
        </div>

        <ApplicantTable
          applications={clubApplications}
          clubName={currentClub.name}
          onSelectApplication={(app) => setSelectedApplicant(app)}
          onRefresh={onRefresh}
          onShowToast={onShowToast}
        />
      </section>

      {/* Modals */}
      {selectedApplicant && (
        <ApplicantDetailModal
          application={
            // Keep fresh reference from applications list
            applications.find((a) => a.id === selectedApplicant.id) || selectedApplicant
          }
          onClose={() => setSelectedApplicant(null)}
          onUpdate={onRefresh}
          onShowToast={onShowToast}
          onOpenScheduler={(app) => setSchedulerTarget(app)}
        />
      )}

      {schedulerTarget && (
        <InterviewSchedulerModal
          application={schedulerTarget}
          onClose={() => setSchedulerTarget(null)}
          onSuccess={() => {
            setSchedulerTarget(null);
            onRefresh();
          }}
          onShowToast={onShowToast}
        />
      )}

      {isFormBuilderOpen && (
        <FormBuilderModal
          club={currentClub}
          onClose={() => setIsFormBuilderOpen(false)}
          onSaveSuccess={() => {
            onRefresh();
          }}
          onShowToast={onShowToast}
        />
      )}

      {isExcelSpreadsheetOpen && (
        <ExcelSpreadsheetModal
          clubs={clubs}
          applications={applications}
          initialClubId={currentClub.id}
          onClose={() => setIsExcelSpreadsheetOpen(false)}
          onShowToast={onShowToast}
        />
      )}
    </div>
  );
};
