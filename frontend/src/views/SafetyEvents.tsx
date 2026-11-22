// Operation Prahaar AI - Safety Events (Enterprise SOC Redesign)
import React, { useState } from 'react';
import { ShieldAlert, Clock, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';
import { CameraEvent } from '../types';
import { SectionHeader, StatusBadge } from '../components/Common';
import { PrahaarAPI } from '../services/api';

interface SafetyEventsProps {
  events: CameraEvent[];
  onIncidentGenerated?: () => void;
}

export const SafetyEvents: React.FC<SafetyEventsProps> = ({ events, onIncidentGenerated }) => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleGenerateSyntheticEvent = async () => {
    setIsGenerating(true);
    setFeedback(null);
    try {
      const res = await PrahaarAPI.generateSyntheticIncident('ZONE-A', 'HIGH');
      setFeedback(`Synthetic edge event recorded: ${res.event_id} (Incident ${res.incident_id})`);
      if (onIncidentGenerated) {
        onIncidentGenerated();
      }
    } catch (err: any) {
      setFeedback(err.message || 'Failed to generate synthetic event');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setFeedback(null), 6000);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SectionHeader
        title="Edge Safety Events Ledger"
        subtitle="Raw spatial detection packets dispatched by local edge nodes. Strict data minimization."
        icon={ShieldAlert}
        actions={
          <button
            onClick={handleGenerateSyntheticEvent}
            disabled={isGenerating}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold rounded transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'GENERATING...' : '⚡ GENERATE SYNTHETIC EVENT'}</span>
          </button>
        }
      />

      {feedback && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-lg text-emerald-300 text-xs font-mono flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {events.length === 0 ? (
        <div className="bg-[#151D25] border border-[#2A3540] rounded-lg p-8 text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-slate-500 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-white">No Edge Safety Events Recorded</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Ledger is currently empty. Click &quot;Generate Synthetic Event&quot; to inject a simulated spatial crowd surge packet (≥75% density) from edge camera nodes.
            </p>
          </div>
          <button
            onClick={handleGenerateSyntheticEvent}
            disabled={isGenerating}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold rounded transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Synthetic Event (Zone A)</span>
          </button>
        </div>
      ) : (
        <div className="bg-[#151D25] border border-[#2A3540] rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#10161C] text-[#94A3B8] font-mono uppercase text-[11px] border-b border-[#2A3540]">
                <tr>
                  <th className="px-4 py-3">Event Type</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Density Ratio</th>
                  <th className="px-4 py-3">Motion Energy</th>
                  <th className="px-4 py-3">Camera Reference</th>
                  <th className="px-4 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3540] font-mono">
                {events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-[#1B2630] transition-colors">
                    <td className="px-4 py-3 font-semibold text-white">{evt.event_type}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={evt.severity} />
                    </td>
                    <td className="px-4 py-3 text-amber-400 font-bold">
                      {(evt.crowd_density_score * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-slate-300">{evt.motion_energy.toFixed(1)}</td>
                    <td className="px-4 py-3 text-emerald-400 font-bold">{evt.camera_id}</td>
                    <td className="px-4 py-3 text-[#94A3B8]">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
