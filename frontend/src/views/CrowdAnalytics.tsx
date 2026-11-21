// Operation Prahaar AI - 4. Crowd Analytics View
import React from 'react';
import { Users, TrendingUp, AlertTriangle, Shield, Clock } from 'lucide-react';
import { CameraEvent } from '../types';

interface CrowdAnalyticsProps {
  events: CameraEvent[];
}

export const CrowdAnalytics: React.FC<CrowdAnalyticsProps> = ({ events }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Users className="w-5 h-5 text-emerald-400" />
          <span>Crowd Analytics & Flow Intelligence</span>
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Non-identifying spatial crowd density estimation, flow anomalies, and bottleneck detection.
        </p>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111713] border border-[#27382B] rounded-lg p-4">
          <span className="text-xs font-mono uppercase text-gray-400">Peak Congestion Ratio</span>
          <div className="text-2xl font-mono font-bold text-amber-400 mt-1">84.2%</div>
          <span className="text-[11px] text-gray-400 mt-1 block">Platform 1 Concourse (NDLS)</span>
        </div>
        <div className="bg-[#111713] border border-[#27382B] rounded-lg p-4">
          <span className="text-xs font-mono uppercase text-gray-400">Dispersal Velocity Index</span>
          <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">Nominal (1.2 m/s)</div>
          <span className="text-[11px] text-gray-400 mt-1 block">No stampede velocity anomaly</span>
        </div>
        <div className="bg-[#111713] border border-[#27382B] rounded-lg p-4">
          <span className="text-xs font-mono uppercase text-gray-400">Surge Risk Probability</span>
          <div className="text-2xl font-mono font-bold text-amber-400 mt-1">Elevated (78%)</div>
          <span className="text-[11px] text-gray-400 mt-1 block">Train arrival bottleneck window</span>
        </div>
      </div>

      {/* Simulated Time-Series Density Chart */}
      <div className="bg-[#111713] border border-[#27382B] rounded-lg p-5">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#27382B]">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Spatial Density Trend (Past 60 Minutes)
          </h3>
          <span className="text-xs font-mono text-emerald-400">Sampling Rate: 5 FPS</span>
        </div>

        {/* CSS Bar Chart Simulation */}
        <div className="h-44 flex items-end justify-between gap-1 pt-6 px-2 bg-[#0D1410] rounded border border-[#27382B]">
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
                  <span className="text-[9px] font-mono text-gray-400">-{20 - idx}m</span>
                </div>
              );
            }
          )}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-gray-400 font-mono">
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
          <span>Decision Support Analytics • Operation Prahaar AI</span>
        </div>
      </div>
    </div>
  );
};
