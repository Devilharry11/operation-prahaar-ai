// Operation Prahaar AI - 10. Audit Logs View
import React, { useState } from 'react';
import { History, Shield, Search } from 'lucide-react';
import { AuditLog } from '../types';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <History className="w-5 h-5 text-emerald-400" />
            <span>Tamper-Evident Audit Ledger</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Chronological, immutable audit trail recording every system event, operator action, and escalation.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search audit trail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#111713] text-gray-200 text-xs pl-9 pr-4 py-2 border border-[#27382B] rounded font-mono focus:outline-none focus:border-emerald-500 w-64"
          />
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-[#111713] border border-[#27382B] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#16221A] text-gray-300 font-mono uppercase text-[11px] border-b border-[#27382B]">
              <tr>
                <th className="px-4 py-3">Event Type</th>
                <th className="px-4 py-3">Actor / Officer</th>
                <th className="px-4 py-3">Action Summary</th>
                <th className="px-4 py-3">IP Address</th>
                <th className="px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#233527] font-mono">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#141C16] transition-colors">
                  <td className="px-4 py-3 font-semibold text-emerald-400">{log.event_type}</td>
                  <td className="px-4 py-3 text-white font-bold">{log.actor_id}</td>
                  <td className="px-4 py-3 text-gray-200 font-sans max-w-md">{log.action_summary}</td>
                  <td className="px-4 py-3 text-gray-400">{log.ip_address}</td>
                  <td className="px-4 py-3 text-gray-400">
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
