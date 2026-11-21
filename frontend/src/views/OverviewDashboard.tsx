// Operation Prahaar AI - 1. Overview Dashboard View
import React from 'react';
import {
  ShieldAlert,
  Camera,
  Cpu,
  UserCheck,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Camera as CameraType, Incident, Alert, EdgeDevice, CameraEvent } from '../types';

interface OverviewProps {
  cameras: CameraType[];
  incidents: Incident[];
  alerts: Alert[];
  edgeDevices: EdgeDevice[];
  events: CameraEvent[];
  onNavigate: (view: any) => void;
}

export const OverviewDashboard: React.FC<OverviewProps> = ({
  cameras,
  incidents,
  alerts,
  edgeDevices,
  events,
  onNavigate,
}) => {
  const unverifiedAlerts = alerts.filter((a) => a.review_status === 'UNVERIFIED');
  const onlineCameras = cameras.filter((c) => c.status === 'ONLINE').length;
  const activeIncidents = incidents.filter((i) => i.status !== 'RESOLVED' && i.status !== 'DISMISSED').length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Tactical Alert Bar */}
      <div className="bg-[#1C2C20] border border-[#2F4835] rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase font-bold">
              NATIONAL PUBLIC SAFETY SITUATION: ELEVATED VIGILANCE
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Operation Prahaar AI — Command Overview
          </h2>
          <p className="text-xs text-gray-300">
            Real-time multi-camera edge computer vision & threat advisory decision support.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('human-verification')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold font-mono uppercase tracking-wider rounded flex items-center space-x-1.5 transition-all shadow-md"
          >
            <UserCheck className="w-4 h-4" />
            <span>Review Queue ({unverifiedAlerts.length})</span>
          </button>
          <button
            onClick={() => onNavigate('video-monitor')}
            className="px-4 py-2 bg-[#233527] hover:bg-[#2F4835] text-emerald-300 text-xs font-mono uppercase tracking-wider rounded border border-[#2F4835] transition-all"
          >
            Monitor CCTV
          </button>
        </div>
      </div>

      {/* 4 Key Tactical Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Unverified Alerts */}
        <div className="bg-[#111713] border border-[#27382B] rounded-lg p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-gray-400">Alerts Pending Review</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-mono font-bold text-amber-400 mt-2">
            {unverifiedAlerts.length}
          </div>
          <div className="text-[11px] text-gray-400 mt-2 flex items-center space-x-1">
            <span className="text-amber-400 font-bold">HITL Rule:</span>
            <span>Awaiting human authorization</span>
          </div>
        </div>

        {/* Card 2: Active Incidents */}
        <div className="bg-[#111713] border border-[#27382B] rounded-lg p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-gray-400">Active Incidents</span>
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-mono font-bold text-white mt-2">
            {activeIncidents}
          </div>
          <div className="text-[11px] text-gray-400 mt-2 flex items-center space-x-1">
            <span className="text-emerald-400">Synthesized:</span>
            <span>Correlated with safety bulletins</span>
          </div>
        </div>

        {/* Card 3: Camera Streams */}
        <div className="bg-[#111713] border border-[#27382B] rounded-lg p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-gray-400">Active CCTV Feeds</span>
            <Camera className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-mono font-bold text-emerald-400 mt-2">
            {onlineCameras} <span className="text-xs text-gray-400 font-normal">/ {cameras.length}</span>
          </div>
          <div className="text-[11px] text-gray-400 mt-2 flex items-center space-x-1">
            <span className="text-emerald-400 font-bold">Resolution:</span>
            <span>640x360 @ 5 FPS (Edge Cap)</span>
          </div>
        </div>

        {/* Card 4: Edge Appliance Health */}
        <div className="bg-[#111713] border border-[#27382B] rounded-lg p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-gray-400">Edge Node Load</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-mono font-bold text-white mt-2">
            {edgeDevices[0]?.cpu_usage_pct || 17.4}%
          </div>
          <div className="text-[11px] text-gray-400 mt-2 flex items-center space-x-1">
            <span className="text-emerald-400 font-bold">RAM:</span>
            <span>~215 MB / 8 GB (No Throttling)</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Unverified Alert Queue & Live Incident Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Pending Human Reviews */}
        <div className="bg-[#111713] border border-[#27382B] rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#27382B]">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Unverified Alert Queue (Human-in-the-Loop)
              </h3>
            </div>
            <span className="text-xs font-mono bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800">
              {unverifiedAlerts.length} Action Needed
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {unverifiedAlerts.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-60" />
                No unverified alerts pending. Public safety zones nominal.
              </div>
            ) : (
              unverifiedAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-[#16221A] border border-[#2F4835] rounded-md p-3.5 hover:border-amber-500/50 transition-all"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-bold text-amber-400">{alert.alert_code}</span>
                    <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-amber-900/60 text-amber-300 rounded border border-amber-700/50">
                      {alert.review_status}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">{alert.title}</h4>
                  <p className="text-xs text-gray-300 mt-1 line-clamp-2">{alert.summary}</p>
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#233527] text-[11px]">
                    <span className="text-gray-400 font-mono">Severity: {alert.severity}</span>
                    <button
                      onClick={() => onNavigate('human-verification')}
                      className="text-amber-400 hover:text-amber-300 font-bold uppercase tracking-wider text-xs"
                    >
                      Inspect & Verify &rarr;
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Active Safety Incidents */}
        <div className="bg-[#111713] border border-[#27382B] rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#27382B]">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Correlated Incidents
              </h3>
            </div>
            <button
              onClick={() => onNavigate('incidents')}
              className="text-xs text-emerald-400 hover:underline font-mono"
            >
              View All ({incidents.length})
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {incidents.slice(0, 3).map((inc) => (
              <div key={inc.id} className="bg-[#141C16] border border-[#233527] rounded-md p-3.5">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono font-bold text-emerald-400">{inc.incident_code}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1C2C20] text-gray-300 border border-[#2F4835]">
                    Status: {inc.status}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white">{inc.title}</h4>
                <p className="text-xs text-gray-300 mt-1 line-clamp-2">{inc.description}</p>
                <div className="mt-2.5 flex items-center space-x-4 text-[11px] font-mono text-gray-400">
                  <span>Confidence: {(inc.confidence_score * 100).toFixed(0)}%</span>
                  <span>Uncertainty: {inc.uncertainty_level}</span>
                  <span>Priority: {inc.priority}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
