import React from 'react';
import { Sparkles, Zap, Building2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { Link } from 'react-router-dom';

const PlanBadge = () => {
  const { user } = useAuthStore();
  if (!user) return null;

  const plan = user.plan || 'free';

  if (plan === 'pro') {
    return (
      <Link to="/upgrade" className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 rounded-full text-xs font-bold hover:bg-indigo-500/20 transition-colors">
        <Sparkles className="h-3.5 w-3.5" /> PRO
      </Link>
    );
  }

  if (plan === 'enterprise') {
    return (
      <Link to="/upgrade" className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-500/10 border border-slate-500/20 text-slate-500 rounded-full text-xs font-bold hover:bg-slate-500/20 transition-colors">
        <Building2 className="h-3.5 w-3.5" /> ENT
      </Link>
    );
  }

  return (
    <Link to="/upgrade" className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 rounded-full text-xs font-bold hover:bg-yellow-500/20 transition-colors">
      <Zap className="h-3.5 w-3.5" /> FREE
    </Link>
  );
};

export default PlanBadge;
