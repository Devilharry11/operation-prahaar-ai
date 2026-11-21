// Operation Prahaar AI - 11. Edge Device Management View
import React from 'react';
import { Cpu, Server, Activity, ShieldCheck, HardDrive } from 'lucide-react';
import { EdgeDevice } from '../types';

interface EdgeDeviceManagementProps {
  devices: EdgeDevice[];
}

export const EdgeDeviceManagement: React.FC<EdgeDeviceManagementProps> = ({ devices }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-emerald-400" />
          <span>Edge Device Management</span>
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Virtual laptop edge appliances and future field-deployable Mini PC hardware nodes.
        </p>
      </div>

      {/* Device Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {devices.map((dev) => (
          <div
            key={dev.id}
            className="bg-[#111713] border border-[#27382B] rounded-lg p-5 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#27382B]">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400">{dev.device_id}</span>
                <h3 className="text-sm font-semibold text-white mt-0.5">{dev.name}</h3>
              </div>
              <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>{dev.status}</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-[#0D1410] p-3 rounded border border-[#27382B]">
              <div>
                <span className="text-gray-400 block text-[10px]">Device Type:</span>
                <span className="text-white">{dev.device_type}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">IP Endpoint:</span>
                <span className="text-white">{dev.ip_address}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">CPU Utilization:</span>
                <span className="text-emerald-400 font-bold">{dev.cpu_usage_pct.toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Memory Footprint:</span>
                <span className="text-white">{dev.ram_usage_mb.toFixed(0)} MB / 8 GB</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 pt-1">
              <span>Uptime: {Math.floor(dev.uptime_seconds / 3600)}h {Math.floor((dev.uptime_seconds % 3600) / 60)}m</span>
              <span>Heartbeat: {new Date(dev.last_heartbeat).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
