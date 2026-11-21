// Operation Prahaar AI - 3. Live & Sample Video Monitoring View
import React, { useState, useEffect } from 'react';
import { Video, Play, Pause, RefreshCw, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import { Camera } from '../types';

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

  // Subtle simulated jitter for crowd bounding boxes
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Video className="w-5 h-5 text-emerald-400" />
            <span>Live & Sample CCTV Video Monitoring</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Edge computer vision simulation on local laptop with synthetic spatial bounding overlays.
          </p>
        </div>

        {/* Camera Selector */}
        <div className="flex items-center space-x-2">
          <select
            value={selectedCamera?.id || ''}
            onChange={(e) => {
              const cam = cameras.find((c) => c.id === e.target.value);
              if (cam) setSelectedCamera(cam);
            }}
            className="bg-[#111713] text-gray-200 text-xs border border-[#27382B] rounded px-3 py-1.5 font-mono focus:outline-none focus:border-emerald-500"
          >
            {cameras.map((c) => (
              <option key={c.id} value={c.id}>
                {c.camera_code} — {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Monitoring Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Video Canvas / Feed Overlay */}
        <div className="lg:col-span-2 bg-[#0D1410] border border-[#27382B] rounded-lg overflow-hidden flex flex-col">
          {/* Feed Title Bar */}
          <div className="bg-[#111713] px-4 py-2.5 border-b border-[#27382B] flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span className="font-mono font-bold text-emerald-400">
                REC • {selectedCamera?.camera_code}
              </span>
            </div>
            <div className="flex items-center space-x-3 text-gray-400 font-mono text-[11px]">
              <span>640x360</span>
              <span>5.0 FPS</span>
              <span className="text-emerald-400">EDGE INGESTION ACTIVE</span>
            </div>
          </div>

          {/* Simulated Video Player with Spatial Overlays */}
          <div className="relative aspect-video bg-[#080C09] flex items-center justify-center overflow-hidden border-b border-[#27382B]">
            {/* Background Grid Pattern simulating CCTV Sensor */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle, #22C55E 1px, transparent 1px), linear-gradient(to right, #1B2E1E 1px, transparent 1px), linear-gradient(to bottom, #1B2E1E 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            ></div>

            {/* Virtual Tripwire / Polygon Warning Line */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <polygon
                points="80,140 560,140 560,340 80,340"
                fill="rgba(34, 197, 94, 0.04)"
                stroke="#22C55E"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text x="90" y="130" fill="#22C55E" fontSize="10" fontFamily="monospace">
                [VIRTUAL PERIMETER ZONE: PLATFORM CONCOURSE]
              </text>
            </svg>

            {/* Simulated Anonymized Bounding Boxes (Zero Facial Capture) */}
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
                <div className="absolute -top-3.5 left-0 bg-[#111713] px-1 text-[8px] font-mono text-emerald-400 border border-emerald-800 rounded-sm whitespace-nowrap">
                  CLUSTER #{idx + 1}
                </div>
              </div>
            ))}

            {/* In-feed Live Telemetry HUD */}
            <div className="absolute bottom-3 left-3 bg-[#111713]/85 backdrop-blur-sm border border-[#27382B] px-3 py-1.5 rounded text-[11px] font-mono text-gray-200 space-y-0.5">
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">Crowd Density:</span>
                <span className="text-amber-400 font-bold">{(densityRatio * 100).toFixed(1)}%</span>
              </div>
              <div className="text-[10px] text-gray-400">Spatial Optics: MOG2 Optical Flow</div>
            </div>

            {/* Privacy Watermark */}
            <div className="absolute top-3 right-3 bg-[#1C2C20]/80 backdrop-blur-sm border border-[#2F4835] px-2.5 py-1 rounded text-[10px] font-mono text-emerald-300 flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>NON-IDENTIFYING SPATIAL FEED</span>
            </div>
          </div>

          {/* Playback Controls & Throttle Status */}
          <div className="p-3 bg-[#111713] flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsSimulating(!isSimulating)}
                className="px-3 py-1 bg-[#1C2C20] hover:bg-[#2F4835] text-emerald-400 border border-[#2F4835] rounded font-mono flex items-center space-x-1"
              >
                {isSimulating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{isSimulating ? 'Pause Stream' : 'Resume Stream'}</span>
              </button>
            </div>
            <div className="text-[11px] font-mono text-gray-400">
              Host: <span className="text-gray-200">Laptop Mini-PC Simulation (8 GB RAM Budget)</span>
            </div>
          </div>
        </div>

        {/* Right: Real-time Telemetry & Threshold Diagnostics */}
        <div className="space-y-4">
          {/* Density Gauge Card */}
          <div className="bg-[#111713] border border-[#27382B] rounded-lg p-4">
            <h3 className="text-xs font-mono uppercase text-gray-400 tracking-wider mb-2">
              Crowd Congestion Gauge
            </h3>
            <div className="text-3xl font-mono font-bold text-amber-400">
              {(densityRatio * 100).toFixed(1)}%
            </div>
            <div className="w-full bg-[#1A231D] h-2.5 rounded-full overflow-hidden mt-3 border border-[#27382B]">
              <div
                className="bg-amber-400 h-full transition-all duration-500"
                style={{ width: `${densityRatio * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-gray-400 mt-1">
              <span>Nominal: &lt; 60%</span>
              <span className="text-amber-400 font-bold">Alert Threshold: 75%</span>
            </div>
          </div>

          {/* Trigger Diagnostics Card */}
          <div className="bg-[#111713] border border-[#27382B] rounded-lg p-4 space-y-3">
            <h3 className="text-xs font-mono uppercase text-gray-400 tracking-wider">
              Safety Event Engine Status
            </h3>

            <div className="bg-[#16221A] border border-[#2F4835] rounded p-2.5 text-xs space-y-1">
              <div className="flex items-center justify-between font-mono">
                <span className="text-gray-400">Active Rule:</span>
                <span className="text-emerald-400">CONGESTION_RAPID_BUILDUP</span>
              </div>
              <div className="flex items-center justify-between font-mono">
                <span className="text-gray-400">Tripwire Breach:</span>
                <span className="text-gray-300">CLEAR (0 Vectors)</span>
              </div>
              <div className="flex items-center justify-between font-mono">
                <span className="text-gray-400">Hitl Dispatch:</span>
                <span className="text-amber-400 font-bold">UNVERIFIED QUEUE</span>
              </div>
            </div>

            <div className="text-[11px] text-gray-400 bg-[#0D1410] p-2.5 rounded border border-[#27382B]">
              <div className="font-bold text-gray-300 mb-1">Responsible AI Guardrail:</div>
              Raw video frames are computed in RAM buffer and immediately discarded. No video is
              uploaded to the cloud or saved without explicit anonymization.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
