// Operation Prahaar AI - Security Intelligence (Enterprise SOC Redesign)
import React from 'react';
import { FileSearch, Calendar } from 'lucide-react';
import { SecurityAdvisory } from '../types';
import { SectionHeader, StatusBadge } from '../components/Common';

interface SecurityIntelligenceProps {
  advisories: SecurityAdvisory[];
}

export const SecurityIntelligence: React.FC<SecurityIntelligenceProps> = ({ advisories }) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SectionHeader
        title="Security Intelligence & Threat Advisories"
        subtitle="Verified public safety intelligence bulletins correlated with physical CCTV crowd patterns."
        icon={FileSearch}
      />

      <div className="space-y-4">
        {advisories.map((adv) => (
          <div
            key={adv.id}
            className="bg-[#151D25] border border-[#2A3540] rounded-lg p-5 space-y-3 hover:border-slate-500 transition-all shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#2A3540]">
              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="font-bold text-emerald-400">{adv.advisory_code}</span>
                <span className="text-[#94A3B8]">• {adv.issuing_agency}</span>
              </div>
              <StatusBadge status={`Threat: ${adv.threat_level}`} variant={adv.threat_level === 'IMMINENT' ? 'red' : 'amber'} />
            </div>

            <h3 className="text-base font-bold text-white tracking-tight">{adv.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{adv.summary}</p>

            <div className="bg-[#10161C] p-3 rounded border border-[#2A3540] text-xs font-mono space-y-1">
              <div>
                <span className="text-[#94A3B8]">Target Locations: </span>
                <span className="text-slate-200">{adv.target_locations}</span>
              </div>
              <div>
                <span className="text-[#94A3B8]">Recommended Actions: </span>
                <span className="text-amber-400">{adv.recommended_actions}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-[#94A3B8] pt-1">
              <span className="flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  Valid: {new Date(adv.valid_from).toLocaleDateString()} &rarr;{' '}
                  {new Date(adv.valid_to).toLocaleDateString()}
                </span>
              </span>
              <span className="text-emerald-400 font-bold">Verified Agency Source</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
