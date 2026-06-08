import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ModalManager from '../shared/ModalManager';
import { useUiStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { useRealtime } from '../../hooks/useRealtime';

const AppLayout = () => {
  const { sidebarHovered } = useUiStore();
  
  // Kích hoạt kết nối Realtime SSE
  useRealtime();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className={cn("flex flex-col transition-all duration-300", sidebarHovered ? "pl-72" : "pl-20")}>
        <TopBar />
        <main className="flex-1 bg-muted/55 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
      <ModalManager />
    </div>
  );
};

export default AppLayout;
