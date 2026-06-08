import React, { useState } from 'react';
import { Bot, Sparkles, User2, Pencil, Check, X, Calendar, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Skeleton from '../ui/Skeleton';
import Button from '../ui/Button';
import dayjs from '../../lib/dateFormat';
import { cn } from '../../lib/utils';

const roleConfig = {
  assistant: {
    icon: Bot,
    badge: 'FocusFlow Assistant',
    container: 'bg-card border-border/80 text-foreground',
    iconWrap: 'bg-accent border border-border/80 text-foreground',
  },
  user: {
    icon: User2,
    badge: 'Bạn',
    container: 'bg-accent/70 border-border/80 text-foreground ml-8 md:ml-16 self-end',
    iconWrap: 'bg-background border border-border text-foreground',
  },
  system: {
    icon: Sparkles,
    badge: 'Hệ thống',
    container: 'bg-muted/70 border-border/70 text-muted-foreground',
    iconWrap: 'bg-muted border border-border/80 text-muted-foreground',
  },
};

const MessageList = ({ 
  messages, 
  isThinking, 
  onUpdateBlock, 
  onCommitPlan, 
  committingMessageId 
}) => {
  const [editingBlockId, setEditingBlockId] = useState(null);

  const handleSaveEdit = (messageId, block, event) => {
    event.preventDefault();
    const newTitle = document.getElementById(`edit-title-${block.id}`).value;
    const updates = { 
      title: newTitle,
      startTime: document.getElementById(`edit-start-${block.id}`).value,
      priority: document.getElementById(`edit-priority-${block.id}`).value
    };
    
    onUpdateBlock(messageId, block.id, updates);
    setEditingBlockId(null);
  };

  const handleStatusChange = (messageId, blockId, status) => {
    onUpdateBlock(messageId, blockId, { status });
  };

  const handleAcceptAll = (messageId, blocks) => {
    blocks.forEach(b => {
      onUpdateBlock(messageId, b.id, { status: 'accepted' });
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {messages.map((message) => {
        const config = roleConfig[message.role] || roleConfig.assistant;
        const Icon = config.icon;
        const hasPlan = message.plan && message.blocksState && message.blocksState.length > 0;

        return (
          <div
            key={message.id}
            className={cn(
              'flex flex-col gap-3 rounded-[1.5rem] border p-4 shadow-sm shadow-slate-900/[0.03] transition-all',
              config.container,
              message.role === 'user' ? 'max-w-[85%] self-end' : 'w-full'
            )}
          >
            <div className="flex gap-3">
              <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl', config.iconWrap)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground/70">
                    {config.badge}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60">
                    {dayjs(message.ts).format('HH:mm')}
                  </span>
                </div>
                <div className="prose prose-sm max-w-none text-current/90 prose-p:leading-6 prose-headings:font-semibold prose-a:text-primary prose-table:border-collapse prose-th:border prose-th:border-border prose-th:p-2 prose-th:bg-muted/50 prose-td:border prose-td:border-border prose-td:p-2">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.text}
                  </ReactMarkdown>
                </div>
              </div>
            </div>

            {/* Render proposed plan inline if present */}
            {hasPlan && (
              <div className="mt-2 border-t border-border/80 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-xs text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    Đề xuất lịch trình ({dayjs(message.plan.targetDate).format('DD/MM/YYYY')})
                  </h4>
                  <button 
                    onClick={() => handleAcceptAll(message.id, message.blocksState)}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Chấp nhận tất cả
                  </button>
                </div>

                <div className="space-y-3">
                  {message.blocksState.map((block) => (
                    <div 
                      key={block.id}
                      className={cn(
                        "p-3 rounded-xl border transition-all text-sm",
                        block.status === 'accepted' ? 'border-green-500/40 bg-green-500/5' :
                        block.status === 'rejected' ? 'border-red-500/40 bg-red-500/5 opacity-70' :
                        'border-border bg-background'
                      )}
                    >
                      {editingBlockId === block.id ? (
                        <form onSubmit={(e) => handleSaveEdit(message.id, block, e)} className="space-y-3">
                          <div>
                            <label className="text-[10px] font-bold text-muted-foreground uppercase">Tiêu đề</label>
                            <input 
                              type="text" 
                              className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-primary outline-none"
                              defaultValue={block.title}
                              id={`edit-title-${block.id}`}
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-muted-foreground uppercase">Khung giờ</label>
                              <input type="time" id={`edit-start-${block.id}`} defaultValue={block.startTime} className="w-full bg-card border border-border rounded-lg px-2 py-1.5 text-sm" />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-muted-foreground uppercase">Độ ưu tiên</label>
                              <select id={`edit-priority-${block.id}`} defaultValue={block.priority || '2'} className="w-full bg-card border border-border rounded-lg px-2 py-1.5 text-sm">
                                <option value="1">1 - Cao</option>
                                <option value="2">2 - Trung bình</option>
                                <option value="3">3 - Thấp</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-1">
                            <Button type="button" variant="ghost" size="sm" onClick={() => setEditingBlockId(null)}>Hủy</Button>
                            <Button type="submit" size="sm">Lưu</Button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <h5 className="font-semibold text-foreground truncate">{block.title}</h5>
                            </div>
                            <div className="text-xs text-muted-foreground space-y-1">
                              {block.startTime && (
                                <p className="font-medium text-foreground/80">Khung giờ: {block.startTime}{block.endTime ? ` - ${block.endTime}` : ''}</p>
                              )}
                              <p className="font-medium text-foreground/80">
                                Độ ưu tiên: {block.priority === '1' ? '1 (Cao)' : block.priority === '2' ? '2 (Trung bình)' : '3 (Thấp)'}
                              </p>
                              {block.reason && <p className="italic text-[11px]">Lý do: {block.reason}</p>}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-muted-foreground/60 hover:bg-accent hover:text-foreground"
                              onClick={() => setEditingBlockId(block.id)}
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className={cn(
                                "h-7 w-7 transition-colors", 
                                block.status === 'accepted' 
                                  ? 'bg-emerald-500/10 text-emerald-600' 
                                  : 'text-muted-foreground/60 hover:text-emerald-600 hover:bg-emerald-500/5'
                              )}
                              onClick={() => handleStatusChange(message.id, block.id, block.status === 'accepted' ? 'pending' : 'accepted')}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className={cn(
                                "h-7 w-7 transition-colors", 
                                block.status === 'rejected' 
                                  ? 'bg-red-500/10 text-red-600' 
                                  : 'text-muted-foreground/60 hover:text-red-600 hover:bg-red-500/5'
                              )}
                              onClick={() => handleStatusChange(message.id, block.id, block.status === 'rejected' ? 'pending' : 'rejected')}
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <Button 
                    onClick={() => onCommitPlan(message.blocksState, message.plan.targetDate, message.id)}
                    disabled={committingMessageId === message.id || !message.blocksState.some(b => b.status === 'accepted')}
                    className="gap-2"
                  >
                    {committingMessageId === message.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Xác nhận và Lưu lịch trình
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {isThinking && (
        <div className="rounded-[1.5rem] border border-border/80 bg-card p-4 shadow-sm shadow-slate-900/[0.03]">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/80 bg-accent">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground/70">FocusFlow Assistant</p>
              <p className="text-xs text-muted-foreground animate-pulse">Đang suy nghĩ và phân tích yêu cầu của bạn...</p>
            </div>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4 rounded-full" />
            <Skeleton className="h-4 w-5/6 rounded-full" />
            <Skeleton className="h-20 w-full rounded-[1.25rem]" />
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageList;
