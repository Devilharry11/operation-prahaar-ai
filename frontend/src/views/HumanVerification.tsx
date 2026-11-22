// Operation Prahaar AI - 3-Tier Human Verification Console (Phase C Milestone C.3)
import React, { useState, useEffect } from 'react';
import { UserCheck, ShieldCheck, CheckCircle, XCircle, ArrowUpRight, AlertTriangle, Layers, RotateCcw, FileText } from 'lucide-react';
import { Alert, Incident, GovernanceQueueResponse, GovernanceQueueItem } from '../types';
import { PrahaarAPI, getActiveBadge } from '../services/api';
import { SectionHeader, StatusBadge } from '../components/Common';

interface HumanVerificationProps {
  alerts: Alert[];
  incidents: Incident[];
  onReviewCompleted: () => void;
}

export const HumanVerification: React.FC<HumanVerificationProps> = ({
  alerts,
  incidents,
  onReviewCompleted,
}) => {
  const [activeTier, setActiveTier] = useState<1 | 2 | 3>(1);
  const [queues, setQueues] = useState<GovernanceQueueResponse | null>(null);
  const [selectedItem, setSelectedItem] = useState<GovernanceQueueItem | null>(null);
  const [rationale, setRationale] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const activeBadge = getActiveBadge();

  const loadQueues = async () => {
    try {
      const q = await PrahaarAPI.getGovernanceQueues();
      setQueues(q);

      // Auto-select first pending item in current tier
      const currentList = activeTier === 1 ? q.tier1_pending : activeTier === 2 ? q.tier2_pending : q.tier3_pending;
      if (currentList.length > 0 && (!selectedItem || !currentList.find((i) => i.incident_id === selectedItem.incident_id))) {
        setSelectedItem(currentList[0]);
      } else if (currentList.length === 0) {
        setSelectedItem(null);
      }
    } catch (err) {
      console.error('Failed to load governance queues', err);
    }
  };

  useEffect(() => {
    loadQueues();
  }, [activeTier]);

  const handleTier1 = async (action: 'VERIFIED' | 'DISMISSED') => {
    if (!selectedItem) return;
    if (rationale.trim().length < 15) {
      setStatusMessage({ type: 'error', text: 'Operational rationale is mandatory and must be at least 15 characters.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      const res = await PrahaarAPI.submitTier1Review({
        incident_id: selectedItem.incident_id,
        action,
        rationale: rationale.trim(),
      });
      setStatusMessage({
        type: 'success',
        text: `Tier 1: Incident ${res.incident_code} marked as ${res.action} by ${res.operator_badge}. Status: ${res.new_status}.`,
      });
      setRationale('');
      await loadQueues();
      onReviewCompleted();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Tier 1 submission failed.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTier2 = async (action: 'CONFIRMED' | 'RETURNED') => {
    if (!selectedItem) return;
    if (rationale.trim().length < 15) {
      setStatusMessage({ type: 'error', text: 'Supervisory explanation is mandatory and must be at least 15 characters.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      const res = await PrahaarAPI.submitTier2Review({
        incident_id: selectedItem.incident_id,
        action,
        explanation: rationale.trim(),
      });
      setStatusMessage({
        type: 'success',
        text: `Tier 2: Watch Officer (${res.operator_badge}) marked Incident ${res.incident_code} as ${res.action}. Status: ${res.new_status}.`,
      });
      setRationale('');
      await loadQueues();
      onReviewCompleted();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Tier 2 submission failed.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTier3 = async (action: 'APPROVED' | 'REJECTED') => {
    if (!selectedItem) return;
    if (rationale.trim().length < 15) {
      setStatusMessage({ type: 'error', text: 'Chief Controller sign-off comments must be at least 15 characters.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      const res = await PrahaarAPI.submitTier3Review({
        incident_id: selectedItem.incident_id,
        action,
        controller_comments: rationale.trim(),
      });
      setStatusMessage({
        type: 'success',
        text: `Tier 3: Chief Controller (${res.operator_badge}) ${res.action} public safety advisory for ${res.incident_code}. Status: ${res.new_status}.`,
      });
      setRationale('');
      await loadQueues();
      onReviewCompleted();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Tier 3 executive submission failed.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const t1Count = queues?.tier1_pending.length || 0;
  const t2Count = queues?.tier2_pending.length || 0;
  const t3Count = queues?.tier3_pending.length || 0;
  const currentQueueList = activeTier === 1 ? queues?.tier1_pending || [] : activeTier === 2 ? queues?.tier2_pending || [] : queues?.tier3_pending || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SectionHeader
        title="Multi-Tier Human Governance Console (HITL)"
        subtitle="Mandatory 3-stage human-in-the-loop decision gate: Operator Verification -> Watch Officer Confirmation -> Chief Controller Sign-off."
        icon={UserCheck}
        actions={
          <div className="flex items-center space-x-2 font-mono text-[11px]">
            <span className="text-[#94A3B8]">Active Operator:</span>
            <span className="bg-[#151D25] text-emerald-300 border border-[#2A3540] px-2 py-0.5 rounded font-bold">
              {activeBadge}
            </span>
          </div>
        }
      />

      {statusMessage && (
        <div
          className={`p-3 rounded-md text-xs font-mono border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
              : 'bg-red-950/80 text-red-300 border-red-700'
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {/* 3 Tier Navigation Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => { setActiveTier(1); setStatusMessage(null); }}
          className={`p-3.5 rounded-lg border text-left transition-all ${
            activeTier === 1
              ? 'bg-[#151D25] border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.15)] text-white'
              : 'bg-[#10161C] border-[#2A3540] text-slate-400 hover:bg-[#151D25]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider flex items-center space-x-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-emerald-400">1</span>
              <span>Tier 1: Operator Review</span>
            </span>
            <span className={`px-2 py-0.5 text-[10px] font-mono rounded font-bold ${
              t1Count > 0 ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-slate-800 text-slate-400'
            }`}>
              {t1Count} PENDING
            </span>
          </div>
          <p className="text-[11px] text-[#94A3B8] font-sans mt-2">
            Control Room physical inspection & initial verification (VERIFIED / DISMISSED).
          </p>
        </button>

        <button
          onClick={() => { setActiveTier(2); setStatusMessage(null); }}
          className={`p-3.5 rounded-lg border text-left transition-all ${
            activeTier === 2
              ? 'bg-[#151D25] border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.15)] text-white'
              : 'bg-[#10161C] border-[#2A3540] text-slate-400 hover:bg-[#151D25]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider flex items-center space-x-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-blue-400">2</span>
              <span>Tier 2: Watch Officer</span>
            </span>
            <span className={`px-2 py-0.5 text-[10px] font-mono rounded font-bold ${
              t2Count > 0 ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'bg-slate-800 text-slate-400'
            }`}>
              {t2Count} PENDING
            </span>
          </div>
          <p className="text-[11px] text-[#94A3B8] font-sans mt-2">
            Supervisory tactical review (CONFIRMED / RETURNED TO TIER 1).
          </p>
        </button>

        <button
          onClick={() => { setActiveTier(3); setStatusMessage(null); }}
          className={`p-3.5 rounded-lg border text-left transition-all ${
            activeTier === 3
              ? 'bg-[#151D25] border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.15)] text-white'
              : 'bg-[#10161C] border-[#2A3540] text-slate-400 hover:bg-[#151D25]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider flex items-center space-x-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-purple-400">3</span>
              <span>Tier 3: Chief Controller</span>
            </span>
            <span className={`px-2 py-0.5 text-[10px] font-mono rounded font-bold ${
              t3Count > 0 ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-slate-800 text-slate-400'
            }`}>
              {t3Count} PENDING
            </span>
          </div>
          <p className="text-[11px] text-[#94A3B8] font-sans mt-2">
            Public Safety Advisory release sign-off (APPROVED / REJECTED).
          </p>
        </button>
      </div>

      {/* Main Review Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Queue for Current Tier */}
        <div className="bg-[#151D25] border border-[#2A3540] rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#2A3540]">
            <span className="text-xs font-mono uppercase text-[#94A3B8] font-bold">
              Tier {activeTier} Review Queue ({currentQueueList.length})
            </span>
            <StatusBadge status="PENDING HITL" variant={activeTier === 1 ? 'amber' : activeTier === 2 ? 'blue' : 'gray'} />
          </div>

          {currentQueueList.length === 0 ? (
            <div className="text-center py-12 text-[#94A3B8] text-xs">
              <ShieldCheck className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-60" />
              No incidents pending Tier {activeTier} review.
            </div>
          ) : (
            currentQueueList.map((item) => (
              <div
                key={item.incident_id}
                onClick={() => setSelectedItem(item)}
                className={`p-3 rounded-md cursor-pointer border transition-all ${
                  selectedItem?.incident_id === item.incident_id
                    ? 'bg-[#1B2630] border-emerald-500 text-white shadow-sm'
                    : 'bg-[#10161C] border-[#2A3540] text-slate-300 hover:bg-[#151D25]'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1 font-mono">
                  <span className="font-bold text-emerald-400">{item.incident_code}</span>
                  <StatusBadge status={item.status} />
                </div>
                <h4 className="text-xs font-semibold text-white line-clamp-1">{item.title}</h4>
                <div className="mt-2 text-[10px] font-mono text-[#94A3B8] flex justify-between">
                  <span>Priority: {item.severity}</span>
                  <span>Conf: {(item.confidence_score * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Decision Execution Panel */}
        <div className="lg:col-span-2 bg-[#151D25] border border-[#2A3540] rounded-lg p-5">
          {selectedItem ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#2A3540]">
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {selectedItem.incident_code}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {selectedItem.title}
                  </h3>
                </div>
                <div className="text-right font-mono text-xs">
                  <span className="text-[#94A3B8] block text-[10px]">Current Status:</span>
                  <StatusBadge status={selectedItem.status} />
                </div>
              </div>

              {/* Context Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono bg-[#10161C] p-3 rounded border border-[#2A3540]">
                <div>
                  <span className="text-[#94A3B8] block text-[10px]">Confidence:</span>
                  <span className="text-emerald-400 font-bold">{(selectedItem.confidence_score * 100).toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-[#94A3B8] block text-[10px]">Uncertainty:</span>
                  <span className="text-amber-400 font-bold">{selectedItem.uncertainty_level}</span>
                </div>
                <div>
                  <span className="text-[#94A3B8] block text-[10px]">Registered Tier:</span>
                  <span className="text-white font-bold">Stage {activeTier} of 3</span>
                </div>
              </div>

              {/* Prior Tier History if available */}
              {activeTier >= 2 && selectedItem.tier1_rationale && (
                <div className="bg-[#10161C] border border-[#2A3540] p-3 rounded text-xs space-y-1">
                  <span className="text-emerald-400 font-mono font-bold block text-[10px] uppercase">
                    Prior Tier 1 Operator Verification:
                  </span>
                  <p className="text-slate-300 font-sans italic">{selectedItem.tier1_rationale}</p>
                </div>
              )}

              {activeTier === 3 && selectedItem.tier2_explanation && (
                <div className="bg-[#10161C] border border-[#2A3540] p-3 rounded text-xs space-y-1">
                  <span className="text-blue-400 font-mono font-bold block text-[10px] uppercase">
                    Prior Tier 2 Watch Officer Confirmation:
                  </span>
                  <p className="text-slate-300 font-sans italic">{selectedItem.tier2_explanation}</p>
                </div>
              )}

              {/* Rationale Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-mono text-[#94A3B8] uppercase font-bold">
                    {activeTier === 1
                      ? 'Operational Verification Rationale (Mandatory)'
                      : activeTier === 2
                      ? 'Supervisory Confirmation Rationale (Mandatory)'
                      : 'Chief Controller Sign-Off Comments (Mandatory)'}
                  </label>
                  <span className={`font-mono text-[11px] ${
                    rationale.trim().length >= 15 ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {rationale.trim().length} / 15 chars min
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  placeholder={
                    activeTier === 1
                      ? "Describe physical visual corroboration of aggregate scene (min 15 characters)..."
                      : activeTier === 2
                      ? "Document tactical assessment and recommendation for advisory release (min 15 characters)..."
                      : "Document executive authorization notes for public safety advisory release (min 15 characters)..."
                  }
                  className="w-full bg-[#10161C] text-slate-200 text-xs p-3 border border-[#2A3540] rounded font-sans focus:outline-none focus:border-emerald-500"
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-[#2A3540]">
                <div className="text-[11px] font-mono text-[#94A3B8]">
                  Submitting as badge: <span className="text-emerald-400 font-bold">{activeBadge}</span>
                </div>

                <div className="flex items-center space-x-3">
                  {activeTier === 1 && (
                    <>
                      <button
                        onClick={() => handleTier1('DISMISSED')}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-red-950/70 hover:bg-red-900 text-red-300 border border-red-800 rounded text-xs font-mono font-bold transition-all disabled:opacity-50"
                      >
                        DISMISS INCIDENT
                      </button>
                      <button
                        onClick={() => handleTier1('VERIFIED')}
                        disabled={isSubmitting}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded text-xs font-mono font-bold transition-all shadow-sm disabled:opacity-50"
                      >
                        VERIFY INCIDENT (TIER 1) &rarr;
                      </button>
                    </>
                  )}

                  {activeTier === 2 && (
                    <>
                      <button
                        onClick={() => handleTier2('RETURNED')}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-amber-950/70 hover:bg-amber-900 text-amber-300 border border-amber-800 rounded text-xs font-mono font-bold transition-all disabled:opacity-50"
                      >
                        RETURN TO TIER 1
                      </button>
                      <button
                        onClick={() => handleTier2('CONFIRMED')}
                        disabled={isSubmitting}
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-mono font-bold transition-all shadow-sm disabled:opacity-50"
                      >
                        CONFIRM INCIDENT (TIER 2) &rarr;
                      </button>
                    </>
                  )}

                  {activeTier === 3 && (
                    <>
                      <button
                        onClick={() => handleTier3('REJECTED')}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-red-950/70 hover:bg-red-900 text-red-300 border border-red-800 rounded text-xs font-mono font-bold transition-all disabled:opacity-50"
                      >
                        REJECT ADVISORY
                      </button>
                      <button
                        onClick={() => handleTier3('APPROVED')}
                        disabled={isSubmitting}
                        className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-mono font-bold transition-all shadow-sm disabled:opacity-50"
                      >
                        APPROVE ADVISORY RELEASE (TIER 3) &rarr;
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-[#94A3B8] text-xs">
              <FileText className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              Select an incident from the queue on the left to begin Tier {activeTier} review.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
