import React, { useState } from 'react';
import { Check, Sparkles, Zap, Building2, Shield, Bot, Users } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { planApi } from '../../api/pro';
import { toast } from 'sonner';

const UpgradePage = () => {
  const { user, login } = useAuthStore(); // We'll just update the user object in store manually or via login refetch
  const [isUpgrading, setIsUpgrading] = useState(false);
  
  const currentPlan = user?.plan || 'free';

  const handleUpgrade = async () => {
    try {
      setIsUpgrading(true);
      const res = await planApi.upgrade();
      toast.success(res.message);
      
      // Update local storage and state for seamless UX
      const updatedUser = { ...user, plan: 'pro' };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      // In a real app we might call getMe() to refresh
      window.location.reload(); 
    } catch (error) {
      toast.error('Nâng cấp thất bại');
      setIsUpgrading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl mb-4">
          Nâng tầm hiệu suất của bạn
        </h1>
        <p className="text-xl text-muted-foreground">
          Chọn gói phù hợp nhất với nhu cầu cá nhân hoặc đội nhóm của bạn.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
        
        {/* Free Plan */}
        <div className="relative p-8 bg-card border border-border/50 rounded-3xl shadow-sm flex flex-col">
          {currentPlan === 'free' && (
            <div className="absolute top-0 right-6 transform -translate-y-1/2">
              <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                Đang dùng
              </span>
            </div>
          )}
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Zap className="h-6 w-6 text-yellow-500" /> Free
            </h3>
            <p className="mt-4 text-muted-foreground text-sm">Cho cá nhân bắt đầu tổ chức công việc.</p>
            <div className="mt-6 flex items-baseline text-5xl font-extrabold">
              $0
              <span className="ml-1 text-xl font-medium text-muted-foreground">/tháng</span>
            </div>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 shrink-0 mr-3" />
              <span className="text-sm text-foreground">Quản lý Calendar & Task cá nhân</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 shrink-0 mr-3" />
              <span className="text-sm text-foreground">Đồng bộ Email thông minh</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 shrink-0 mr-3" />
              <span className="text-sm text-foreground">Giới hạn 20 request AI/ngày</span>
            </li>
          </ul>
          <button 
            disabled={currentPlan === 'free'}
            className="w-full py-3 px-4 rounded-xl font-medium text-sm border-2 border-primary/20 text-primary bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentPlan === 'free' ? 'Gói hiện tại' : 'Chuyển sang Free'}
          </button>
        </div>

        {/* Pro Plan */}
        <div className="relative p-8 bg-card border-2 border-primary rounded-3xl shadow-xl flex flex-col transform lg:-translate-y-4">
          <div className="absolute top-0 inset-x-0 transform -translate-y-1/2 flex justify-center">
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-lg">
              <Sparkles className="h-3.5 w-3.5" /> Phổ biến nhất
            </span>
          </div>
          
          <div className="mb-8 mt-2">
            <h3 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Users className="h-6 w-6 text-indigo-500" /> Pro
            </h3>
            <p className="mt-4 text-muted-foreground text-sm">Dành cho nhóm nhỏ cần cộng tác liền mạch.</p>
            <div className="mt-6 flex items-baseline text-5xl font-extrabold">
              $9.99
              <span className="ml-1 text-xl font-medium text-muted-foreground">/tháng</span>
            </div>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-start">
              <Check className="h-5 w-5 text-indigo-500 shrink-0 mr-3" />
              <span className="text-sm text-foreground font-medium">Mọi tính năng của gói Free</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-indigo-500 shrink-0 mr-3" />
              <span className="text-sm text-foreground font-medium">Tạo & Quản lý Workspace nhóm</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-indigo-500 shrink-0 mr-3" />
              <span className="text-sm text-foreground">Giao việc cho thành viên</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-indigo-500 shrink-0 mr-3" />
              <span className="text-sm text-foreground">Lên tới 100 request AI/ngày</span>
            </li>
          </ul>
          
          {currentPlan === 'pro' ? (
             <button disabled className="w-full py-3 px-4 rounded-xl font-medium text-sm text-white bg-indigo-500/50 cursor-not-allowed">
               Đang dùng gói Pro
             </button>
          ) : (
             <button 
               onClick={handleUpgrade}
               disabled={isUpgrading}
               className="w-full py-3 px-4 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] flex justify-center items-center gap-2"
             >
               {isUpgrading ? 'Đang xử lý...' : 'Nâng cấp ngay'}
             </button>
          )}
        </div>

        {/* Enterprise Plan */}
        <div className="relative p-8 bg-card/50 border border-border/50 rounded-3xl flex flex-col opacity-80">
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Building2 className="h-6 w-6 text-slate-500" /> Enterprise
            </h3>
            <p className="mt-4 text-muted-foreground text-sm">Giải pháp toàn diện cho tổ chức lớn.</p>
            <div className="mt-6 flex items-baseline text-5xl font-extrabold">
              Tùy chỉnh
            </div>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-start">
              <Check className="h-5 w-5 text-slate-400 shrink-0 mr-3" />
              <span className="text-sm text-foreground">Không giới hạn Workspaces</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-slate-400 shrink-0 mr-3" />
              <span className="text-sm text-foreground">Không giới hạn request AI</span>
            </li>
            <li className="flex items-start">
              <Shield className="h-5 w-5 text-slate-400 shrink-0 mr-3" />
              <span className="text-sm text-foreground">Bảo mật SSO & Phân quyền nâng cao</span>
            </li>
          </ul>
          <button disabled className="w-full py-3 px-4 rounded-xl font-medium text-sm border-2 border-border text-muted-foreground bg-accent/50 cursor-not-allowed">
            Liên hệ tư vấn (Sắp ra mắt)
          </button>
        </div>

      </div>
    </div>
  );
};

export default UpgradePage;
