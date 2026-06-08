import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, Menu, Mail, MessageSquare, Check } from 'lucide-react';
import { useUiStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';
import Button from '../ui/Button';
import { notificationsApi } from '../../api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from '../../lib/dateFormat';
import PlanBadge from '../pro/PlanBadge';
import WorkspaceSelector from '../pro/WorkspaceSelector';

const NotificationIcon = ({ type }) => {
  switch (type) {
    case 'Email': return <Mail className="h-4 w-4 text-blue-500" />;
    case 'Zalo': return <MessageSquare className="h-4 w-4 text-blue-400" />;
    case 'Slack': return <MessageSquare className="h-4 w-4 text-purple-500" />;
    case 'Discord': return <MessageSquare className="h-4 w-4 text-indigo-500" />;
    default: return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

const TopBar = () => {
  const { toggleSidebar } = useUiStore();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  // Lấy số lượng thông báo chưa đọc (polling mỗi 30s)
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: async () => {
      const res = await notificationsApi.getUnreadCount();
      return res.count || 0;
    },
    refetchInterval: 30000,
  });

  // Lấy danh sách thông báo
  const { data: notificationsData } = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: async () => {
      const res = await notificationsApi.list();
      return res.notifications || [];
    },
    enabled: showNotifications, // Chỉ fetch khi mở dropdown
  });

  const notifications = notificationsData || [];

  // Mutation đánh dấu đã đọc
  const markReadMutation = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Mutation đánh dấu tất cả đã đọc
  const markAllReadMutation = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Click ra ngoài để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markReadMutation.mutate(notification.id);
    }
    // TODO: Navigate or open related modal based on notification type
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card px-6 transition-all">
      <div className="flex items-center gap-4 lg:hidden">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-accent-foreground transition-colors" />
          <input 
            placeholder="Tìm kiếm sự kiện, công việc..." 
            className="h-10 w-full pl-10 bg-background border border-border rounded-xl text-sm focus:bg-card focus:ring-1 focus:ring-ring/30 transition-all placeholder:text-muted-foreground/40"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <WorkspaceSelector />
        <PlanBadge />

        <div className="relative" ref={notificationRef}>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative h-9 w-9 rounded-xl hover:bg-accent/75 hover:text-foreground text-muted-foreground/70"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-card">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-card p-2 shadow-lg z-50">
              <div className="flex items-center justify-between px-2 py-2 mb-1">
                <h3 className="font-semibold text-sm">Thông báo</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={() => markAllReadMutation.mutate()}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <Check className="h-3 w-3 stroke-[2.5]" />
                    Đánh dấu đã đọc
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-1 max-h-[240px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent pr-1">
                {notifications.length === 0 ? (
                  <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                    Không có thông báo nào.
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`flex gap-3 p-2 rounded-lg cursor-pointer transition-colors ${notification.is_read ? 'hover:bg-accent/50' : 'bg-primary/5 hover:bg-primary/10'}`}
                    >
                      <div className="mt-1 flex-shrink-0">
                        <NotificationIcon type={notification.type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${notification.is_read ? 'text-foreground/80' : 'text-foreground font-medium'}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {dayjs(notification.created_at).fromNow()}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="flex-shrink-0 self-center">
                          <span className="flex h-2 w-2 rounded-full bg-primary" />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="h-4 w-px bg-border/40 mx-1 hidden sm:block" />
        
        <div className="hidden sm:flex items-center gap-3 pl-1 cursor-pointer group">
          <div className="h-8 w-8 rounded-lg bg-accent border border-border/80 flex items-center justify-center text-foreground text-xs font-bold transition-all group-hover:bg-accent/80">
            {user?.display_name?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
