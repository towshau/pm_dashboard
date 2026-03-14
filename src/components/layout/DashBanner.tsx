import { useDash } from '../../hooks/useDash';

interface DashBannerProps {
  planningMode: boolean;
  onPlanningToggle: () => void;
  tasksCommitted: number;
  completionPercent: number;
  blockerCount: number;
}

export function DashBanner({
  planningMode,
  onPlanningToggle,
  tasksCommitted,
  completionPercent,
  blockerCount,
}: DashBannerProps) {
  const { loading, statusLabel, dateRangeLabel } = useDash();

  return (
    <div
      className="px-7 py-4 flex flex-wrap items-center justify-between gap-4"
      style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2a4a 100%)' }}
    >
      <div className="flex items-center gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[#8e8ea8]">Current dash</div>
          <div className="text-lg font-semibold text-white mt-0.5">
            {loading ? '…' : dateRangeLabel()}
          </div>
        </div>
        <div className="w-px h-9 bg-white/20" />
        <div>
          <div className="text-[10px] text-[#8e8ea8]">STATUS</div>
          <div className="text-[13px] font-medium text-[#fac775] mt-0.5">{statusLabel()}</div>
        </div>
      </div>
      <div className="flex items-center gap-5">
        <div className="text-center">
          <div className="text-[22px] font-semibold text-white">{tasksCommitted}</div>
          <div className="text-[10px] text-[#8e8ea8]">tasks committed</div>
        </div>
        <div className="text-center">
          <div className="text-[22px] font-semibold text-[#5dcaa5]">{completionPercent}%</div>
          <div className="text-[10px] text-[#8e8ea8]">complete</div>
        </div>
        <div className="text-center">
          <div className="text-[22px] font-semibold text-[#f09595]">{blockerCount}</div>
          <div className="text-[10px] text-[#8e8ea8]">blockers</div>
        </div>
        <button
          type="button"
          onClick={onPlanningToggle}
          className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg border text-xs transition-colors ${
            planningMode
              ? 'bg-amber-500/15 border-amber-500/50 text-[#fac775]'
              : 'border-white/20 text-[#c4c4d4] hover:border-white/40'
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          {planningMode ? 'Planning active' : 'Planning mode'}
        </button>
      </div>
    </div>
  );
}
