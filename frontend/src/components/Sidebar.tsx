// Operation Prahaar AI - Command Center Sidebar Navigation (12 Sections)
import React from 'react';
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

interface NavItem {
  key: ViewKey;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  highlight?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  unverifiedCount,
  activeAlertCount,
}) => {
  const navItems: NavItem[] = [
    { key: 'overview', label: '1. Overview Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: 'cameras', label: '2. Camera Management', icon: <Camera className="w-4 h-4" /> },
    { key: 'video-monitor', label: '3. Live / Sample Video', icon: <Video className="w-4 h-4" /> },
    { key: 'crowd-analytics', label: '4. Crowd Analytics', icon: <Users className="w-4 h-4" /> },
    { key: 'safety-events', label: '5. Safety Events', icon: <ShieldAlert className="w-4 h-4" /> },
    { key: 'incidents', label: '6. Incident Management', icon: <FolderKanban className="w-4 h-4" /> },
    { key: 'intelligence', label: '7. Security Intelligence', icon: <FileSearch className="w-4 h-4" /> },
    { key: 'alert-center', label: '8. Alert Center', icon: <Bell className="w-4 h-4" />, badge: activeAlertCount },
    {
      key: 'human-verification',
      label: '9. Human Verification',
      icon: <UserCheck className="w-4 h-4" />,
      badge: unverifiedCount,
      highlight: unverifiedCount > 0,
    },
    { key: 'audit-logs', label: '10. Audit Logs', icon: <History className="w-4 h-4" /> },
    { key: 'edge-devices', label: '11. Edge Device Mgmt', icon: <Cpu className="w-4 h-4" /> },
    { key: 'settings', label: '12. System Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-[#111713] border-r border-[#27382B] flex flex-col justify-between shrink-0 h-[calc(100vh-61px)]">
      {/* Nav List */}
      <div className="py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] uppercase font-mono tracking-wider text-emerald-500/70 font-semibold">
          Command Sections
        </div>
        {navItems.map((item) => {
          const isActive = currentView === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onSelectView(item.key)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-md transition-all font-medium text-left ${
                isActive
                  ? 'bg-[#1C2C20] text-emerald-400 border border-[#2F4835] shadow-sm font-semibold'
                  : 'text-gray-300 hover:bg-[#16221A] hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-2.5 truncate">
                <span className={isActive ? 'text-emerald-400' : 'text-gray-400'}>{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`ml-2 px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full ${
                    item.highlight
                      ? 'bg-amber-500 text-black animate-pulse'
                      : 'bg-[#233527] text-emerald-300 border border-[#2F4835]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Edge Appliance Health Summary Footer */}
      <div className="p-3 bg-[#0D1410] border-t border-[#27382B] text-xs">
        <div className="flex items-center justify-between text-gray-400 mb-1">
          <span className="font-mono text-[11px]">EDGE APPLIANCE</span>
          <span className="text-[10px] text-emerald-400 font-mono">ONLINE</span>
        </div>
        <div className="text-[11px] text-gray-300 font-mono truncate">EDGE-IND-DELHI-001</div>
        <div className="mt-2 text-[10px] text-gray-400 flex justify-between font-mono">
          <span>MEM: 215 MB / 8 GB</span>
          <span>FPS: 5 (CPU CAP)</span>
        </div>
      </div>
    </aside>
  );
};
