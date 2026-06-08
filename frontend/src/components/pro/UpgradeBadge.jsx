import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const UpgradeBadge = ({ isOpen }) => {
  const { user } = useAuthStore();
  
  if (!user || user.plan === 'pro' || user.plan === 'enterprise') return null;

  return (
    <div className={`mx-4 mt-4 mb-2 ${isOpen ? 'p-4' : 'p-2'} bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl relative overflow-hidden group transition-all`}>
      <div className="absolute top-0 right-0 p-2 opacity-50 group-hover:opacity-100 transition-opacity">
        <Sparkles className="h-4 w-4 text-purple-500" />
      </div>
      
      {isOpen ? (
        <>
          <h4 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
            Nâng cấp Pro
          </h4>
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            Mở khóa không gian làm việc nhóm và tăng giới hạn AI.
          </p>
          <Link 
            to="/upgrade"
            className="block w-full text-center py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
          >
            Khám phá ngay
          </Link>
        </>
      ) : (
        <Link to="/upgrade" className="flex items-center justify-center h-8 w-8 mx-auto" title="Nâng cấp Pro">
          <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" />
        </Link>
      )}
    </div>
  );
};

export default UpgradeBadge;
