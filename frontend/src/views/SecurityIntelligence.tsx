// Operation Prahaar AI - 7. Security Intelligence View
import React from 'react';
import { FileSearch, Shield, AlertTriangle, Calendar, ExternalLink } from 'lucide-react';
import { SecurityAdvisory } from '../types';

interface SecurityIntelligenceProps {
  advisories: SecurityAdvisory[];
}

export const SecurityIntelligence: React.FC<SecurityIntelligenceProps> = ({ advisories }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <FileSearch className="w-5 h-5 text-emerald-400" />
          <span>Security Intelligence & Threat Advisories</span>
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Verified security intelligence bulletins correlated with physical CCTV crowd patterns.
        </p>
      </div>

      {/* Advisories Grid */}
      <div className="space-y-4">
        {advisories.map((adv) => (
          <div
            key={adv.id}
            className="bg-[#111713] border border-[#27382B] rounded-lg p-5 space-y-3 hover:border-[#2F4835] transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#27382B]">
              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="font-bold text-emerald-400">{adv.advisory_code}</span>
                <span className="text-gray-400">• {adv.issuing_agency}</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase w-fit ${
                  adv.threat_level === 'IMMINENT'
                    ? 'bg-red-950 text-red-300 border border-red-800'
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}
              >
                Threat Level: {adv.threat_level}
              </span>
            </div>

            <h3 className="text-base font-bold text-white">{adv.title}</h3>
            <p className="text-xs text-gray-300 leading-relaxed">{adv.summary}</p>

            <div className="bg-[#0D1410] p-3 rounded border border-[#27382B] text-xs font-mono space-y-1">
              <div>
                <span className="text-gray-400">Target Locations: </span>
                <span className="text-gray-200">{adv.target_locations}</span>
              </div>
              <div>
                <span className="text-gray-400">Recommended Action: </span>
                <span className="text-amber-400">{adv.recommended_actions}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 pt-1">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  Valid: {new Date(adv.valid_from).toLocaleDateString()} &rarr;{' '}
                  {new Date(adv.valid_to).toLocaleDateString()}
                </span>
              </span>
              <span className="text-emerald-400">Verified Official Source</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
