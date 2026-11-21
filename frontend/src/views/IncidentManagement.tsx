// Operation Prahaar AI - 6. Incident Management View
import React, { useState } from 'react';
import { FolderKanban, Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Incident } from '../types';

interface IncidentManagementProps {
  incidents: Incident[];
  onNavigate: (view: any) => void;
}

export const IncidentManagement: React.FC<IncidentManagementProps> = ({ incidents, onNavigate }) => {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(incidents[0] || null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <FolderKanban className="w-5 h-5 text-emerald-400" />
          <span>Incident Management Ledger</span>
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Synthesized situational incidents combining multi-camera spatial events and agency advisories.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Incident List */}
        <div className="bg-[#111713] border border-[#27382B] rounded-lg p-4 space-y-3">
          <h3 className="text-xs font-mono uppercase text-gray-400 font-bold mb-2">
            Active Situational Incidents ({incidents.length})
          </h3>
          {incidents.map((inc) => (
            <div
              key={inc.id}
              onClick={() => setSelectedIncident(inc)}
              className={`p-3.5 rounded-md cursor-pointer border transition-all ${
                selectedIncident?.id === inc.id
                  ? 'bg-[#1C2C20] border-emerald-500 text-white shadow-sm'
                  : 'bg-[#141C16] border-[#233527] text-gray-300 hover:bg-[#16221A]'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1 font-mono">
                <span className="font-bold text-emerald-400">{inc.incident_code}</span>
                <span className="px-2 py-0.5 text-[10px] bg-[#0D1410] rounded text-gray-300 border border-[#27382B]">
                  {inc.status}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-white">{inc.title}</h4>
              <div className="mt-2 text-[11px] font-mono text-gray-400 flex justify-between">
                <span>Priority: {inc.priority}</span>
                <span>Conf: {(inc.confidence_score * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Detailed Explainability Card */}
        <div className="lg:col-span-2 bg-[#111713] border border-[#27382B] rounded-lg p-5">
          {selectedIncident ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#27382B]">
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {selectedIncident.incident_code}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    {selectedIncident.title}
                  </h3>
                </div>
                <button
                  onClick={() => onNavigate('human-verification')}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold font-mono uppercase rounded transition-all"
                >
                  Action in Verification Queue
                </button>
              </div>

              {/* Description */}
              <div className="text-xs text-gray-300 leading-relaxed bg-[#0D1410] p-3 rounded border border-[#27382B]">
                {selectedIncident.description}
              </div>

              {/* Explainability Engine Card */}
              <div className="bg-[#16221A] border border-[#2F4835] rounded-lg p-4 space-y-2">
                <h4 className="text-xs font-mono uppercase text-emerald-400 font-bold tracking-wider">
                  AI Explainability & Reasoning Card
                </h4>
                <p className="text-xs text-gray-200">{selectedIncident.explanation}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono text-gray-300">
                  <div>
                    <span className="text-gray-400 block text-[10px]">Triggered Rule:</span>
                    <span className="text-white font-semibold">{selectedIncident.triggered_rule}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Confidence Score:</span>
                    <span className="text-emerald-400 font-semibold">
                      {(selectedIncident.confidence_score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Model Uncertainty:</span>
                    <span className="text-amber-400 font-semibold">
                      {selectedIncident.uncertainty_level}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chain of Custody & Privacy Safeguard Note */}
              <div className="text-[11px] text-gray-400 flex items-center space-x-2 pt-2">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  All decisions are stored with SHA-256 evidence signatures in the immutable audit log.
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 text-xs">
              Select an incident from the ledger to inspect explainability metrics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
