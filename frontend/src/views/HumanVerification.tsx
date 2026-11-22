// Operation Prahaar AI - Human Verification Console (Enterprise SOC Redesign)
import React, { useState } from 'react';
import { UserCheck, ShieldCheck, CheckCircle, XCircle, ArrowUpRight } from 'lucide-react';
import { Alert, Incident } from '../types';
import { PrahaarAPI } from '../services/api';
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
    <div className="space-y-6 max-w-7xl mx-auto">
      <SectionHeader
        title="Human Verification Console (HITL Safeguard)"
        subtitle="Mandatory Human-in-the-Loop decision gate. AI provides context & uncertainty ratings; authorized human officer decides."
        icon={UserCheck}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Pending Unverified Queue */}
        <div className="bg-[#151D25] border border-[#2A3540] rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#2A3540]">
            <span className="text-xs font-mono uppercase text-[#94A3B8] font-bold">
              Unverified Queue ({unverifiedAlerts.length})
            </span>
            <StatusBadge status="AWAITING REVIEW" variant="amber" />
          </div>

          {unverifiedAlerts.length === 0 ? (
            <div className="text-center py-12 text-[#94A3B8] text-xs">
              <ShieldCheck className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-60" />
              All alerts verified. No pending incidents.
            </div>
          ) : (
            unverifiedAlerts.map((alt) => (
              <div
                key={alt.id}
                onClick={() => setSelectedAlert(alt)}
                className={`p-3 rounded-md cursor-pointer border transition-all ${
                  selectedAlert?.id === alt.id
                    ? 'bg-[#1B2630] border-amber-500 text-white shadow-sm'
                    : 'bg-[#10161C] border-[#2A3540] text-slate-300 hover:bg-[#151D25]'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1 font-mono">
                  <span className="font-bold text-amber-400">{alt.alert_code}</span>
                  <StatusBadge status={alt.review_status} />
                </div>
                <h4 className="text-xs font-semibold text-white">{alt.title}</h4>
                <div className="mt-2 text-[10px] font-mono text-[#94A3B8] flex justify-between">
                  <span>Severity: {alt.severity}</span>
                  <span>{new Date(alt.created_at).toLocaleTimeString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Inspection & Action Console */}
        <div className="lg:col-span-2 bg-[#151D25] border border-[#2A3540] rounded-lg p-5 space-y-4">
          {selectedAlert && linkedIncident ? (
            <>
              <div className="pb-3 border-b border-[#2A3540]">
                <div className="flex items-center space-x-2 text-xs font-mono">
                  <span className="font-bold text-emerald-400">{linkedIncident.incident_code}</span>
                  <span className="text-[#94A3B8]">• Linked to {selectedAlert.alert_code}</span>
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">{linkedIncident.title}</h3>
                <p className="text-xs text-slate-300 mt-1">{linkedIncident.description}</p>
              </div>

              {/* Confidence & Uncertainty Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#10161C] p-3 rounded border border-[#2A3540] text-xs font-mono">
                <div>
                  <span className="text-[#94A3B8] block text-[10px]">AI Confidence:</span>
                  <span className="text-emerald-400 font-bold">
                    {(linkedIncident.confidence_score * 100).toFixed(0)}%
                  </span>
                </div>
                <div>
                  <span className="text-[#94A3B8] block text-[10px]">Model Uncertainty:</span>
                  <span className="text-amber-400 font-bold">{linkedIncident.uncertainty_level}</span>
                </div>
                <div>
                  <span className="text-[#94A3B8] block text-[10px]">Triggered Heuristic:</span>
                  <span className="text-slate-200 truncate block">{linkedIncident.triggered_rule}</span>
                </div>
              </div>

              {/* Explainable Summary */}
              <div className="bg-[#10161C] border border-[#2A3540] rounded p-3 text-xs text-slate-200">
                <span className="font-mono text-emerald-400 font-bold block mb-1">
                  Explainable Alert Summary:
                </span>
                {linkedIncident.explanation}
              </div>

              {/* Reviewer Action Form */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-mono text-[#94A3B8] mb-1">
                    Reviewer Badge ID:
                  </label>
                  <input
                    type="text"
                    value={reviewerBadge}
                    onChange={(e) => setReviewerBadge(e.target.value)}
                    className="w-full sm:w-64 bg-[#10161C] text-slate-200 text-xs font-mono border border-[#2A3540] rounded px-3 py-1.5 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans text-[#94A3B8] mb-1 font-medium">
                    Operational Review Rationale / Notes (Mandatory for Tamper-Evident Audit Trail):
                  </label>
                  <textarea
                    rows={3}
                    placeholder="E.g., Officer inspected visual CCTV feed; verified localized crowd congestion caused by platform train arrival..."
                    value={rationale}
                    onChange={(e) => setRationale(e.target.value)}
                    className="w-full bg-[#10161C] text-slate-200 text-xs font-sans border border-[#2A3540] rounded p-3 focus:outline-none focus:border-emerald-500"
                  ></textarea>
                </div>

                {/* 3 Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    disabled={isSubmitting}
                    onClick={() => handleAction('VERIFIED')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-sans rounded flex items-center space-x-1.5 transition-all shadow"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Verify Incident</span>
                  </button>

                  <button
                    disabled={isSubmitting}
                    onClick={() => handleAction('DISMISSED')}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold font-sans rounded flex items-center space-x-1.5 transition-all shadow"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Dismiss / False Alarm</span>
                  </button>

                  <button
                    disabled={isSubmitting}
                    onClick={() => handleAction('ESCALATED')}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold font-sans rounded flex items-center space-x-1.5 transition-all shadow"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Escalate Incident</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-[#94A3B8] text-xs">
              Select an unverified alert from the queue to conduct human review.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
