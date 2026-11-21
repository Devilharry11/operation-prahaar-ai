// Operation Prahaar AI - 9. Human Verification Console (Critical HITL Flow)
import React, { useState } from 'react';
import { UserCheck, ShieldCheck, AlertTriangle, CheckCircle, XCircle, ArrowUpRight, History } from 'lucide-react';
import { Alert, Incident } from '../types';
import { PrahaarAPI } from '../services/api';

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
  const unverifiedAlerts = alerts.filter((a) => a.review_status === 'UNVERIFIED');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(unverifiedAlerts[0] || null);
  const [reviewerBadge, setReviewerBadge] = useState<string>('IND-OPR-4081');
  const [rationale, setRationale] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const linkedIncident = incidents.find((i) => i.id === selectedAlert?.incident_id);

  const handleAction = async (action: 'VERIFIED' | 'DISMISSED' | 'ESCALATED') => {
    if (!selectedAlert || !linkedIncident) return;
    if (!rationale.trim() || rationale.length < 5) {
      setStatusMessage({ type: 'error', text: 'Operational rationale is mandatory (minimum 5 characters).' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      await PrahaarAPI.submitReview({
        incident_id: linkedIncident.id,
        alert_id: selectedAlert.id,
        reviewer_badge_or_username: reviewerBadge,
        action,
        rationale,
      });

      setStatusMessage({
        type: 'success',
        text: `Incident ${linkedIncident.incident_code} successfully marked as ${action} by Officer ${reviewerBadge}. Tamper-evident audit log appended.`,
      });
      setRationale('');
      onReviewCompleted();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Verification submission failed.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <UserCheck className="w-5 h-5 text-amber-400" />
          <span>Human Verification Console (HITL Safeguard)</span>
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Mandatory Human-in-the-Loop decision gate. AI provides context & uncertainty metrics; authorized human officer decides.
        </p>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Pending Queue */}
        <div className="bg-[#111713] border border-[#27382B] rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#27382B]">
            <span className="text-xs font-mono uppercase text-gray-400 font-bold">
              Unverified Queue ({unverifiedAlerts.length})
            </span>
            <span className="text-[10px] font-mono bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800">
              Awaiting Action
            </span>
          </div>

          {unverifiedAlerts.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-xs">
              <CheckCircle className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-50" />
              All alerts verified. No pending incidents.
            </div>
          ) : (
            unverifiedAlerts.map((alt) => (
              <div
                key={alt.id}
                onClick={() => setSelectedAlert(alt)}
                className={`p-3 rounded-md cursor-pointer border transition-all ${
                  selectedAlert?.id === alt.id
                    ? 'bg-[#1C2C20] border-amber-500 text-white shadow-sm'
                    : 'bg-[#141C16] border-[#233527] text-gray-300 hover:bg-[#16221A]'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1 font-mono">
                  <span className="font-bold text-amber-400">{alt.alert_code}</span>
                  <span className="text-[10px] text-amber-300 bg-amber-950 px-1.5 py-0.5 rounded">
                    {alt.review_status}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-white">{alt.title}</h4>
                <div className="mt-2 text-[10px] font-mono text-gray-400 flex justify-between">
                  <span>Severity: {alt.severity}</span>
                  <span>{new Date(alt.created_at).toLocaleTimeString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Inspection & Action Form */}
        <div className="lg:col-span-2 bg-[#111713] border border-[#27382B] rounded-lg p-5 space-y-5">
          {selectedAlert && linkedIncident ? (
            <>
              {/* Incident Header */}
              <div className="pb-3 border-b border-[#27382B]">
                <div className="flex items-center space-x-2 text-xs font-mono">
                  <span className="font-bold text-emerald-400">{linkedIncident.incident_code}</span>
                  <span className="text-gray-400">• Linked to {selectedAlert.alert_code}</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">{linkedIncident.title}</h3>
                <p className="text-xs text-gray-300 mt-1">{linkedIncident.description}</p>
              </div>

              {/* Evidence & Uncertainty HUD */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#0D1410] p-3 rounded border border-[#27382B] text-xs font-mono">
                <div>
                  <span className="text-gray-400 block text-[10px]">AI Confidence:</span>
                  <span className="text-emerald-400 font-bold">
                    {(linkedIncident.confidence_score * 100).toFixed(0)}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Model Uncertainty:</span>
                  <span className="text-amber-400 font-bold">{linkedIncident.uncertainty_level}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Triggered Rule:</span>
                  <span className="text-white truncate block">{linkedIncident.triggered_rule}</span>
                </div>
              </div>

              {/* Explainability Summary */}
              <div className="bg-[#16221A] border border-[#2F4835] rounded p-3 text-xs text-gray-200">
                <span className="font-mono text-emerald-400 font-bold block mb-1">
                  Explainable Alert Summary:
                </span>
                {linkedIncident.explanation}
              </div>

              {/* Reviewer Input Form */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">
                    Reviewer Badge / ID:
                  </label>
                  <input
                    type="text"
                    value={reviewerBadge}
                    onChange={(e) => setReviewerBadge(e.target.value)}
                    className="w-full sm:w-64 bg-[#0D1410] text-gray-200 text-xs font-mono border border-[#27382B] rounded px-3 py-1.5 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">
                    Operational Review Rationale / Notes (Mandatory for Audit Trail):
                  </label>
                  <textarea
                    rows={3}
                    placeholder="E.g., Officer inspected CCTV feed; verified pedestrian congestion bottleneck caused by delayed train arrival..."
                    value={rationale}
                    onChange={(e) => setRationale(e.target.value)}
                    className="w-full bg-[#0D1410] text-gray-200 text-xs font-sans border border-[#27382B] rounded p-3 focus:outline-none focus:border-emerald-500"
                  ></textarea>
                </div>

                {/* 3 Verification Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    disabled={isSubmitting}
                    onClick={() => handleAction('VERIFIED')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-mono uppercase tracking-wider rounded flex items-center space-x-1.5 transition-all shadow"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Verify Incident</span>
                  </button>

                  <button
                    disabled={isSubmitting}
                    onClick={() => handleAction('DISMISSED')}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold font-mono uppercase tracking-wider rounded flex items-center space-x-1.5 transition-all shadow"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Dismiss / False Alarm</span>
                  </button>

                  <button
                    disabled={isSubmitting}
                    onClick={() => handleAction('ESCALATED')}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold font-mono uppercase tracking-wider rounded flex items-center space-x-1.5 transition-all shadow"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Escalate Incident</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-gray-400 text-xs">
              Select an unverified alert from the queue to conduct human review.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
