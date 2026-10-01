import React, { useState, useMemo } from 'react';
import { Club, ClubCategory } from '../../types';
import { Search, Calendar, Users, Clock, ArrowRight, Sparkles } from 'lucide-react';

interface ClubDirectoryProps {
  clubs: Club[];
  onSelectClubDetail: (club: Club) => void;
  onStartApplication: (club: Club) => void;
  applicationCount: number;
}

const CATEGORIES: ('전체' | ClubCategory)[] = [
  '전체',
  'IT/코딩',
  '문화/예술',
  '창업/경영',
  '봉사/사회',
  '학술/연구',
  '스포츠/레저',
];

export const ClubDirectory: React.FC<ClubDirectoryProps> = ({
  clubs,
  onSelectClubDetail,
  onStartApplication,
  applicationCount,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'전체' | ClubCategory>('전체');
  const [onlyRecruiting, setOnlyRecruiting] = useState(false);

  const filteredClubs = useMemo(() => {
    return clubs.filter((club) => {
      const matchSearch =
        club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory =
        selectedCategory === '전체' || club.category === selectedCategory;

      const matchRecruiting = !onlyRecruiting || club.activeStatus === 'recruiting';

      return matchSearch && matchCategory && matchRecruiting;
    });
  }, [clubs, searchQuery, selectedCategory, onlyRecruiting]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Hero Section */}
      <section className="border-b border-neutral-200 pb-10">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-wider text-neutral-500 uppercase mb-2">
            Campus Club Recruitment Platform
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-950 text-balance leading-tight">
            동아리 가입 신청서를 한곳에서 비교하고,<br className="hidden sm:inline" />
            3분 만에 간편하게 제출하세요
          </h1>
          <p className="mt-3 text-neutral-600 text-sm sm:text-base leading-relaxed">
            복잡한 구글 폼이나 출력물 제출 없이 맞춤 문항 작성, 자동 임시저장, 실시간 서류·면접 합격 결과 조회까지 원스톱으로 지원합니다.
          </p>

          {/* Social Proof / Metrics adjacent to claim */}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-neutral-600 border-t border-neutral-100 pt-4">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-neutral-900 tabular-nums">{clubs.length}개</span>
              <span>등록 동아리</span>
            </div>
            <span aria-hidden="true" className="text-neutral-300">·</span>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-neutral-900 tabular-nums">{applicationCount}건</span>
              <span>누적 지원서 접수</span>
            </div>
            <span aria-hidden="true" className="text-neutral-300">·</span>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-neutral-900">100% 모바일/PC</span>
              <span>실시간 서류 결과 확인</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Category Filter Controls */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="동아리명, 키워드(웹개발, 밴드, 마케팅 등) 검색..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors"
            />
          </div>

          {/* Recruiting only toggle */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyRecruiting}
                onChange={(e) => setOnlyRecruiting(e.target.checked)}
                className="w-4 h-4 text-neutral-900 rounded border-neutral-300 focus:ring-neutral-900"
              />
              <span>모집 중인 동아리만 보기</span>
            </label>
          </div>
        </div>

        {/* Interactive Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-neutral-900 text-white font-semibold'
                  : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Clubs Grid */}
      <section>
        {filteredClubs.length === 0 ? (
          <div className="text-center py-16 bg-white border border-neutral-200 rounded-lg">
            <p className="text-sm text-neutral-600 font-medium">검색 조건에 맞는 동아리가 없습니다.</p>
            <p className="text-xs text-neutral-400 mt-1">검색어를 변경하거나 필터를 해제해 보세요.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('전체');
                setOnlyRecruiting(false);
              }}
              className="mt-4 px-3.5 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 rounded-md hover:bg-neutral-200 transition-colors"
            >
              필터 초기화
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.map((club) => {
              const isRecruiting = club.activeStatus === 'recruiting';
              return (
                <div
                  key={club.id}
                  className="bg-white border border-neutral-200 rounded-xl overflow-hidden flex flex-col hover:border-neutral-400 transition-colors"
                >
                  {/* Cover Image with Fallback */}
                  <div className="relative aspect-16/9 bg-neutral-100 overflow-hidden border-b border-neutral-100">
                    <img
                      src={club.coverImage}
                      alt={club.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Resilient fallback container without broken icon
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-neutral-900/10 pointer-events-none" />
                    
                    {/* Status pill on image */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded shadow-xs ${
                          isRecruiting
                            ? 'bg-neutral-900 text-white'
                            : 'bg-neutral-200 text-neutral-700'
                        }`}
                      >
                        {isRecruiting ? '모집 중' : '모집 마감'}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className="text-xs bg-white/90 backdrop-blur-xs text-neutral-800 font-medium px-2 py-0.5 rounded">
                        {club.category}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-neutral-900 tracking-tight leading-snug">
                        {club.name}
                      </h3>
                      <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                        {club.shortDesc}
                      </p>

                      {/* Unboxed Metadata with typographic separators */}
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-500 pt-1">
                        {club.tags.slice(0, 3).map((tag, idx) => (
                          <React.Fragment key={tag}>
                            <span>#{tag}</span>
                            {idx < Math.min(club.tags.length, 3) - 1 && (
                              <span aria-hidden="true">·</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    {/* Operational Details */}
                    <div className="space-y-1.5 pt-3 border-t border-neutral-100 text-xs text-neutral-600">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500">모집 기간</span>
                        <span className="font-mono tabular-nums text-neutral-900">
                          {club.recruitmentPeriod.start} ~ {club.recruitmentPeriod.end}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500">정기 모임</span>
                        <span className="truncate max-w-[190px] text-neutral-800 font-medium" title={club.regularMeetingTime}>
                          {club.regularMeetingTime}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500">모집 정원</span>
                        <span className="tabular-nums text-neutral-800 font-medium">
                          {club.targetRecruitCount ? `약 ${club.targetRecruitCount}명 내외` : '약간명'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        onClick={() => onSelectClubDetail(club)}
                        className="w-full py-2 px-3 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors text-center"
                      >
                        모집 요강
                      </button>
                      <button
                        onClick={() => onStartApplication(club)}
                        disabled={!isRecruiting}
                        className={`w-full py-2 px-3 text-xs font-semibold rounded-md transition-colors text-center ${
                          isRecruiting
                            ? 'bg-neutral-900 hover:bg-neutral-800 text-white shadow-xs'
                            : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                        }`}
                      >
                        {isRecruiting ? '지원서 작성' : '모집 마감'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
