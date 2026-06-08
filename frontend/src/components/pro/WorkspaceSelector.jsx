import React, { useEffect, useState } from 'react';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { useAuthStore } from '../../stores/authStore';
import { ChevronDown, Check, User, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WorkspaceSelector = () => {
  const { user } = useAuthStore();
  const { workspaces, activeWorkspaceId, setActiveWorkspaceId, fetchWorkspaces } = useWorkspaceStore();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.plan === 'pro' || user?.plan === 'enterprise') {
      fetchWorkspaces();
    }
  }, [user, fetchWorkspaces]);

  if (!user || user.plan === 'free') return null;

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-accent/50 hover:bg-accent border border-border/50 rounded-xl transition-colors text-sm font-medium text-foreground"
      >
        {activeWorkspaceId === null ? (
          <><User className="h-4 w-4 text-primary" /> Cá nhân</>
        ) : (
          <><Users className="h-4 w-4" style={{ color: activeWorkspace?.color || '#6366f1' }} /> {activeWorkspace?.name}</>
        )}
        <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border shadow-xl rounded-xl py-2 z-50 overflow-hidden">
            <div className="px-3 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
               Không gian làm việc
            </div>
            
            <button 
              onClick={() => { setActiveWorkspaceId(null); setIsOpen(false); navigate('/dashboard'); }}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-primary/10 text-primary flex items-center justify-center">
                  <User className="h-3.5 w-3.5" />
                </div>
                <span>Cá nhân</span>
              </div>
              {activeWorkspaceId === null && <Check className="h-4 w-4 text-primary" />}
            </button>

            {workspaces.length > 0 && <div className="border-t border-border/50 my-1"></div>}
            
            {workspaces.map(ws => (
              <button 
                key={ws.id}
                onClick={() => { setActiveWorkspaceId(ws.id); setIsOpen(false); navigate(`/workspaces/${ws.id}`); }}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="h-6 w-6 rounded flex items-center justify-center text-white font-bold text-xs shrink-0" style={{ backgroundColor: ws.color || '#6366f1' }}>
                    {ws.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate">{ws.name}</span>
                </div>
                {activeWorkspaceId === ws.id && <Check className="h-4 w-4 text-primary shrink-0" />}
              </button>
            ))}

            <div className="border-t border-border/50 my-1"></div>
            <button 
              onClick={() => { setIsOpen(false); navigate('/workspaces'); }}
              className="w-full text-left px-4 py-2 text-sm text-primary hover:bg-primary/5 transition-colors font-medium"
            >
              Quản lý Workspaces
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default WorkspaceSelector;
