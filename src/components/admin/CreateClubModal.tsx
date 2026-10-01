import React, { useState } from 'react';
import { Club, ClubCategory } from '../../types';
import { DEFAULT_QUESTIONS_TEMPLATE } from '../../data/mockData';
import { StorageService } from '../../services/storage';
import { X, Check, PlusCircle, Building } from 'lucide-react';

interface CreateClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (club: Club) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const CATEGORIES: ClubCategory[] = [
  'IT/코딩',
  '문화/예술',
  '창업/경영',
  '봉사/사회',
  '학술/연구',
  '스포츠/레저',
  '기타',
];

export const CreateClubModal: React.FC<CreateClubModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  onShowToast,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ClubCategory>('IT/코딩');
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [regularMeetingTime, setRegularMeetingTime] = useState('매주 수요일 18:30');
  const [membershipFee, setMembershipFee] = useState('학기당 20,000원');
  const [location, setLocation] = useState('학생회관 동아리실');
  const [targetCount, setTargetCount] = useState(15);
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-20');
  const [tagsInput, setTagsInput] = useState('프로젝트, 친목, 정기세미나');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !shortDesc.trim() || !leaderName.trim()) {
      onShowToast('동아리명, 한 줄 소개, 대표자명을 입력해주세요.', 'error');
      return;
    }

    const newClubId = `club_${Date.now().toString(36)}`;
    const tags = tagsInput
      .split(',')
      .map((s) => s.trim().replace(/^#/, ''))
      .filter(Boolean);

    // Pick an existing cover image or fallback
    const coverImage = '/src/assets/images/club_coding_workspace_1790827384488.jpg';

    const newClub: Club = {
      id: newClubId,
      name: name.trim(),
      category,
      shortDesc: shortDesc.trim(),
      fullDesc: fullDesc.trim() || shortDesc.trim(),
      coverImage,
      tags: tags.length > 0 ? tags : ['동아리', category],
      leaderName: leaderName.trim(),
      contactEmail: contactEmail.trim() || 'contact@example.ac.kr',
      contactPhone: contactPhone.trim() || '010-0000-0000',
      regularMeetingTime,
      membershipFee,
      location,
      requirements: ['정기 모임 성실 참석 가능자', '열정적인 활동 의지를 가진 학우'],
      recruitmentPeriod: {
        start: startDate,
        end: endDate,
      },
      activeStatus: 'recruiting',
      questions: [...DEFAULT_QUESTIONS_TEMPLATE],
      targetRecruitCount: Number(targetCount) || 15,
    };

    StorageService.saveClub(newClub);
    onCreated(newClub);
    onShowToast(`'${newClub.name}' 동아리 및 지원서 모집공고가 등록되었습니다!`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl border border-neutral-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-neutral-900" />
            <h2 className="text-lg font-bold text-neutral-950">새 동아리 모집 공고 등록</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-neutral-800 mb-1">
                동아리 명칭 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 알고스 (알고리즘 문제해결 학회)"
                required
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-800 mb-1">분야 / 카테고리</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ClubCategory)}
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-neutral-800 mb-1">
              한 줄 요약 소개 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              placeholder="예: 백준 및 코딩테스트를 함께 정복하는 교내 알고리즘 스터디 동아리"
              required
              className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-neutral-800 mb-1">
              상세 소개 및 활동 안내
            </label>
            <textarea
              rows={3}
              value={fullDesc}
              onChange={(e) => setFullDesc(e.target.value)}
              placeholder="동아리의 주된 활동, 커리큘럼, 분위기, 혜택 등을 상세히 적어주세요."
              className="w-full p-2.5 bg-white border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-neutral-800 mb-1">
                대표자명 / 학번 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
                placeholder="홍길동 (컴공 22학번)"
                required
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-800 mb-1">대표 연락처</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="010-0000-0000"
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-800 mb-1">문의 이메일</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="club@univ.ac.kr"
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-neutral-800 mb-1">정기 모임 일정</label>
              <input
                type="text"
                value={regularMeetingTime}
                onChange={(e) => setRegularMeetingTime(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-800 mb-1">활동 장소</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-800 mb-1">모집 정원</label>
              <input
                type="number"
                value={targetCount}
                onChange={(e) => setTargetCount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-800 mb-1">모집 시작일</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-800 mb-1">모집 마감일</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-neutral-800 mb-1">
              키워드 태그 (쉼표로 구분)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="코딩, 스터디, 공모전"
              className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md"
            />
          </div>

          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-[11px] text-neutral-500">
            * 기본 지원서 문항(지원동기, 관련 경험, 정기참석 여부, 포트폴리오 링크, 면접 희망시간)이 자동으로 함께 등록되며, 개설 후 '양식 편집기'에서 자유롭게 질문을 추가하거나 변경할 수 있습니다.
          </div>

          {/* Footer inside form */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-100 rounded-md transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>동아리 모집 공고 등록하기</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
