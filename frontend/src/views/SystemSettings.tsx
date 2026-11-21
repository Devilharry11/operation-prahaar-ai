// Operation Prahaar AI - 12. System Settings & Responsible AI Safeguards View
import React from 'react';
import { Settings, Shield, Lock, EyeOff, Database, Server } from 'lucide-react';
import { SystemHealth } from '../types';

interface SystemSettingsProps {
  health: SystemHealth | null;
}

export const SystemSettings: React.FC<SystemSettingsProps> = ({ health }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Settings className="w-5 h-5 text-emerald-400" />
          <span>System Settings & Responsible AI Governance</span>
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Constitutional safety parameters, privacy preservation flags, and hardware retention rules.
        </p>
      </div>

      {/* Safety Invariants Checklist */}
      <div className="bg-[#111713] border border-[#27382B] rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center space-x-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Active Ethical Guardrails (Hardcoded Invariants)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-[#16221A] border border-[#2F4835] rounded p-3 flex items-start space-x-3">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white">Facial Recognition: DISABLED</div>
              <div className="text-gray-300 text-[11px] mt-0.5">
                Zero facial landmark extraction or biometrics permitted by system configuration.
              </div>
            </div>
          </div>

          <div className="bg-[#16221A] border border-[#2F4835] rounded p-3 flex items-start space-x-3">
            <EyeOff className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white">Individual Profiling: DISABLED</div>
              <div className="text-gray-300 text-[11px] mt-0.5">
                No tracking based on clothing, demographic traits, or cross-camera re-identification.
              </div>
            </div>
          </div>

          <div className="bg-[#16221A] border border-[#2F4835] rounded p-3 flex items-start space-x-3">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white">Human-in-the-Loop: ENFORCED</div>
              <div className="text-gray-300 text-[11px] mt-0.5">
                All alerts default to UNVERIFIED. An authorized officer must review before escalation.
              </div>
            </div>
          </div>

          <div className="bg-[#16221A] border border-[#2F4835] rounded p-3 flex items-start space-x-3">
            <Database className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white">Data Minimization: ENFORCED</div>
              <div className="text-gray-300 text-[11px] mt-0.5">
                Ephemeral video processing in RAM buffer; raw frames discarded after optical flow.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Environment Information */}
      <div className="bg-[#111713] border border-[#27382B] rounded-lg p-5 text-xs font-mono space-y-2">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
          Runtime Environment Diagnostics
        </h3>
        <div className="flex justify-between py-1 border-b border-[#233527] text-gray-400">
          <span>Application Name:</span>
          <span className="text-white">{health?.app_name || 'OPERATION PRAHAAR AI'}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-[#233527] text-gray-400">
          <span>Target Architecture:</span>
          <span className="text-white">Windows 11 / Laptop Mini-PC Edge Simulation</span>
        </div>
        <div className="flex justify-between py-1 border-b border-[#233527] text-gray-400">
          <span>Database Engine:</span>
          <span className="text-emerald-400 font-bold">SQLite (Zero-Cost Local / prahaar.db)</span>
        </div>
        <div className="flex justify-between py-1 text-gray-400">
          <span>System Memory Cap:</span>
          <span className="text-white">8 GB Total Budget (~300 MB Allocated)</span>
        </div>
      </div>
    </div>
  );
};
