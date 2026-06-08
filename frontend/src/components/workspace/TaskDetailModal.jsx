import React, { useState, useEffect, useRef } from 'react';
import { X, MessageSquare, Send, Clock, User as UserIcon, Calendar, CheckCircle2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceApi } from '../../api/pro';
import dayjs from '../../lib/dateFormat';
import { toast } from 'sonner';
import { useAuthStore } from '../../stores/authStore';

const TaskDetailModal = ({ isOpen, onClose, task, workspaceId }) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [comment, setComment] = useState('');
  const commentsEndRef = useRef(null);
  const commentInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && task?.focusComment && commentInputRef.current) {
      setTimeout(() => {
        commentInputRef.current?.focus();
      }, 200);
    }
  }, [isOpen, task]);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['taskComments', workspaceId, task?.id],
    queryFn: () => workspaceApi.getTaskComments(workspaceId, task.id),
    enabled: isOpen && !!task?.id,
  });

  const commentMutation = useMutation({
    mutationFn: (content) => workspaceApi.createTaskComment(workspaceId, task.id, content),
    onSuccess: () => {
      setComment('');
      queryClient.invalidateQueries(['taskComments', workspaceId, task.id]);
      queryClient.invalidateQueries(['workspaceTasks', workspaceId]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Lỗi khi gửi bình luận');
    }
  });

  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments]);

  if (!isOpen || !task) return null;

  const handleSendComment = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    commentMutation.mutate(comment);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6">
      <div className="bg-card w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2.5 py-1 text-xs font-bold rounded-md uppercase tracking-wider ${
                task.status === 'done' ? 'bg-emerald-500/10 text-emerald-600' : 
                task.status === 'in_progress' ? 'bg-blue-500/10 text-blue-600' : 'bg-slate-500/10 text-slate-500'
              }`}>
                {task.status === 'done' ? 'Đã xong' : task.status === 'in_progress' ? 'Đang làm' : 'Cần làm'}
              </span>
              {task.priority === '1' && <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2.5 py-1 rounded-md">Cao</span>}
            </div>
            <h2 className="text-xl font-bold text-foreground leading-tight">{task.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-muted/10 p-6 flex flex-col gap-6">
          {/* Task Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card p-4 rounded-xl border border-border/50 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground mb-1 text-sm">
                <Calendar className="w-4 h-4" /> Hạn chót
              </div>
              <p className="font-semibold text-foreground">
                {task.due_date ? dayjs(task.due_date).format('DD/MM/YYYY HH:mm') : 'Không có hạn'}
              </p>
            </div>
            <div className="bg-card p-4 rounded-xl border border-border/50 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground mb-1 text-sm">
                <UserIcon className="w-4 h-4" /> Người thực hiện
              </div>
              <p className="font-semibold text-foreground">
                {task.assigned_to === user?.id ? 'Bạn' : (task.assignee_name || 'Chưa giao')}
              </p>
            </div>
          </div>

          {task.description && (
            <div className="bg-card p-5 rounded-xl border border-border/50 shadow-sm">
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                Chi tiết công việc
              </h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {task.description}
              </p>
            </div>
          )}

          {/* Comments Section */}
          <div className="flex-1 flex flex-col bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden min-h-[300px]">
            <div className="p-4 border-b border-border bg-muted/20">
              <h4 className="font-semibold flex items-center gap-2 text-foreground">
                <MessageSquare className="w-4 h-4 text-primary" /> 
                Ghi chú / Thảo luận
              </h4>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></span>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-8">
                  Chưa có ghi chú nào. Hãy là người đầu tiên!
                </div>
              ) : (
                comments.map(c => {
                  const isYou = c.user_id === user?.id;
                  return (
                  <div key={c.id} className={`flex gap-3 ${isYou ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border ${
                      isYou ? 'bg-primary text-primary-foreground border-primary' : 'bg-primary/10 text-primary border-primary/20'
                    }`}>
                      {isYou ? (user?.display_name?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase() : (c.display_name?.charAt(0) || 'U').toUpperCase()}
                    </div>
                    <div className={`flex-1 flex flex-col ${isYou ? 'items-end' : 'items-start'}`}>
                      <div className={`flex items-baseline gap-2 mb-1 ${isYou ? 'flex-row-reverse' : ''}`}>
                        <span className="font-semibold text-sm text-foreground">
                          {isYou ? 'Bạn' : c.display_name}
                        </span>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {dayjs(c.created_at).format('HH:mm DD/MM')}
                        </span>
                      </div>
                      <div className={`p-3 text-sm border inline-block max-w-[90%] ${
                        isYou 
                          ? 'bg-primary text-primary-foreground border-primary rounded-2xl rounded-tr-none' 
                          : 'bg-muted/40 text-foreground border-border/50 rounded-2xl rounded-tl-none'
                      }`}>
                        <p className="whitespace-pre-wrap">{c.content}</p>
                      </div>
                    </div>
                  </div>
                  );
                })
              )}
              <div ref={commentsEndRef} />
            </div>

            {/* Comment Input */}
            <form onSubmit={handleSendComment} className="p-4 border-t border-border bg-background">
              <div className="relative flex items-center">
                <input
                  ref={commentInputRef}
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Thêm ghi chú của bạn..."
                  className="w-full bg-muted/50 border border-border rounded-full pl-5 pr-12 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                />
                <button 
                  type="submit" 
                  disabled={!comment.trim() || commentMutation.isPending}
                  className="absolute right-2 p-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
