import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import PrivateRoute from './PrivateRoute';
import Skeleton from '../components/ui/Skeleton';

// Pages
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const CalendarPage = lazy(() => import('../pages/CalendarPage'));
const TasksPage = lazy(() => import('../pages/TasksPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage'));
const AIAssistant = lazy(() => import('../pages/AIAssistant'));

// Pro Pages
const UpgradePage = lazy(() => import('../pages/pro/UpgradePage'));
const WorkspacePage = lazy(() => import('../pages/pro/WorkspacePage'));
const TeamPage = lazy(() => import('../pages/pro/TeamPage'));

const PageLoader = () => (
  <div className="space-y-4">
    <Skeleton className="h-12 w-1/3" />
    <div className="grid grid-cols-2 gap-4">
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  </div>
);

const AppRouter = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected Routes */}
        <Route
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/assistant" element={<AIAssistant />} />
          
          <Route path="/upgrade" element={<UpgradePage />} />
          <Route path="/workspaces" element={<WorkspacePage />} />
          <Route path="/workspaces/:id" element={<TeamPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
