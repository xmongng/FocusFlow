import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  CheckSquare, 
  BarChart3, 
  Bot, 
  Settings, 
  LogOut, 
  Plus, 
  CalendarDays,
  Loader2,
  Users,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { useUiStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';
import { categoriesApi } from '../../api';
import { cn } from '../../lib/utils';

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Lịch", url: "/calendar", icon: Calendar },
  { title: "Công việc", url: "/tasks", icon: CheckSquare },
  { title: "Thống kê", url: "/analytics", icon: BarChart3 },
  { title: "Trợ lý AI", url: "/assistant", icon: Bot },
];

const workspaceNavItem = { title: "Workspaces", url: "/workspaces", icon: Users };

const Sidebar = () => {
  const { openModal, sidebarHovered: isHovered, setSidebarHovered: setIsHovered } = useUiStore();
  const { logout, user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(true);

  const { data: categories = [], isLoading: loadingCats } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const data = await categoriesApi.list();
      return data || [];
    },
    enabled: !!user,
  });

  return (
    <aside 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-border bg-card/95 transition-all duration-300",
        isHovered ? "w-72 shadow-xl" : "w-20"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center px-4 mb-2">
          <Link to="/" className={cn("flex items-center gap-3", isHovered ? "px-4" : "justify-center w-full")}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-foreground border border-border/80">
              <CalendarDays className="h-4 w-4" />
            </div>
            {isHovered && (
              <span className="text-xl font-bold tracking-tighter text-foreground">Calendar</span>
            )}
          </Link>
        </div>

        {/* Main Nav */}
        <nav className="flex-1 space-y-1 px-4 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <Link
                key={item.url}
                to={item.url}
                className={cn(
                  "group flex items-center gap-3 rounded-xl py-3 text-sm font-medium transition-all duration-200",
                  isHovered ? "px-4" : "justify-center",
                  isActive
                    ? "bg-accent text-foreground border border-border/80"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/75"
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0 transition-colors", isActive ? "text-foreground" : "text-muted-foreground/60")} />
                {isHovered && <span>{item.title}</span>}
              </Link>
            );
          })}
          
          {(user?.plan === 'pro' || user?.plan === 'enterprise') && (
            <Link
              to={workspaceNavItem.url}
              className={cn(
                "group flex items-center gap-3 rounded-xl py-3 text-sm font-medium transition-all duration-200 mt-1",
                isHovered ? "px-4" : "justify-center",
                location.pathname.startsWith('/workspaces')
                  ? "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/75"
              )}
            >
              <workspaceNavItem.icon className={cn("h-5 w-5 shrink-0 transition-colors", location.pathname.startsWith('/workspaces') ? "text-indigo-500" : "text-muted-foreground/60")} />
              {isHovered && <span>{workspaceNavItem.title}</span>}
            </Link>
          )}

          {/* Categories Section - Đã khôi phục */}
          {isHovered && (
            <div className="mt-8 pt-6 space-y-4">
              <div 
                className="flex items-center justify-between px-4 cursor-pointer group"
                onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
              >
                <div className="flex items-center gap-2 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">
                    Phân loại
                  </h3>
                  {isCategoriesExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </div>
              </div>
              
              {isCategoriesExpanded && (
                <div className="space-y-0.5 animate-in slide-in-from-top-2 fade-in duration-200">
                  {loadingCats ? (
                    <div className="px-4 py-2"><Loader2 className="h-3 w-3 animate-spin opacity-10" /></div>
                  ) : categories.length > 0 ? (
                    <>
                      {categories.slice(0, 5).map((cat) => (
                        <button 
                          key={cat.id} 
                          onClick={() => navigate(`/tasks?category=${cat.id}`)}
                          className="flex w-full items-center gap-3 rounded-xl px-4 py-2 text-sm text-muted-foreground hover:bg-accent/65 hover:text-foreground transition-all"
                        >
                          <span className="text-sm opacity-70">{cat.icon || '📅'}</span>
                          <span className="flex-1 truncate text-left">{cat.name}</span>
                        </button>
                      ))}
                      {categories.length > 5 && (
                        <button 
                          onClick={() => navigate('/settings')}
                          className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 mt-1 text-xs font-semibold text-primary hover:text-primary-active transition-all"
                        >
                          Xem tất cả
                        </button>
                      )}
                    </>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </nav>



        {/* Footer */}
        <div className="mt-auto border-t border-border/50 py-4 flex flex-col gap-1">
          <Link 
            to="/settings" 
            className={cn(
              "flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent/65 hover:text-foreground transition-all",
              isHovered ? "px-4" : "justify-center"
            )}
          >
            <Settings className="h-5 w-5 shrink-0" />
            {isHovered && <span>Cài đặt</span>}
          </Link>

          <button 
            onClick={() => { if(window.confirm('Đăng xuất?')) logout(); }}
            className={cn(
              "flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium text-destructive/70 hover:bg-destructive/5 transition-all",
              isHovered ? "px-4" : "justify-center"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {isHovered && <span>Đăng xuất</span>}
          </button>

          {isHovered && (
            <div className="mt-4 pt-4 border-t border-border/40 flex items-center gap-3 px-4">
              <div className="h-8 w-8 rounded-lg bg-accent text-foreground border border-border/80 flex items-center justify-center text-xs font-bold shrink-0">
                {user?.display_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold truncate text-foreground">{user?.display_name}</p>
                <p className="text-[9px] text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
