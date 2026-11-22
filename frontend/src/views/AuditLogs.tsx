// Operation Prahaar AI - Audit Ledger (Enterprise SOC Redesign)
import React, { useState } from 'react';
import { History, Search } from 'lucide-react';
import { AuditLog } from '../types';
import { SectionHeader } from '../components/Common';

interface AuditLogsProps {
  logs: AuditLog[];
}

export const AuditLogs: React.FC<AuditLogsProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredLogs = logs.filter((log) => {
    return (
      log.action_summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor_id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SectionHeader
        title="Tamper-Evident Audit Ledger"
        subtitle="Chronological, immutable compliance trail recording every system event, operator review, and state transition."
        icon={History}
        actions={
          <div className="relative">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search audit trail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#151D25] text-slate-200 text-xs pl-9 pr-4 py-2 border border-[#2A3540] rounded font-mono focus:outline-none focus:border-emerald-500 w-64"
            />
          </div>
        }
      />

      <div className="bg-[#151D25] border border-[#2A3540] rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#10161C] text-[#94A3B8] font-mono uppercase text-[11px] border-b border-[#2A3540]">
              <tr>
                <th className="px-4 py-3">Event Type</th>
                <th className="px-4 py-3">Actor / Badge</th>
                <th className="px-4 py-3">Action Description</th>
                <th className="px-4 py-3">IP Address</th>
                <th className="px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3540] font-mono">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#1B2630] transition-colors">
                  <td className="px-4 py-3 font-semibold text-emerald-400">{log.event_type}</td>
                  <td className="px-4 py-3 text-white font-bold">{log.actor_id}</td>
                  <td className="px-4 py-3 text-slate-200 font-sans max-w-md text-xs">{log.action_summary}</td>
                  <td className="px-4 py-3 text-[#94A3B8]">{log.ip_address}</td>
                  <td className="px-4 py-3 text-[#94A3B8]">
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
