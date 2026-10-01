import { Club, Application, ApplicationStatus, ApplicantEvaluation, InterviewSchedule } from '../types';
import { INITIAL_CLUBS, INITIAL_APPLICATIONS } from '../data/mockData';

const CLUBS_KEY = 'clubform_clubs_v1';
const APPLICATIONS_KEY = 'clubform_applications_v1';
const DRAFT_PREFIX = 'clubform_draft_';

export const StorageService = {
  getClubs(): Club[] {
    try {
      const data = localStorage.getItem(CLUBS_KEY);
      if (!data) {
        localStorage.setItem(CLUBS_KEY, JSON.stringify(INITIAL_CLUBS));
        return INITIAL_CLUBS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_CLUBS;
    }
  },

  saveClub(club: Club): void {
    const clubs = this.getClubs();
    const index = clubs.findIndex((c) => c.id === club.id);
    if (index >= 0) {
      clubs[index] = club;
    } else {
      clubs.unshift(club);
    }
    localStorage.setItem(CLUBS_KEY, JSON.stringify(clubs));
  },

  deleteClub(clubId: string): void {
    const clubs = this.getClubs().filter((c) => c.id !== clubId);
    localStorage.setItem(CLUBS_KEY, JSON.stringify(clubs));

    const apps = this.getApplications().filter((a) => a.clubId !== clubId);
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(apps));
  },

  getApplications(): Application[] {
    try {
      const data = localStorage.getItem(APPLICATIONS_KEY);
      if (!data) {
        localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(INITIAL_APPLICATIONS));
        return INITIAL_APPLICATIONS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_APPLICATIONS;
    }
  },

  getApplicationsByClub(clubId: string): Application[] {
    return this.getApplications().filter((app) => app.clubId === clubId);
  },

  saveApplication(application: Application): void {
    const apps = this.getApplications();
    const index = apps.findIndex((a) => a.id === application.id);
    if (index >= 0) {
      apps[index] = application;
    } else {
      apps.unshift(application);
    }
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(apps));
  },

  deleteApplication(appId: string): void {
    const apps = this.getApplications().filter((a) => a.id !== appId);
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(apps));
  },

  updateApplicationStatus(appId: string, status: ApplicationStatus, note?: string): Application | null {
    const apps = this.getApplications();
    const target = apps.find((a) => a.id === appId);
    if (!target) return null;

    target.status = status;
    target.updatedAt = new Date().toISOString().slice(0, 16).replace('T', ' ');
    if (note !== undefined) {
      target.statusNotificationNote = note;
    }
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(apps));
    return target;
  },

  batchUpdateStatus(appIds: string[], status: ApplicationStatus): void {
    const apps = this.getApplications();
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    apps.forEach((app) => {
      if (appIds.includes(app.id)) {
        app.status = status;
        app.updatedAt = now;
      }
    });
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(apps));
  },

  saveEvaluation(appId: string, evaluation: ApplicantEvaluation): void {
    const apps = this.getApplications();
    const target = apps.find((a) => a.id === appId);
    if (target) {
      target.evaluation = evaluation;
      target.updatedAt = new Date().toISOString().slice(0, 16).replace('T', ' ');
      localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(apps));
    }
  },

  saveInterviewSchedule(appId: string, schedule: InterviewSchedule): void {
    const apps = this.getApplications();
    const target = apps.find((a) => a.id === appId);
    if (target) {
      target.interviewSchedule = schedule;
      target.status = 'interview_scheduled';
      target.updatedAt = new Date().toISOString().slice(0, 16).replace('T', ' ');
      localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(apps));
    }
  },

  saveDraft(clubId: string, draftData: any): void {
    try {
      localStorage.setItem(`${DRAFT_PREFIX}${clubId}`, JSON.stringify(draftData));
    } catch {
      // ignore
    }
  },

  getDraft(clubId: string): any | null {
    try {
      const data = localStorage.getItem(`${DRAFT_PREFIX}${clubId}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  clearDraft(clubId: string): void {
    localStorage.removeItem(`${DRAFT_PREFIX}${clubId}`);
  },

  resetToDemo(): void {
    localStorage.setItem(CLUBS_KEY, JSON.stringify(INITIAL_CLUBS));
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(INITIAL_APPLICATIONS));
  },

  getClubSheetData(club: Club, applications: Application[]) {
    const clubApps = applications.filter((a) => a.clubId === club.id);
    const statusKoreanMap: Record<ApplicationStatus, string> = {
      submitted: '접수완료',
      reviewing: '서류심사중',
      doc_passed: '서류통과',
      interview_scheduled: '면접예정',
      accepted: '최종합격',
      rejected: '불합격',
    };

    const rows = clubApps.map((app) => {
      const row: Record<string, string | number> = {
        접수번호: app.id,
        지원일시: app.submittedAt,
        진행상태: statusKoreanMap[app.status] || app.status,
        성명: app.applicant.name,
        학번: app.applicant.studentId,
        소속학과: app.applicant.department,
        학년: app.applicant.grade,
        휴대폰번호: app.applicant.phone,
        이메일: app.applicant.email,
      };

      // Add each dynamic question as a column
      club.questions.forEach((q) => {
        const val = app.answers[q.id];
        const formatted = Array.isArray(val)
          ? val.join(', ')
          : typeof val === 'object' && val !== null
          ? JSON.stringify(val)
          : String(val || '');
        row[`[문항] ${q.label}`] = formatted;
      });

      row['심사총점'] = app.evaluation?.score ?? '미평가';
      row['평가위원메모'] = app.evaluation?.notes || '';
      row['면접일정'] = app.interviewSchedule
        ? `${app.interviewSchedule.date} ${app.interviewSchedule.time}`
        : '미정';
      row['면접장소'] = app.interviewSchedule?.location || '';

      return row;
    });

    return rows;
  },

  exportAllClubsToExcel(clubs: Club[], applications: Application[]): void {
    import('xlsx').then((XLSX) => {
      const wb = XLSX.utils.book_new();

      clubs.forEach((club) => {
        const rows = this.getClubSheetData(club, applications);
        // Clean sheet name: max 30 chars, no invalid chars : \ / ? * [ ]
        let sheetName = club.name.replace(/[\[\]:*?/\\]/g, '').trim().slice(0, 28);
        if (!sheetName) sheetName = `동아리_${club.id.slice(-4)}`;

        // If no applications yet, provide headers template row
        let ws: any;
        if (rows.length === 0) {
          const emptyRow: Record<string, string> = {
            접수번호: '(접수된 지원서 없음)',
            지원일시: '',
            진행상태: '',
            성명: '',
            학번: '',
            소속학과: '',
            학년: '',
            휴대폰번호: '',
            이메일: '',
          };
          club.questions.forEach((q) => {
            emptyRow[`[문항] ${q.label}`] = '';
          });
          emptyRow['심사총점'] = '';
          emptyRow['평가위원메모'] = '';
          emptyRow['면접일정'] = '';
          emptyRow['면접장소'] = '';
          ws = XLSX.utils.json_to_sheet([emptyRow]);
        } else {
          ws = XLSX.utils.json_to_sheet(rows);
        }

        // Set column widths
        ws['!cols'] = [
          { wch: 16 }, // 접수번호
          { wch: 18 }, // 지원일시
          { wch: 12 }, // 진행상태
          { wch: 10 }, // 성명
          { wch: 14 }, // 학번
          { wch: 18 }, // 학과
          { wch: 8 },  // 학년
          { wch: 15 }, // 연락처
          { wch: 22 }, // 이메일
          ...club.questions.map(() => ({ wch: 28 })), // 문항들
          { wch: 10 }, // 심사총점
          { wch: 30 }, // 메모
          { wch: 18 }, // 면접일정
          { wch: 25 }, // 면접장소
        ];

        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      });

      const today = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `동아리별_지원서_통합시트_${today}.xlsx`);
    });
  },

  exportSingleClubToExcel(club: Club, applications: Application[]): void {
    import('xlsx').then((XLSX) => {
      const wb = XLSX.utils.book_new();
      const rows = this.getClubSheetData(club, applications);
      const sheetName = club.name.replace(/[\[\]:*?/\\]/g, '').trim().slice(0, 28) || '지원서목록';

      let ws: any;
      if (rows.length === 0) {
        const emptyRow: Record<string, string> = {
          접수번호: '(접수된 지원서 없음)',
          지원일시: '',
          진행상태: '',
          성명: '',
          학번: '',
          소속학과: '',
          학년: '',
          휴대폰번호: '',
          이메일: '',
        };
        club.questions.forEach((q) => {
          emptyRow[`[문항] ${q.label}`] = '';
        });
        emptyRow['심사총점'] = '';
        emptyRow['평가위원메모'] = '';
        emptyRow['면접일정'] = '';
        emptyRow['면접장소'] = '';
        ws = XLSX.utils.json_to_sheet([emptyRow]);
      } else {
        ws = XLSX.utils.json_to_sheet(rows);
      }

      ws['!cols'] = [
        { wch: 16 },
        { wch: 18 },
        { wch: 12 },
        { wch: 10 },
        { wch: 14 },
        { wch: 18 },
        { wch: 8 },
        { wch: 15 },
        { wch: 22 },
        ...club.questions.map(() => ({ wch: 28 })),
        { wch: 10 },
        { wch: 30 },
        { wch: 18 },
        { wch: 25 },
      ];

      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      const today = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `${club.name}_지원자명단_${today}.xlsx`);
    });
  },

  exportToCsv(applications: Application[], clubName: string): void {
    if (applications.length === 0) return;

    // Header row
    const headers = [
      '지원서ID',
      '동아리명',
      '지원일시',
      '심사진행상태',
      '지원자이름',
      '학번',
      '학과',
      '학년',
      '연락처',
      '이메일',
      '심사총점',
      '심사평가메모',
      '면접일정',
      '면접장소',
    ];

    const rows = applications.map((app) => {
      const statusKoreanMap: Record<ApplicationStatus, string> = {
        submitted: '접수완료',
        reviewing: '서류심사중',
        doc_passed: '서류통과',
        interview_scheduled: '면접예정',
        accepted: '최종합격',
        rejected: '불합격',
      };

      const interviewText = app.interviewSchedule
        ? `${app.interviewSchedule.date} ${app.interviewSchedule.time}`
        : '미정';

      return [
        `"${app.id}"`,
        `"${app.clubName.replace(/"/g, '""')}"`,
        `"${app.submittedAt}"`,
        `"${statusKoreanMap[app.status] || app.status}"`,
        `"${app.applicant.name}"`,
        `"${app.applicant.studentId}"`,
        `"${app.applicant.department}"`,
        `"${app.applicant.grade}"`,
        `"${app.applicant.phone}"`,
        `"${app.applicant.email}"`,
        `"${app.evaluation?.score ?? '미평가'}"`,
        `"${(app.evaluation?.notes || '').replace(/"/g, '""')}"`,
        `"${interviewText}"`,
        `"${(app.interviewSchedule?.location || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${clubName}_지원자목록_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
