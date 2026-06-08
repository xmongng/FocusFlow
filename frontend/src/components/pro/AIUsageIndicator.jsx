import React, { useEffect, useState } from 'react';
import { planApi } from '../../api/pro';
import { useAuthStore } from '../../stores/authStore';
import { Link } from 'react-router-dom';

const AIUsageIndicator = () => {
  const [usage, setUsage] = useState({ used: 0, limit: 20 });
  const { user } = useAuthStore();
  const isEnterprise = user?.plan === 'enterprise';

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const data = await planApi.getCurrentPlan();
        if (data.aiUsage) {
          setUsage(data.aiUsage);
        }
      } catch (error) {
        console.error('Lỗi lấy AI usage:', error);
      }
    };
    fetchPlan();
  }, []);

  if (isEnterprise) return null; // Unlimited

  const percentage = Math.min(100, Math.round((usage.used / usage.limit) * 100));
  const isNearLimit = percentage >= 80;

  return (
    <div className="bg-card border border-border/50 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
      <div className="flex-1 w-full">
        <div className="flex justify-between text-xs font-semibold mb-2">
          <span className="text-muted-foreground">Sử dụng AI trong ngày</span>
          <span className={isNearLimit ? 'text-destructive' : 'text-foreground'}>
            {usage.used} / {usage.limit} requests
          </span>
        </div>
        <div className="w-full bg-accent rounded-full h-2.5 overflow-hidden">
          <div 
            className={`h-2.5 rounded-full transition-all duration-500 ${isNearLimit ? 'bg-destructive' : 'bg-primary'}`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
      
      {user?.plan === 'free' && (
        <Link 
          to="/upgrade" 
          className="shrink-0 text-xs font-medium text-white bg-indigo-500 hover:bg-indigo-600 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
        >
          Nâng cấp giới hạn
        </Link>
      )}
    </div>
  );
};

export default AIUsageIndicator;
