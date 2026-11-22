// Operation Prahaar AI - Safety Events (Enterprise SOC Redesign)
import React from 'react';
import { ShieldAlert, Clock, MapPin } from 'lucide-react';
import { CameraEvent } from '../types';
import { SectionHeader, StatusBadge } from '../components/Common';

interface SafetyEventsProps {
  events: CameraEvent[];
}

export const SafetyEvents: React.FC<SafetyEventsProps> = ({ events }) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SectionHeader
        title="Edge Safety Events Ledger"
        subtitle="Raw spatial detection packets dispatched by local edge nodes. Strict data minimization."
        icon={ShieldAlert}
      />

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
    </div>
  );
};
