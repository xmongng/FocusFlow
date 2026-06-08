import React, { useState } from 'react';
import dayjs from '../../lib/dateFormat';
import { Calendar, Clock, CheckCircle2, Filter, MessageSquare } from 'lucide-react';
import TaskDetailModal from './TaskDetailModal';
import { useAuthStore } from '../../stores/authStore';

const WorkspaceCalendar = ({ tasks, members, workspaceId }) => {
  const { user } = useAuthStore();
  const [filterMember, setFilterMember] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);

  // Filter tasks that have due dates and sort them
  const scheduledTasks = tasks
    .filter(t => t.due_date)
    .filter(t => {
      if (filterMember === 'all') return true;
      if (filterMember === 'unassigned') return !t.assigned_to;
      return t.assigned_to === parseInt(filterMember);
    })
    .filter(t => {
      if (filterStatus === 'all') return true;
      if (filterStatus === 'done') return t.status === 'done';
      if (filterStatus === 'pending') return t.status !== 'done';
      return true;
    })
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

  // Group by date
  const groupedTasks = scheduledTasks.reduce((acc, task) => {
    const dateKey = dayjs(task.due_date).format('YYYY-MM-DD');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(task);
    return acc;
  }, {});

  const dates = Object.keys(groupedTasks);



  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 bg-card p-3 rounded-xl border border-border/50">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Lọc theo:</span>
        </div>
        <select 
          value={filterMember}
          onChange={(e) => setFilterMember(e.target.value)}
          className="text-sm px-3 py-1.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-auto"
        >
          <option value="all">Lịch chung (Tất cả)</option>
          <option value="unassigned">Chưa giao</option>
          {members?.map(m => (
            <option key={m.id} value={m.id}>Lịch của {m.id === user?.id ? 'Bạn' : m.display_name}</option>
          ))}
        </select>

        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-sm px-3 py-1.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-auto"
        >
          <option value="all">Mọi trạng thái</option>
          <option value="pending">Chưa xong (Đang làm/Chờ)</option>
          <option value="done">Đã hoàn thành</option>
        </select>
      </div>

      {dates.length === 0 ? (
        <div className="py-10 text-center rounded-[2rem] border border-dashed border-border/70 bg-muted/30">
          <Calendar className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Chưa có công việc nào được lên lịch.</p>
        </div>
      ) : (
        dates.map(date => {
        const isToday = date === dayjs().format('YYYY-MM-DD');
        const isPast = dayjs(date).isBefore(dayjs(), 'day');
        const tasksForDate = groupedTasks[date];
        const completedCount = tasksForDate.filter(t => t.status === 'done').length;
        const totalCount = tasksForDate.length;
        const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
        
        return (
          <div key={date} className="relative pl-4 border-l-2 border-border/50 pb-6 last:pb-0">
            <div className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-4 border-card ${
              isToday ? 'bg-primary' : isPast ? 'bg-muted-foreground/50' : 'bg-primary/50'
            }`} />
            
            <div className="mb-4">
              <div className="flex items-center justify-between gap-4 mb-2">
                <h4 className={`text-sm font-bold ${isToday ? 'text-primary' : isPast ? 'text-muted-foreground' : 'text-foreground'}`}>
                  {isToday ? 'Hôm nay' : dayjs(date).format('DD/MM/YYYY')}
                </h4>
                <div className="text-xs font-medium text-muted-foreground">
                  {completedCount}/{totalCount} hoàn thành
                </div>
              </div>
              <div className="h-1.5 w-full bg-accent rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${progressPercentage === 100 ? 'bg-emerald-500' : 'bg-primary'}`} 
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              {tasksForDate.map(task => (
                <div 
                  key={task.id} 
                  onClick={() => setSelectedTask(task)}
                  className={`flex items-start gap-3 p-3 rounded-xl border bg-card cursor-pointer hover:border-primary/50 transition-colors ${
                  task.status === 'done' ? 'border-border/40 opacity-70' : 
                  isPast ? 'border-red-500/30 bg-red-500/5' : 'border-border/80'
                }`}>
                  <div className="mt-0.5">
                    {task.status === 'done' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Clock className={`h-4 w-4 ${isPast ? 'text-red-500' : 'text-primary'}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold flex items-center gap-2 ${task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {task.title}
                      {task.comment_count > 0 && (
                        <span className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">
                          <MessageSquare className="w-3 h-3" /> {task.comment_count}
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {dayjs(task.due_date).format('HH:mm')}
                      </span>
                      <span className="text-muted-foreground text-xs">•</span>
                      <div className="flex items-center gap-1.5">
                        {task.assignee_name ? (
                          <>
                            <div className="h-4 w-4 rounded-sm bg-primary/10 text-primary flex items-center justify-center text-[8px] font-bold">
                              {task.assigned_to === user?.id ? 'B' : task.assignee_name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs font-medium text-foreground">
                              {task.assigned_to === user?.id ? 'Bạn' : task.assignee_name}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs font-medium text-muted-foreground">Chưa giao</span>
                        )}
                      </div>
                      <span className="text-muted-foreground text-xs">•</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${
                        task.status === 'done' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {task.status === 'done' ? 'Đã xong' : 'Chưa xong'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }))}
      
      <TaskDetailModal 
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        workspaceId={workspaceId}
      />
    </div>
  );
};

export default WorkspaceCalendar;
