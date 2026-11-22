// Operation Prahaar AI - Live & Sample Video Monitoring (Enterprise SOC Redesign)
import React, { useState, useEffect } from 'react';
import { Video, Play, Pause, AlertTriangle, ShieldCheck, Activity, Sparkles } from 'lucide-react';
import { Camera } from '../types';
import { SectionHeader, StatusBadge } from '../components/Common';

interface LiveVideoProps {
  cameras: Camera[];
}

export const LiveVideoMonitoring: React.FC<LiveVideoProps> = ({ cameras }) => {
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(cameras[0] || null);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [densityRatio, setDensityRatio] = useState<number>(0.84);
  const [simulatedBoxes, setSimulatedBoxes] = useState([
    { x: 120, y: 140, w: 50, h: 80 },
    { x: 210, y: 155, w: 45, h: 75 },
    { x: 310, y: 130, w: 55, h: 85 },
    { x: 420, y: 160, w: 48, h: 78 },
  ]);

  // Synthetic spatial box simulation
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      setDensityRatio((prev) => {
        const delta = (Math.random() - 0.48) * 0.04;
        return Math.min(0.96, Math.max(0.65, prev + delta));
      });
      setSimulatedBoxes((boxes) =>
        boxes.map((b) => ({
          ...b,
          x: Math.max(80, Math.min(540, b.x + (Math.random() - 0.5) * 6)),
          y: Math.max(120, Math.min(260, b.y + (Math.random() - 0.5) * 4)),
        }))
      );
    }, 1200);
    return () => clearInterval(interval);
  }, [isSimulating]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SectionHeader
        title="Live & Sample Video Feeds"
        subtitle="Local edge computer vision simulation with synthetic spatial bounding overlays. Zero facial capture."
        icon={Video}
        actions={
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono bg-amber-950/40 text-amber-300 border border-amber-800/60 px-2 py-1 rounded">
              [DEMO SIMULATION]
            </span>
            <select
              value={selectedCamera?.id || ''}
              onChange={(e) => {
                const cam = cameras.find((c) => c.id === e.target.value);
                if (cam) setSelectedCamera(cam);
              }}
              className="bg-[#151D25] text-slate-200 text-xs border border-[#2A3540] rounded px-3 py-1 font-mono focus:outline-none focus:border-emerald-500"
            >
              {cameras.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.camera_code} — {c.name}
                </option>
              ))}
            </select>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Video Canvas / Feed Overlay */}
        <div className="lg:col-span-2 bg-[#151D25] border border-[#2A3540] rounded-lg overflow-hidden flex flex-col">
          {/* Feed Title Bar */}
          <div className="bg-[#10161C] px-4 py-2.5 border-b border-[#2A3540] flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span className="font-bold text-emerald-400">
                REC • {selectedCamera?.camera_code}
              </span>
            </div>
            <div className="flex items-center space-x-3 text-[#94A3B8] text-[11px]">
              <span>640x360</span>
              <span>5.0 FPS</span>
              <span className="text-emerald-400 font-bold">EDGE INGESTION ACTIVE</span>
            </div>
          </div>

          {/* Simulated Video Player */}
          <div className="relative aspect-video bg-[#0A0D0E] flex items-center justify-center overflow-hidden border-b border-[#2A3540]">
            {/* Background Grid Pattern */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle, #22C55E 1px, transparent 1px), linear-gradient(to right, #151D25 1px, transparent 1px), linear-gradient(to bottom, #151D25 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            ></div>

            {/* Virtual Tripwire / Polygon Warning Line */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <polygon
                points="80,140 560,140 560,340 80,340"
                fill="rgba(34, 197, 94, 0.03)"
                stroke="#22C55E"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text x="90" y="130" fill="#22C55E" fontSize="10" fontFamily="monospace">
                [VIRTUAL PERIMETER ZONE: PLATFORM 1 CONCOURSE]
              </text>
            </svg>

            {/* Simulated Anonymized Bounding Boxes */}
            {simulatedBoxes.map((box, idx) => (
              <div
                key={idx}
                style={{
                  left: `${(box.x / 640) * 100}%`,
                  top: `${(box.y / 360) * 100}%`,
                  width: `${(box.w / 640) * 100}%`,
                  height: `${(box.h / 360) * 100}%`,
                }}
                className="absolute border border-emerald-400 bg-emerald-500/10 pointer-events-none transition-all duration-700"
              >
                <div className="absolute -top-3.5 left-0 bg-[#10161C] px-1 text-[8px] font-mono text-emerald-400 border border-emerald-800 rounded-sm whitespace-nowrap">
                  CLUSTER #{idx + 1}
                </div>
              </div>
            ))}

            {/* HUD Telemetry Overlay */}
            <div className="absolute bottom-3 left-3 bg-[#10161C]/90 backdrop-blur-sm border border-[#2A3540] px-3 py-1.5 rounded text-[11px] font-mono text-slate-200 space-y-0.5">
              <div className="flex items-center space-x-2">
                <span className="text-[#94A3B8]">Crowd Density:</span>
                <span className="text-amber-400 font-bold">{(densityRatio * 100).toFixed(1)}%</span>
              </div>
              <div className="text-[10px] text-[#94A3B8]">Spatial Optics: MOG2 Optical Flow</div>
            </div>

            {/* Privacy Watermark */}
            <div className="absolute top-3 right-3 bg-[#151D25]/90 backdrop-blur-sm border border-[#2A3540] px-2.5 py-1 rounded text-[10px] font-mono text-emerald-300 flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>NON-IDENTIFYING SPATIAL FEED</span>
            </div>
          </div>

          {/* Controls Footer */}
          <div className="p-3 bg-[#10161C] flex items-center justify-between text-xs font-sans">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className="px-3 py-1 bg-[#1B2630] hover:bg-slate-700 text-slate-200 border border-[#2A3540] rounded font-mono flex items-center space-x-1.5"
            >
              {isSimulating ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
              <span>{isSimulating ? 'Pause Simulation' : 'Resume Simulation'}</span>
            </button>
            <div className="text-[11px] font-mono text-[#94A3B8]">
              Host: Laptop Mini-PC Edge Node (8 GB RAM Budget)
            </div>
          </div>
        </div>

        {/* Right: Real-time Telemetry Diagnostics */}
        <div className="space-y-4">
          <div className="bg-[#151D25] border border-[#2A3540] rounded-lg p-4">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block mb-2">
              Crowd Congestion Ratio
            </span>
            <div className="text-3xl font-mono font-bold text-amber-400">
              {(densityRatio * 100).toFixed(1)}%
            </div>
            <div className="w-full bg-[#10161C] h-2 rounded-full overflow-hidden mt-3 border border-[#2A3540]">
              <div
                className="bg-amber-400 h-full transition-all duration-500"
                style={{ width: `${densityRatio * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-[#94A3B8] mt-1.5">
              <span>Nominal: &lt; 60%</span>
              <span className="text-amber-400 font-bold">Alert Threshold: 75%</span>
            </div>
          </div>

          <div className="bg-[#151D25] border border-[#2A3540] rounded-lg p-4 space-y-3">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block">
              Safety Event Engine Diagnostic
            </span>

            <div className="bg-[#10161C] border border-[#2A3540] rounded p-2.5 text-xs font-mono space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Active Rule:</span>
                <span className="text-emerald-400">CONGESTION_RAPID_BUILDUP</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Perimeter Breach:</span>
                <span className="text-slate-300">CLEAR (0 Vectors)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">HITL Gate:</span>
                <span className="text-amber-400 font-bold">UNVERIFIED QUEUE</span>
              </div>
            </div>

            <div className="text-[11px] text-[#94A3B8] bg-[#10161C] p-2.5 rounded border border-[#2A3540] leading-relaxed">
              <div className="font-semibold text-slate-200 mb-0.5">Responsible AI Guardrail:</div>
              Frames are processed purely in ephemeral RAM and discarded immediately. No video stream is persisted.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
