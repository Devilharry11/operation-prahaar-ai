// Operation Prahaar AI - Synthetic Demo Controller Modal
// Strictly limited to safe, non-identifying public-safety demonstration scenarios.

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Layers,
  History,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Shield,
  Send,
  RefreshCw,
  Cpu,
  Users,
  Activity,
  FileText,
} from 'lucide-react';
import { PrahaarAPI } from '../services/api';
import { DemoScenarioType, DemoEventResponse, Camera } from '../types';

interface DemoControllerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventGenerated: () => void;
  cameras: Camera[];
}

const SCENARIOS: {
  id: DemoScenarioType;
  title: string;
  badge: string;
  desc: string;
  icon: React.ElementType;
}[] = [
  {
    id: 'AGGREGATE_OCCUPANCY_EXCEEDED',
    title: 'Aggregate Occupancy Threshold Exceeded',
    badge: 'CROWD DENSITY (88%)',
    desc: 'Simulates spatial pedestrian saturation reaching 88% at transit terminal concourse.',
    icon: Users,
  },
  {
    id: 'SIMULATED_CONGESTION_ADVISORY',
    title: 'Simulated Congestion Advisory',
    badge: 'BOTTLENECK FLOW',
    desc: 'Simulates footfall velocity deceleration near stairwell ingress indicating bottleneck stall.',
    icon: Activity,
  },
  {
    id: 'SYSTEM_HEALTH_WARNING',
    title: 'Edge Processing Latency Spike',
    badge: 'EDGE CV LATENCY',
    desc: 'Simulates edge frame processing delay exceeding 200ms latency budget with auto downscale.',
    icon: Cpu,
  },
  {
    id: 'EDGE_CONNECTIVITY_INTERRUPTION',
    title: 'Edge Appliance Intermittent Drop',
    badge: 'TELEMETRY DROP',
    desc: 'Simulates edge node missed heartbeats. Verifies edge offline fallback pipeline.',
    icon: AlertTriangle,
  },
  {
    id: 'INFORMATION_ADVISORY',
    title: 'Informational Safety Advisory Notice',
    badge: 'INTELLIGENCE ADVISORY',
    desc: 'Synthesizes background public safety bulletin for heightened transit concourse vigilance.',
    icon: FileText,
  },
];

