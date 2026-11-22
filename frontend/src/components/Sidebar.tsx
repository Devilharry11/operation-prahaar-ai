// Operation Prahaar AI - Enterprise SOC Grouped Sidebar Navigation
import React, { useState } from 'react';
import {
  LayoutDashboard,
  Camera,
  Video,
  Users,
  ShieldAlert,
  FolderKanban,
  FileSearch,
  Bell,
  UserCheck,
  History,
  Cpu,
  Settings,
  ChevronLeft,
  ChevronRight,
  Server,
  Activity,
} from 'lucide-react';

export type ViewKey =
  | 'overview'
  | 'cameras'
  | 'video-monitor'
  | 'crowd-analytics'
  | 'safety-events'
  | 'incidents'
  | 'intelligence'
  | 'alert-center'
  | 'human-verification'
  | 'audit-logs'
  | 'edge-devices'
  | 'settings';

interface SidebarProps {
  currentView: ViewKey;
  onSelectView: (view: ViewKey) => void;
  unverifiedCount: number;
  activeAlertCount: number;
}

interface NavSection {
  title: string;
  items: {
    key: ViewKey;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    highlight?: boolean;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  unverifiedCount,
  activeAlertCount,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const sections: NavSection[] = [
    {
      title: 'COMMAND CENTER',
      items: [
        { key: 'overview', label: 'Situation Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        { key: 'safety-events', label: 'Event Management', icon: <ShieldAlert className="w-4 h-4" /> },
        { key: 'incidents', label: 'Incident Dossier', icon: <FolderKanban className="w-4 h-4" /> },
        { key: 'alert-center', label: 'Alert Center', icon: <Bell className="w-4 h-4" />, badge: activeAlertCount },
        {
          key: 'human-verification',
          label: 'Human Verification',
          icon: <UserCheck className="w-4 h-4" />,
          badge: unverifiedCount,
          highlight: unverifiedCount > 0,
        },
      ],
    },
    {
      title: 'ANALYTICS',
      items: [
        { key: 'crowd-analytics', label: 'Crowd Dynamics', icon: <Users className="w-4 h-4" /> },
        { key: 'intelligence', label: 'Security Advisories', icon: <FileSearch className="w-4 h-4" /> },
      ],
    },
    {
      title: 'INFRASTRUCTURE',
      items: [
        { key: 'cameras', label: 'Camera Registry', icon: <Camera className="w-4 h-4" /> },
        { key: 'video-monitor', label: 'Live / Sample Feeds', icon: <Video className="w-4 h-4" /> },
        { key: 'edge-devices', label: 'Edge Devices', icon: <Cpu className="w-4 h-4" /> },
      ],
    },
    {
      title: 'GOVERNANCE',
      items: [
        { key: 'audit-logs', label: 'Audit Ledger', icon: <History className="w-4 h-4" /> },
        { key: 'settings', label: 'System Settings', icon: <Settings className="w-4 h-4" /> },
      ],
    },
  ];

  return (
    <aside
      className={`bg-[#10161C] border-r border-[#2A3540] flex flex-col justify-between shrink-0 transition-all duration-200 select-none h-[calc(100vh-57px)] ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Top Nav List */}
      <div className="py-3 overflow-y-auto px-2 space-y-4">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">
            {!collapsed && (
              <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] font-semibold">
                {section.title}
              </div>
            )}
            {section.items.map((item) => {
              const isActive = currentView === item.key;
              return (
                <button
                  key={item.key}
                  title={collapsed ? item.label : undefined}
                  onClick={() => onSelectView(item.key)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all text-left ${
                    isActive
                      ? 'bg-[#1B2630] text-emerald-400 font-semibold shadow-sm border-l-2 border-emerald-400'
                      : 'text-slate-300 hover:bg-[#151D25] hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <span className={isActive ? 'text-emerald-400' : 'text-[#94A3B8]'}>
                      {item.icon}
                    </span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!collapsed && item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`ml-2 px-1.5 py-0.2 rounded font-mono text-[10px] font-bold ${
                        item.highlight
                          ? 'bg-amber-500 text-black animate-pulse'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Footer: Edge Node Diagnostics & Collapse Toggle */}
      <div className="p-3 bg-[#0A0D0E] border-t border-[#2A3540] text-xs">
        {!collapsed && (
          <div className="mb-2.5 space-y-1 bg-[#151D25] p-2.5 rounded border border-[#2A3540]">
            <div className="flex items-center justify-between text-[#94A3B8] text-[10px] font-mono">
              <span className="flex items-center space-x-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>EDGE APPLIANCE</span>
              </span>
              <span>ONLINE</span>
            </div>
            <div className="text-[11px] font-mono text-slate-200 truncate">EDGE-IND-DELHI-001</div>
            <div className="text-[10px] text-[#94A3B8] flex justify-between font-mono pt-0.5">
              <span>RAM: 215 MB / 8 GB</span>
              <span>5 FPS CAP</span>
            </div>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-1 rounded hover:bg-[#151D25] text-[#94A3B8] hover:text-white transition-all text-xs"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span className="ml-1 text-[11px]">Collapse Menu</span>}
        </button>
      </div>
    </aside>
  );
};
