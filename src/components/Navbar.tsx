import React from 'react';
import { Search, Shield, User, Plus, RefreshCw, FileSpreadsheet } from 'lucide-react';

interface NavbarProps {
  currentTab: 'applicant' | 'admin' | 'my-applications';
  onSelectTab: (tab: 'applicant' | 'admin' | 'my-applications') => void;
  onOpenCreateClub: () => void;
  onOpenExcelSheet?: () => void;
  onResetDemo: () => void;
  clubCount: number;
  applicationCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenCreateClub,
  onOpenExcelSheet,
  onResetDemo,
  clubCount,
  applicationCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onSelectTab('applicant')}
          className="text-left group flex items-baseline gap-2 cursor-pointer focus-visible:outline-none"
        >
          <span className="text-xl font-bold tracking-tight text-neutral-950 font-serif">
            ClubForm
          </span>
          <span className="text-xs text-neutral-500 font-sans hidden sm:inline">
            클럽폼
          </span>
        </button>

        {/* Zone 2: Clean text navigation links */}
        <nav className="flex items-center gap-1 sm:gap-6 text-sm font-medium">
          <button
            onClick={() => onSelectTab('applicant')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              currentTab === 'applicant'
                ? 'text-neutral-950 bg-neutral-100 font-semibold'
                : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50'
            }`}
          >
            동아리 탐색 & 지원
          </button>

          <button
            onClick={() => onSelectTab('my-applications')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              currentTab === 'my-applications'
                ? 'text-neutral-950 bg-neutral-100 font-semibold'
                : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50'
            }`}
          >
            내 지원서 조회
          </button>

          <button
            onClick={() => onSelectTab('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              currentTab === 'admin'
                ? 'text-indigo-900 bg-indigo-50 font-semibold'
                : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            <span>운영진 관리 센터</span>
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2">
          {onOpenExcelSheet && (
            <button
              onClick={onOpenExcelSheet}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
              title="동아리별 지원서 통합 엑셀 시트 관리 열기"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">동아리별 엑셀 시트</span>
            </button>
          )}

          {currentTab === 'admin' ? (
            <button
              onClick={onOpenCreateClub}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors whitespace-nowrap shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>새 모집공고 개설</span>
            </button>
          ) : (
            <button
              onClick={() => onSelectTab('my-applications')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 rounded-md hover:bg-neutral-200 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-neutral-500" />
              <span>결과 조회</span>
            </button>
          )}

          <button
            onClick={onResetDemo}
            title="데모 데이터 초기화"
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded hover:bg-neutral-100 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
