// Operation Prahaar AI - System Settings & Responsible AI Safeguards (Enterprise SOC Redesign)
import React from 'react';
import { Settings, Shield, Lock, EyeOff, Database, Server } from 'lucide-react';
import { SystemHealth } from '../types';
import { SectionHeader, StatusBadge } from '../components/Common';

interface SystemSettingsProps {
  health: SystemHealth | null;
}

export const SystemSettings: React.FC<SystemSettingsProps> = ({ health }) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SectionHeader
        title="System Governance & Responsible AI Settings"
        subtitle="Constitutional safety parameters, privacy preservation flags, and hardware retention rules."
        icon={Settings}
      />

      {/* Safety Invariants Matrix */}
      <div className="bg-[#151D25] border border-[#2A3540] rounded-lg p-5 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center space-x-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Active Ethical Safeguards (Architectural Invariants)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs font-sans">
          <div className="bg-[#10161C] border border-[#2A3540] rounded-lg p-3.5 flex items-start space-x-3">
            <div className="p-1.5 rounded bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-white">Facial Recognition: DISABLED</div>
              <div className="text-[#94A3B8] text-[11px] mt-0.5 leading-relaxed">
                Zero facial landmark extraction or biometrics permitted by system configuration.
              </div>
            </div>
          </div>

          <div className="bg-[#10161C] border border-[#2A3540] rounded-lg p-3.5 flex items-start space-x-3">
            <div className="p-1.5 rounded bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 shrink-0">
              <EyeOff className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-white">Individual Profiling: DISABLED</div>
              <div className="text-[#94A3B8] text-[11px] mt-0.5 leading-relaxed">
                No tracking based on clothing, demographic traits, or cross-camera re-identification.
              </div>
            </div>
          </div>

          <div className="bg-[#10161C] border border-[#2A3540] rounded-lg p-3.5 flex items-start space-x-3">
            <div className="p-1.5 rounded bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-white">Human-in-the-Loop: ENFORCED</div>
              <div className="text-[#94A3B8] text-[11px] mt-0.5 leading-relaxed">
                All alerts default to UNVERIFIED. An authorized officer must review before escalation.
              </div>
            </div>
          </div>

          <div className="bg-[#10161C] border border-[#2A3540] rounded-lg p-3.5 flex items-start space-x-3">
            <div className="p-1.5 rounded bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-white">Data Minimization: ENFORCED</div>
              <div className="text-[#94A3B8] text-[11px] mt-0.5 leading-relaxed">
                Ephemeral video processing in RAM buffer; raw frames discarded after optical flow.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Runtime Environment Diagnostics */}
      <div className="bg-[#151D25] border border-[#2A3540] rounded-lg p-5 text-xs font-mono space-y-2.5">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 font-mono">
          Runtime Platform Diagnostics
        </h3>
        <div className="flex justify-between py-1.5 border-b border-[#2A3540] text-[#94A3B8]">
          <span>Application Name:</span>
          <span className="text-white">{health?.app_name || 'OPERATION PRAHAAR AI'}</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-[#2A3540] text-[#94A3B8]">
          <span>Target Architecture:</span>
          <span className="text-white">Windows 11 / Laptop Mini-PC Edge Simulation</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-[#2A3540] text-[#94A3B8]">
          <span>Database Engine:</span>
          <span className="text-emerald-400 font-bold">SQLite (Localhost: prahaar.db)</span>
        </div>
        <div className="flex justify-between py-1.5 text-[#94A3B8]">
          <span>System Memory Cap:</span>
          <span className="text-white">8 GB Total Laptop Budget (~250 MB In-Use)</span>
        </div>
      </div>
    </div>
  );
};
