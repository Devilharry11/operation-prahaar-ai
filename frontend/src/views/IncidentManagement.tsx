// Operation Prahaar AI - Incident Management (Enterprise SOC Redesign)
import React, { useState } from 'react';
import { FolderKanban, Shield, AlertTriangle, ArrowRight } from 'lucide-react';
import { Incident } from '../types';
import { SectionHeader, StatusBadge } from '../components/Common';

interface IncidentManagementProps {
  incidents: Incident[];
  onNavigate: (view: any) => void;
}

export const IncidentManagement: React.FC<IncidentManagementProps> = ({ incidents, onNavigate }) => {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(incidents[0] || null);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SectionHeader
        title="Incident Management Dossier"
        subtitle="Correlated situational assessments synthesizing multi-camera spatial events and agency threat advisories."
        icon={FolderKanban}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Master Incident List */}
        <div className="bg-[#151D25] border border-[#2A3540] rounded-lg p-3.5 space-y-2.5">
          <div className="px-1 py-1 text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
            Active Incidents ({incidents.length})
          </div>
          {incidents.map((inc) => (
            <div
              key={inc.id}
              onClick={() => setSelectedIncident(inc)}
              className={`p-3 rounded-md cursor-pointer border transition-all ${
                selectedIncident?.id === inc.id
                  ? 'bg-[#1B2630] border-emerald-500 text-white shadow-sm'
                  : 'bg-[#10161C] border-[#2A3540] text-slate-300 hover:bg-[#151D25]'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1 font-mono">
                <span className="font-bold text-emerald-400">{inc.incident_code}</span>
                <StatusBadge status={inc.status} />
              </div>
              <h4 className="text-xs font-semibold text-white line-clamp-1">{inc.title}</h4>
              <div className="mt-2 text-[10px] font-mono text-[#94A3B8] flex justify-between">
                <span>Priority: {inc.priority}</span>
                <span>Conf: {(inc.confidence_score * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Detailed Explainability Card */}
        <div className="lg:col-span-2 bg-[#151D25] border border-[#2A3540] rounded-lg p-5">
          {selectedIncident ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#2A3540]">
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {selectedIncident.incident_code}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {selectedIncident.title}
                  </h3>
                </div>
                <button
                  onClick={() => onNavigate('human-verification')}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold font-sans rounded transition-all shadow-sm"
                >
                  Verify Incident &rarr;
                </button>
              </div>

              {/* Description */}
              <div className="text-xs text-slate-200 bg-[#10161C] p-3 rounded border border-[#2A3540] leading-relaxed">
                {selectedIncident.description}
              </div>

              {/* Explainability Engine Card */}
              <div className="bg-[#10161C] border border-[#2A3540] rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase text-emerald-400 font-bold tracking-wider">
                    AI Explainability & Reasoning Metrics
                  </h4>
                  <StatusBadge status={`Uncertainty: ${selectedIncident.uncertainty_level}`} variant="amber" />
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{selectedIncident.explanation}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono bg-[#151D25] p-3 rounded border border-[#2A3540]">
                  <div>
                    <span className="text-[#94A3B8] block text-[10px]">Triggered Rule:</span>
                    <span className="text-white font-semibold">{selectedIncident.triggered_rule}</span>
                  </div>
                  <div>
                    <span className="text-[#94A3B8] block text-[10px]">Confidence Score:</span>
                    <span className="text-emerald-400 font-bold">
                      {(selectedIncident.confidence_score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[#94A3B8] block text-[10px]">Current Status:</span>
                    <span className="text-white font-semibold">{selectedIncident.status}</span>
                  </div>
                </div>
              </div>

              {/* Chain of Custody & Privacy Safeguard Note */}
              <div className="text-[11px] text-[#94A3B8] flex items-center space-x-2 pt-1 font-sans">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  All operator verification determinations are permanently recorded in the immutable audit ledger.
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-[#94A3B8] text-xs">
              Select an incident from the ledger to inspect explainability metrics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
