// Operation Prahaar AI - Incident Management & Explainable AI (XAI) (Phase C Milestone C.2)
import React, { useState, useEffect } from 'react';
import { FolderKanban, Shield, AlertTriangle, ArrowRight, Brain, Cpu, CheckCircle2, Info } from 'lucide-react';
import { Incident, IncidentExplainability } from '../types';
import { PrahaarAPI } from '../services/api';
import { SectionHeader, StatusBadge } from '../components/Common';

interface IncidentManagementProps {
  incidents: Incident[];
  onNavigate: (view: any) => void;
}

export const IncidentManagement: React.FC<IncidentManagementProps> = ({ incidents, onNavigate }) => {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(incidents[0] || null);
  const [xaiData, setXaiData] = useState<IncidentExplainability | null>(null);
  const [isLoadingXai, setIsLoadingXai] = useState<boolean>(false);

  useEffect(() => {
    if (!selectedIncident && incidents.length > 0) {
      setSelectedIncident(incidents[0]);
    }
  }, [incidents, selectedIncident]);

  useEffect(() => {
    if (selectedIncident) {
      setIsLoadingXai(true);
      PrahaarAPI.getIncidentExplainability(selectedIncident.id)
        .then((data) => setXaiData(data))
        .catch((err) => console.error('Failed to load XAI explainability', err))
        .finally(() => setIsLoadingXai(false));
    }
  }, [selectedIncident]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SectionHeader
        title="Incident Management & Explainable AI (XAI) Dossier"
        subtitle="Correlated situational assessments synthesizing multi-camera spatial events, agency advisories, and reproducible XAI factor breakdowns."
        icon={FolderKanban}
        actions={
          <span className="text-[11px] font-mono bg-blue-950/60 text-blue-300 border border-blue-800 px-2 py-1 rounded">
            [SYNTHETIC DEMO]
          </span>
        }
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
              className={`p-3 rounded-md cursor-pointer border transition-all ${selectedIncident?.id === inc.id
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

              {/* Explainable AI Factor Breakdown */}
              <div className="bg-[#10161C] border border-[#2A3540] rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-mono uppercase text-emerald-400 font-bold tracking-wider">
                      Transparent Attribution Factor Breakdown (XAI)
                    </h4>
                  </div>
                  <StatusBadge status={`Uncertainty: ${selectedIncident.uncertainty_level}`} variant="amber" />
                </div>

                {xaiData ? (
                  <div className="space-y-3">
                    <div className="text-xs font-mono bg-[#151D25] p-3 rounded border border-[#2A3540] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-[#94A3B8]">Applied Heuristic Rule:</span>
                        <span className="text-white font-bold">{xaiData.rule_id}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 font-sans">{xaiData.rule_description}</p>
                    </div>

                    {/* Attribution Factors Table */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-[#94A3B8] uppercase tracking-wider block">
                        Measured Telemetry vs Safety Baseline:
                      </span>
                      {xaiData.factors.map((f, idx) => (
                        <div
                          key={idx}
                          className="bg-[#151D25] border border-[#2A3540] p-3 rounded text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between font-mono">
                            <span className="font-bold text-white">{f.factor_name}</span>
                            <span className="text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.5 rounded text-[10px]">
                              Weight: {f.weight_pct}%
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-[#94A3B8]">
                            <div>Measured: <span className="text-amber-300 font-semibold">{f.measured_value}</span></div>
                            <div>Baseline: <span className="text-slate-300">{f.safety_baseline}</span></div>
                          </div>
                          <p className="text-[11px] text-slate-400 font-sans pt-1 border-t border-[#2A3540]/60">
                            {f.diagnostic}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Metadata footer */}
                    <div className="grid grid-cols-2 gap-3 pt-2 text-[10px] font-mono text-[#94A3B8] border-t border-[#2A3540]">
                      <div>
                        Sensor Data Quality: <span className="text-emerald-400 font-bold">{(xaiData.data_quality_score * 100).toFixed(0)}%</span>
                      </div>
                      <div className="text-right">
                        Evaluation Hash: <span className="text-white font-mono">{xaiData.reproducible_hash.substring(0, 16)}...</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-blue-950/40 border border-blue-900/60 rounded text-[11px] font-sans text-blue-200">
                      {xaiData.non_identifying_disclaimer}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 py-6 text-center font-mono">
                    {isLoadingXai ? 'Synthesizing XAI factor weights...' : selectedIncident.explanation}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-[#94A3B8] text-xs">
              Select an incident to view situational assessment and XAI reasoning.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
