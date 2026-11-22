// Operation Prahaar AI - Modern Enterprise SOC Top Navigation Header
import React, { useState } from 'react';
import { Shield, Radio, Activity, Lock, AlertTriangle, User, Database, Sparkles, ChevronDown } from 'lucide-react';
import { SystemHealth } from '../types';
import { getActiveBadge, setActiveBadge } from '../services/api';

interface HeaderProps {
  health: SystemHealth | null;
  unverifiedCount: number;
  onNavigateToReviews: () => void;
  onOpenDemoController?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  health,
  unverifiedCount,
  onNavigateToReviews,
  onOpenDemoController,
}) => {
  const isBackendLive = health?.database_connected === true;
  const [activeBadge, setLocalBadge] = useState<string>(getActiveBadge());

  const handleBadgeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBadge = e.target.value;
    setActiveBadge(newBadge);
    setLocalBadge(newBadge);
  };

  const getBadgeDetails = (badge: string) => {
    switch (badge) {
      case 'IND-ADM-001':
        return { name: 'V. Verma', title: 'Chief Controller', role: 'CHIEF_CONTROLLER', initials: 'VV' };
      case 'IND-ANA-2094':
        return { name: 'P. Patel', title: 'Watch Officer', role: 'INTELLIGENCE_ANALYST', initials: 'PP' };
      default:
        return { name: 'R. Sharma', title: 'Control Operator', role: 'COMMAND_OPERATOR', initials: 'RS' };
    }
  };

  const details = getBadgeDetails(activeBadge);

  return (
    <header className="bg-[#10161C] border-b border-[#2A3540] px-5 py-2.5 flex items-center justify-between sticky top-0 z-50">
      {/* Left: Brand Identity with distinctive shield/radar icon */}
      <div className="flex items-center space-x-3.5">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-[#151D25] border border-[#2A3540] shadow-sm">
          <Shield className="w-5 h-5 text-emerald-400" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping opacity-75"></span>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-base font-bold tracking-tight text-white font-sans">
              OPERATION PRAHAAR <span className="text-emerald-400">AI</span>
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700 rounded">
              v1.0-SOC
            </span>
          </div>
          <p className="text-[11px] text-[#94A3B8] tracking-normal font-sans">
            AI-Powered Public Safety & Counter-Terrorism Decision Support
          </p>
        </div>
      </div>

      {/* Center: System Status & Tagline */}
      <div className="hidden xl:flex items-center space-x-3 text-xs bg-[#151D25] px-3.5 py-1.5 rounded-full border border-[#2A3540]">
        <div className="flex items-center space-x-1.5 text-[#94A3B8]">
          <span className="text-[11px] font-mono tracking-wide text-slate-300">
            "JUSTICE THROUGH INTELLIGENCE. PROTECTION THROUGH TECHNOLOGY."
          </span>
        </div>
      </div>

      {/* Right Controls & Telemetry Pills */}
      <div className="flex items-center space-x-2.5 text-xs">
        {/* Synthetic Demo Controller Trigger Button */}
        <button
          onClick={onOpenDemoController}
          className="flex items-center space-x-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-amber-200 px-3 py-1 rounded border border-amber-600/60 hover:border-amber-500 font-mono text-[11px] font-semibold transition-all shadow-sm cursor-pointer group"
          title="Open Synthetic Demo Controller for Hackathon Scenarios"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
          <span>⚡ DEMO CONTROLLER</span>
        </button>

        {/* Responsible AI Compliance Badge */}
        <div className="hidden md:flex items-center space-x-1.5 bg-[#151D25] text-emerald-300 px-2.5 py-1 rounded border border-emerald-900/60 font-mono text-[11px]">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>NO FACIAL RECOG</span>
        </div>

        {/* Pending Review Indicator Pill */}
        {unverifiedCount > 0 ? (
          <button
            onClick={onNavigateToReviews}
            className="flex items-center space-x-1.5 bg-amber-950/70 hover:bg-amber-900 text-amber-300 px-3 py-1 rounded border border-amber-700/80 font-mono text-[11px] font-bold transition-all shadow-sm"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{unverifiedCount} UNVERIFIED</span>
          </button>
        ) : (
          <div className="flex items-center space-x-1.5 bg-[#151D25] text-[#94A3B8] px-2.5 py-1 rounded border border-[#2A3540] font-mono text-[11px]">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>QUEUE NOMINAL</span>
          </div>
        )}

        {/* Backend Connectivity Status Pill */}
        <div
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded border font-mono text-[11px] ${
            isBackendLive
              ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/60'
              : 'bg-amber-950/50 text-amber-300 border-amber-800/60'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isBackendLive ? 'bg-emerald-400 shadow-[0_0_8px_#22C55E]' : 'bg-amber-400'
            }`}
          ></span>
          <span className="uppercase">
            {isBackendLive ? 'LIVE BACKEND' : 'OFFLINE FALLBACK'}
          </span>
        </div>

        {/* Operator Role Switcher Dropdown */}
        <div className="flex items-center space-x-2 bg-[#151D25] text-slate-200 px-2.5 py-1 rounded border border-[#2A3540] text-xs">
          <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-emerald-400 font-bold">
            {details.initials}
          </div>
          <div className="text-left leading-none">
            <select
              value={activeBadge}
              onChange={handleBadgeChange}
              className="bg-transparent text-slate-200 text-[11px] font-semibold focus:outline-none cursor-pointer pr-1"
            >
              <option value="IND-OPR-4081" className="bg-[#151D25] text-white">
                R. Sharma (Operator: Tier 1)
              </option>
              <option value="IND-ANA-2094" className="bg-[#151D25] text-white">
                P. Patel (Watch Officer: Tier 2)
              </option>
              <option value="IND-ADM-001" className="bg-[#151D25] text-white">
                V. Verma (Chief Controller: Tier 3)
              </option>
            </select>
            <div className="text-[9px] text-[#94A3B8] font-mono">{activeBadge}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
