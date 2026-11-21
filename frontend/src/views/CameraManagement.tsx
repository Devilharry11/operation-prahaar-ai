// Operation Prahaar AI - 2. Camera Management View
import React, { useState } from 'react';
import { Camera as CameraIcon, Plus, CheckCircle, AlertCircle, MapPin, Shield } from 'lucide-react';
import { Camera } from '../types';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <CameraIcon className="w-5 h-5 text-emerald-400" />
            <span>Authorized Camera Registry</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Registered CCTV input streams with defined virtual tripwires & crowd monitoring polygons.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-2 bg-[#111713] p-1 rounded-md border border-[#27382B]">
          {['ALL', 'ONLINE', 'OFFLINE'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 text-xs font-mono rounded ${
                filter === tab
                  ? 'bg-[#1C2C20] text-emerald-400 border border-[#2F4835]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Camera Grid */}
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
              className="bg-[#111713] border border-[#27382B] rounded-lg overflow-hidden flex flex-col justify-between"
            >
              {/* Camera Preview Header */}
              <div className="p-4 border-b border-[#27382B]">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-mono text-emerald-400 font-bold">{cam.camera_code}</span>
                  <span
                    className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono ${
                      cam.status === 'ONLINE'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-red-950 text-red-300 border border-red-800'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>{cam.status}</span>
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white">{cam.name}</h3>
                <div className="flex items-center space-x-1 text-gray-400 text-xs mt-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{cam.location_id}</span>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="p-4 space-y-2 text-xs bg-[#0D1410] font-mono">
                <div className="flex justify-between text-gray-400">
                  <span>Stream Source:</span>
                  <span className="text-gray-200 truncate max-w-[160px]">{cam.stream_url}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Resolution / FPS:</span>
                  <span className="text-gray-200">{cam.resolution} @ {cam.fps} FPS</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Zone Polygon:</span>
                  <span className="text-emerald-400 font-bold">
                    {polygonPoints.length > 0 ? `${polygonPoints.length}-Point Polygon Active` : 'Default Grid'}
                  </span>
                </div>
              </div>

              {/* Footer Privacy Affirmation */}
              <div className="px-4 py-2 bg-[#141C16] border-t border-[#233527] flex items-center justify-between text-[11px] text-gray-400">
                <span className="flex items-center space-x-1">
                  <Shield className="w-3 h-3 text-emerald-400" />
                  <span>Privacy Preserving</span>
                </span>
                <span className="font-mono text-emerald-400">No Face Capture</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
