// Operation Prahaar AI - Tamper-Evident Audit Ledger (Phase C Milestone C.4)
import React, { useState } from 'react';
import { History, Search, ShieldCheck, ShieldAlert, CheckCircle, RefreshCw, KeyRound, Database } from 'lucide-react';
import { AuditLog, AuditVerificationResponse } from '../types';
import { PrahaarAPI } from '../services/api';
import { SectionHeader } from '../components/Common';

interface AuditLogsProps {
  logs: AuditLog[];
}

export const AuditLogs: React.FC<AuditLogsProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<AuditVerificationResponse | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);

  const filteredLogs = logs.filter((log) => {
    return (
      log.action_summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.record_reference && log.record_reference.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const handleVerifyChain = async () => {
    setIsVerifying(true);
    setVerifyMessage(null);
    try {
      const res = await PrahaarAPI.verifyAuditChain();
      setVerificationResult(res);
      setVerifyMessage(res.message);
    } catch (err: any) {
      setVerifyMessage(err.message || 'Audit chain verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SectionHeader
        title="Tamper-Evident Cryptographic Audit Ledger"
        subtitle="Chronological, append-only SHA-256 block chain anchoring every operator review, alert state transition, and supervisor confirmation."
        icon={History}
        actions={
          <div className="flex items-center space-x-3">
            <span className="text-[11px] font-mono bg-blue-950/60 text-blue-300 border border-blue-800 px-2 py-1 rounded">
              [SYNTHETIC DEMO]
            </span>
            <button
              onClick={handleVerifyChain}
              disabled={isVerifying}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono text-xs font-bold px-3 py-1.5 rounded transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>{isVerifying ? 'VERIFYING CHAIN...' : '⚡ VERIFY CRYPTOGRAPHIC CHAIN'}</span>
            </button>
            <div className="relative">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search audit trail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#151D25] text-slate-200 text-xs pl-9 pr-4 py-2 border border-[#2A3540] rounded font-mono focus:outline-none focus:border-emerald-500 w-56"
              />
            </div>
          </div>
        }
      />

      {/* Cryptographic Verification Status Banner */}
      {verificationResult && (
        <div
          className={`p-4 rounded-lg border text-xs font-mono transition-all ${
            verificationResult.is_valid
              ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200'
              : 'bg-red-950/60 border-red-500 text-red-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {verificationResult.is_valid ? (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-red-400" />
              )}
              <span className="font-bold text-sm">
                {verificationResult.is_valid
                  ? 'CRYPTOGRAPHIC CHAIN INTEGRITY VERIFIED — SEQUENTIALLY LINKED TO GENESIS ANCHOR'
                  : 'INTEGRITY BREACH DETECTED — CORRUPTED OR TAMPERED RECORDS'}
              </span>
            </div>
            <span className="text-[11px] text-[#94A3B8]">
              Verified at: {new Date(verificationResult.verification_timestamp).toLocaleTimeString()}
            </span>
          </div>

          <p className="mt-2 text-xs font-sans text-slate-300">{verificationResult.message}</p>
          <div className="text-[11px] text-[#94A3B8] font-sans mt-1.5 italic bg-[#10161C] p-2 rounded border border-[#2A3540]">
            Audit Integrity Scope: SHA-256 hash chaining detects record content modification, reordering, and intermediate block deletion. It does not independently prevent offline rewriting of the entire database file without external write-once storage.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-[#2A3540] text-[11px]">
            <div>
              <span className="text-[#94A3B8] block text-[10px]">Total Records Verified:</span>
              <span className="font-bold text-white">{verificationResult.total_records_checked} Blocks</span>
            </div>
            <div>
              <span className="text-[#94A3B8] block text-[10px]">Genesis Block Anchor:</span>
              <span className="font-mono text-emerald-400 truncate block">
                {verificationResult.genesis_hash.substring(0, 24)}...
              </span>
            </div>
            <div>
              <span className="text-[#94A3B8] block text-[10px]">Chain Head Hash (Latest Block):</span>
              <span className="font-mono text-emerald-400 truncate block">
                {verificationResult.chain_head_hash ? `${verificationResult.chain_head_hash.substring(0, 24)}...` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Ledger Table */}
      <div className="bg-[#151D25] border border-[#2A3540] rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#10161C] text-[#94A3B8] font-mono uppercase text-[11px] border-b border-[#2A3540]">
              <tr>
                <th className="px-4 py-3">Event Type</th>
                <th className="px-4 py-3">Actor / Badge</th>
                <th className="px-4 py-3">Record Ref</th>
                <th className="px-4 py-3">Action Description</th>
                <th className="px-4 py-3">SHA-256 Current Hash</th>
                <th className="px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3540] font-mono">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#1B2630] transition-colors">
                  <td className="px-4 py-3 font-semibold text-emerald-400 whitespace-nowrap">
                    {log.event_type}
                  </td>
                  <td className="px-4 py-3 text-white font-bold whitespace-nowrap">{log.actor_id}</td>
                  <td className="px-4 py-3 text-blue-300 font-bold whitespace-nowrap">
                    {log.record_reference || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-slate-200 font-sans max-w-sm text-xs">
                    {log.action_summary}
                  </td>
                  <td className="px-4 py-3 text-[#94A3B8] font-mono text-[10px] whitespace-nowrap" title={log.current_hash || 'Legacy unhashed'}>
                    {log.current_hash ? `${log.current_hash.substring(0, 16)}...` : 'Genesis'}
                  </td>
                  <td className="px-4 py-3 text-[#94A3B8] whitespace-nowrap text-[11px]">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