export const DemoControllerModal: React.FC<DemoControllerModalProps> = ({
  isOpen,
  onClose,
  onEventGenerated,
  cameras,
}) => {
  const [activeTab, setActiveTab] = useState<'single' | 'batch' | 'history' | 'reset'>('single');
  const [selectedScenario, setSelectedScenario] = useState<DemoScenarioType>('AGGREGATE_OCCUPANCY_EXCEEDED');
  const [selectedCameraId, setSelectedCameraId] = useState<string>(cameras[0]?.id || '');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [customNote, setCustomNote] = useState<string>('Hackathon Stage Demonstration Event');
  const [batchCount, setBatchCount] = useState<number>(3);
  const [operatorBadge, setOperatorBadge] = useState<string>('IND-OPR-4081');

  const [loading, setLoading] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [lastGeneratedEvent, setLastGeneratedEvent] = useState<DemoEventResponse | null>(null);
  const [historyItems, setHistoryItems] = useState<any[]>([]);

  useEffect(() => {
    if (cameras.length > 0 && !selectedCameraId) {
      setSelectedCameraId(cameras[0].id);
    }
  }, [cameras, selectedCameraId]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await PrahaarAPI.getDemoHistory(15, operatorBadge);
      setHistoryItems(data);
    } catch (err) {
      console.error('Failed to load demo history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'history') {
      loadHistory();
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleGenerateSingle = async () => {
    setLoading(true);
    setFeedbackMessage(null);
    setLastGeneratedEvent(null);
    try {
      const res = await PrahaarAPI.generateDemoEvent({
        scenario: selectedScenario,
        camera_id: selectedCameraId || undefined,
        severity,
        custom_note: customNote,
      }, operatorBadge);
      setLastGeneratedEvent(res);
      setFeedbackMessage({
        type: 'success',
        text: `Successfully generated ${res.incident_code} (${res.scenario}). Confirmed saved to database and sent to Human Review queue as UNVERIFIED.`,
      });
      onEventGenerated();
    } catch (err: any) {
      setLastGeneratedEvent(null);
      setFeedbackMessage({
        type: 'error',
        text: `Database Dispatch Failed: ${err.message}. Event was NOT created or persisted.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBatch = async () => {
    setLoading(true);
    setFeedbackMessage(null);
    try {
      const resList = await PrahaarAPI.generateDemoBatch({
        count: batchCount,
        camera_id: selectedCameraId || undefined,
      }, operatorBadge);
      setFeedbackMessage({
        type: 'success',
        text: `Generated batch of ${resList.length} synthetic demonstration events. All confirmed saved to database and dispatched to Human Review as UNVERIFIED.`,
      });
      onEventGenerated();
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: `Batch Generation Failed: ${err.message}. No demonstration events were persisted.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetData = async () => {
    if (!operatorBadge || operatorBadge.trim().length < 3) {
      setFeedbackMessage({
        type: 'error',
        text: 'Please provide a valid operator badge ID (e.g., IND-OPR-4081).',
      });
      return;
    }

    setLoading(true);
    setFeedbackMessage(null);
    try {
      const res = await PrahaarAPI.resetDemoData({
        confirm: true,
        operator_badge: operatorBadge,
      }, operatorBadge);
      setFeedbackMessage({
        type: 'success',
        text: `Demo reset complete: Removed ${res.deleted_incidents_count} incidents & ${res.deleted_alerts_count} alerts. Baseline data strictly preserved.`,
      });
      onEventGenerated();
      if (activeTab === 'history') {
        loadHistory();
      }
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: `Reset Operation Rejected: ${err.message}. Database remains unchanged.`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#10161C] border border-[#2A3540] rounded-xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-[#F1F5F9]">
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-[#2A3540] flex items-center justify-between bg-[#151D25]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  SYNTHETIC DEMO CONTROLLER
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-amber-950/60 text-amber-300 border border-amber-800 rounded">
                  HACKATHON EVALUATION MODE
                </span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Generates safe, non-identifying public-safety demonstration events for live evaluation.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1B2630] border border-transparent hover:border-[#2A3540] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Responsible AI Compliance Bar */}
        <div className="px-6 py-2 bg-[#0A0D0E] border-b border-[#2A3540] flex items-center justify-between text-[11px] font-mono text-[#94A3B8]">
          <div className="flex items-center space-x-2">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-300">
              RESPONSIBLE AI: Zero facial recognition • Synthetic telemetry only • Mandatory human review gate
            </span>
          </div>
          <span className="text-emerald-400 font-semibold">ALL ALERTS START AS UNVERIFIED</span>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#2A3540] bg-[#151D25] px-6">
          <button
            onClick={() => {
              setActiveTab('single');
              setFeedbackMessage(null);
            }}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'single'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-[#94A3B8] hover:text-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Single Scenario</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('batch');
              setFeedbackMessage(null);
            }}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'batch'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-[#94A3B8] hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Multi-Incident Batch</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('history');
              setFeedbackMessage(null);
            }}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'history'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-[#94A3B8] hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Demo History</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('reset');
              setFeedbackMessage(null);
            }}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'reset'
                ? 'border-red-400 text-red-300 font-semibold'
                : 'border-transparent text-[#94A3B8] hover:text-slate-200'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-[#10161C]">
          {/* Status Feedback Notice */}
          {feedbackMessage && (
            <div
              className={`p-3.5 rounded-lg border flex items-start space-x-3 text-xs ${
                feedbackMessage.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                  : 'bg-red-950/60 border-red-800 text-red-200'
              }`}
            >
              {feedbackMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 font-mono">{feedbackMessage.text}</div>
            </div>
          )}

          {/* TAB 1: Single Scenario */}
          {activeTab === 'single' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-2">
                  Select Safe Demonstration Scenario
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {SCENARIOS.map((sc) => {
                    const Icon = sc.icon;
                    const isSelected = selectedScenario === sc.id;
                    return (
                      <div
                        key={sc.id}
                        onClick={() => setSelectedScenario(sc.id)}
                        className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#1B2630] border-amber-500 shadow-md ring-1 ring-amber-500/40'
                            : 'bg-[#151D25] border-[#2A3540] hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div
                            className={`p-2 rounded ${
                              isSelected
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-[#10161C] text-slate-400'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-semibold text-white truncate">
                                {sc.title}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                              {sc.desc}
                            </p>
                            <span className="inline-block mt-2 px-1.5 py-0.5 text-[9px] font-mono uppercase bg-[#10161C] text-amber-400 border border-[#2A3540] rounded">
                              {sc.badge}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Configuration Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                    Target Camera Stream
                  </label>
                  <select
                    value={selectedCameraId}
                    onChange={(e) => setSelectedCameraId(e.target.value)}
                    className="w-full bg-[#151D25] border border-[#2A3540] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  >
                    {cameras.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.camera_code} ({c.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                    Simulated Severity Level
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full bg-[#151D25] border border-[#2A3540] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH (Standard)</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                    Demonstration Note
                  </label>
                  <input
                    type="text"
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="e.g. Stage Evaluation Demonstration"
                    className="w-full bg-[#151D25] border border-[#2A3540] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Trigger Button */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-[#94A3B8] font-mono">
                  → Dispatches Incident & Alert straight into the Human Review workflow
                </span>
                <button
                  onClick={handleGenerateSingle}
                  disabled={loading}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>GENERATE DEMONSTRATION EVENT</span>
                </button>
              </div>

              {/* Last Event Summary Card */}
              {lastGeneratedEvent && (
                <div className="p-4 rounded-lg bg-[#151D25] border border-emerald-800/60 text-xs font-mono space-y-1.5 shadow-lg">
                  <div className="flex items-center justify-between text-slate-300">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-emerald-400">DISPATCH CONFIRMATION</span>
                      <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 rounded">
                        DATABASE CONFIRMED • PERSISTED
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(lastGeneratedEvent.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div>
                      <span className="text-slate-400">Incident Code: </span>
                      <span className="text-white font-bold">{lastGeneratedEvent.incident_code}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Alert Code: </span>
                      <span className="text-white font-bold">{lastGeneratedEvent.alert_code}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Scenario: </span>
                      <span className="text-slate-200">{lastGeneratedEvent.scenario}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Review Status: </span>
                      <span className="text-amber-400 font-bold">
                        {lastGeneratedEvent.review_status}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Multi-Incident Batch */}
          {activeTab === 'batch' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[#151D25] border border-[#2A3540]">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                  Batch Multi-Incident Generation
                </h3>
                <p className="text-xs text-[#94A3B8] mb-4 leading-relaxed">
                  Generates an interleaved sequence of distinct demonstration incidents (occupancy surge,
                  stairwell congestion, edge latency warning, and security advisory). Ideal for
                  demonstrating queue prioritization, triage, and rapid human verification under load.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                      Batch Event Count
                    </label>
                    <div className="flex space-x-3">
                      {[3, 4, 5].map((cnt) => (
                        <button
                          key={cnt}
                          onClick={() => setBatchCount(cnt)}
                          className={`flex-1 py-2 text-xs font-mono font-bold rounded border transition-colors ${
                            batchCount === cnt
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                              : 'bg-[#10161C] text-[#94A3B8] border-[#2A3540] hover:text-white'
                          }`}
                        >
                          {cnt} EVENTS
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                      Target Camera Stream
                    </label>
                    <select
                      value={selectedCameraId}
                      onChange={(e) => setSelectedCameraId(e.target.value)}
                      className="w-full bg-[#10161C] border border-[#2A3540] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    >
                      {cameras.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.camera_code} ({c.name})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-5 flex justify-end">
                  <button
                    onClick={handleGenerateBatch}
                    disabled={loading}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Layers className="w-4 h-4" />
                    )}
                    <span>GENERATE {batchCount} DEMO EVENTS</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Demo History */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#94A3B8]">
                  Recent Synthetic Demonstration Incidents ({historyItems.length})
                </span>
                <button
                  onClick={loadHistory}
                  disabled={loading}
                  className="px-2.5 py-1 text-xs bg-[#151D25] hover:bg-[#1B2630] text-slate-300 border border-[#2A3540] rounded flex items-center space-x-1.5"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {historyItems.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#94A3B8] border border-dashed border-[#2A3540] rounded-lg">
                  No synthetic demonstration events currently in history. Generate some above.
                </div>
              ) : (
                <div className="border border-[#2A3540] rounded-lg overflow-hidden bg-[#151D25]">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#1B2630] text-[#94A3B8] border-b border-[#2A3540]">
                      <tr>
                        <th className="p-2.5">INCIDENT CODE</th>
                        <th className="p-2.5 font-sans">TITLE</th>
                        <th className="p-2.5">ALERT</th>
                        <th className="p-2.5">VERIFICATION</th>
                        <th className="p-2.5">CONFIDENCE</th>
                        <th className="p-2.5">TIME</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2A3540]">
                      {historyItems.map((item) => (
                        <tr key={item.incident_id} className="hover:bg-[#1B2630]/60">
                          <td className="p-2.5 text-amber-300 font-bold">{item.incident_code}</td>
                          <td className="p-2.5 font-sans text-slate-200 truncate max-w-xs">
                            {item.title}
                          </td>
                          <td className="p-2.5 text-slate-300">{item.alert_code}</td>
                          <td className="p-2.5">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                item.review_status === 'UNVERIFIED'
                                  ? 'bg-amber-950/70 text-amber-300 border border-amber-700/60'
                                  : item.review_status === 'VERIFIED'
                                  ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-700/60'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {item.review_status}
                            </span>
                          </td>
                          <td className="p-2.5 text-emerald-400">
                            {Math.round(item.confidence_score * 100)}%
                          </td>
                          <td className="p-2.5 text-slate-400 text-[11px]">
                            {new Date(item.created_at).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Reset Demo Data */}
          {activeTab === 'reset' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-red-950/20 border border-red-800/60 space-y-3">
                <div className="flex items-center space-x-2 text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    Safety-Preserving Demonstration Data Reset
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  This utility safely cleans up all incidents created with prefix{' '}
                  <code className="text-red-300 font-mono bg-red-950/80 px-1 py-0.5 rounded">
                    DEMO-INC-*
                  </code>{' '}
                  and alerts with prefix{' '}
                  <code className="text-red-300 font-mono bg-red-950/80 px-1 py-0.5 rounded">
                    DEMO-ALT-*
                  </code>
                  .
                </p>
                <div className="p-3 bg-[#10161C] border border-[#2A3540] rounded text-xs space-y-1 font-mono text-[#94A3B8]">
                  <div className="text-emerald-400 font-bold">✓ SAFETY GUARANTEE:</div>
                  <div>• Baseline seeded public-safety records (INC-2026-0001, etc.) remain strictly untouched.</div>
                  <div>• Location and Camera entities remain untouched.</div>
                  <div>• Reset operation is recorded permanently in the Immutable Audit Log.</div>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Enter Operator Security Badge to Authorize Reset:
                  </label>
                  <input
                    type="text"
                    value={operatorBadge}
                    onChange={(e) => setOperatorBadge(e.target.value)}
                    placeholder="IND-OPR-4081"
                    className="w-full sm:w-64 bg-[#10161C] border border-[#2A3540] rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-400"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleResetData}
                    disabled={loading}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    <span>EXECUTE DEMO DATA RESET</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3 border-t border-[#2A3540] bg-[#151D25] flex items-center justify-between text-xs">
          <span className="text-[#94A3B8] font-mono text-[11px]">
            FastAPI Backend: <span className="text-emerald-400">/api/v1/demo/*</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1B2630] hover:bg-[#2A3540] text-slate-300 rounded font-medium text-xs transition-colors"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
