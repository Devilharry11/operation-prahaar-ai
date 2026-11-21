// Operation Prahaar AI - 8. Alert Center View
import React, { useState } from 'react';
import { Bell, AlertTriangle, CheckCircle, XCircle, UserCheck } from 'lucide-react';
import { Alert } from '../types';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Bell className="w-5 h-5 text-emerald-400" />
            <span>Alert Center</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Real-time simulated alerts. Every alert remains UNVERIFIED until an authorized operator reviews it.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-2 bg-[#111713] p-1 rounded-md border border-[#27382B]">
          {['ALL', 'UNVERIFIED', 'VERIFIED', 'REJECTED', 'ESCALATED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 text-xs font-mono rounded ${
                filter === tab
                  ? 'bg-[#1C2C20] text-emerald-400 border border-[#2F4835]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className="bg-[#111713] border border-[#27382B] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#2F4835] transition-all"
          >
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="font-bold text-amber-400">{alert.alert_code}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    alert.review_status === 'UNVERIFIED'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : alert.review_status === 'VERIFIED'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-gray-800 text-gray-300 border border-gray-700'
                  }`}
                >
                  {alert.review_status}
                </span>
                <span className="text-gray-400">• Severity: {alert.severity}</span>
              </div>
              <h4 className="text-sm font-semibold text-white">{alert.title}</h4>
              <p className="text-xs text-gray-300">{alert.summary}</p>
              <div className="text-[11px] font-mono text-gray-400">
                Timestamp: {new Date(alert.created_at).toLocaleString()}
              </div>
            </div>

            <div className="shrink-0 flex items-center space-x-2">
              {alert.review_status === 'UNVERIFIED' ? (
                <button
                  onClick={() => onNavigate('human-verification')}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold font-mono uppercase tracking-wider rounded transition-all shadow"
                >
                  Review Incident &rarr;
                </button>
              ) : (
                <span className="px-3 py-1.5 text-xs font-mono text-emerald-400 bg-[#16221A] rounded border border-[#2F4835]">
                  Reviewed by Human
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
