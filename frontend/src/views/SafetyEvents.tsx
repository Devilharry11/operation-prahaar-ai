// Operation Prahaar AI - 5. Safety Events View
import React from 'react';
import { ShieldAlert, AlertCircle, Clock, MapPin } from 'lucide-react';
import { CameraEvent } from '../types';

interface SafetyEventsProps {
  events: CameraEvent[];
}

export const SafetyEvents: React.FC<SafetyEventsProps> = ({ events }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-emerald-400" />
          <span>Safety Events Log</span>
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Raw spatial detections dispatched by edge vision modules. Strictly anonymized.
        </p>
      </div>

      {/* Events Table */}
      <div className="bg-[#111713] border border-[#27382B] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#16221A] text-gray-300 font-mono uppercase text-[11px] border-b border-[#27382B]">
              <tr>
                <th className="px-4 py-3">Event Type</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Density Score</th>
                <th className="px-4 py-3">Motion Energy</th>
                <th className="px-4 py-3">Camera Ref</th>
                <th className="px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#233527] font-mono">
              {events.map((evt) => (
                <tr key={evt.id} className="hover:bg-[#141C16] transition-colors">
                  <td className="px-4 py-3 font-semibold text-white">{evt.event_type}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        evt.severity === 'HIGH' || evt.severity === 'CRITICAL'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-[#1C2C20] text-emerald-300 border border-[#2F4835]'
                      }`}
                    >
                      {evt.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-amber-400">
                    {(evt.crowd_density_score * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-gray-300">{evt.motion_energy.toFixed(1)}</td>
                  <td className="px-4 py-3 text-emerald-400">{evt.camera_id}</td>
                  <td className="px-4 py-3 text-gray-400">
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
