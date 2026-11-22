// Operation Prahaar AI - Edge Device Management (Enterprise SOC Redesign)
import React from 'react';
import { Cpu, Server, Activity, ShieldCheck, HardDrive } from 'lucide-react';
import { EdgeDevice } from '../types';
import { SectionHeader, StatusBadge } from '../components/Common';

interface EdgeDeviceManagementProps {
  devices: EdgeDevice[];
}

export const EdgeDeviceManagement: React.FC<EdgeDeviceManagementProps> = ({ devices }) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SectionHeader
        title="Edge Device Appliance Management"
        subtitle="Virtual laptop edge computing appliances and field Mini PC hardware nodes. Local processing telemetry."
        icon={Cpu}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {devices.map((dev) => (
          <div
            key={dev.id}
            className="bg-[#151D25] border border-[#2A3540] rounded-lg p-5 space-y-4 shadow-sm"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#2A3540]">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400">{dev.device_id}</span>
                <h3 className="text-sm font-semibold text-white mt-0.5">{dev.name}</h3>
              </div>
              <StatusBadge status={dev.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-[#10161C] p-3 rounded border border-[#2A3540]">
              <div>
                <span className="text-[#94A3B8] block text-[10px]">Appliance Type:</span>
                <span className="text-slate-200">{dev.device_type}</span>
              </div>
              <div>
                <span className="text-[#94A3B8] block text-[10px]">IP Endpoint:</span>
                <span className="text-slate-200">{dev.ip_address}</span>
              </div>
              <div>
                <span className="text-[#94A3B8] block text-[10px]">CPU Utilization:</span>
                <span className="text-emerald-400 font-bold">{dev.cpu_usage_pct.toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-[#94A3B8] block text-[10px]">Memory Footprint:</span>
                <span className="text-slate-200">{dev.ram_usage_mb.toFixed(0)} MB / 8 GB</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-[#94A3B8] pt-1">
              <span>Uptime: {Math.floor(dev.uptime_seconds / 3600)}h {Math.floor((dev.uptime_seconds % 3600) / 60)}m</span>
              <span>Last Heartbeat: {new Date(dev.last_heartbeat).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
