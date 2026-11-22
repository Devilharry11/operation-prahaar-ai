// Operation Prahaar AI - Alert Center (Enterprise SOC Redesign)
import React, { useState } from 'react';
import { Bell, ArrowRight } from 'lucide-react';
import { Alert } from '../types';
import { SectionHeader, StatusBadge } from '../components/Common';

interface AlertCenterProps {
  alerts: Alert[];
  onNavigate: (view: any) => void;
}

export const AlertCenter: React.FC<AlertCenterProps> = ({ alerts, onNavigate }) => {
  const [filter, setFilter] = useState<string>('ALL');

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'ALL') return true;
    return a.review_status === filter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SectionHeader
        title="Operational Alert Center"
        subtitle="Simulated public safety alerts. Alerts strictly remain UNVERIFIED until reviewed by authorized human officers."
        icon={Bell}
        actions={
          <div className="flex items-center space-x-1.5 bg-[#151D25] p-1 rounded-md border border-[#2A3540]">
            {['ALL', 'UNVERIFIED', 'VERIFIED', 'REJECTED', 'ESCALATED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 text-xs font-mono rounded transition-all ${
                  filter === tab
                    ? 'bg-[#1B2630] text-emerald-400 font-semibold border border-emerald-800/60 shadow-sm'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        }
      />

      <div className="space-y-3">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className="bg-[#151D25] border border-[#2A3540] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-500 transition-all shadow-sm"
          >
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="font-bold text-amber-400">{alert.alert_code}</span>
                <StatusBadge status={alert.review_status} />
                <span className="text-[#94A3B8]">• Severity: {alert.severity}</span>
              </div>
              <h4 className="text-sm font-semibold text-white tracking-tight">{alert.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{alert.summary}</p>
              <div className="text-[11px] font-mono text-[#94A3B8]">
                Timestamp: {new Date(alert.created_at).toLocaleString()}
              </div>
            </div>

            <div className="shrink-0 flex items-center space-x-2">
              {alert.review_status === 'UNVERIFIED' ? (
                <button
                  onClick={() => onNavigate('human-verification')}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold font-sans rounded flex items-center space-x-1.5 transition-all shadow"
                >
                  <span>Review Incident</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="px-3 py-1 text-xs font-mono text-emerald-400 bg-[#10161C] rounded border border-[#2A3540]">
                  Human Reviewed
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
