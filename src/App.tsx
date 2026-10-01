import React, { useState, useEffect, useCallback, Component, ErrorInfo, ReactNode } from 'react';
import { Club, Application } from './types';
import { StorageService } from './services/storage';
import { Navbar } from './components/Navbar';
import { ClubDirectory } from './components/applicant/ClubDirectory';
import { ClubDetailModal } from './components/applicant/ClubDetailModal';
import { ApplicationFormModal } from './components/applicant/ApplicationFormModal';
import { MyApplicationsModal } from './components/applicant/MyApplicationsModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CreateClubModal } from './components/admin/CreateClubModal';
import { ExcelSpreadsheetModal } from './components/admin/ExcelSpreadsheetModal';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    try {
      StorageService.resetToDemo();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-neutral-200 p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">화면 렌더링 오류가 발생했습니다</h2>
              <p className="text-xs text-neutral-600 mt-1">
                일시적인 데이터 오류로 인해 화면이 중단되었습니다. 아래 버튼을 눌러 데모 데이터를 복원하고 새로고침하세요.
              </p>
            </div>
            {this.state.error && (
              <p className="p-2.5 bg-neutral-50 border border-neutral-200 rounded text-[11px] text-neutral-500 font-mono text-left break-all">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>데이터 복원 및 새로고침</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}

function MainApp() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [currentTab, setCurrentTab] = useState<'applicant' | 'admin' | 'my-applications'>('applicant');
  const [activeAdminClubId, setActiveAdminClubId] = useState<string>('');

  // Modals for Applicant View
  const [selectedClubForDetail, setSelectedClubForDetail] = useState<Club | null>(null);
  const [selectedClubForApplication, setSelectedClubForApplication] = useState<Club | null>(null);

  // Modals for Admin View
  const [isCreateClubOpen, setIsCreateClubOpen] = useState(false);
  const [isExcelSpreadsheetOpen, setIsExcelSpreadsheetOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Reload data from storage
  const reloadData = useCallback(() => {
    const loadedClubs = StorageService.getClubs();
    const loadedApps = StorageService.getApplications();
    setClubs(loadedClubs);
    setApplications(loadedApps);
    if (loadedClubs.length > 0 && !activeAdminClubId) {
      setActiveAdminClubId(loadedClubs[0].id);
    }
  }, [activeAdminClubId]);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  const handleResetDemo = () => {
    if (window.confirm('기본 데모 데이터로 초기화하시겠습니까? 새로 작성한 지원서와 동아리는 초기화됩니다.')) {
      StorageService.resetToDemo();
      reloadData();
      showToast('초기 데모 데이터로 복원되었습니다.', 'info');
    }
  };

  const handleApplicationSubmitSuccess = (newApp: Application) => {
    reloadData();
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 font-sans">
      {/* Top Bar Contract Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenCreateClub={() => setIsCreateClubOpen(true)}
        onOpenExcelSheet={() => setIsExcelSpreadsheetOpen(true)}
        onResetDemo={handleResetDemo}
        clubCount={clubs.length}
        applicationCount={applications.length}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'applicant' && (
          <ClubDirectory
            clubs={clubs}
            applicationCount={applications.length}
            onSelectClubDetail={(club) => setSelectedClubForDetail(club)}
            onStartApplication={(club) => setSelectedClubForApplication(club)}
          />
        )}

        {currentTab === 'my-applications' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <MyApplicationsModal
              applications={applications}
              onClose={() => setCurrentTab('applicant')}
              onRefresh={reloadData}
              onShowToast={showToast}
            />
          </div>
        )}

        {currentTab === 'admin' && (
          <AdminDashboard
            clubs={clubs}
            applications={applications}
            activeClubId={activeAdminClubId || clubs[0]?.id || ''}
            onSelectClub={(id) => setActiveAdminClubId(id)}
            onRefresh={reloadData}
            onOpenCreateClub={() => setIsCreateClubOpen(true)}
            onViewApplicantMode={(club) => {
              setSelectedClubForDetail(club);
            }}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-6 mt-12 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-900">ClubForm (클럽폼)</span>
            <span>·</span>
            <span>간편한 대학 및 청년 동아리 가입신청 & 선발 관리 플랫폼</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentTab('applicant')}
              className="hover:text-neutral-900 transition-colors"
            >
              동아리 찾기
            </button>
            <button
              onClick={() => setCurrentTab('my-applications')}
              className="hover:text-neutral-900 transition-colors"
            >
              내 지원서 조회
            </button>
            <button
              onClick={() => setCurrentTab('admin')}
              className="hover:text-neutral-900 transition-colors"
            >
              운영진 센터
            </button>
            <button
              onClick={() => setIsExcelSpreadsheetOpen(true)}
              className="hover:text-neutral-900 transition-colors font-medium text-emerald-800"
            >
              동아리별 엑셀 시트
            </button>
            <button
              onClick={handleResetDemo}
              className="text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              데모 초기화
            </button>
          </div>
        </div>
      </footer>

      {/* Global Modals for Applicant View */}
      {selectedClubForDetail && (
        <ClubDetailModal
          club={selectedClubForDetail}
          onClose={() => setSelectedClubForDetail(null)}
          onStartApplication={(club) => {
            setSelectedClubForDetail(null);
            setSelectedClubForApplication(club);
          }}
        />
      )}

      {selectedClubForApplication && (
        <ApplicationFormModal
          club={selectedClubForApplication}
          onClose={() => setSelectedClubForApplication(null)}
          onSubmitSuccess={handleApplicationSubmitSuccess}
          onShowToast={showToast}
        />
      )}

      {/* Global Modals for Admin View */}
      <CreateClubModal
        isOpen={isCreateClubOpen}
        onClose={() => setIsCreateClubOpen(false)}
        onCreated={(newClub) => {
          reloadData();
          setActiveAdminClubId(newClub.id);
          setCurrentTab('admin');
        }}
        onShowToast={showToast}
      />

      {/* Global Excel Spreadsheet Center Modal */}
      {isExcelSpreadsheetOpen && (
        <ExcelSpreadsheetModal
          clubs={clubs}
          applications={applications}
          initialClubId={activeAdminClubId || clubs[0]?.id}
          onClose={() => setIsExcelSpreadsheetOpen(false)}
          onShowToast={showToast}
        />
      )}

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
