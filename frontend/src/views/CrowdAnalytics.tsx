// Operation Prahaar AI - Crowd Dynamics & Spatial Analytics (Phase C Milestone C.1)
import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, AlertTriangle, ShieldCheck, Activity, Gauge, MapPin, RefreshCw } from 'lucide-react';
import { CameraEvent, AnalyticsSummary, TrendPoint, HotspotItem } from '../types';
import { PrahaarAPI } from '../services/api';
import { SectionHeader, MetricCard, StatusBadge } from '../components/Common';

interface CrowdAnalyticsProps {
  events: CameraEvent[];
}

export const CrowdAnalytics: React.FC<CrowdAnalyticsProps> = ({ events }) => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sumData, trendData] = await Promise.all([
        PrahaarAPI.getAnalyticsSummary(),
        PrahaarAPI.getAnalyticsTrends(selectedZone === 'ALL' ? undefined : selectedZone),
      ]);
      setSummary(sumData);
      setTrends(trendData);
    } catch (err) {
      console.error('Failed to load analytics data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [selectedZone]);

  // Aggregate stats
  const densityRatio = summary ? (summary.system_density_ratio * 100).toFixed(1) : '62.0';
  const flowVelocity = summary ? summary.avg_flow_velocity_mps.toFixed(2) : '1.15';
  const criticalCount = summary ? summary.critical_zones_count : 1;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SectionHeader
        title="Spatial Density & Crowd Flow Analytics"
        subtitle="Aggregate non-identifying spatial density estimation, rolling 5-minute influx rates, and bottleneck monitoring."
        icon={Users}
        actions={
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono bg-blue-950/60 text-blue-300 border border-blue-800 px-2 py-1 rounded">
              [SYNTHETIC DEMO TELEMETRY]
            </span>
            <button
              onClick={loadData}
              disabled={isLoading}
              className="p-1.5 bg-[#151D25] hover:bg-[#1B2630] border border-[#2A3540] rounded text-slate-300 hover:text-white"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        }
      />

      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="Aggregate Density Envelope"
          value={`${densityRatio}%`}
          subValue="Cross-concourse average volume"
          icon={TrendingUp}
          variant={parseFloat(densityRatio) > 75 ? 'amber' : 'green'}
        />
        <MetricCard
          label="Corridor Flow Velocity"
          value={`${flowVelocity} m/s`}
          subValue="Nominal pedestrian throughput rate"
          icon={Gauge}
          variant="green"
        />
        <MetricCard
          label="Critical Congestion Zones"
          value={`${criticalCount} of ${summary?.total_monitored_zones || 4}`}
          subValue="Active threshold bottleneck warnings"
          icon={AlertTriangle}
          variant={criticalCount > 0 ? 'amber' : 'green'}
        />
      </div>

      {/* 4 Fictional Zones Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase text-[#94A3B8] font-bold tracking-wider">
            Monitored Demonstration Zones (Capacity & Flow)
          </h3>
          <div className="flex items-center space-x-1">
            {['ALL', 'ZONE-A', 'ZONE-B', 'ZONE-C', 'ZONE-D'].map((z) => (
              <button
                key={z}
                onClick={() => setSelectedZone(z)}
                className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-colors ${
                  selectedZone === z
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600 font-bold'
                    : 'bg-[#151D25] text-[#94A3B8] border-[#2A3540] hover:text-slate-200'
                }`}
              >
                {z}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(summary?.zones || []).map((zone) => {
            const pct = Math.round(zone.occupancy_ratio * 100);
            const isCrit = zone.congestion_level === 'CRITICAL';
            const isMod = zone.congestion_level === 'MODERATE';
            return (
              <div
                key={zone.zone_id}
                className={`bg-[#151D25] border rounded-lg p-4 space-y-3 transition-all ${
                  isCrit
                    ? 'border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.1)]'
                    : isMod
                    ? 'border-yellow-600/40'
                    : 'border-[#2A3540]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span>{zone.zone_id}</span>
                  </span>
                  <StatusBadge
                    status={zone.congestion_level}
                    variant={isCrit ? 'amber' : isMod ? 'amber' : 'green'}
                  />
                </div>

                <div className="text-xs text-slate-300 font-sans font-semibold">
                  {zone.zone_name}
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-[#94A3B8]">
                    <span>Occupancy: {zone.current_occupancy} / {zone.capacity_limit}</span>
                    <span className="font-bold text-white">{pct}%</span>
                  </div>
                  <div className="w-full bg-[#10161C] h-2 rounded-full overflow-hidden border border-[#2A3540]">
                    <div
                      style={{ width: `${Math.min(pct, 100)}%` }}
                      className={`h-full transition-all ${
                        isCrit ? 'bg-amber-500' : isMod ? 'bg-yellow-400' : 'bg-emerald-500'
                      }`}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-[10px] font-mono text-[#94A3B8] border-t border-[#2A3540]">
                  <div>
                    <span className="block text-[9px]">Velocity:</span>
                    <span className="text-white font-bold">{zone.flow_velocity_mps.toFixed(2)} m/s</span>
                  </div>
                  <div>
                    <span className="block text-[9px]">Trend:</span>
                    <span className={zone.density_trend === 'RISING' ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {zone.density_trend}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5-Minute Rolling Window Trend Telemetry (SVG Chart) */}
      <div className="bg-[#151D25] border border-[#2A3540] rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#2A3540]">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              5-Minute Rolling Density Telemetry (Historical Trend)
            </h3>
            <span className="text-[10px] text-[#94A3B8] font-sans">
              Dynamic heuristic spatial wave simulation • Showing zone: {selectedZone}
            </span>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
            Rolling Window: 5 Min Buckets
          </span>
        </div>

        {/* SVG Curve Chart */}
        <div className="h-52 bg-[#10161C] rounded border border-[#2A3540] p-4 relative flex flex-col justify-between">
          <svg className="w-full h-40 overflow-visible" viewBox="0 0 800 140" preserveAspectRatio="none">
            {/* Horizontal guide lines */}
            <line x1="0" y1="35" x2="800" y2="35" stroke="#2A3540" strokeDasharray="3 3" />
            <line x1="0" y1="70" x2="800" y2="70" stroke="#2A3540" strokeDasharray="3 3" />
            <line x1="0" y1="105" x2="800" y2="105" stroke="#2A3540" strokeDasharray="3 3" />
            {/* 75% Congestion threshold line */}
            <line x1="0" y1="35" x2="800" y2="35" stroke="#F59E0B" strokeWidth="1" strokeDasharray="4 2" />

            {/* Plot curve */}
            {trends.length > 1 && (() => {
              const points = trends.map((tp, idx) => {
                const x = (idx / (trends.length - 1)) * 800;
                // Scale density [0, 1] to y [130, 10]
                const y = 130 - (tp.avg_density * 120);
                return `${x},${y}`;
              }).join(' ');

              return (
                <>
                  <polyline
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                  />
                  {trends.map((tp, idx) => {
                    const x = (idx / (trends.length - 1)) * 800;
                    const y = 130 - (tp.avg_density * 120);
                    const isHigh = tp.avg_density >= 0.75;
                    return (
                      <circle
                        key={idx}
                        cx={x}
                        cy={y}
                        r={isHigh ? '4' : '3'}
                        fill={isHigh ? '#F59E0B' : '#10B981'}
                        stroke="#10161C"
                        strokeWidth="1.5"
                      />
                    );
                  })}
                </>
              );
            })()}
          </svg>

          {/* Time axis labels */}
          <div className="flex items-center justify-between text-[10px] font-mono text-[#94A3B8] pt-2 border-t border-[#2A3540]">
            <span>-25m</span>
            <span>-20m</span>
            <span>-15m</span>
            <span>-10m</span>
            <span>-5m</span>
            <span className="text-emerald-400 font-bold">Now</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[#94A3B8] font-sans">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
              <span>Nominal Flow Envelope (&lt;75%)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
              <span>Congestion Threshold (&ge;75%)</span>
            </span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">
            Strictly Non-Identifying Aggregate Geometry • Zero Facial Recognition
          </span>
        </div>
      </div>
    </div>
  );
};
