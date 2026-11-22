// Operation Prahaar AI - Alert Center (Enterprise SOC Redesign)
import React, { useState } from 'react';
import { Bell, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Alert } from '../types';
import { SectionHeader, StatusBadge } from '../components/Common';
import { PrahaarAPI } from '../services/api';

interface AlertCenterProps {
  alerts: Alert[];
  onNavigate: (view: any) => void;
  onIncidentGenerated?: () => void;
}

export const AlertCenter: React.FC<AlertCenterProps> = ({ alerts, onNavigate, onIncidentGenerated }) => {
  const [filter, setFilter] = useState<string>('ALL');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'ALL') return true;
    return a.review_status === filter;
  });

  const handleGenerateSyntheticIncident = async () => {
    setIsGenerating(true);
    setFeedback(null);
    try {
      const res = await PrahaarAPI.generateSyntheticIncident('ZONE-A', 'HIGH');
      setFeedback(`Synthetic incident generated: ${res.incident_id} (${res.alert_code})`);
      if (onIncidentGenerated) {
        onIncidentGenerated();
      }
    } catch (err: any) {
      setFeedback(err.message || 'Failed to generate synthetic incident');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setFeedback(null), 6000);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SectionHeader
        title="Operational Alert Center"
        subtitle="Simulated public safety alerts. Alerts strictly remain UNVERIFIED until reviewed by authorized human officers."
        icon={Bell}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleGenerateSyntheticIncident}
              disabled={isGenerating}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold rounded transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'GENERATING...' : '⚡ GENERATE SYNTHETIC INCIDENT'}</span>
            </button>
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
          </div>
        }
      />

      {feedback && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-lg text-emerald-300 text-xs font-mono flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {filteredAlerts.length === 0 ? (
        <div className="bg-[#151D25] border border-[#2A3540] rounded-lg p-8 text-center space-y-4">
          <Bell className="w-12 h-12 text-slate-500 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-white">No Alerts Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {filter === 'ALL'
                ? 'No synthetic alerts currently in ledger. Click "Generate Synthetic Incident" to simulate an edge threshold breach (≥75% congestion).'
                : `No alerts currently with review status "${filter}".`}
            </p>
          </div>
          <button
            onClick={handleGenerateSyntheticIncident}
            disabled={isGenerating}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold rounded transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Synthetic Incident (Zone A)</span>
          </button>
        </div>
      ) : (
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
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold font-sans rounded flex items-center space-x-1.5 transition-all shadow cursor-pointer"
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
      )}
    </div>
  );
};
