import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Check,
  Plus,
  Search,
  Calendar,
  MoreVertical,
  Flag,
  Inbox,
  Loader2,
  Mail,
  MessageCircle,
  Hash,
  MessageSquare,
  User,
  Filter,
  Layers,
  Pencil,
  Clock,
  ChevronDown,
  ChevronUp,
  X,
  AlertCircle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useUiStore } from '../stores/uiStore';
import { tasksApi } from '../api';
import { cn } from '../lib/utils';
import dayjs from '../lib/dateFormat';
import { toast } from 'sonner';

// We will compute taskTabs dynamically inside the component

const getSourceBadge = (source) => {
  const s = source || 'Custom';
  switch (s) {
    case 'Email':
      return {
        label: 'Email',
        className: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
        icon: Mail,
      };
    case 'Zalo':
      return {
        label: 'Zalo',
        className: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
        icon: MessageCircle,
      };
    case 'Slack':
      return {
        label: 'Slack',
        className: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
        icon: Hash,
      };
    case 'Discord':
      return {
        label: 'Discord',
        className: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
        icon: MessageSquare,
      };
    case 'Custom':
    default:
      return {
        label: 'Custom',
        className: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
        icon: User,
      };
  }
};

const TasksPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { openModal } = useUiStore();
  const activeTab = searchParams.get('tab') || 'today';
  const [searchQuery, setSearchQuery] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [activeSource, setActiveSource] = useState('all');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const dateParam = searchParams.get('date');
  const [selectedDate, setSelectedDate] = useState(() => {
    if (dateParam) {
      const parsed = dayjs(dateParam);
      if (parsed.isValid()) return parsed;
    }
    return dayjs();
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const taskTabs = useMemo(() => {
    const selectedDateStr = selectedDate.format('YYYY-MM-DD');
    const todayStr = dayjs().format('YYYY-MM-DD');
    const yesterdayStr = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    const tomorrowStr = dayjs().add(1, 'day').format('YYYY-MM-DD');

    let firstTabLabel = 'Hôm nay';
    if (selectedDateStr === yesterdayStr) {
      firstTabLabel = 'Hôm qua';
    } else if (selectedDateStr === tomorrowStr) {
      firstTabLabel = 'Ngày mai';
    } else if (selectedDateStr !== todayStr) {
      firstTabLabel = 'Trong ngày';
    }

    return [
      { id: 'today', label: firstTabLabel },
      { id: 'upcoming', label: 'Sắp tới' },
      { id: 'all', label: 'Tất cả' },
      { id: 'completed', label: 'Đã xong' },
    ];
  }, [selectedDate]);

  useEffect(() => {
    if (dateParam) {
      const parsed = dayjs(dateParam);
      if (parsed.isValid() && !parsed.isSame(selectedDate, 'day')) {
        setSelectedDate(parsed);
      }
    } else {
      const today = dayjs();
      if (!selectedDate.isSame(today, 'day')) {
        setSelectedDate(today);
      }
    }
  }, [dateParam]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Calculate Monday to Sunday containing the selected date
  const startOfWeek = useMemo(() => {
    const dayOfWeek = selectedDate.day(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    return selectedDate.add(diffToMonday, 'day').startOf('day');
  }, [selectedDate]);

  const endOfWeek = useMemo(() => {
    return startOfWeek.add(6, 'day').endOf('day');
  }, [startOfWeek]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));
  }, [startOfWeek]);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksApi.list(),
  });

  // Mutation xử lý việc thêm mới một công việc vào cơ sở dữ liệu
  const createTaskMutation = useMutation({
    mutationFn: (taskData) => tasksApi.create(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setNewTaskTitle('');
      toast.success('Đã thêm công việc');
    },
  });

  // Mutation xử lý việc cập nhật thông tin công việc (Ví dụ: hoàn thành, đổi tiêu đề, chỉnh ngày hạn, mức ưu tiên)
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, ...data }) => tasksApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  // Xử lý sự kiện thêm nhanh công việc bằng phím Enter từ ô nhập đầu trang
  const handleQuickAdd = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (!newTaskTitle.trim()) return;
      createTaskMutation.mutate({
        title: newTaskTitle,
        due_date: dayjs().format('YYYY-MM-DD 23:59:59'),
        priority: '2',
      });
    }
  };

  const categoryParam = searchParams.get('category');
  const filterParam = searchParams.get('filter');

  const filteredByTabAndSearch = useMemo(() => {
    let result = Array.isArray(tasks) ? tasks : [];

    if (searchQuery) {
      result = result.filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (categoryParam) {
      result = result.filter((t) => String(t.category_id) === categoryParam);
    }

    if (filterParam === 'overdue') {
      const todayStart = dayjs().startOf('day');
      return result.filter((t) => t.status !== 'done' && t.due_date && dayjs(t.due_date).isBefore(todayStart, 'day'));
    }

    // Filter by selected date and active tab
    result = result.filter((t) => {
      if (!t) return false;

      const hasDueDate = !!t.due_date;
      // Timezone-safe string-based date comparison
      const tDateStr = hasDueDate ? dayjs(t.due_date).format('YYYY-MM-DD') : '';
      const selectedDateStr = selectedDate.format('YYYY-MM-DD');
      const isSameDay = hasDueDate && tDateStr === selectedDateStr;
      
      // Unscheduled tasks are shown only when selectedDate is today
      const isSelectedToday = selectedDateStr === dayjs().format('YYYY-MM-DD');
      const includeUnscheduled = !hasDueDate && isSelectedToday;

      if (activeTab === 'today') {
        const isSelectedToday = selectedDateStr === dayjs().format('YYYY-MM-DD');
        const isSelectedPast = selectedDate.isBefore(dayjs().startOf('day'), 'day');
        
        if (isSelectedToday) {
          // Today's view: show active tasks due today, overdue tasks, and unscheduled tasks
          const isOverdue = hasDueDate && dayjs(t.due_date).isBefore(selectedDate.startOf('day'), 'day');
          return t.status !== 'done' && (isSameDay || isOverdue || includeUnscheduled);
        } else if (isSelectedPast) {
          // Past day's view: show all tasks (both completed and uncompleted) due on that day
          return isSameDay;
        } else {
          // Future day's view: show uncompleted tasks due on that day
          return t.status !== 'done' && isSameDay;
        }
      } else if (activeTab === 'upcoming') {
        return t.status !== 'done' && isSameDay;
      } else if (activeTab === 'completed') {
        return t.status === 'done' && isSameDay;
      } else {
        // 'all' tab: both completed and uncompleted tasks for the selected date
        return isSameDay || includeUnscheduled;
      }
    });

    return result;
  }, [activeTab, searchQuery, selectedDate, tasks, categoryParam, filterParam]);

  const sourceCounts = useMemo(() => {
    const counts = {
      all: filteredByTabAndSearch.length,
      Email: 0,
      Zalo: 0,
      Slack: 0,
      Discord: 0,
      Custom: 0,
    };

    filteredByTabAndSearch.forEach((t) => {
      const src = t.source || 'Custom';
      if (counts[src] !== undefined) {
        counts[src]++;
      } else {
        counts.Custom++;
      }
    });

    return counts;
  }, [filteredByTabAndSearch]);

  const filteredTasks = useMemo(() => {
    let result = filteredByTabAndSearch;
    if (activeSource !== 'all') {
      result = result.filter((t) => (t.source || 'Custom') === activeSource);
    }
    return result.sort((a, b) => {
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return dayjs(a.due_date).unix() - dayjs(b.due_date).unix();
    });
  }, [filteredByTabAndSearch, activeSource]);

  const getDateLabel = () => {
    if (selectedDate.isSame(dayjs(), 'day')) {
      return 'Hôm nay';
    }
    const weekday = selectedDate.format('dddd');
    const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    return `${capitalizedWeekday}, ${selectedDate.format('DD/MM/YYYY')}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700 pb-32">
      <div className="space-y-1 border-b pb-8">
        <h1 className="text-4xl font-semibold tracking-tight">Công việc</h1>
        <p className="text-muted-foreground text-sm font-medium">Sắp xếp ưu tiên và lên lịch thực hiện cho từng công việc</p>
      </div>

      <div className="rounded-[1.5rem] border border-primary/15 bg-primary/[0.04] px-5 py-4 text-sm text-foreground/80 shadow-sm shadow-primary/5">
        <p className="font-semibold">Mẹo đồng bộ:</p>
        <p className="mt-1 text-muted-foreground">
          Khi bạn đặt <span className="font-semibold text-foreground">ngày</span> và <span className="font-semibold text-foreground">giờ thực hiện</span> cho một công việc, công việc đó sẽ xuất hiện trong <span className="font-semibold text-foreground">Lịch trình hôm nay</span> hoặc lịch sắp tới trên Dashboard.
        </p>
      </div>

      {filterParam === 'overdue' && (
        <div className="rounded-[1.5rem] border border-red-500/30 bg-red-500/5 px-5 py-4 text-sm shadow-sm flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-600">Đang hiển thị công việc quá hạn</p>
            <p className="mt-1 text-muted-foreground text-xs">Đây là những công việc đã qua ngày đáo hạn nhưng chưa được hoàn thành.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3 text-xs h-8"
              onClick={() => {
                setSearchParams((prev) => {
                  prev.delete('filter');
                  return prev;
                });
              }}
            >
              Xóa bộ lọc
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="flex p-1 bg-muted/70 rounded-[1.25rem] border border-border/70 w-full md:w-auto shadow-sm shadow-slate-900/[0.02]">
          {taskTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSearchParams({ tab: tab.id })}
                className={cn(
                  'flex-1 md:flex-none px-6 py-2.5 text-xs font-bold rounded-2xl transition-all',
                  isActive
                    ? 'bg-primary/20 text-foreground shadow-md shadow-primary/15 ring-1 ring-primary/30 border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/80'
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative flex-1 w-full flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <Input
              placeholder="Tìm kiếm công việc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 bg-card border-border/70 rounded-2xl shadow-sm shadow-slate-900/[0.02] focus:ring-0 focus:border-primary/40 transition-all"
            />
          </div>
          <Button
            onClick={() => openModal('taskForm')}
            className="rounded-2xl h-12 px-5 font-bold shadow-sm shadow-primary/15 shrink-0 flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Thêm mới
          </Button>
        </div>
      </div>

      {categoryParam && (
        <div className="flex items-center gap-2 mt-4 bg-primary/10 text-primary border border-primary/20 px-4 py-2 w-fit rounded-xl text-xs font-bold animate-in fade-in">
          <Filter className="w-3.5 h-3.5" />
          <span>Đang lọc theo phân loại</span>
          <button 
            onClick={() => {
              searchParams.delete('category');
              setSearchParams(searchParams);
            }}
            className="hover:bg-primary/20 ml-2 p-1 rounded-md transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Sleek Date Filter Trigger & Dropdown */}
      <div className="flex items-center gap-3 relative z-20">
        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest pl-2">
          Ngày xem việc:
        </span>
        
        <div className="relative inline-block" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold border transition-all shadow-sm",
              showDropdown
                ? "bg-primary text-primary-foreground border-primary shadow-primary/10"
                : "bg-card text-muted-foreground border-border/70 hover:text-foreground hover:bg-muted/30"
            )}
          >
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{getDateLabel()}</span>
            {showDropdown ? <ChevronUp className="h-3.5 w-3.5 shrink-0 opacity-70" /> : <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" />}
          </button>

          {/* Floating Dropdown Panel (Vertical Scrollable) */}
          {showDropdown && (
            <div className="absolute top-full left-0 mt-2 z-50 bg-popover/95 backdrop-blur-md border border-border shadow-2xl rounded-2xl p-2 w-64 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent flex flex-col gap-0.5 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 text-[9px] font-extrabold text-muted-foreground/40 uppercase tracking-widest border-b border-border/30 mb-1 flex items-center justify-between">
                  <span>Tuần này</span>
                  <span className="text-[8px] tracking-normal font-semibold normal-case">
                    {startOfWeek.format('DD/MM')} - {endOfWeek.format('DD/MM')}
                  </span>
                </div>
                
                {weekDays.map((pDate, idx) => {
                  const isSelected = pDate.isSame(selectedDate, 'day');
                  const isToday = pDate.isSame(dayjs(), 'day');
                  const weekdayName = pDate.format('dddd');
                  const capitalizedWeekday = weekdayName.charAt(0).toUpperCase() + weekdayName.slice(1);
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedDate(pDate);
                        setSearchParams((prev) => {
                          prev.set('date', pDate.format('YYYY-MM-DD'));
                          return prev;
                        });
                        setShowDropdown(false);
                      }}
                      className={cn(
                        "flex items-center justify-between w-full px-3 py-2 text-xs font-bold rounded-xl text-left transition-all",
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/10"
                          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                      )}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span>{capitalizedWeekday}</span>
                        <span className={cn(
                          "text-[9px] font-semibold",
                          isSelected ? "text-primary-foreground/75" : "text-muted-foreground/50"
                        )}>
                          Ngày {pDate.format('DD/MM/YYYY')}
                        </span>
                      </div>
                      {isToday && (
                        <span className={cn(
                          "text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border tracking-wide",
                          isSelected ? "bg-primary-foreground/20 border-primary-foreground/30 text-primary-foreground" : "bg-primary/10 border-primary/20 text-primary"
                        )}>
                          Hôm nay
                        </span>
                      )}
                    </button>
                  );
                })}
                
                {/* Advanced Date Picker at the bottom */}
                <div className="h-px bg-border/40 my-1" />
                <label className="relative flex items-center gap-2 w-full px-3 py-2 text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted/70 rounded-xl cursor-pointer transition-all">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Chọn ngày xa hơn...</span>
                  <input
                    type="date"
                    value={selectedDate.format('YYYY-MM-DD')}
                    onChange={(e) => {
                      if (e.target.value) {
                        const newDate = dayjs(e.target.value);
                        setSelectedDate(newDate);
                        setSearchParams((prev) => {
                          prev.set('date', newDate.format('YYYY-MM-DD'));
                          return prev;
                        });
                        setShowDropdown(false);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full"
                  />
                </label>
              </div>
          )}
        </div>

        {/* Quick return to today link */}
        {!selectedDate.isSame(dayjs(), 'day') && (
          <button
            onClick={() => {
              setSelectedDate(dayjs());
              setSearchParams((prev) => {
                prev.delete('date');
                return prev;
              });
              setShowDropdown(false);
            }}
            className="text-[10px] font-bold text-primary hover:text-primary-active uppercase tracking-wider transition-colors hover:underline"
          >
            Quay lại hôm nay
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 items-center bg-card p-3 rounded-[1.5rem] border border-border/70 shadow-sm shadow-slate-900/[0.01] relative z-10">
        <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest pl-2 pr-1 flex items-center gap-1.5 shrink-0">
          <Filter className="h-3.5 w-3.5" /> Lọc nguồn:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: 'Tất cả', icon: Layers, colorClass: 'text-foreground' },
            { id: 'Custom', label: 'Custom', icon: User, colorClass: 'text-slate-500' },
            { id: 'Email', label: 'Email', icon: Mail, colorClass: 'text-blue-500' },
            { id: 'Zalo', label: 'Zalo', icon: MessageCircle, colorClass: 'text-cyan-500' },
            { id: 'Slack', label: 'Slack', icon: Hash, colorClass: 'text-purple-500' },
            { id: 'Discord', label: 'Discord', icon: MessageSquare, colorClass: 'text-indigo-500' },
          ].map((src) => {
            const isActive = activeSource === src.id;
            const count = sourceCounts[src.id] || 0;
            const SrcIcon = src.icon;
            return (
              <button
                key={src.id}
                onClick={() => setActiveSource(src.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all shadow-sm',
                  isActive
                    ? 'bg-primary/20 text-foreground border-primary/30 font-bold'
                    : 'bg-background text-muted-foreground border-border hover:bg-muted/50 hover:text-foreground'
                )}
              >
                <SrcIcon className={cn('h-3.5 w-3.5', !isActive && src.colorClass)} />
                <span>{src.label}</span>
                <span
                  className={cn(
                    'inline-flex items-center justify-center px-1.5 py-0.5 rounded-md text-[9px] font-extrabold',
                    isActive ? 'bg-background text-foreground' : 'bg-muted text-muted-foreground'
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-6 w-6 text-muted-foreground/30 animate-spin" />
          </div>
        ) : filteredTasks.length > 0 ? (
          filteredTasks.map((task) => {
            const sourceInfo = getSourceBadge(task.source);
            const SourceIcon = sourceInfo.icon;
            const isOverdue = task.status !== 'done' && task.due_date && dayjs(task.due_date).isBefore(dayjs().startOf('day'), 'day');
            
            return (
              <div
                key={task.id}
                onClick={() => updateTaskMutation.mutate({ ...task, status: task.status === 'done' ? 'todo' : 'done' })}
                className={cn(
                  'group flex items-center gap-5 p-5 rounded-[1.5rem] border transition-all cursor-pointer shadow-sm hover:shadow-md',
                  task.status === 'done' 
                    ? 'opacity-50 border-border/70 bg-card' 
                    : isOverdue 
                      ? 'border-red-500/40 bg-red-500/5 hover:border-red-500/60 hover:bg-red-500/10'
                      : 'border-border/70 bg-card hover:border-primary/25 shadow-slate-900/[0.03] hover:shadow-slate-900/[0.05]'
                )}
              >
                <div
                  className={cn(
                    'h-5 w-5 rounded-full border flex items-center justify-center transition-all shrink-0',
                    task.status === 'done' ? 'bg-foreground border-foreground' : isOverdue ? 'border-red-500/50 group-hover:border-red-500' : 'border-border group-hover:border-primary'
                  )}
                >
                  {task.status === 'done' && <Check className="h-3.5 w-3.5 text-background stroke-[2.5]" />}
                </div>

                <div className="flex-1 min-w-0">
                  {editingTaskId === task.id ? (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.stopPropagation();
                            if (editingTitle.trim()) {
                              updateTaskMutation.mutate({ ...task, title: editingTitle.trim() });
                            }
                            setEditingTaskId(null);
                          } else if (e.key === 'Escape') {
                            e.stopPropagation();
                            setEditingTaskId(null);
                          }
                        }}
                        className="w-full bg-background border border-border/80 px-3 py-1.5 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary/50 text-foreground"
                        autoFocus
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (editingTitle.trim()) {
                            updateTaskMutation.mutate({ ...task, title: editingTitle.trim() });
                          }
                          setEditingTaskId(null);
                        }}
                        className="px-3 py-1.5 bg-primary/20 text-foreground border border-primary/30 text-xs font-bold rounded-xl hover:bg-primary/30 shrink-0"
                      >
                        Lưu
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTaskId(null);
                        }}
                        className="px-3 py-1.5 bg-muted text-muted-foreground border border-border text-xs font-bold rounded-xl hover:bg-muted/80 shrink-0"
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <h4
                      className={cn(
                        'font-semibold text-base flex items-center gap-2 transition-all',
                        task.status === 'done' ? 'text-muted-foreground line-through' : isOverdue ? 'text-red-600' : 'text-foreground group-hover:text-primary'
                      )}
                    >
                      <span className="truncate">{task.title}</span>
                      {isOverdue && <span className="text-[10px] uppercase tracking-wider font-extrabold text-red-500 flex items-center gap-1 shrink-0"><AlertCircle className="w-3 h-3" /> Quá hạn</span>}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTaskId(task.id);
                          setEditingTitle(task.title);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-all text-muted-foreground/50 hover:text-primary shrink-0"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                    </h4>
                  )}

                  <div className="flex items-center flex-wrap gap-4 mt-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <span
                      className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer relative"
                      onClick={(e) => e.stopPropagation()}
                      title="Chọn ngày để đưa công việc vào lịch trình"
                    >
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span className="text-[10px] text-muted-foreground/70 font-bold uppercase tracking-wide">Lịch:</span>
                      <input
                        type="date"
                        value={task.due_date ? dayjs(task.due_date).format('YYYY-MM-DD') : ''}
                        onChange={(e) => {
                          e.stopPropagation();
                          const val = e.target.value;
                          const oldTime = task.due_date ? dayjs(task.due_date).format('HH:mm:ss') : '23:59:59';
                          updateTaskMutation.mutate({ ...task, due_date: val ? `${val} ${oldTime}` : null });
                        }}
                        className="bg-transparent border-none text-[11px] font-bold text-muted-foreground uppercase outline-none cursor-pointer w-[105px] p-0 focus:ring-0 focus:outline-none focus:border-none"
                      />
                    </span>

                    <span
                      className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer relative"
                      onClick={(e) => e.stopPropagation()}
                      title="Đặt giờ để công việc xuất hiện đúng khung giờ trong lịch trình"
                    >
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span className="text-[10px] text-muted-foreground/70 font-bold uppercase tracking-wide">Giờ:</span>
                      <input
                        type="time"
                        value={task.due_date && dayjs(task.due_date).format('HH:mm') !== '23:59' ? dayjs(task.due_date).format('HH:mm') : ''}
                        onChange={(e) => {
                          e.stopPropagation();
                          const val = e.target.value;
                          const datePart = task.due_date ? dayjs(task.due_date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
                          updateTaskMutation.mutate({ ...task, due_date: val ? `${datePart} ${val}:00` : `${datePart} 23:59:59` });
                        }}
                        className="bg-transparent border-none text-[11px] font-bold text-muted-foreground uppercase outline-none cursor-pointer w-[60px] p-0 focus:ring-0 focus:outline-none focus:border-none"
                      />
                    </span>

                    {task.due_date ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-normal uppercase border bg-primary/10 text-primary border-primary/20 shrink-0">
                        Đã lên lịch
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-normal uppercase border bg-muted text-muted-foreground border-border shrink-0">
                        Chưa lên lịch
                      </span>
                    )}

                    <span className="text-[10px] text-muted-foreground/70 normal-case tracking-normal">
                      Đặt ngày/giờ để hiển thị trong lịch trình Dashboard
                    </span>

                    <span
                      className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Flag className="h-3.5 w-3.5 shrink-0" />
                      <select
                        value={task.priority || '2'}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateTaskMutation.mutate({ ...task, priority: e.target.value });
                        }}
                        className="bg-transparent border-none text-[11px] font-bold text-muted-foreground uppercase outline-none cursor-pointer p-0 focus:ring-0 focus:outline-none focus:border-none w-24"
                      >
                        <option value="1" className="text-foreground bg-card">Ưu tiên: 1</option>
                        <option value="2" className="text-foreground bg-card">Ưu tiên: 2</option>
                        <option value="3" className="text-foreground bg-card">Ưu tiên: 3</option>
                      </select>
                    </span>

                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-normal uppercase border transition-all shrink-0',
                        sourceInfo.className
                      )}
                    >
                      <SourceIcon className="h-3 w-3" />
                      {sourceInfo.label}
                    </span>
                  </div>
                </div>

                <MoreVertical className="h-4 w-4 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-32 rounded-[3rem] border border-dashed border-border/70 bg-muted/30">
            <Inbox className="h-10 w-10 text-muted-foreground/20 mb-4" />
            <p className="text-sm text-muted-foreground font-medium">Không có công việc nào</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 z-50">
        <div className="bg-white border-2 border-slate-300 rounded-[2rem] p-2 shadow-[0_20px_44px_rgba(15,23,42,0.14)] flex items-center gap-2">
          <input
            type="text"
            placeholder="Ghi nhanh việc cần làm..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={handleQuickAdd}
            className="flex-1 rounded-[1.35rem] bg-white px-4 py-3 text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground/50 shadow-inner shadow-slate-200/60"
          />
          <Button
            size="sm"
            onClick={handleQuickAdd}
            disabled={!newTaskTitle.trim()}
            className="rounded-full px-8 h-10 font-bold shadow-sm shadow-primary/15"
          >
            Thêm
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
