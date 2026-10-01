import React, { useState, useMemo } from 'react';
import { Application, ApplicationStatus } from '../../types';
import { StorageService } from '../../services/storage';
import { Search, Filter, Download, CheckSquare, Square, ChevronRight, Star, Clock, UserCheck, MessageSquare } from 'lucide-react';

interface ApplicantTableProps {
  applications: Application[];
  onSelectApplication: (app: Application) => void;
  onRefresh: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  clubName: string;
}

const STATUS_FILTERS: { key: 'all' | ApplicationStatus; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'submitted', label: '접수완료' },
  { key: 'reviewing', label: '서류심사중' },
  { key: 'doc_passed', label: '서류통과' },
  { key: 'interview_scheduled', label: '면접예정' },
  { key: 'accepted', label: '최종합격' },
  { key: 'rejected', label: '불합격' },
];

export const ApplicantTable: React.FC<ApplicantTableProps> = ({
  applications,
  onSelectApplication,
  onRefresh,
  onShowToast,
  clubName,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ApplicationStatus>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchStatus = statusFilter === 'all' || app.status === statusFilter;
      const matchSearch =
        app.applicant.name.toLowerCase().includes(search.toLowerCase()) ||
        app.applicant.studentId.includes(search) ||
        app.applicant.department.toLowerCase().includes(search.toLowerCase()) ||
        app.applicant.phone.includes(search);
      return matchStatus && matchSearch;
    });
  }, [applications, search, statusFilter]);

  const allSelected =
    filteredApplications.length > 0 &&
    filteredApplications.every((app) => selectedIds.includes(app.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredApplications.map((app) => app.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBatchStatus = (newStatus: ApplicationStatus, label: string) => {
    if (selectedIds.length === 0) return;
    StorageService.batchUpdateStatus(selectedIds, newStatus);
    onRefresh();
    setSelectedIds([]);
    onShowToast(`선택한 ${selectedIds.length}명의 지원자가 '${label}' 상태로 변경되었습니다.`, 'success');
  };

  const handleExportExcel = () => {
    const clubs = StorageService.getClubs();
    const club = clubs.find((c) => c.name === clubName) || clubs[0];
    if (club) {
      StorageService.exportSingleClubToExcel(club, applications);
      onShowToast(`'${clubName}' 엑셀(.xlsx) 파일이 다운로드되었습니다.`, 'success');
    } else {
      StorageService.exportToCsv(filteredApplications, clubName);
      onShowToast('지원자 명단 CSV 파일이 다운로드되었습니다.', 'success');
    }
  };

  const handleExportCsv = () => {
    StorageService.exportToCsv(filteredApplications, clubName);
    onShowToast('지원자 명단 CSV 파일이 다운로드되었습니다.', 'success');
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'submitted':
        return <span className="inline-block px-2 py-0.5 text-[11px] font-medium rounded bg-neutral-100 text-neutral-700">접수완료</span>;
      case 'reviewing':
        return <span className="inline-block px-2 py-0.5 text-[11px] font-medium rounded bg-blue-50 text-blue-700">서류심사중</span>;
      case 'doc_passed':
        return <span className="inline-block px-2 py-0.5 text-[11px] font-medium rounded bg-emerald-50 text-emerald-800">서류통과</span>;
      case 'interview_scheduled':
        return <span className="inline-block px-2 py-0.5 text-[11px] font-medium rounded bg-purple-50 text-purple-800">면접예정</span>;
      case 'accepted':
        return <span className="inline-block px-2 py-0.5 text-[11px] font-bold rounded bg-emerald-600 text-white">최종합격</span>;
      case 'rejected':
        return <span className="inline-block px-2 py-0.5 text-[11px] font-medium rounded bg-neutral-200 text-neutral-600">불합격</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-2xs">
      {/* Controls Bar */}
      <div className="p-4 border-b border-neutral-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="지원자명, 학번, 학과, 연락처 검색..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900"
            />
          </div>

          {/* Export Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-600 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-md transition-colors"
              title="CSV 형식으로 다운로드"
            >
              <span>CSV</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>동아리 엑셀(.xlsx) 저장</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-neutral-100">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  statusFilter === f.key
                    ? 'bg-neutral-900 text-white font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                {f.label}{' '}
                <span className="opacity-75 tabular-nums text-[10px]">
                  (
                  {f.key === 'all'
                    ? applications.length
                    : applications.filter((a) => a.status === f.key).length}
                  )
                </span>
              </button>
            ))}
          </div>

          <div className="text-xs text-neutral-500 tabular-nums">
            총 <strong className="text-neutral-900 font-semibold">{filteredApplications.length}</strong>건의 지원서
          </div>
        </div>

        {/* Batch Actions Toolbar when selected */}
        {selectedIds.length > 0 && (
          <div className="p-2.5 bg-neutral-900 text-white rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold tabular-nums">{selectedIds.length}명 선택됨</span>
              <button
                onClick={() => setSelectedIds([])}
                className="text-neutral-400 hover:text-white underline text-[11px]"
              >
                선택 해제
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <span>일괄 상태 변경:</span>
              <button
                onClick={() => handleBatchStatus('reviewing', '서류심사중')}
                className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-200"
              >
                서류심사중
              </button>
              <button
                onClick={() => handleBatchStatus('doc_passed', '서류통과')}
                className="px-2 py-1 bg-emerald-800 hover:bg-emerald-700 rounded text-emerald-100 font-medium"
              >
                서류통과
              </button>
              <button
                onClick={() => handleBatchStatus('accepted', '최종합격')}
                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-white font-bold"
              >
                최종합격
              </button>
              <button
                onClick={() => handleBatchStatus('rejected', '불합격')}
                className="px-2 py-1 bg-rose-900 hover:bg-rose-800 rounded text-rose-200"
              >
                불합격
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table Data Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50 text-neutral-500 font-medium border-b border-neutral-200">
            <tr>
              <th className="py-2.5 pl-4 pr-2 w-8">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-neutral-500 hover:text-neutral-900"
                >
                  {allSelected ? (
                    <CheckSquare className="w-4 h-4 text-neutral-900" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="py-2.5 px-3">지원자</th>
              <th className="py-2.5 px-3">학번 / 소속</th>
              <th className="py-2.5 px-3">연락처</th>
              <th className="py-2.5 px-3">접수 일시</th>
              <th className="py-2.5 px-3">진행 상태</th>
              <th className="py-2.5 px-3">심사 총점</th>
              <th className="py-2.5 px-3">평가 메모</th>
              <th className="py-2.5 pr-4 pl-2 text-right">상세 심사</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredApplications.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-neutral-400">
                  해당 조건에 해당하는 지원자가 없습니다.
                </td>
              </tr>
            ) : (
              filteredApplications.map((app) => {
                const isSelected = selectedIds.includes(app.id);
                return (
                  <tr
                    key={app.id}
                    className={`hover:bg-neutral-50/80 transition-colors ${
                      isSelected ? 'bg-neutral-50' : ''
                    }`}
                  >
                    <td className="py-3 pl-4 pr-2">
                      <button
                        type="button"
                        onClick={() => toggleSelectOne(app.id)}
                        className="text-neutral-500 hover:text-neutral-900"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-neutral-900" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Applicant Name */}
                    <td className="py-3 px-3">
                      <button
                        onClick={() => onSelectApplication(app)}
                        className="font-semibold text-neutral-950 hover:underline text-left block"
                      >
                        {app.applicant.name}
                      </button>
                      <span className="text-[11px] text-neutral-400">{app.applicant.grade}</span>
                    </td>

                    {/* Department / ID */}
                    <td className="py-3 px-3">
                      <span className="font-mono text-neutral-700">{app.applicant.studentId}</span>
                      <span className="text-[11px] block text-neutral-500 truncate max-w-[150px]">
                        {app.applicant.department}
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="py-3 px-3">
                      <span className="font-mono text-neutral-700">{app.applicant.phone}</span>
                      <span className="text-[11px] block text-neutral-400 truncate max-w-[140px]">
                        {app.applicant.email}
                      </span>
                    </td>

                    {/* Submitted Date */}
                    <td className="py-3 px-3 whitespace-nowrap text-neutral-500 font-mono tabular-nums">
                      {app.submittedAt}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {getStatusBadge(app.status)}
                    </td>

                    {/* Score */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {app.evaluation ? (
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span className="font-semibold font-mono tabular-nums text-neutral-900">
                            {app.evaluation.score}점
                          </span>
                        </div>
                      ) : (
                        <span className="text-neutral-300 font-mono">-</span>
                      )}
                    </td>

                    {/* Evaluation Notes */}
                    <td className="py-3 px-3 max-w-[180px]">
                      {app.evaluation?.notes ? (
                        <p className="truncate text-neutral-600 text-[11px]" title={app.evaluation.notes}>
                          {app.evaluation.notes}
                        </p>
                      ) : (
                        <span className="text-neutral-300 text-[11px]">메모 없음</span>
                      )}
                    </td>

                    {/* Action Button */}
                    <td className="py-3 pr-4 pl-2 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSelectApplication(app)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors"
                      >
                        <span>검토</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
