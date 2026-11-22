// Operation Prahaar AI - Reusable UI Components
import React from 'react';
import { LucideIcon } from 'lucide-react';

// 1. Status Badge
interface StatusBadgeProps {
  status: string;
  variant?: 'green' | 'amber' | 'red' | 'blue' | 'gray';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = 'gray',
  size = 'sm',
}) => {
  // Auto-detect variant from status string if not explicitly given
  let finalVariant = variant;
  const s = status.toUpperCase();
  if (s === 'ONLINE' || s === 'VERIFIED' || s === 'OPERATIONAL' || s === 'RESOLVED') {
    finalVariant = 'green';
  } else if (s === 'UNVERIFIED' || s === 'WARNING' || s === 'HIGH' || s === 'MODERATE' || s === 'ELEVATED') {
    finalVariant = 'amber';
  } else if (s === 'CRITICAL' || s === 'IMMINENT' || s === 'OFFLINE' || s === 'REJECTED') {
    finalVariant = 'red';
  } else if (s === 'INFO' || s === 'NEW' || s === 'UNDER_REVIEW' || s === 'LOW') {
    finalVariant = 'blue';
  }

  const styles = {
    green: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80',
    amber: 'bg-amber-950/60 text-amber-400 border-amber-800/80',
    red: 'bg-red-950/60 text-red-400 border-red-800/80',
    blue: 'bg-blue-950/60 text-blue-400 border-blue-800/80',
    gray: 'bg-slate-900/80 text-slate-300 border-slate-700/80',
  };

  const dotColors = {
    green: 'bg-emerald-400',
    amber: 'bg-amber-400',
    red: 'bg-red-400',
    blue: 'bg-blue-400',
    gray: 'bg-slate-400',
  };

  const sizeStyle = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center space-x-1.5 font-mono font-medium rounded border ${styles[finalVariant]} ${sizeStyle}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors[finalVariant]}`}></span>
      <span>{status}</span>
    </span>
  );
};

// 2. Metric KPI Card
interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  variant?: 'default' | 'amber' | 'green' | 'red';
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  icon: Icon,
  variant = 'default',
  onClick,
}) => {
  const iconColors = {
    default: 'text-slate-400 bg-slate-800/50 border-slate-700',
    amber: 'text-amber-400 bg-amber-950/40 border-amber-800/60',
    green: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60',
    red: 'text-red-400 bg-red-950/40 border-red-800/60',
  };

  const valueColors = {
    default: 'text-slate-100',
    amber: 'text-amber-400',
    green: 'text-emerald-400',
    red: 'text-red-400',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-[#151D25] border border-[#2A3540] rounded-lg p-4 flex flex-col justify-between transition-all ${
        onClick ? 'cursor-pointer hover:border-slate-500 hover:bg-[#1B2630]' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#94A3B8] tracking-wide">{label}</span>
        <div className={`p-1.5 rounded-md border ${iconColors[variant]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-3">
        <div className={`text-2xl font-bold font-mono tracking-tight ${valueColors[variant]}`}>
          {value}
        </div>
        {subValue && (
          <div className="text-xs text-[#94A3B8] mt-1 flex items-center space-x-1">
            <span>{subValue}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// 3. Section Header
interface SectionHeaderProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  actions?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  actions,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#2A3540]">
      <div>
        <h2 className="text-lg font-bold text-[#F1F5F9] flex items-center space-x-2.5">
          <Icon className="w-5 h-5 text-emerald-400" />
          <span>{title}</span>
        </h2>
        <p className="text-xs text-[#94A3B8] mt-0.5">{subtitle}</p>
      </div>
      {actions && <div className="flex items-center space-x-2">{actions}</div>}
    </div>
  );
};

// 4. Empty State
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description }) => {
  return (
    <div className="text-center py-12 px-4 bg-[#151D25]/50 border border-[#2A3540] border-dashed rounded-lg">
      <Icon className="w-8 h-8 mx-auto text-[#64748B] mb-2.5" />
      <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
      <p className="text-xs text-[#94A3B8] mt-1 max-w-sm mx-auto">{description}</p>
    </div>
  );
};
