import React, { useState } from 'react';
import { CheckCircle2, Clock, Flag, User as UserIcon, Plus, Trash2, Edit2, X, MessageSquare } from 'lucide-react';
import dayjs from '../../lib/dateFormat';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceApi } from '../../api/pro';
import { toast } from 'sonner';
import Button from '../ui/Button';
import Dialog from '../ui/Dialog';
import TaskDetailModal from './TaskDetailModal';

const WorkspaceTaskBoard = ({ tasks, members, workspaceId, myRole, currentUserId }) => {
  const queryClient = useQueryClient();
  const [filterMember, setFilterMember] = useState('all');
  const [isCreatingBatch, setIsCreatingBatch] = useState(false);
  const [batchTasks, setBatchTasks] = useState([{ title: '', assigned_to: '', due_date: '' }]);
  const [selectedTask, setSelectedTask] = useState(null);

  const isAdminOrOwner = myRole === 'owner' || myRole === 'admin';

  // Nếu không phải là admin/owner, chỉ thấy task được giao cho chính mình
  const allowedTasks = isAdminOrOwner 
    ? tasks 
    : tasks.filter(t => t.assigned_to === currentUserId);

  const filteredTasks = allowedTasks.filter(t => {
    if (filterMember === 'all') return true;
    if (filterMember === 'unassigned') return !t.assigned_to;
    return t.assigned_to === parseInt(filterMember);
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }) => workspaceApi.updateTask(workspaceId, taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['workspaceTasks', workspaceId]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Không thể cập nhật công việc');
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId) => workspaceApi.deleteTask(workspaceId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries(['workspaceTasks', workspaceId]);
      toast.success('Đã xóa công việc');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Không thể xóa công việc');
    }
  });

  const createBatchMutation = useMutation({
    mutationFn: (tasksData) => workspaceApi.createBatchTasks(workspaceId, tasksData),
    onSuccess: () => {
      queryClient.invalidateQueries(['workspaceTasks', workspaceId]);
      toast.success('Đã tạo danh sách công việc');
      setIsCreatingBatch(false);
      setBatchTasks([{ title: '', assigned_to: '', due_date: '' }]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Lỗi khi tạo công việc');
    }
  });

  const handleUpdateField = (taskId, field, value) => {
    updateTaskMutation.mutate({ taskId, data: { [field]: value } });
  };

  const addBatchRow = () => {
    setBatchTasks([...batchTasks, { title: '', assigned_to: '', due_date: '' }]);
  };

  const updateBatchRow = (index, field, value) => {
    const newTasks = [...batchTasks];
    newTasks[index][field] = value;
    setBatchTasks(newTasks);
  };

  const removeBatchRow = (index) => {
    const newTasks = [...batchTasks];
    newTasks.splice(index, 1);
    setBatchTasks(newTasks);
    if (newTasks.length === 0) setIsCreatingBatch(false);
  };

  const submitBatchTasks = () => {
    const validTasks = batchTasks.filter(t => t.title.trim() !== '');
    if (validTasks.length === 0) {
      toast.error('Vui lòng nhập ít nhất một công việc');
      return;
    }
    
    const formattedTasks = validTasks.map(t => ({
      ...t,
      due_date: t.due_date ? `${t.due_date} 23:59:59` : null
    }));
    
    createBatchMutation.mutate(formattedTasks);
  };

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 p-4 bg-card rounded-xl border border-border/50">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Lọc theo:</span>
          <select 
            value={filterMember}
            onChange={(e) => setFilterMember(e.target.value)}
            className="text-sm px-3 py-1.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">Tất cả thành viên</option>
            <option value="unassigned">Chưa giao</option>
            {members?.map(m => (
              <option key={m.id} value={m.id}>{m.id === currentUserId ? 'Bạn' : m.display_name}</option>
            ))}
          </select>
        </div>
        
        {isAdminOrOwner && (
          <Button onClick={() => setIsCreatingBatch(true)} className="rounded-xl h-9">
            <Plus className="h-4 w-4 mr-2" /> Tạo danh sách công việc
          </Button>
        )}
      </div>

      <Dialog
        open={isCreatingBatch}
        onOpenChange={setIsCreatingBatch}
        title="Tạo danh sách công việc"
        description="Nhập nhiều công việc cùng lúc để giao nhanh cho các thành viên trong nhóm."
        className="max-w-4xl w-[90vw]"
      >
        <div className="space-y-4 pt-4">
          <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
            {batchTasks.map((task, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-accent/20 p-3 rounded-xl border border-border/50">
                <div className="flex-1 min-w-0 w-full">
                  <input 
                    type="text" 
                    placeholder={`Tên công việc ${idx + 1}...`}
                    value={task.title}
                    onChange={(e) => updateBatchRow(idx, 'title', e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="w-full sm:w-48 shrink-0">
                  <select 
                    value={task.assigned_to}
                    onChange={(e) => updateBatchRow(idx, 'assigned_to', e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="">Người nhận (Tùy chọn)</option>
                    {members?.map(m => (
                      <option key={m.id} value={m.id}>{m.id === currentUserId ? 'Bạn' : m.display_name}</option>
                    ))}
                  </select>
                </div>
                <div className="w-full sm:w-44 shrink-0">
                  <input 
                    type="date" 
                    value={task.due_date}
                    onChange={(e) => updateBatchRow(idx, 'due_date', e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <button 
                  onClick={() => removeBatchRow(idx)}
                  className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors shrink-0"
                  title="Xóa dòng"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between items-center pt-2 border-t border-border/50">
            <Button variant="outline" onClick={addBatchRow} className="rounded-lg h-10">
              <Plus className="h-4 w-4 mr-2" /> Thêm dòng mới
            </Button>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setIsCreatingBatch(false)} className="rounded-lg h-10">
                Hủy
              </Button>
              <Button onClick={submitBatchTasks} disabled={createBatchMutation.isPending} className="rounded-lg h-10 px-6">
                {createBatchMutation.isPending ? 'Đang tạo...' : 'Tạo tất cả công việc'}
              </Button>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Task List */}
      <div className="overflow-x-auto rounded-xl border border-border/50 bg-card">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-accent/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium rounded-tl-xl w-8"></th>
              <th className="px-4 py-3 font-medium min-w-[200px]">Tên công việc</th>
              <th className="px-4 py-3 font-medium">Người thực hiện</th>
              <th className="px-4 py-3 font-medium">Deadline</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 font-medium rounded-tr-xl w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-muted-foreground">
                  Không có công việc nào.
                </td>
              </tr>
            ) : (
              filteredTasks.map(task => {
                const isOverdue = task.due_date && dayjs(task.due_date).isBefore(dayjs()) && task.status !== 'done';
                
                return (
                  <tr 
                    key={task.id} 
                    className={`group hover:bg-accent/30 transition-colors ${isOverdue ? 'bg-red-500/5' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => handleUpdateField(task.id, 'status', task.status === 'done' ? 'todo' : 'done')}
                        className={`h-5 w-5 rounded border flex items-center justify-center transition-colors ${
                          task.status === 'done' 
                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                            : 'border-border text-transparent hover:border-emerald-500 hover:text-emerald-500/50'
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                    <td className="px-4 py-3 max-w-[300px]">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setSelectedTask(task)}
                          className={`text-left font-medium truncate flex items-center gap-2 hover:underline hover:text-primary transition-colors ${task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                        >
                          {task.title}
                          {task.comment_count > 0 && (
                            <span className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">
                              <MessageSquare className="w-3 h-3" /> {task.comment_count}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTask({ ...task, focusComment: true });
                          }}
                          className="p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-all flex items-center gap-0.5 shrink-0 opacity-40 group-hover:opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                          title="Thêm ghi chú/bình luận"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {isAdminOrOwner ? (
                        <select
                          value={task.assigned_to || ''}
                          onChange={(e) => handleUpdateField(task.id, 'assigned_to', e.target.value || null)}
                          className="text-xs bg-transparent hover:bg-accent focus:bg-background border border-transparent focus:border-border rounded px-2 py-1 outline-none w-36"
                        >
                          <option value="">Chưa giao</option>
                          {members?.map(m => (
                            <option key={m.id} value={m.id}>{m.id === currentUserId ? 'Bạn' : m.display_name}</option>
                          ))}
                        </select>
                      ) : (
                        task.assignee_name ? (
                          <div className="flex items-center gap-2 px-2">
                            <div className="h-5 w-5 rounded bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-[9px] font-bold">
                              {task.assigned_to === currentUserId ? 'B' : task.assignee_name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs font-medium">{task.assigned_to === currentUserId ? 'Bạn' : task.assignee_name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground px-2">Chưa giao</span>
                        )
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isAdminOrOwner ? (
                        <input
                          type="date"
                          value={task.due_date ? dayjs(task.due_date).format('YYYY-MM-DD') : ''}
                          onChange={(e) => handleUpdateField(task.id, 'due_date', e.target.value ? `${e.target.value} 23:59:59` : null)}
                          className={`text-xs bg-transparent hover:bg-accent focus:bg-background border border-transparent focus:border-border rounded px-2 py-1 outline-none ${isOverdue ? 'text-red-500 font-medium' : ''}`}
                        />
                      ) : (
                        <div className={`text-xs px-2 ${isOverdue ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                          {task.due_date ? dayjs(task.due_date).format('DD/MM/YYYY') : '-'}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={task.status}
                        onChange={(e) => handleUpdateField(task.id, 'status', e.target.value)}
                        className={`text-xs font-medium px-2 py-1 rounded-md border appearance-none cursor-pointer outline-none ${
                          task.status === 'done' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                          task.status === 'in_progress' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                          'bg-accent text-foreground border-border'
                        }`}
                      >
                        <option value="todo">Chưa làm</option>
                        <option value="in_progress">Đang làm</option>
                        <option value="done">Hoàn thành</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isAdminOrOwner && (
                        <button 
                          onClick={() => {
                            if(window.confirm('Xóa công việc này?')) deleteTaskMutation.mutate(task.id);
                          }}
                          className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <TaskDetailModal 
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        workspaceId={workspaceId}
      />
    </div>
  );
};

export default WorkspaceTaskBoard;
