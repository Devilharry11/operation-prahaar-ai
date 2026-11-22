// Operation Prahaar AI - Crowd Analytics (Enterprise SOC Redesign)
import React from 'react';
import { Users, TrendingUp, AlertTriangle, Shield, Clock } from 'lucide-react';
import { CameraEvent } from '../types';
import { SectionHeader, MetricCard } from '../components/Common';

interface CrowdAnalyticsProps {
  events: CameraEvent[];
}

export const CrowdAnalytics: React.FC<CrowdAnalyticsProps> = ({ events }) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SectionHeader
        title="Crowd Dynamics & Flow Analytics"
        subtitle="Spatial density estimation and crowd congestion monitoring without facial recognition."
        icon={Users}
        actions={
          <span className="text-[11px] font-mono bg-blue-950/40 text-blue-300 border border-blue-800/60 px-2 py-1 rounded">
            [PROTOTYPE VISUALIZATION]
          </span>
        }
      />

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="Peak Congestion Ratio"
          value="84.2%"
          subValue="Platform 1 Concourse (NDLS)"
          icon={TrendingUp}
          variant="amber"
        />
        <MetricCard
          label="Dispersal Velocity Index"
          value="1.2 m/s"
          subValue="Nominal pedestrian flow"
          icon={Users}
          variant="green"
        />
        <MetricCard
          label="Surge Risk Probability"
          value="Elevated (78%)"
          subValue="Train arrival bottleneck window"
          icon={AlertTriangle}
          variant="amber"
        />
      </div>

      {/* Simulated Time-Series Density Chart */}
      <div className="bg-[#151D25] border border-[#2A3540] rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#2A3540]">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Spatial Density History (Past 60 Minutes)
          </h3>
          <span className="text-xs font-mono text-emerald-400">5 FPS Frame Sampling</span>
        </div>

        {/* CSS Bar Chart with enterprise slate background */}
        <div className="h-44 flex items-end justify-between gap-1 pt-6 px-3 bg-[#10161C] rounded border border-[#2A3540]">
          {[35, 42, 38, 45, 52, 48, 62, 70, 78, 84, 82, 79, 75, 68, 60, 58, 64, 72, 80, 84].map(
            (val, idx) => {
              const isAlert = val >= 75;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div
                    style={{ height: `${val * 1.5}px` }}
                    className={`w-full rounded-t transition-all ${
                      isAlert ? 'bg-amber-400 hover:bg-amber-300' : 'bg-emerald-600 hover:bg-emerald-500'
                    }`}
                  ></div>
                  <span className="text-[9px] font-mono text-[#94A3B8]">-{20 - idx}m</span>
                </div>
              );
            }
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-[#94A3B8] font-sans">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600"></span>
              <span>Nominal (&lt;75%)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400"></span>
              <span>Congestion Threshold (&ge;75%)</span>
            </span>
          </div>
          <span className="font-mono text-[11px]">Decision Support Telemetry • Prahaar AI</span>
        </div>
      </div>
    </div>
  );
};
