import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Plus,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  AlertCircle,
  Loader2,
  MapPin,
  Mail,
  MessageCircle,
  Hash,
  MessageSquare,
  User,
  Maximize2,
  X,
  Bell,
  Timer,
  Flag,
  Trash2,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Button from '../components/ui/Button';
import { useAuthStore } from '../stores/authStore';
import { useUiStore } from '../stores/uiStore';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { tasksApi } from '../api';
import { cn } from '../lib/utils';
import dayjs from '../lib/dateFormat';

const getSourceIcon = (source) => {
  const s = source || 'Custom';
  switch (s) {
    case 'Email':
      return { icon: Mail, className: 'text-blue-500 bg-blue-500/10 border-blue-500/20' };
    case 'Zalo':
      return { icon: MessageCircle, className: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20' };
    case 'Slack':
      return { icon: Hash, className: 'text-purple-500 bg-purple-500/10 border-purple-500/20' };
    case 'Discord':
      return { icon: MessageSquare, className: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' };
    case 'Custom':
    default:
      return { icon: User, className: 'text-slate-500 bg-slate-500/10 border-slate-500/20' };
  }
};

const getPriorityInfo = (priority) => {
  switch (String(priority)) {
    case '1':
      return { label: 'Cao', className: 'bg-red-50 text-red-600 border-red-200', color: '#ef4444' };
    case '3':
      return { label: 'Thấp', className: 'bg-slate-50 text-slate-500 border-slate-200', color: '#94a3b8' };
    default:
      return { label: 'TB', className: 'bg-amber-50 text-amber-600 border-amber-200', color: '#f59e0b' };
  }
};

const getTimeRemaining = (dateTime) => {
  if (!dateTime) return null;
  const now = dayjs();
  const due = dayjs(dateTime);
  const diffMinutes = due.diff(now, 'minute');
  if (diffMinutes < 0) return { text: 'Quá hạn', className: 'text-red-500' };
  if (diffMinutes < 60) return { text: `${diffMinutes} phút`, className: 'text-orange-500' };
  const diffHours = due.diff(now, 'hour');
  if (diffHours < 24) return { text: `${diffHours} giờ`, className: 'text-amber-500' };
  const diffDays = due.diff(now, 'day');
  return { text: `${diffDays} ngày`, className: 'text-slate-500' };
};

const formatScheduleTime = (value) => {
  if (!value) return 'Chưa đặt giờ';
  const parsed = dayjs(value);
  if (!parsed.isValid()) return 'Chưa đặt giờ';
  if (parsed.format('HH:mm:ss') === '23:59:59') return 'Cả ngày';
  return parsed.format('HH:mm');
};

const buildTodayScheduleItems = (tasks, today) => {
  const dateKey = `dashboard_schedule_order_${dayjs(today).format('YYYY-MM-DD')}`;
  let customOrder = [];
  try {
    const saved = localStorage.getItem(dateKey);
    if (saved) {
      customOrder = JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error reading custom order', e);
  }

  const scheduledTasks = Array.isArray(tasks)
    ? tasks
        .filter((task) => task && task.status !== 'done' && (!task.due_date || dayjs(task.due_date).isSameOrBefore(today, 'day')))
        .map((task) => ({
          id: `task-${task.id}`,
          itemId: task.id,
          kind: 'task',
          title: task.title,
          time: task.due_date,
          priority: task.priority,
          source: task.source,
          rawTask: task,
        }))
    : [];

  const defaultSorted = [...scheduledTasks].sort((a, b) => {
    if (!a.time && !b.time) return 0;
    if (!a.time) return 1;
    if (!b.time) return -1;
    return new Date(a.time) - new Date(b.time);
  });

  if (customOrder && customOrder.length > 0) {
    return defaultSorted.sort((a, b) => {
      const idxA = customOrder.indexOf(a.itemId);
      const idxB = customOrder.indexOf(b.itemId);
      
      if (idxA !== -1 && idxB !== -1) {
        return idxA - idxB;
      }
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return defaultSorted.indexOf(a) - defaultSorted.indexOf(b);
    });
  }

  return defaultSorted;
};

const ScheduleModal = ({
  isOpen,
  onClose,
  todayScheduleItems,
  todayTasks,
  deletingId,
  completingId,
  onCompleteTask,
  onDeleteTask,
  onMoveTask,
}) => {
  const totalItems = todayScheduleItems.length;
  const pendingTasks = todayTasks.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-4xl bg-card rounded-3xl shadow-2xl border border-border/60 flex flex-col overflow-hidden"
        style={{ maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Lịch trình đầy đủ</h2>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                {dayjs().format('dddd, DD [tháng] MM [năm] YYYY')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-xl border border-border/60 flex items-center justify-center hover:bg-muted/50 transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="overflow-auto flex-1">
          {totalItems === 0 ? (
            <div className="py-20 text-center">
              <Calendar className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground/50">Không có lịch trình nào hôm nay</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20">
                  <th className="text-left px-6 py-3 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50 w-[40%]">Công việc</th>
                  <th className="text-left px-4 py-3 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50 w-[15%]">Độ ưu tiên</th>
                  <th className="text-left px-4 py-3 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50 w-[20%]">Thời gian</th>
                  <th className="text-left px-4 py-3 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50 w-[15%]">Còn lại</th>
                  <th className="text-left px-4 py-3 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50 w-[10%]">Nguồn</th>
                  <th className="text-center px-4 py-3 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50 w-[10%]">Tác vụ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {todayScheduleItems.map((item, idx) => {
                  const isTask = item.kind === 'task';
                  const timeRemaining = getTimeRemaining(item.time);
                  const priorityInfo = isTask ? getPriorityInfo(item.priority) : null;
                  const sourceInfo = isTask ? getSourceIcon(item.source) : null;
                  const SourceIcon = sourceInfo?.icon;
                  const isDeleting = deletingId === item.id;
                  const isCompleting = completingId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-primary/[0.03] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'h-2 w-2 rounded-full shrink-0',
                              item.priority === '1'
                                ? 'bg-red-400'
                                : item.priority === '3'
                                  ? 'bg-slate-400'
                                  : 'bg-amber-400'
                            )}
                          />
                          <div>
                            <p className="font-semibold text-foreground/80 leading-tight">{item.title}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[9px] font-bold uppercase', priorityInfo.className)}>
                          <Flag className="h-2.5 w-2.5" /> {priorityInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-semibold text-foreground/70">
                            {formatScheduleTime(item.time)}
                          </p>
                          {item.time && (
                            <p className="text-[9px] text-muted-foreground/40 font-medium">{dayjs(item.time).format('DD/MM/YYYY')}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {timeRemaining ? (
                          <div className="flex items-center gap-1.5">
                            <Timer className={cn('h-3 w-3', timeRemaining.className)} />
                            <span className={cn('text-xs font-semibold', timeRemaining.className)}>{timeRemaining.text}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/40">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {sourceInfo && SourceIcon ? (
                          <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[9px] font-bold', sourceInfo.className)}>
                            <SourceIcon className="h-3 w-3" />
                            {item.source || 'Custom'}
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/40">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onMoveTask(item.itemId, 'up')}
                            disabled={idx === 0}
                            className="p-1.5 text-muted-foreground/50 hover:text-primary transition-colors flex items-center justify-center shrink-0 disabled:opacity-20 disabled:pointer-events-none"
                            title="Di chuyển lên"
                          >
                            <ArrowUp className="h-4.5 w-4.5" />
                          </button>
                          <button
                            onClick={() => onMoveTask(item.itemId, 'down')}
                            disabled={idx === totalItems - 1}
                            className="p-1.5 text-muted-foreground/50 hover:text-primary transition-colors flex items-center justify-center shrink-0 disabled:opacity-20 disabled:pointer-events-none"
                            title="Di chuyển xuống"
                          >
                            <ArrowDown className="h-4.5 w-4.5" />
                          </button>
                          <div className="w-px bg-border/40 h-4 mx-0.5" />
                          <button
                            onClick={() => onCompleteTask(item.rawTask, item.id)}
                            disabled={isCompleting || isDeleting}
                            className="h-6 w-6 rounded-full border border-border/40 text-muted-foreground/60 hover:text-emerald-600 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-colors flex items-center justify-center shrink-0"
                            title="Hoàn thành công việc"
                          >
                            {isCompleting ? <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" /> : <Check className="h-3 w-3 stroke-[2.5]" />}
                          </button>
                          <button
                            onClick={() => onDeleteTask(item.rawTask, item.id)}
                            disabled={isCompleting || isDeleting}
                            className="h-6 w-6 rounded-full border border-border/40 text-muted-foreground/60 hover:text-red-600 hover:border-red-500/30 hover:bg-red-500/5 transition-colors flex items-center justify-center shrink-0"
                            title="Xóa công việc khỏi lịch trình"
                          >
                            {isDeleting ? <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" /> : <Trash2 className="h-3 w-3" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-8 py-4 border-t border-border/60 bg-muted/10 flex items-center justify-between">
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground/50 font-medium">
            <span><span className="text-amber-600 font-bold">{pendingTasks}</span> việc chưa xong</span>
          </div>
          <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};



const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { openModal } = useUiStore();
  const { workspaces, fetchWorkspaces, isLoading: loadingWorkspaces } = useWorkspaceStore();
  const today = dayjs().startOf('day');
  const queryClient = useQueryClient();
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [overviewTab, setOverviewTab] = useState('personal');
  const [completingId, setCompletingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [sortVersion, setSortVersion] = useState(0);

  React.useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const { data: tasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const data = await tasksApi.list();
      return data || [];
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: (task) =>
      tasksApi.update(task.id, {
        title: task.title,
        status: 'done',
        priority: task.priority,
        due_date: task.due_date,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Đã hoàn thành công việc.');
    },
    onError: (error) => {
      toast.error(`Có lỗi xảy ra: ${error.message}`);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId) => tasksApi.delete(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Đã xóa công việc khỏi lịch trình.');
    },
    onError: (error) => {
      toast.error(`Không thể xóa công việc: ${error.message}`);
    },
  });

  const handleCompleteTask = async (task, scheduleItemId, e) => {
    if (e) e.stopPropagation();
    setCompletingId(scheduleItemId || `task-${task.id}`);
    try {
      await completeTaskMutation.mutateAsync(task);
    } finally {
      setCompletingId(null);
    }
  };

  const handleDeleteTask = async (task, scheduleItemId, e) => {
    if (e) e.stopPropagation();
    setDeletingId(scheduleItemId || `task-${task.id}`);
    try {
      await deleteTaskMutation.mutateAsync(task.id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleMoveTask = (itemId, direction) => {
    const dateKey = `dashboard_schedule_order_${today.format('YYYY-MM-DD')}`;
    const currentIds = todayScheduleItems.map(item => item.itemId);
    const index = currentIds.indexOf(itemId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= currentIds.length) return;

    // Swap items
    const temp = currentIds[index];
    currentIds[index] = currentIds[newIndex];
    currentIds[newIndex] = temp;

    // Save to localStorage
    localStorage.setItem(dateKey, JSON.stringify(currentIds));
    
    // Force immediate re-render
    setSortVersion(v => v + 1);
  };

  const todayTasks = Array.isArray(tasks)
    ? tasks
        .filter((t) => t && t.status !== 'done' && (!t.due_date || dayjs(t.due_date).isSameOrBefore(today, 'day')))
        .sort((a, b) => {
          const pA = parseInt(a.priority) || 2;
          const pB = parseInt(b.priority) || 2;
          if (pA !== pB) return pA - pB;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date) - new Date(b.due_date);
        })
    : [];

  const todayScheduleItems = buildTodayScheduleItems(tasks, today);

  const greetingHour = dayjs().hour();
  const greeting = greetingHour < 12 ? 'Chào buổi sáng' : greetingHour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  return (
    <>
      <ScheduleModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        todayScheduleItems={todayScheduleItems}
        todayTasks={todayTasks}
        deletingId={deletingId}
        completingId={completingId}
        onCompleteTask={handleCompleteTask}
        onDeleteTask={handleDeleteTask}
        onMoveTask={handleMoveTask}
      />

      <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20 px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200/80 pb-10">
          <div className="space-y-1.5">
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">Hệ thống cá nhân</p>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              {greeting}, {user?.display_name?.split(' ').pop() || 'Bạn'}
            </h1>
            <p className="text-muted-foreground text-[11px] font-medium opacity-70">
              {dayjs().format('dddd, DD [tháng] MM [năm] YYYY')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => openModal('taskForm')} className="rounded-xl shadow-none text-[11px] h-9 px-4">
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Thêm công việc
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Việc hôm nay', value: Array.isArray(tasks) ? tasks.filter((t) => t && t.status !== 'done' && t.due_date && dayjs(t.due_date).isSame(today, 'day')).length : 0, icon: Calendar, color: 'text-primary', path: '/tasks?tab=today' },
            { label: 'Cần hoàn thành', value: todayTasks.length, icon: CheckCircle2, color: 'text-foreground', path: '/tasks?tab=today' },
            { label: 'Việc quá hạn', value: Array.isArray(tasks) ? tasks.filter((t) => t && t.status !== 'done' && t.due_date && dayjs(t.due_date).isBefore(today, 'day')).length : 0, icon: AlertCircle, color: 'text-destructive/60', path: '/tasks?tab=all&filter=overdue' },
            { label: 'Đã xong', value: Array.isArray(tasks) ? tasks.filter((t) => t && t.status === 'done' && t.due_date && dayjs(t.due_date).isSame(today, 'day')).length : 0, icon: TrendingUp, color: 'text-muted-foreground', path: '/tasks?tab=completed' },
          ].map((stat, i) => (
            <div
              key={i}
              onClick={() => stat.path && navigate(stat.path)}
              className="p-6 rounded-3xl bg-card shadow-sm shadow-slate-900/[0.03] border border-border/70 hover:border-primary/25 transition-all cursor-pointer"
            >
              <stat.icon className={cn('h-4 w-4 mb-4', stat.color)} />
              <p className="text-3xl font-bold tracking-tight mb-0.5">{stat.value}</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">{stat.label}</p>
            </div>
          ))}
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold uppercase tracking-widest text-foreground/80 flex items-center gap-2">
                  Lịch trình hôm nay
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                </h2>
                <p className="text-[11px] text-muted-foreground/60 mt-1">Bao gồm các công việc đã lên lịch thực hiện hôm nay.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setScheduleModalOpen(true)}
                  title="Xem lịch trình đầy đủ"
                  className="h-7 w-7 rounded-lg border border-border/60 flex items-center justify-center hover:bg-muted/50 hover:border-primary/30 transition-all group"
                >
                  <Maximize2 className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
                <button
                  onClick={() => navigate('/calendar')}
                  className="text-xs text-primary hover:text-primary-active font-bold flex items-center gap-1 hover:underline transition-all"
                >
                  Xem tất cả <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {loadingTasks ? (
                <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-muted-foreground/10" /></div>
              ) : todayScheduleItems.length > 0 ? (
                todayScheduleItems.slice(0, 5).map((item) => {
                  const sourceInfo = getSourceIcon(item.source);
                  const SourceIcon = sourceInfo?.icon;
                  const isDeleting = deletingId === item.id;
                  const isCompleting = completingId === item.id;

                  const isOverdue = item.time && dayjs(item.time).isBefore(today, 'day');

                  return (
                    <div key={item.id} className={cn(
                      "group flex items-center gap-4 p-5 rounded-3xl bg-card shadow-sm shadow-slate-900/[0.03] border transition-all",
                      isOverdue ? "border-red-500/40 bg-red-500/5 hover:border-red-500/60 hover:bg-red-500/10" : "border-border/70 hover:border-primary/20 hover:bg-muted/25"
                    )}>
                      <div className={cn(
                        "flex flex-col items-center justify-center text-center border-r pr-5 min-w-[78px]",
                        isOverdue ? "border-red-500/30" : "border-border/70"
                      )}>
                        <span className={cn("text-sm font-bold", isOverdue ? "text-red-600" : "text-foreground")}>{formatScheduleTime(item.time)}</span>
                        {isOverdue && <span className="text-[9px] uppercase tracking-wider font-extrabold mt-1 text-red-500 flex items-center gap-1"><AlertCircle className="w-2.5 h-2.5" /> Quá hạn</span>}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <h4 className="font-semibold text-base group-hover:text-primary transition-colors truncate">{item.title}</h4>
                        </div>

                        <div className="flex items-center gap-4 text-[10px] text-muted-foreground/60 font-medium flex-wrap">
                          {SourceIcon && (
                            <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-bold', sourceInfo.className)}>
                              <SourceIcon className="h-3 w-3" /> {item.source || 'Custom'}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <Timer className="h-3 w-3" /> Hoàn thành để gỡ khỏi lịch hôm nay
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMoveTask(item.itemId, 'up'); }}
                          className="p-1.5 text-muted-foreground/50 hover:text-primary transition-colors shrink-0 flex items-center justify-center"
                          title="Di chuyển lên"
                        >
                          <ArrowUp className="h-5 w-5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMoveTask(item.itemId, 'down'); }}
                          className="p-1.5 text-muted-foreground/50 hover:text-primary transition-colors shrink-0 flex items-center justify-center"
                          title="Di chuyển xuống"
                        >
                          <ArrowDown className="h-5 w-5" />
                        </button>
                        <div className="w-px bg-border/50 h-5 mx-0.5" />
                        <button
                          onClick={(e) => handleCompleteTask(item.rawTask, item.id, e)}
                          disabled={isCompleting || isDeleting}
                          className="h-7 w-7 rounded-full border border-border/40 text-muted-foreground/60 hover:text-emerald-600 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-colors shrink-0 flex items-center justify-center bg-background"
                          title="Hoàn thành công việc"
                        >
                          {isCompleting ? <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" /> : <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
                        </button>
                        <button
                          onClick={(e) => handleDeleteTask(item.rawTask, item.id, e)}
                          disabled={isCompleting || isDeleting}
                          className="h-7 w-7 rounded-full border border-border/40 text-muted-foreground/60 hover:text-red-600 hover:border-red-500/30 hover:bg-red-500/5 transition-colors shrink-0 flex items-center justify-center bg-background"
                          title="Xóa công việc khỏi lịch trình"
                        >
                          {isDeleting ? <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-20 text-center rounded-[2.5rem] border border-dashed border-border/70 bg-muted/30">
                  <p className="text-[11px] text-muted-foreground/50 font-medium">Bạn chưa có công việc nào được lên lịch cho hôm nay.</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex p-1 bg-muted/40 rounded-xl border border-border/50">
              <button
                onClick={() => setOverviewTab('personal')}
                className={cn(
                  "flex-1 text-xs font-semibold py-2 rounded-lg transition-all",
                  overviewTab === 'personal' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Cá nhân
              </button>
              <button
                onClick={() => setOverviewTab('team')}
                className={cn(
                  "flex-1 text-xs font-semibold py-2 rounded-lg transition-all",
                  overviewTab === 'team' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Nhóm
              </button>
            </div>

            {overviewTab === 'personal' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold uppercase tracking-widest text-foreground/80">Công việc</h2>
                    <p className="text-[11px] text-muted-foreground/60 mt-1">Việc đến hạn hoặc quá hạn.</p>
                  </div>
                  <button
                    onClick={() => navigate('/tasks?tab=today')}
                    className="text-xs text-primary hover:text-primary-active font-bold flex items-center gap-1 hover:underline transition-all"
                  >
                    Xem tất cả <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-3">
                  {loadingTasks ? (
                    <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-muted-foreground/10" /></div>
                  ) : todayTasks.length > 0 ? (
                    todayTasks.slice(0, 5).map((task) => {
                      const sourceInfo = getSourceIcon(task.source);
                      const SourceIcon = sourceInfo.icon;
                      const priorityInfo = getPriorityInfo(task.priority);

                      const isOverdue = task.due_date && dayjs(task.due_date).isBefore(today, 'day');

                      return (
                        <div
                          key={task.id}
                          onClick={(e) => handleCompleteTask(task, `task-${task.id}`, e)}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-2xl bg-card shadow-sm shadow-slate-900/[0.03] border transition-all cursor-pointer group",
                            isOverdue ? "border-red-500/30 bg-red-500/5 hover:border-red-500/50 hover:bg-red-500/10" : "border-border/70 hover:border-primary/25"
                          )}
                        >
                          <div className={cn(
                            "h-5 w-5 rounded-full border transition-colors shrink-0 flex items-center justify-center",
                            isOverdue ? "border-red-500/40 group-hover:border-red-500/60 group-hover:bg-red-500/10" : "border-border/40 group-hover:border-primary/40 bg-background group-hover:bg-primary/5"
                          )}>
                            <Check className={cn("h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity stroke-[2.5]", isOverdue ? "text-red-600" : "text-primary")} />
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <p className={cn("text-sm font-semibold truncate group-hover:underline", isOverdue ? "text-red-700/90 group-hover:text-red-700 decoration-red-500/40" : "text-foreground/80 group-hover:text-foreground decoration-primary/40")}>{task.title}</p>
                            <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60 flex-wrap">
                              {task.due_date && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {dayjs(task.due_date).format('HH:mm DD/MM')}
                                </span>
                              )}
                              <span className={cn('px-1.5 py-0.5 rounded border text-[8px] font-extrabold uppercase shrink-0', priorityInfo.className)}>
                                {priorityInfo.label}
                              </span>
                              {task.due_date && dayjs(task.due_date).isSame(today, 'day') && (
                                <span className="px-1.5 py-0.5 rounded border text-[8px] font-extrabold uppercase shrink-0 bg-primary/10 text-primary border-primary/20">
                                  Hôm nay
                                </span>
                              )}
                              {isOverdue && (
                                <span className="px-1.5 py-0.5 rounded border text-[8px] font-extrabold uppercase shrink-0 bg-red-500/10 text-red-600 border-red-500/20 flex items-center gap-1">
                                  <AlertCircle className="w-2.5 h-2.5" /> Quá hạn
                                </span>
                              )}
                            </div>
                          </div>
                          <span className={cn('p-1.5 rounded-lg border shrink-0', sourceInfo.className)} title={task.source}>
                            <SourceIcon className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-20 text-center rounded-[2.5rem] border border-dashed border-border/70 bg-card/50 opacity-70">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Hoàn thành hết!</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {overviewTab === 'team' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold uppercase tracking-widest text-foreground/80">Không gian làm việc</h2>
                    <p className="text-[11px] text-muted-foreground/60 mt-1">Các nhóm của bạn.</p>
                  </div>
                  <button
                    onClick={() => navigate('/workspaces')}
                    className="text-xs text-primary hover:text-primary-active font-bold flex items-center gap-1 hover:underline transition-all"
                  >
                    Xem tất cả <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-3">
                  {(user?.plan === 'free' || !user?.plan) ? (
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-primary/10 via-background to-primary/5 border border-primary/20 flex flex-col items-center justify-center text-center space-y-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mb-1">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-sm font-bold text-foreground">Nâng cấp để sử dụng</h3>
                      <p className="text-[11px] text-muted-foreground mt-1 max-w-[200px] mx-auto mb-3">
                        Gói Free chỉ hỗ trợ cá nhân hóa.
                      </p>
                      <Button onClick={() => navigate('/pro/upgrade')} className="rounded-xl px-5 py-1.5 h-auto text-xs">
                        Tìm hiểu gói Pro
                      </Button>
                    </div>
                  ) : (
                    <>
                      {loadingWorkspaces ? (
                        <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-muted-foreground/10" /></div>
                      ) : workspaces.length > 0 ? (
                        <div className="flex flex-col gap-3">
                          {workspaces.slice(0, 5).map(ws => (
                            <div 
                              key={ws.id} 
                              onClick={() => navigate(`/team/${ws.id}`)}
                              className="group p-4 rounded-2xl bg-card border border-border/70 shadow-sm shadow-slate-900/[0.03] hover:border-primary/30 hover:bg-muted/30 transition-all cursor-pointer flex items-center gap-4"
                            >
                              <div 
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0"
                                style={{ backgroundColor: ws.color || '#4A90D9' }}
                              >
                                {ws.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                  <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate pr-2">{ws.name}</h3>
                                  <span className="text-[9px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md group-hover:text-primary transition-colors shrink-0">
                                    {ws.role === 'owner' ? 'Chủ' : 'Mem'}
                                  </span>
                                </div>
                                <div className="flex items-center text-[10px] text-muted-foreground font-medium">
                                  <span className="flex items-center gap-1"><User className="h-3 w-3" /> {ws.member_count || 1} tv</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-16 text-center rounded-[2.5rem] border border-dashed border-border/70 bg-muted/30">
                          <p className="text-[11px] text-muted-foreground font-medium mb-3">Chưa có Workspace nào.</p>
                          <Button onClick={() => openModal('workspaceForm')} variant="outline" size="sm" className="rounded-xl h-8 text-xs px-3">
                            Tạo Workspace
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
