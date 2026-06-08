import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Mail,
  MessageCircle,
  Hash,
  MessageSquare,
  User,
  Flag,
} from 'lucide-react';
import dayjs from '../lib/dateFormat';
import { tasksApi } from '../api';
import { cn } from '../lib/utils';

const getSourceIcon = (source) => {
  const s = source || 'Custom';
  switch (s) {
    case 'Email':
      return { icon: Mail, className: 'text-blue-500 bg-blue-500/10 border-blue-500/20', barColor: 'bg-blue-500' };
    case 'Zalo':
      return { icon: MessageCircle, className: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20', barColor: 'bg-cyan-500' };
    case 'Slack':
      return { icon: Hash, className: 'text-purple-500 bg-purple-500/10 border-purple-500/20', barColor: 'bg-purple-500' };
    case 'Discord':
      return { icon: MessageSquare, className: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20', barColor: 'bg-indigo-500' };
    case 'Custom':
    default:
      return { icon: User, className: 'text-slate-500 bg-slate-500/10 border-slate-500/20', barColor: 'bg-slate-500' };
  }
};

const getPriorityInfo = (priority) => {
  switch (String(priority)) {
    case '1':
      return { label: 'Cao', className: 'bg-red-50 text-red-600 border-red-200', barColor: 'bg-red-500' };
    case '3':
      return { label: 'Thấp', className: 'bg-slate-50 text-slate-500 border-slate-200', barColor: 'bg-slate-400' };
    default:
      return { label: 'Trung bình', className: 'bg-amber-50 text-amber-600 border-amber-200', barColor: 'bg-amber-500' };
  }
};

const AnalyticsPage = () => {
  const today = dayjs().startOf('day');
  const [hoveredBar, setHoveredBar] = useState(null);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const data = await tasksApi.list();
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary/45" />
        <p className="text-xs text-muted-foreground font-medium animate-pulse">Đang tải dữ liệu phân tích...</p>
      </div>
    );
  }

  // --- 1. Weekly completion data (last 7 days) ---
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    return dayjs().subtract(6 - i, 'day').startOf('day');
  });

  const chartData = last7Days.map((day) => {
    const dayTasks = Array.isArray(tasks)
      ? tasks.filter((t) => t && t.due_date && dayjs(t.due_date).isSame(day, 'day'))
      : [];
    const total = dayTasks.length;
    const completed = dayTasks.filter((t) => t.status === 'done').length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      day,
      label: day.isSame(today, 'day') ? 'Hôm nay' : day.format('DD/MM'),
      dayOfWeek: day.format('dd'),
      total,
      completed,
      pending: total - completed,
      rate,
    };
  });

  // Weekly stats
  const totalWeeklyTasks = chartData.reduce((acc, curr) => acc + curr.total, 0);
  const completedWeeklyTasks = chartData.reduce((acc, curr) => acc + curr.completed, 0);
  const weeklyRate = totalWeeklyTasks > 0 ? Math.round((completedWeeklyTasks / totalWeeklyTasks) * 100) : 0;

  // --- 2. Monthly completion data (last 30 days rolling) ---
  const last30DaysStart = dayjs().subtract(29, 'day').startOf('day');
  const last30DaysTasks = Array.isArray(tasks)
    ? tasks.filter((t) => t && t.due_date && dayjs(t.due_date).isSameOrAfter(last30DaysStart, 'day') && dayjs(t.due_date).isSameOrBefore(today, 'day'))
    : [];
  const total30 = last30DaysTasks.length;
  const completed30 = last30DaysTasks.filter((t) => t.status === 'done').length;
  const monthlyRate = total30 > 0 ? Math.round((completed30 / total30) * 100) : 0;

  // --- 3. Productive day calculation ---
  const productiveDayObj = chartData
    .filter((d) => d.total > 0)
    .reduce((max, curr) => (curr.rate > (max?.rate || 0) ? curr : max), null);
  
  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const productiveDayLabel = productiveDayObj 
    ? `${capitalizeFirstLetter(productiveDayObj.day.format('dddd'))} (${productiveDayObj.label})`
    : 'Chưa có dữ liệu';

  // Encouragement text
  let insightText = "Lên lịch trình công việc đầy đủ để theo dõi hiệu suất hoàn thành của bạn.";
  if (totalWeeklyTasks > 0) {
    if (weeklyRate >= 80) {
      insightText = "Tuyệt vời! Bạn đang duy trì phong độ làm việc cực kỳ xuất sắc tuần này.";
    } else if (weeklyRate >= 50) {
      insightText = "Khá tốt! Bạn đang đi đúng hướng, cố gắng giải quyết nốt các việc còn tồn đọng nhé.";
    } else {
      insightText = "Bạn có khá nhiều nhiệm vụ chưa hoàn thành tuần này. Hãy dành chút thời gian tập trung xử lý nhé!";
    }
  }

  // --- 4. Task Sources Distribution (All active tasks) ---
  const validTasks = Array.isArray(tasks) ? tasks.filter((t) => t) : [];
  const totalTasksCount = validTasks.length;

  const sourcesList = ['Custom', 'Email', 'Zalo', 'Slack', 'Discord'];
  const sourcesData = sourcesList.map(src => {
    const count = validTasks.filter(t => (t.source || 'Custom') === src).length;
    const completed = validTasks.filter(t => (t.source || 'Custom') === src && t.status === 'done').length;
    const percentage = totalTasksCount > 0 ? Math.round((count / totalTasksCount) * 100) : 0;
    return { name: src, count, completed, percentage };
  }).sort((a, b) => b.count - a.count);

  // --- 5. Task Priorities Distribution ---
  const priorityList = ['1', '2', '3']; // 1=High, 2=Medium, 3=Low
  const priorityData = priorityList.map(prio => {
    const count = validTasks.filter(t => String(t.priority || '2') === prio).length;
    const completed = validTasks.filter(t => String(t.priority || '2') === prio && t.status === 'done').length;
    const percentage = totalTasksCount > 0 ? Math.round((count / totalTasksCount) * 100) : 0;
    return { code: prio, count, completed, percentage };
  });

  // SVG dimensions
  const chartWidth = 500;
  const chartHeight = 200;
  const paddingLeft = 45;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 30;

  const graphWidth = chartWidth - paddingLeft - paddingRight;
  const graphHeight = chartHeight - paddingTop - paddingBottom;
  const barWidth = 16;

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20 px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200/80 pb-10">
        <div className="space-y-1.5">
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">Hệ thống cá nhân</p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            Phân tích hiệu suất
          </h1>
          <p className="text-muted-foreground text-[11px] font-medium opacity-70">
            Theo dõi tỉ lệ hoàn thành nhiệm vụ và thống kê nguồn gốc công việc.
          </p>
        </div>
      </div>

      {/* Main Weekly/Monthly Analytics Card */}
      <div className="p-6 rounded-3xl bg-card shadow-sm shadow-slate-900/[0.03] border border-border/70 flex flex-col gap-6 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
          <div>
            <h2 className="text-base font-bold uppercase tracking-widest text-foreground/80 flex items-center gap-2">
              Hiệu Suất Hoàn Thành
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </h2>
            <p className="text-[11px] text-muted-foreground/60 mt-1">Phân tích tỉ lệ hoàn thành nhiệm vụ theo thời gian.</p>
          </div>
          <div className="flex items-center gap-2 bg-muted/40 rounded-xl p-0.5 border border-border/40 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            <span className="px-2.5 py-1 rounded-lg bg-card text-foreground shadow-sm">7 ngày gần nhất</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* SVG Chart */}
          <div className="lg:col-span-2 relative">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible select-none">
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>

              {/* Grid Lines & Y Axis Labels */}
              {[0, 50, 100].map((level) => {
                const y = paddingTop + graphHeight - (level / 100) * graphHeight;
                return (
                  <g key={`level-${level}`}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={chartWidth - paddingRight}
                      y2={y}
                      stroke="currentColor"
                      className="text-border/30"
                      strokeWidth={1}
                    />
                    <text
                      x={paddingLeft - 10}
                      y={y + 4}
                      textAnchor="end"
                      className="text-[9px] font-bold fill-muted-foreground/60"
                    >
                      {level}%
                    </text>
                  </g>
                );
              })}

              {/* Vertical separator lines */}
              {chartData.map((_, i) => {
                if (i === 0) return null;
                const xSeparator = paddingLeft + i * (graphWidth / 7);
                return (
                  <line
                    key={`separator-${i}`}
                    x1={xSeparator}
                    y1={paddingTop}
                    x2={xSeparator}
                    y2={paddingTop + graphHeight}
                    stroke="currentColor"
                    className="text-border/20"
                    strokeWidth={1}
                    strokeDasharray="3,3"
                  />
                );
              })}

              {/* Bars */}
              {chartData.map((d, i) => {
                const sliceWidth = graphWidth / 7;
                const x = paddingLeft + (i + 0.5) * sliceWidth - barWidth / 2;
                const barHeight = (d.rate / 100) * graphHeight;
                const y = paddingTop + graphHeight - barHeight;

                // Check if there are no tasks for this day
                if (d.total === 0) {
                  return (
                    <g key={`bar-${i}`}>
                      {/* Tiny visual base indicator for zero tasks */}
                      <circle
                        cx={x + barWidth / 2}
                        cy={paddingTop + graphHeight}
                        r={2}
                        className="fill-muted-foreground/20"
                      />
                      <text
                        x={x + barWidth / 2}
                        y={chartHeight - 8}
                        textAnchor="middle"
                        className="text-[9px] font-semibold fill-muted-foreground/40"
                      >
                        {d.label}
                      </text>
                    </g>
                  );
                }

                return (
                  <g key={`bar-${i}`}>
                    {/* Dynamic glow filter when hovered */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      rx={4}
                      fill="url(#barGradient)"
                      className={cn(
                        "transition-all duration-300 origin-bottom",
                        hoveredBar?.day.isSame(d.day, 'day') ? "opacity-100 scale-x-105 filter drop-shadow-[0_4px_8px_rgba(59,130,246,0.3)]" : "opacity-90"
                      )}
                    />
                    {/* Flatten the bottom corners */}
                    {barHeight > 4 && (
                      <rect
                        x={x}
                        y={y + barHeight - 4}
                        width={barWidth}
                        height={4}
                        fill="url(#barGradient)"
                      />
                    )}
                    {/* X Axis Label */}
                    <text
                      x={x + barWidth / 2}
                      y={chartHeight - 8}
                      textAnchor="middle"
                      className={cn(
                        "text-[9px] font-bold transition-colors",
                        d.day.isSame(today, 'day') ? "fill-primary font-extrabold" : "fill-muted-foreground/60"
                      )}
                    >
                      {d.label}
                    </text>
                  </g>
                );
              })}

              {/* Invisible hotspots for hover interaction */}
              {chartData.map((d, i) => {
                const sliceWidth = graphWidth / 7;
                const sliceX = paddingLeft + i * sliceWidth;
                return (
                  <rect
                    key={`hotspot-${i}`}
                    x={sliceX}
                    y={paddingTop}
                    width={sliceWidth}
                    height={graphHeight}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => {
                      const x = sliceX + sliceWidth / 2;
                      const barHeight = (d.rate / 100) * graphHeight;
                      const y = paddingTop + graphHeight - barHeight;
                      setHoveredBar({
                        ...d,
                        x,
                        y,
                      });
                    }}
                    onMouseLeave={() => setHoveredBar(null)}
                  />
                );
              })}
            </svg>

            {/* Floaty Tooltip */}
            {hoveredBar && (
              <div
                className="absolute z-30 pointer-events-none p-3 bg-popover/95 backdrop-blur-md border border-border/80 shadow-xl rounded-2xl text-left min-w-[160px] flex flex-col gap-1.5 transition-all duration-150 animate-in fade-in zoom-in-95"
                style={{
                  left: `${(hoveredBar.x / chartWidth) * 100}%`,
                  top: `${(hoveredBar.y / chartHeight) * 100}%`,
                  transform: 'translate(-50%, -105%)',
                }}
              >
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                    {capitalizeFirstLetter(hoveredBar.day.format('dddd'))}
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    Ngày {hoveredBar.day.format('DD/MM/YYYY')}
                  </span>
                </div>
                <div className="h-px bg-border/40 my-0.5" />
                {hoveredBar.total > 0 ? (
                  <>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-muted-foreground/80 font-medium">Tỉ lệ xong:</span>
                      <span className="text-primary text-sm">{hoveredBar.rate}%</span>
                    </div>
                    <div className="flex flex-col gap-0.5 text-[10px] font-semibold text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                        Đã xong: <strong className="text-foreground">{hoveredBar.completed}</strong>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                        Chưa xong: <strong className="text-foreground">{hoveredBar.pending}</strong>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-500 shrink-0" />
                        Tổng cộng: <strong className="text-foreground">{hoveredBar.total}</strong>
                      </span>
                    </div>
                  </>
                ) : (
                  <span className="text-[10px] font-bold text-muted-foreground/60 italic py-1">Không có công việc nào</span>
                )}
              </div>
            )}
          </div>

          {/* Insights / Stats Panel */}
          <div className="border-t lg:border-t-0 lg:border-l border-border/50 pt-6 lg:pt-0 lg:pl-8 flex flex-col gap-5 justify-center h-full">
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              {/* Weekly rate */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50">Tuần này</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-foreground">{weeklyRate}%</span>
                  <span className="text-[10px] font-bold text-muted-foreground/50">hoàn thành</span>
                </div>
                <p className="text-[10px] text-muted-foreground/60 leading-normal">
                  Đã xong {completedWeeklyTasks} trên tổng số {totalWeeklyTasks} việc của tuần.
                </p>
              </div>

              {/* Monthly rate */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50">Tháng này (30 ngày qua)</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-primary">{monthlyRate}%</span>
                  <span className="text-[10px] font-bold text-muted-foreground/50">hoàn thành</span>
                </div>
                <p className="text-[10px] text-muted-foreground/60 leading-normal">
                  Đã xong {completed30} trên tổng số {total30} việc trong 30 ngày qua.
                </p>
              </div>
            </div>

            <div className="h-px bg-border/40 my-1 hidden lg:block" />

            {/* Productive Day & Dynamic Insights */}
            <div className="space-y-4">
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50 block">Ngày năng suất nhất</span>
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  {productiveDayLabel}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/40 text-[10.5px] font-medium text-muted-foreground/80 leading-relaxed">
                {insightText}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Secondary Analysis - Source & Priority Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Task Sources Breakdown */}
        <div className="p-6 rounded-3xl bg-card border border-border/70 shadow-sm shadow-slate-900/[0.03] space-y-6">
          <div>
            <h3 className="text-base font-bold uppercase tracking-widest text-foreground/80">Phân tích theo Nguồn</h3>
            <p className="text-[11px] text-muted-foreground/60 mt-1">Nguồn gốc đồng bộ của các nhiệm vụ trong hệ thống.</p>
          </div>

          <div className="space-y-4">
            {totalTasksCount === 0 ? (
              <p className="text-[11px] text-muted-foreground/50 italic text-center py-6">Chưa có dữ liệu công việc</p>
            ) : (
              sourcesData.map(src => {
                const srcInfo = getSourceIcon(src.name);
                const SrcIcon = srcInfo.icon;
                return (
                  <div key={src.name} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-2 text-foreground/85">
                        <span className={cn('p-1 rounded border', srcInfo.className)}>
                          <SrcIcon className="h-3 w-3" />
                        </span>
                        {src.name}
                      </span>
                      <span className="text-muted-foreground font-semibold">
                        {src.count} việc <span className="text-[10px] font-medium">({src.percentage}%)</span>
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden border border-border/10">
                      <div 
                        className={cn('h-full rounded-full transition-all duration-500', srcInfo.barColor)} 
                        style={{ width: `${src.percentage}%` }}
                      />
                    </div>
                    <div className="text-[9px] text-muted-foreground/60 flex justify-between px-1">
                      <span>Hoàn thành: {src.completed} / {src.count}</span>
                      <span>{src.count > 0 ? Math.round((src.completed / src.count) * 100) : 0}%</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Task Priorities Breakdown */}
        <div className="p-6 rounded-3xl bg-card border border-border/70 shadow-sm shadow-slate-900/[0.03] space-y-6">
          <div>
            <h3 className="text-base font-bold uppercase tracking-widest text-foreground/80">Mức độ ưu tiên</h3>
            <p className="text-[11px] text-muted-foreground/60 mt-1">Phân bổ khối lượng công việc theo tầm quan trọng.</p>
          </div>

          <div className="space-y-5">
            {totalTasksCount === 0 ? (
              <p className="text-[11px] text-muted-foreground/50 italic text-center py-6">Chưa có dữ liệu công việc</p>
            ) : (
              priorityData.map(prio => {
                const prioInfo = getPriorityInfo(prio.code);
                return (
                  <div key={prio.code} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-2 text-foreground/85">
                        <span className={cn('h-2 w-2 rounded-full shrink-0', 
                          prio.code === '1' ? 'bg-red-400' : prio.code === '3' ? 'bg-slate-400' : 'bg-amber-400'
                        )} />
                        {prioInfo.label}
                      </span>
                      <span className="text-muted-foreground font-semibold">
                        {prio.count} việc <span className="text-[10px] font-medium">({prio.percentage}%)</span>
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-muted/50 rounded-full overflow-hidden border border-border/10">
                      <div 
                        className={cn('h-full rounded-full transition-all duration-500', prioInfo.barColor)} 
                        style={{ width: `${prio.percentage}%` }}
                      />
                    </div>
                    <div className="text-[9px] text-muted-foreground/60 flex justify-between px-1">
                      <span>Hoàn thành: {prio.completed} / {prio.count}</span>
                      <span>{prio.count > 0 ? Math.round((prio.completed / prio.count) * 100) : 0}%</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
