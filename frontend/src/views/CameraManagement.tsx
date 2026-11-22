// Operation Prahaar AI - Camera Management (Enterprise SOC Redesign)
import React, { useState } from 'react';
import { Camera as CameraIcon, MapPin, Shield, Radio, CheckCircle, AlertCircle } from 'lucide-react';
import { Camera } from '../types';
import { SectionHeader, StatusBadge } from '../components/Common';

interface CameraManagementProps {
  cameras: Camera[];
}

export const CameraManagement: React.FC<CameraManagementProps> = ({ cameras }) => {
  const [filter, setFilter] = useState<string>('ALL');

  const filteredCameras = cameras.filter((c) => {
    if (filter === 'ALL') return true;
    return c.status === filter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SectionHeader
        title="Authorized Camera Registry"
        subtitle="Registered public safety CCTV streams with defined spatial monitoring polygons. Zero biometric processing."
        icon={CameraIcon}
        actions={
          <div className="flex items-center space-x-1.5 bg-[#151D25] p-1 rounded-md border border-[#2A3540]">
            {['ALL', 'ONLINE', 'OFFLINE'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 text-xs font-mono rounded transition-all ${
                  filter === tab
                    ? 'bg-[#1B2630] text-emerald-400 font-semibold border border-emerald-800/60 shadow-sm'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        }
      />

      {/* Camera Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCameras.map((cam) => {
          let polygonPoints = [];
          try {
            if (cam.zone_polygon_json) {
              polygonPoints = JSON.parse(cam.zone_polygon_json);
            }
          } catch (e) {
            polygonPoints = [];
          }

          return (
            <div
              key={cam.id}
              className="bg-[#151D25] border border-[#2A3540] rounded-lg overflow-hidden flex flex-col justify-between hover:border-slate-500 transition-all shadow-sm"
            >
              {/* Card Header */}
              <div className="p-4 border-b border-[#2A3540]">
                <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                  <span className="font-bold text-emerald-400 tracking-wide">{cam.camera_code}</span>
                  <StatusBadge status={cam.status} />
                </div>
                <h3 className="text-sm font-semibold text-white tracking-tight">{cam.name}</h3>
                <div className="flex items-center space-x-1.5 text-[#94A3B8] text-xs mt-1.5 font-sans">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{cam.location_id}</span>
                </div>
              </div>

              {/* Technical Specifications Matrix */}
              <div className="p-4 space-y-2 text-xs bg-[#10161C] font-mono text-slate-300">
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Stream Source:</span>
                  <span className="truncate max-w-[170px] text-slate-200">{cam.stream_url}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Resolution / FPS:</span>
                  <span className="text-slate-200">{cam.resolution} @ {cam.fps} FPS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Monitoring Zone:</span>
                  <span className="text-emerald-400 font-semibold">
                    {polygonPoints.length > 0 ? `${polygonPoints.length}-Vertex Polygon` : 'Full Frame'}
                  </span>
                </div>
              </div>

              {/* Footer Privacy Guarantee */}
              <div className="px-4 py-2.5 bg-[#151D25] border-t border-[#2A3540] flex items-center justify-between text-[11px] text-[#94A3B8]">
                <span className="flex items-center space-x-1 text-emerald-400/90 font-sans">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Privacy Preserving</span>
                </span>
                <span className="font-mono text-slate-400 text-[10px]">NO FACIAL LOGS</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
