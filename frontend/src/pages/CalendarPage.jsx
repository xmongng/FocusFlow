import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Loader2,
  Check
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useUiStore } from '../stores/uiStore';
import { tasksApi } from '../api';
import { cn } from '../lib/utils';
import dayjs from '../lib/dateFormat';
import { getCalendarInfo } from '../lib/lunarUtils';

const CalendarPage = () => {
  const navigate = useNavigate();
  const { openModal } = useUiStore();
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [calendarType, setCalendarType] = useState('solar');
  
  const queryClient = useQueryClient();
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const data = await tasksApi.list();
      return data || [];
    }
  });

  const toggleTaskMutation = useMutation({
    mutationFn: (task) => tasksApi.update(task.id, { status: task.status === 'done' ? 'todo' : 'done' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
    }
  });

  const startOfMonth = currentDate.startOf('month');
  const dayOfWeek = startOfMonth.day(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const gridStart = startOfMonth.add(diffToMonday, 'day').startOf('day');
  
  const calendarDays = [];
  let day = gridStart;
  for (let i = 0; i < 42; i++) {
    calendarDays.push(day);
    day = day.add(1, 'day');
  }

  return (
    <div className="max-w-[1600px] mx-auto flex flex-col h-full space-y-8 animate-in fade-in duration-700 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b pb-8">
        <div className="flex items-center gap-6">
          <h1 className="text-4xl font-semibold tracking-tighter capitalize">
            {currentDate.format('MMMM, YYYY')}
          </h1>
          <div className="flex items-center bg-muted/40 rounded-2xl p-1 border border-border/40">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => setCurrentDate(currentDate.subtract(1, 'month'))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-4 text-[10px] font-bold uppercase tracking-wider" onClick={() => setCurrentDate(dayjs())}>
              Hôm nay
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => setCurrentDate(currentDate.add(1, 'month'))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Type Toggle */}
          <div className="flex items-center bg-muted/40 rounded-2xl p-1 border border-border/40 ml-2 sm:ml-4">
            <Button 
              variant={calendarType === 'solar' ? 'default' : 'ghost'} 
              size="sm" 
              className={cn("h-8 px-4 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all", calendarType === 'solar' && "shadow-sm")} 
              onClick={() => setCalendarType('solar')}
            >
              Lịch Dương
            </Button>
            <Button 
              variant={calendarType === 'lunar' ? 'default' : 'ghost'} 
              size="sm" 
              className={cn("h-8 px-4 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all", calendarType === 'lunar' && "shadow-sm")} 
              onClick={() => setCalendarType('lunar')}
            >
              Lịch Âm
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/30" />}
          <Button size="sm" onClick={() => openModal('taskForm')} className="rounded-full px-6">
            <Plus className="mr-2 h-4 w-4" /> Thêm công việc
          </Button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="space-y-1 flex-1 flex flex-col min-h-0">
        {/* Days Header */}
        <div className="grid grid-cols-7 mb-2">
          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d, i) => (
            <div key={i} className="text-center text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">
              {d}
            </div>
          ))}
        </div>

        {/* Monthly Grid - Cải thiện để responsive và co giãn linh hoạt hơn */}
        <div className="grid grid-cols-7 grid-rows-6 flex-1 min-h-[650px] border border-border/30 rounded-[2.5rem] overflow-hidden bg-card shadow-2xl shadow-black/[0.02]">
          {calendarDays.map((date, i) => {
            const isToday = date.isSame(dayjs(), 'day');
            const isCurrentMonth = date.isSame(currentDate, 'month');
            const { lunar, holiday, isSpecialLunarDay } = getCalendarInfo(date);

            return (
              <div 
                key={i} 
                onClick={() => {
                  navigate(`/tasks?tab=all&date=${date.format('YYYY-MM-DD')}`);
                }}
                className={cn(
                  "border-r border-b border-border/30 p-3 transition-all relative hover:bg-muted/10 group cursor-pointer flex flex-col justify-between",
                  !isCurrentMonth && "bg-muted/5 opacity-30"
                )}
              >
                {/* Header của ô ngày (Dương lịch & Âm lịch) */}
                <div>
                  <div className="flex justify-between items-center">
                    <span className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-xl text-xs font-bold transition-all",
                      isToday 
                        ? "bg-primary text-primary-foreground shadow-lg" 
                        : (calendarType === 'lunar' && isSpecialLunarDay ? "text-red-500" : "text-foreground group-hover:bg-muted")
                    )}>
                      {calendarType === 'solar' ? date.date() : (lunar ? lunar.day : '')}
                    </span>
                    {lunar && (
                      <span className={cn(
                        "text-[9px] font-semibold select-none",
                        calendarType === 'solar' && isSpecialLunarDay ? "text-red-500 font-bold" : "text-muted-foreground/50"
                      )}>
                        {calendarType === 'solar' 
                          ? (lunar.day === 1 ? `${lunar.day}/${lunar.month}${lunar.leap_month ? 'n' : ''}` : `${lunar.day}${lunar.leap_month ? 'n' : ''}`)
                          : (date.date() === 1 ? `${date.date()}/${date.month() + 1}` : date.date())}
                      </span>
                    )}
                  </div>

                  {/* Nhãn Ngày Lễ */}
                  {holiday && (
                    <div className={cn(
                      "mt-1.5 text-[9px] px-2 py-0.5 rounded-lg font-bold truncate select-none border",
                      holiday.isOff 
                        ? "bg-red-500/10 text-red-600 border-red-500/20" 
                        : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    )} title={holiday.name}>
                      {holiday.name}
                    </div>
                  )}
                </div>
                
                {/* Danh sách Công việc trong ngày */}
                <div className="mt-2 space-y-1 overflow-y-auto flex-1 max-h-[80px] custom-scrollbar">
                  {/* Công việc (Tasks) */}
                  {tasks.filter(t => t && t.due_date && dayjs(t.due_date).isSame(date, 'day')).map(task => {
                    const isDone = task.status === 'done';
                    const taskTime = task.due_date ? dayjs(task.due_date) : null;
                    const timeStr = taskTime && taskTime.format('HH:mm:ss') !== '23:59:59' ? taskTime.format('HH:mm') + ' ' : '';
                    
                    return (
                      <div 
                        key={`task-${task.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTaskMutation.mutate(task);
                        }}
                        className={cn(
                          "text-[10px] px-2 py-1.5 rounded-xl border truncate font-medium transition-all flex items-center gap-1.5 cursor-pointer",
                          isDone 
                            ? "bg-muted/30 text-muted-foreground line-through border-border/30" 
                            : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500 hover:text-white"
                        )}
                        title={task.title}
                      >
                        <div className={cn(
                          "w-3 h-3 rounded-md flex items-center justify-center border shrink-0 transition-all",
                          isDone 
                            ? "bg-muted-foreground/30 border-transparent text-white" 
                            : "border-emerald-500 bg-emerald-500/10"
                        )}>
                          {isDone && <Check className="w-2 h-2" />}
                        </div>
                        <span className="truncate">{timeStr}{task.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
