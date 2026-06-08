import React, { useEffect, useState } from 'react';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { useUiStore } from '../../stores/uiStore';
import { Plus, Users, Layout, MoreVertical, Check, X, Loader2 } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Skeleton from '../../components/ui/Skeleton';
import { inviteApi } from '../../api/pro';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const WorkspacePage = () => {
  const { workspaces, fetchWorkspaces, isLoading } = useWorkspaceStore();
  const { openModal } = useUiStore();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isAutoAccepting, setIsAutoAccepting] = useState(false);

  const { data: invites = [] } = useQuery({
    queryKey: ['my_invites'],
    queryFn: inviteApi.getMyInvites
  });

  const acceptMutation = useMutation({
    mutationFn: inviteApi.accept,
    onSuccess: () => {
      toast.success('Đã tham gia Workspace');
      queryClient.invalidateQueries(['my_invites']);
      fetchWorkspaces();
    }
  });

  const rejectMutation = useMutation({
    mutationFn: inviteApi.reject,
    onSuccess: () => {
      toast.success('Đã từ chối lời mời');
      queryClient.invalidateQueries(['my_invites']);
    }
  });

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  useEffect(() => {
    const token = searchParams.get('invite');
    if (token && invites.length > 0) {
      const pendingInvite = invites.find(i => i.token === token);
      if (pendingInvite && !acceptMutation.isPending && !isAutoAccepting) {
        setIsAutoAccepting(true);
        acceptMutation.mutate(token, {
          onSettled: () => {
            setIsAutoAccepting(false);
            navigate('/workspaces', { replace: true });
          }
        });
      }
    }
  }, [searchParams, invites, acceptMutation, navigate, isAutoAccepting]);

  return (
    <div className="max-w-6xl mx-auto py-8">
      {isAutoAccepting && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-lg font-medium">Đang tự động xác nhận lời mời...</p>
        </div>
      )}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Workspaces</h1>
          <p className="text-muted-foreground mt-1">Quản lý các không gian làm việc nhóm của bạn.</p>
        </div>
        <button onClick={() => openModal('workspaceForm')} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors shadow-sm">
          <Plus className="h-4 w-4" /> Tạo Workspace
        </button>
      </div>

      {invites.length > 0 && (
        <div className="mb-10 p-6 rounded-2xl bg-card border border-primary/20 shadow-sm">
          <h2 className="text-base font-bold text-foreground mb-4">Lời mời tham gia</h2>
          <div className="space-y-3">
            {invites.map(invite => (
              <div key={invite.id} className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors">
                <div>
                  <p className="font-semibold text-foreground">
                    <span className="text-primary">{invite.sender?.display_name || invite.sender?.email}</span> đã mời bạn tham gia <span className="font-bold">{invite.workspace?.name}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => acceptMutation.mutate(invite.token)}
                    disabled={acceptMutation.isPending}
                    className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 flex items-center justify-center transition-colors"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => rejectMutation.mutate(invite.token)}
                    disabled={rejectMutation.isPending}
                    className="h-8 w-8 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
      ) : workspaces.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border/50 rounded-2xl">
          <Layout className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Chưa có Workspace nào</h3>
          <p className="text-muted-foreground mb-6">Tạo workspace đầu tiên để bắt đầu làm việc nhóm.</p>
          <button onClick={() => openModal('workspaceForm')} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium text-sm mx-auto">
            <Plus className="h-4 w-4" /> Tạo Workspace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map(ws => (
            <Link key={ws.id} to={`/workspaces/${ws.id}`} className="block group">
              <div className="bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/50 transition-all hover:shadow-md cursor-pointer relative overflow-hidden h-full flex flex-col">
                <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: ws.color || '#6366f1' }}></div>
                
                <div className="flex justify-between items-start mb-4 mt-2">
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: ws.color || '#6366f1' }}>
                    {ws.name.charAt(0).toUpperCase()}
                  </div>
                  <button className="text-muted-foreground hover:text-foreground p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
                
                <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-1">{ws.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">
                  {ws.description || 'Không có mô tả.'}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 bg-accent rounded-md text-foreground">
                    <Users className="h-3.5 w-3.5" /> 
                    Vai trò: {ws.role === 'owner' ? 'Owner' : ws.role === 'admin' ? 'Admin' : 'Member'}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkspacePage;
