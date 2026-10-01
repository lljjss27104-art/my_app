import React, { useState } from 'react';
import { Club, Application } from '../../types';
import { StorageService } from '../../services/storage';
import { X, Download, FileSpreadsheet, Layers, CheckCircle2, ChevronRight } from 'lucide-react';

interface ExcelSpreadsheetModalProps {
  clubs: Club[];
  applications: Application[];
  initialClubId?: string;
  onClose: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ExcelSpreadsheetModal: React.FC<ExcelSpreadsheetModalProps> = ({
  clubs,
  applications,
  initialClubId,
  onClose,
  onShowToast,
}) => {
  const [activeClubId, setActiveClubId] = useState(
    initialClubId || (clubs.length > 0 ? clubs[0].id : '')
  );

  const currentClub = clubs.find((c) => c.id === activeClubId) || clubs[0];
  const sheetRows = currentClub ? StorageService.getClubSheetData(currentClub, applications) : [];

  const handleExportAll = () => {
    StorageService.exportAllClubsToExcel(clubs, applications);
    onShowToast('모든 동아리 시트가 포함된 통합 엑셀(.xlsx) 파일이 다운로드되었습니다.', 'success');
  };

  const handleExportCurrent = () => {
    if (!currentClub) return;
    StorageService.exportSingleClubToExcel(currentClub, applications);
    onShowToast(`'${currentClub.name}' 동아리 시트 엑셀(.xlsx) 파일이 다운로드되었습니다.`, 'success');
  };

  if (!currentClub) return null;

  // Extract column headers from the first row or club questions
  const baseHeaders = [
    '접수번호',
    '지원일시',
    '진행상태',
    '성명',
    '학번',
    '소속학과',
    '학년',
    '휴대폰번호',
    '이메일',
  ];
  const questionHeaders = currentClub.questions.map((q) => `[문항] ${q.label}`);
  const trailingHeaders = ['심사총점', '평가위원메모', '면접일정', '면접장소'];
  const allHeaders = [...baseHeaders, ...questionHeaders, ...trailingHeaders];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-neutral-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden my-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <span>동아리별 지원서 통합 엑셀 시트 관리</span>
                <span aria-hidden="true">·</span>
                <span>실시간 동기화 완료</span>
              </div>
              <h2 className="text-lg font-bold text-neutral-950">
                동아리별 엑셀 스프레드시트 뷰어
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCurrent}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-800 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-md transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-neutral-600" />
              <span>현재 시트(.xlsx) 다운로드</span>
            </button>

            <button
              onClick={handleExportAll}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>전체 동아리 통합 엑셀(.xlsx) 다운로드</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Informational Sub-banner */}
        <div className="px-6 py-2.5 bg-emerald-50/60 border-b border-emerald-100 flex items-center justify-between text-xs text-emerald-950">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              지원자가 가입 신청서를 제출하면 해당 동아리의 엑셀 시트에 사용자 작성 응답이 실시간 자동 누적 저장됩니다.
            </span>
          </div>
          <span className="font-mono text-emerald-800 text-[11px] tabular-nums hidden md:inline">
            총 {clubs.length}개 동아리 시트 구성
          </span>
        </div>

        {/* Excel-style Sheet Tabs Bar */}
        <div className="flex items-center gap-1 px-4 py-1.5 bg-neutral-100 border-b border-neutral-200 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 mr-2 shrink-0">
            <Layers className="w-3.5 h-3.5 text-neutral-400" />
            <span className="font-semibold text-[11px]">시트 선택:</span>
          </div>

          {clubs.map((c) => {
            const count = applications.filter((a) => a.clubId === c.id).length;
            const isActive = c.id === currentClub.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveClubId(c.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-t-md text-xs font-medium border-t-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-emerald-900 border-emerald-600 font-bold shadow-xs'
                    : 'bg-neutral-200/70 text-neutral-600 hover:bg-neutral-200 border-transparent'
                }`}
              >
                <span>{c.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono tabular-nums ${
                    isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-300 text-neutral-700'
                  }`}
                >
                  {count}명
                </span>
              </button>
            );
          })}
        </div>

        {/* Spreadsheet Table Viewport */}
        <div className="flex-1 overflow-auto bg-neutral-50 p-4">
          <div className="bg-white border border-neutral-200 rounded-lg shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead className="bg-neutral-100/90 text-neutral-700 border-b border-neutral-200 sticky top-0 z-10 select-none">
                <tr>
                  <th className="py-2.5 px-3 border-r border-neutral-200 font-semibold w-12 text-center text-neutral-400 bg-neutral-100">
                    #
                  </th>
                  {allHeaders.map((header) => (
                    <th
                      key={header}
                      className="py-2.5 px-3 border-r border-neutral-200 font-semibold whitespace-nowrap bg-neutral-100"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {sheetRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={allHeaders.length + 1}
                      className="py-16 text-center text-neutral-400 text-xs bg-white"
                    >
                      <p className="font-semibold text-neutral-700 text-sm">
                        현재 '{currentClub.name}' 시트에 접수된 지원서가 없습니다.
                      </p>
                      <p className="mt-1 text-neutral-400 text-xs">
                        지원자가 신청서를 제출하면 이 시트에 모든 질문과 답변이 자동으로 즉시 추가됩니다.
                      </p>
                    </td>
                  </tr>
                ) : (
                  sheetRows.map((row, rowIdx) => (
                    <tr
                      key={rowIdx}
                      className="hover:bg-neutral-50/80 transition-colors group"
                    >
                      <td className="py-2.5 px-3 border-r border-neutral-200 text-center text-neutral-400 font-mono text-[11px] bg-neutral-50/50">
                        {rowIdx + 1}
                      </td>
                      {allHeaders.map((header) => {
                        const cellVal = row[header];
                        return (
                          <td
                            key={header}
                            className="py-2 px-3 border-r border-neutral-200 text-neutral-800 whitespace-nowrap max-w-xs truncate"
                            title={String(cellVal ?? '')}
                          >
                            {header === '진행상태' ? (
                              <span className="font-semibold text-neutral-900">{cellVal}</span>
                            ) : header === '심사총점' ? (
                              <span className="font-mono tabular-nums font-semibold">{cellVal}</span>
                            ) : header === '학번' || header === '지원일시' || header === '휴대폰번호' ? (
                              <span className="font-mono tabular-nums text-neutral-700">{cellVal}</span>
                            ) : (
                              <span>{cellVal || '-'}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-500">
          <div>
            <span>시트: </span>
            <strong className="text-neutral-900 font-semibold">{currentClub.name}</strong>
            <span className="mx-2">·</span>
            <span className="tabular-nums font-mono">총 {sheetRows.length}건 데이터</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCurrent}
              className="px-3 py-1.5 font-medium text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-100 rounded-md transition-colors"
            >
              현재 시트(.xlsx) 저장
            </button>
            <button
              onClick={handleExportAll}
              className="px-4 py-1.5 font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors"
            >
              전체 시트 통합 엑셀(.xlsx) 저장
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
