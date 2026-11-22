// Operation Prahaar AI - Modern Enterprise SOC Overview Dashboard
import React from 'react';
import {
  ShieldAlert,
  Camera,
  Cpu,
  UserCheck,
  AlertTriangle,
  Server,
  Activity,
  History,
  ArrowRight,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { Camera as CameraType, Incident, Alert, EdgeDevice, CameraEvent, AuditLog, SystemHealth } from '../types';
import { MetricCard, StatusBadge, SectionHeader } from '../components/Common';

interface OverviewProps {
  cameras: CameraType[];
  incidents: Incident[];
  alerts: Alert[];
  edgeDevices: EdgeDevice[];
  events: CameraEvent[];
  auditLogs: AuditLog[];
  health: SystemHealth | null;
  onNavigate: (view: any) => void;
}

export const OverviewDashboard: React.FC<OverviewProps> = ({
  cameras,
  incidents,
  alerts,
  edgeDevices,
  events,
  auditLogs,
  health,
  onNavigate,
}) => {
  const unverifiedAlerts = alerts.filter((a) => a.review_status === 'UNVERIFIED');
  const activeIncidents = incidents.filter((i) => i.status !== 'RESOLVED' && i.status !== 'DISMISSED');
  const isHealthy = health?.database_connected === true;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Tactical Operational Readiness Alert Bar */}
      <div className="bg-[#151D25] border border-[#2A3540] rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start space-x-3.5">
          <div className="p-2 rounded-md bg-amber-950/40 border border-amber-800/60 text-amber-400 shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono font-bold tracking-wider text-amber-400 uppercase">
                SECURITY READINESS: HEIGHTENED VIGILANCE ADVISORY
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-[11px] text-[#94A3B8] font-mono">NORTHERN RAILWAYS ZONE</span>
            </div>
            <h2 className="text-base font-bold text-white mt-0.5">
              Multi-Camera Edge Spatial Surveillance & Decision Support
            </h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Non-identifying spatial crowd telemetry active. Facial recognition strictly prohibited.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={() => onNavigate('human-verification')}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold font-sans rounded flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <UserCheck className="w-4 h-4" />
            <span>Review Queue ({unverifiedAlerts.length})</span>
          </button>
          <button
            onClick={() => onNavigate('video-monitor')}
            className="px-3 py-1.5 bg-[#1B2630] hover:bg-slate-700 text-slate-200 text-xs font-sans rounded border border-[#2A3540] transition-all"
          >
            Monitor Feeds
          </button>
        </div>
      </div>

      {/* 2. Top 4 Standardized Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Pending Reviews */}
        <MetricCard
          label="Pending Human Reviews"
          value={unverifiedAlerts.length}
          subValue={unverifiedAlerts.length > 0 ? "Action mandatory before escalation" : "Queue fully cleared"}
          icon={AlertTriangle}
          variant={unverifiedAlerts.length > 0 ? "amber" : "default"}
          onClick={() => onNavigate('human-verification')}
        />

        {/* KPI 2: Active Incidents */}
        <MetricCard
          label="Active Safety Incidents"
          value={activeIncidents.length}
          subValue="Synthesized from spatial telemetry"
          icon={ShieldAlert}
          variant={activeIncidents.length > 0 ? "default" : "green"}
          onClick={() => onNavigate('incidents')}
        />

        {/* KPI 3: Registered Edge Nodes */}
        <MetricCard
          label="Registered Edge Devices"
          value={edgeDevices.length}
          subValue={`${cameras.length} CCTV inputs bound`}
          icon={Cpu}
          variant="green"
          onClick={() => onNavigate('edge-devices')}
        />

        {/* KPI 4: Backend Health */}
        <MetricCard
          label="Backend API Gateway"
          value={isHealthy ? "ONLINE" : "OFFLINE"}
          subValue={isHealthy ? "SQLite pool connected (0 errors)" : "Fallback cache active"}
          icon={Server}
          variant={isHealthy ? "green" : "red"}
          onClick={() => onNavigate('settings')}
        />
      </div>

      {/* 3. Main Workspace Grid: Unverified Queue + Correlated Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: Unverified Review Queue */}
        <div className="bg-[#151D25] border border-[#2A3540] rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#2A3540]">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Unverified Review Queue
                </h3>
              </div>
              <StatusBadge status={`${unverifiedAlerts.length} PENDING`} variant={unverifiedAlerts.length > 0 ? "amber" : "green"} />
            </div>

            <div className="mt-3.5 space-y-2.5">
              {unverifiedAlerts.length === 0 ? (
                <div className="text-center py-10 text-xs text-[#94A3B8]">
                  <ShieldCheck className="w-8 h-8 mx-auto text-emerald-500/60 mb-2" />
                  All safety alerts have been reviewed. Public safety zones nominal.
                </div>
              ) : (
                unverifiedAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="bg-[#10161C] border border-[#2A3540] hover:border-amber-500/50 rounded-md p-3 transition-all"
                  >
                    <div className="flex items-center justify-between text-xs mb-1 font-mono">
                      <span className="font-bold text-amber-400">{alert.alert_code}</span>
                      <StatusBadge status={alert.review_status} />
                    </div>
                    <h4 className="text-xs font-semibold text-white">{alert.title}</h4>
                    <p className="text-[11px] text-[#94A3B8] mt-1 line-clamp-2 leading-relaxed">
                      {alert.summary}
                    </p>
                    <div className="mt-2.5 pt-2 border-t border-[#2A3540] flex items-center justify-between text-[11px]">
                      <span className="text-[#94A3B8] font-mono">Severity: {alert.severity}</span>
                      <button
                        onClick={() => onNavigate('human-verification')}
                        className="text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1"
                      >
                        <span>Inspect & Review</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#2A3540] text-[11px] text-[#94A3B8] flex items-center justify-between font-sans">
            <span>Mandatory Human-in-the-Loop decision gate</span>
            <button
              onClick={() => onNavigate('human-verification')}
              className="text-emerald-400 hover:underline font-medium"
            >
              Open Console &rarr;
            </button>
          </div>
        </div>

        {/* Right Column: Correlated Incidents */}
        <div className="bg-[#151D25] border border-[#2A3540] rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#2A3540]">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Correlated Incidents
                </h3>
              </div>
              <button
                onClick={() => onNavigate('incidents')}
                className="text-xs text-emerald-400 hover:underline font-mono"
              >
                View Dossier ({incidents.length})
              </button>
            </div>

            <div className="mt-3.5 space-y-2.5">
              {incidents.slice(0, 3).map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => onNavigate('incidents')}
                  className="bg-[#10161C] border border-[#2A3540] hover:border-slate-500 rounded-md p-3 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between text-xs mb-1 font-mono">
                    <span className="font-bold text-emerald-400">{inc.incident_code}</span>
                    <StatusBadge status={inc.status} />
                  </div>
                  <h4 className="text-xs font-semibold text-white">{inc.title}</h4>
                  <p className="text-[11px] text-[#94A3B8] mt-1 line-clamp-2 leading-relaxed">
                    {inc.description}
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-[#2A3540] flex items-center justify-between text-[11px] font-mono text-[#94A3B8]">
                    <span>Confidence: {(inc.confidence_score * 100).toFixed(0)}%</span>
                    <span>Priority: {inc.priority}</span>
                    <span>Uncertainty: {inc.uncertainty_level}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#2A3540] text-[11px] text-[#94A3B8] flex items-center justify-between">
            <span>Explainable reasoning models active</span>
            <span className="font-mono text-slate-300">Rule: CONGESTION_BUILDUP</span>
          </div>
        </div>
      </div>

      {/* 4. Bottom Row: System Health Diagnostics & Recent Audit Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* System Health Card (1 Col) */}
        <div className="bg-[#151D25] border border-[#2A3540] rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#2A3540]">
            <span className="text-xs font-bold text-white uppercase tracking-wider">System Governance</span>
            <StatusBadge status="ACTIVE" variant="green" />
          </div>
          <div className="space-y-2 text-xs font-sans text-slate-300">
            <div className="flex items-center justify-between py-1 border-b border-[#2A3540]/60">
              <span className="text-[#94A3B8]">Facial Recognition:</span>
              <span className="font-mono text-emerald-400 font-bold">DISABLED</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-[#2A3540]/60">
              <span className="text-[#94A3B8]">Biometric Watchlists:</span>
              <span className="font-mono text-emerald-400 font-bold">NONE</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-[#2A3540]/60">
              <span className="text-[#94A3B8]">Frame Retention:</span>
              <span className="font-mono text-slate-300">Ephemeral Buffer</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-[#94A3B8]">Audit Trail:</span>
              <span className="font-mono text-emerald-400 font-bold">TAMPER-EVIDENT</span>
            </div>
          </div>
        </div>

        {/* Audit Activity Stream (2 Cols) */}
        <div className="lg:col-span-2 bg-[#151D25] border border-[#2A3540] rounded-lg p-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#2A3540]">
            <div className="flex items-center space-x-2">
              <History className="w-4 h-4 text-[#94A3B8]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Recent Audit Ledger Stream
              </span>
            </div>
            <button
              onClick={() => onNavigate('audit-logs')}
              className="text-xs text-emerald-400 hover:underline font-mono"
            >
              Full Ledger ({auditLogs.length})
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {auditLogs.slice(0, 3).map((log) => (
              <div
                key={log.id}
                className="bg-[#10161C] p-2.5 rounded border border-[#2A3540] flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center space-x-2.5 truncate mr-2">
                  <span className="text-emerald-400 font-bold shrink-0">{log.event_type}</span>
                  <span className="text-slate-300 truncate font-sans text-[11px]">
                    {log.action_summary}
                  </span>
                </div>
                <div className="text-[10px] text-[#94A3B8] shrink-0">
                  {new Date(log.created_at).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
