// Operation Prahaar AI - Command Center Header
import React from 'react';
import { Shield, Radio, Activity, Lock, AlertTriangle } from 'lucide-react';
import { SystemHealth } from '../types';

interface HeaderProps {
  health: SystemHealth | null;
  unverifiedCount: number;
}

export const Header: React.FC<HeaderProps> = ({ health, unverifiedCount }) => {
  return (
    <header className="bg-[#111713] border-b border-[#27382B] px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      {/* Brand Identity: Shield / Radar Logo */}
      <div className="flex items-center space-x-4">
        <div className="relative flex items-center justify-center w-11 h-11 rounded-lg bg-[#1C2C20] border border-[#2F4835] shadow-inner">
          <Shield className="w-6 h-6 text-emerald-400" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-ping opacity-75"></span>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full"></span>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold tracking-wider text-white">
              OPERATION PRAHAAR <span className="text-emerald-400">AI</span>
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-[#1C2C20] text-emerald-400 border border-[#2F4835] rounded">
              Prototype
            </span>
          </div>
          <p className="text-xs text-gray-400 tracking-wide">
            Decision-Support & National Public Safety Intelligence Platform
          </p>
        </div>
      </div>

      {/* Center Tagline / Slogan */}
      <div className="hidden lg:flex items-center space-x-2 text-xs font-mono tracking-widest text-emerald-400/80 bg-[#16221A] px-4 py-1.5 rounded-full border border-[#27382B]">
        <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span>"JUSTICE THROUGH INTELLIGENCE. PROTECTION THROUGH TECHNOLOGY."</span>
      </div>

      {/* Right Controls & Telemetry Badges */}
      <div className="flex items-center space-x-3 text-xs">
        {/* Responsible AI Compliance Badge */}
        <div className="flex items-center space-x-1.5 bg-[#1C2C20] text-emerald-300 px-3 py-1.5 rounded border border-[#2F4835]">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-mono">NO FACIAL RECOG</span>
        </div>

        {/* Unverified Queue Warning Indicator */}
        {unverifiedCount > 0 ? (
          <div className="flex items-center space-x-1.5 bg-amber-950/60 text-amber-300 px-3 py-1.5 rounded border border-amber-700/60 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono font-bold">{unverifiedCount} UNVERIFIED</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1.5 bg-[#1C2C20] text-gray-400 px-3 py-1.5 rounded border border-[#27382B]">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono">QUEUE CLEAR</span>
          </div>
        )}

        {/* Backend Connectivity Status */}
        <div className="flex items-center space-x-1.5 bg-[#0D1410] px-3 py-1.5 rounded border border-[#27382B]">
          <span
            className={`w-2 h-2 rounded-full ${
              health?.status === 'OPERATIONAL' ? 'bg-emerald-400 shadow-[0_0_8px_#22C55E]' : 'bg-amber-400'
            }`}
          ></span>
          <span className="font-mono text-gray-300 uppercase">
            {health?.status || 'CONNECTING'}
          </span>
        </div>
      </div>
    </header>
  );
};
