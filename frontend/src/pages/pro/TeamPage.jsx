import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { useAuthStore } from '../../stores/authStore';
import { workspaceApi, inviteApi } from '../../api/pro';
import { Users, CheckSquare, Calendar, Settings, ArrowLeft, Plus, X, Tag, List, Trash2, LogOut } from 'lucide-react';
import Skeleton from '../../components/ui/Skeleton';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Button from '../../components/ui/Button';

// Workspace Components
import WorkspaceTaskBoard from '../../components/workspace/WorkspaceTaskBoard';
import WorkspaceCalendar from '../../components/workspace/WorkspaceCalendar';
import ConfirmActionDialog from '../../components/workspace/ConfirmActionDialog';

const TeamPage = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [workspace, setWorkspace] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks');
  const [isLoading, setIsLoading] = useState(true);

  const queryClient = useQueryClient();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [wsName, setWsName] = useState('');
  const [wsDesc, setWsDesc] = useState('');
  
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchDetail = async () => {
    try {
      setIsLoading(true);
      const data = await workspaceApi.getDetail(id);
      setWorkspace(data);
      setWsName(data.name);
      setWsDesc(data.description || '');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const { data: wsTasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['workspaceTasks', id],
    queryFn: () => workspaceApi.getTasks(id),
    enabled: !!id
  });

  const inviteMutation = useMutation({
    mutationFn: (email) => inviteApi.inviteMember(id, email),
    onSuccess: () => {
      toast.success('Đã gửi lời mời thành công');
      setInviteEmail('');
      setShowInviteForm(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi khi gửi lời mời')
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId) => workspaceApi.removeMember(id, userId),
    onSuccess: () => {
      toast.success('Đã xóa thành viên');
      fetchDetail();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi khi xóa thành viên')
  });

  const updateWorkspaceMutation = useMutation({
    mutationFn: (data) => workspaceApi.update(id, data),
    onSuccess: () => {
      toast.success('Đã cập nhật Workspace');
      fetchDetail();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi khi cập nhật')
  });

  const leaveWorkspaceMutation = useMutation({
    mutationFn: () => workspaceApi.removeMember(id, user.id),
    onSuccess: () => {
      toast.success('Đã rời khỏi Workspace');
      window.location.href = '/workspaces';
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi khi rời Workspace')
  });

  const deleteWorkspaceMutation = useMutation({
    mutationFn: () => workspaceApi.delete(id),
    onSuccess: () => {
      toast.success('Đã xóa Workspace thành công');
      window.location.href = '/workspaces';
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi khi xóa Workspace')
  });

  if (isLoading) return <div className="p-8"><Skeleton className="h-40 w-full mb-8 rounded-2xl" /></div>;
  if (!workspace) return <div className="p-8 text-center text-muted-foreground">Không tìm thấy Workspace</div>;

  const isAdminOrOwner = workspace.myRole === 'owner' || workspace.myRole === 'admin';

  return (
    <div className="max-w-7xl mx-auto py-6">
      {/* Compact Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link to="/workspaces" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors">
            <ArrowLeft className="h-3 w-3" /> Quay lại Workspace
          </Link>
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0" style={{ backgroundColor: workspace.color || '#6366f1' }}>
              {workspace.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground leading-tight">{workspace.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-muted-foreground">{workspace.members?.length || 0} thành viên</span>
                <span className="w-1 h-1 rounded-full bg-border/80"></span>
                <span className="text-xs font-medium text-primary uppercase">{workspace.myRole}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border/50 mb-6 flex overflow-x-auto custom-scrollbar gap-2">
        {[
          { id: 'tasks', label: 'Bảng Công việc', icon: List },
          { id: 'calendar', label: 'Lịch trình', icon: Calendar },
          { id: 'members', label: 'Thành viên', icon: Users },
          { id: 'settings', label: 'Cài đặt', icon: Settings }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-primary text-primary bg-primary/5 rounded-t-lg' 
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-t-lg'
            }`}
          >
            <tab.icon className="h-4 w-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-card/50 rounded-2xl min-h-[400px]">
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            {tasksLoading ? (
              <div className="py-10 text-center"><Skeleton className="h-40 w-full rounded-2xl" /></div>
            ) : (
              <WorkspaceTaskBoard 
                tasks={wsTasks} 
                members={workspace.members} 
                workspaceId={id} 
                myRole={workspace.myRole}
                currentUserId={user?.id}
              />
            )}
          </div>
        )}

        {activeTab === 'calendar' && (
            <div className="p-6 bg-card border border-border/50 rounded-2xl">
             <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
               <Calendar className="h-5 w-5 text-primary" /> Lịch trình công việc nhóm
             </h3>
             {tasksLoading ? (
               <Skeleton className="h-64 w-full rounded-2xl" />
             ) : (
               <WorkspaceCalendar tasks={wsTasks} members={workspace.members} workspaceId={id} />
             )}
           </div>
        )}
        
        {activeTab === 'members' && (
          <div className="p-6 bg-card border border-border/50 rounded-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Thành viên Workspace</h3>
              {isAdminOrOwner && (
                <button 
                  onClick={() => setShowInviteForm(!showInviteForm)}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  {showInviteForm ? 'Hủy' : '+ Mời thành viên'}
                </button>
              )}
            </div>

            {showInviteForm && (
              <div className="mb-6 p-5 bg-card border border-primary/20 rounded-2xl shadow-sm">
                <h4 className="font-semibold text-sm mb-3">Mời thành viên mới qua Email</h4>
                <div className="flex gap-3">
                  <input 
                    type="email" 
                    placeholder="Nhập email người cần mời..." 
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1 bg-accent border border-border/50 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                  />
                  <Button 
                    onClick={() => inviteMutation.mutate(inviteEmail)}
                    disabled={!inviteEmail || inviteMutation.isPending}
                    className="rounded-xl"
                  >
                    {inviteMutation.isPending ? 'Đang gửi...' : 'Gửi lời mời'}
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {workspace.members?.map(m => (
                <div key={m.id} className="flex items-center justify-between p-4 bg-accent/30 border border-border/50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-accent text-foreground rounded-lg flex items-center justify-center font-bold border border-border">
                       {m.display_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{m.display_name} {m.id === workspace.owner_id ? '(Bạn)' : ''}</p>
                      <p className="text-xs text-muted-foreground">{m.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                      m.role === 'owner' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' : 
                      m.role === 'admin' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 
                      'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                    }`}>
                      {m.role}
                    </span>
                    {isAdminOrOwner && m.role !== 'owner' && (
                      <button 
                        onClick={() => {
                          if (window.confirm(`Bạn có chắc muốn xóa ${m.display_name} khỏi workspace này?`)) {
                            removeMemberMutation.mutate(m.id);
                          }
                        }}
                        disabled={removeMemberMutation.isPending}
                        className="text-xs text-destructive hover:underline"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'settings' && (
           <div className="p-6 bg-card border border-border/50 rounded-2xl">
             <h3 className="text-lg font-semibold mb-4">Cài đặt Workspace</h3>
             <p className="text-muted-foreground text-sm mb-6">Thay đổi thông tin workspace.</p>
             {isAdminOrOwner ? (
                <div className="max-w-md space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tên Workspace</label>
                    <input 
                      type="text" 
                      className="w-full bg-accent border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" 
                      value={wsName} 
                      onChange={(e) => setWsName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Mô tả</label>
                    <textarea 
                      className="w-full bg-accent border border-border rounded-lg px-3 py-2 text-sm h-24 focus:outline-none focus:border-primary" 
                      value={wsDesc}
                      onChange={(e) => setWsDesc(e.target.value)}
                    ></textarea>
                  </div>
                  <Button 
                    onClick={() => updateWorkspaceMutation.mutate({ name: wsName, description: wsDesc })}
                    disabled={updateWorkspaceMutation.isPending || (!wsName.trim())}
                    className="rounded-xl px-6"
                  >
                    {updateWorkspaceMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                   </Button>
                </div>
             ) : (
               <div className="p-4 bg-accent/50 text-muted-foreground text-sm rounded-lg mb-6">Bạn không có quyền thay đổi cài đặt workspace.</div>
             )}

             {/* Danger Zone */}
             <div className="mt-12 pt-8 border-t border-red-500/20">
               <h4 className="text-red-500 font-semibold mb-4">Vùng nguy hiểm (Danger Zone)</h4>
               <div className="space-y-4">
                 
                 {/* Chỉ Member/Admin mới có nút Rời nhóm */}
                 {workspace.myRole !== 'owner' && (
                   <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-red-500/5 border border-red-500/20 rounded-xl gap-4">
                     <div>
                       <p className="font-semibold text-foreground text-sm mb-1">Rời khỏi Workspace</p>
                       <p className="text-xs text-muted-foreground">Bạn sẽ mất quyền truy cập vào các công việc và dữ liệu trong nhóm này.</p>
                     </div>
                     <button 
                       onClick={() => setShowLeaveConfirm(true)}
                       className="shrink-0 flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-lg text-sm font-medium transition-colors"
                     >
                       <LogOut className="w-4 h-4" /> Rời nhóm
                     </button>
                   </div>
                 )}

                 {/* Chỉ Owner mới có nút Xóa nhóm */}
                 {workspace.myRole === 'owner' && (
                   <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-red-500/5 border border-red-500/20 rounded-xl gap-4">
                     <div>
                       <p className="font-semibold text-foreground text-sm mb-1">Xóa Workspace</p>
                       <p className="text-xs text-muted-foreground">Hành động này không thể hoàn tác. Toàn bộ công việc, thành viên và dữ liệu sẽ bị xóa sạch.</p>
                     </div>
                     <button 
                       onClick={() => setShowDeleteConfirm(true)}
                       className="shrink-0 flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
                     >
                       <Trash2 className="w-4 h-4" /> Xóa nhóm
                     </button>
                   </div>
                 )}
               </div>
             </div>
           </div>
        )}
      </div>

      <ConfirmActionDialog 
        isOpen={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        onConfirm={() => leaveWorkspaceMutation.mutate()}
        title="Xác nhận rời Workspace"
        message={`Bạn có chắc chắn muốn rời khỏi Workspace "${workspace.name}" không? Bạn sẽ không thể truy cập lại dữ liệu trừ khi được mời lại.`}
        confirmText="Vâng, Rời nhóm"
        isLoading={leaveWorkspaceMutation.isPending}
      />

      <ConfirmActionDialog 
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => deleteWorkspaceMutation.mutate()}
        title="Xác nhận Xóa Workspace"
        message={`Hành động này KHÔNG THỂ HOÀN TÁC! Bạn có chắc chắn muốn xóa vĩnh viễn Workspace "${workspace.name}" cùng với toàn bộ dữ liệu, công việc và bình luận bên trong không?`}
        confirmText="Tôi chắc chắn, Xóa vĩnh viễn"
        isLoading={deleteWorkspaceMutation.isPending}
      />
    </div>
  );
};

export default TeamPage;
