// Operation Prahaar AI - Top-Level Application Orchestrator
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, ViewKey } from './components/Sidebar';
import { OverviewDashboard } from './views/OverviewDashboard';
import { CameraManagement } from './views/CameraManagement';
import { LiveVideoMonitoring } from './views/LiveVideoMonitoring';
import { CrowdAnalytics } from './views/CrowdAnalytics';
import { SafetyEvents } from './views/SafetyEvents';
import { IncidentManagement } from './views/IncidentManagement';
import { SecurityIntelligence } from './views/SecurityIntelligence';
import { AlertCenter } from './views/AlertCenter';
import { HumanVerification } from './views/HumanVerification';
import { AuditLogs } from './views/AuditLogs';
import { EdgeDeviceManagement } from './views/EdgeDeviceManagement';
import { SystemSettings } from './views/SystemSettings';
import { DemoControllerModal } from './components/DemoControllerModal';
import { PrahaarAPI } from './services/api';
import {
  SystemHealth,
  Camera,
  EdgeDevice,
  CameraEvent,
  Incident,
  Alert,
  SecurityAdvisory,
  AuditLog,
} from './types';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewKey>('overview');
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [edgeDevices, setEdgeDevices] = useState<EdgeDevice[]>([]);
  const [events, setEvents] = useState<CameraEvent[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [advisories, setAdvisories] = useState<SecurityAdvisory[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);

  // Load all telemetry & domain data
  const loadData = async () => {
    try {
      const [h, c, ed, ev, inc, al, adv, aud] = await Promise.all([
        PrahaarAPI.getHealth(),
        PrahaarAPI.getCameras(),
        PrahaarAPI.getEdgeDevices(),
        PrahaarAPI.getEvents(),
        PrahaarAPI.getIncidents(),
        PrahaarAPI.getAlerts(),
        PrahaarAPI.getAdvisories(),
        PrahaarAPI.getAuditLogs(),
      ]);
      setHealth(h);
      setCameras(c);
      setEdgeDevices(ed);
      setEvents(ev);
      setIncidents(inc);
      setAlerts(al);
      setAdvisories(adv);
      setAuditLogs(aud);
    } catch (err) {
      console.error('Error fetching Prahaar AI data:', err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, []);

  const unverifiedCount = alerts.filter((a) => a.review_status === 'UNVERIFIED').length;
  const activeAlertCount = alerts.length;

  return (
    <div className="min-h-screen bg-[#0A0D0E] text-[#F1F5F9] flex flex-col font-sans selection:bg-emerald-800 selection:text-white">
      {/* Explicit Public Demonstration Safeguard Banner */}
      <div className="bg-amber-950/40 border-b border-amber-600/30 px-4 py-1.5 flex flex-wrap items-center justify-between text-xs font-mono text-amber-300">
        <div className="flex items-center space-x-2">
          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 font-bold tracking-wider text-[10px] border border-amber-500/40">
            DEMONSTRATION SYSTEM
          </span>
          <span className="font-semibold tracking-tight text-[11px] sm:text-xs text-amber-300">
            SYNTHETIC DEMO — NOT REAL-WORLD MONITORING • ZERO BIOMETRICS • ZERO AUTONOMOUS DISPATCH
          </span>
        </div>
        <div className="hidden lg:flex items-center space-x-3 text-[11px] text-amber-400/80">
          <span>Human-in-the-Loop Decision Support Prototype</span>
          <span>•</span>
          <span>Educational Technology</span>
        </div>
      </div>

      {/* Modern Enterprise SOC Top Header */}
      <Header
        health={health}
        unverifiedCount={unverifiedCount}
        onNavigateToReviews={() => setCurrentView('human-verification')}
        onOpenDemoController={() => setIsDemoModalOpen(true)}
      />

      {/* Main Command Center Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          onSelectView={setCurrentView}
          unverifiedCount={unverifiedCount}
          activeAlertCount={activeAlertCount}
        />

        {/* Dynamic Section Workspace */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#0A0D0E]">
          {currentView === 'overview' && (
            <OverviewDashboard
              cameras={cameras}
              incidents={incidents}
              alerts={alerts}
              edgeDevices={edgeDevices}
              events={events}
              auditLogs={auditLogs}
              health={health}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'safety-events' && <SafetyEvents events={events} />}

          {currentView === 'incidents' && (
            <IncidentManagement incidents={incidents} onNavigate={setCurrentView} />
          )}

          {currentView === 'alert-center' && (
            <AlertCenter alerts={alerts} onNavigate={setCurrentView} />
          )}

          {currentView === 'human-verification' && (
            <HumanVerification
              alerts={alerts}
              incidents={incidents}
              onReviewCompleted={loadData}
            />
          )}

          {currentView === 'crowd-analytics' && <CrowdAnalytics events={events} />}

          {currentView === 'intelligence' && <SecurityIntelligence advisories={advisories} />}

          {currentView === 'cameras' && <CameraManagement cameras={cameras} />}

          {currentView === 'video-monitor' && <LiveVideoMonitoring cameras={cameras} />}

          {currentView === 'edge-devices' && <EdgeDeviceManagement devices={edgeDevices} />}

          {currentView === 'audit-logs' && <AuditLogs logs={auditLogs} />}

          {currentView === 'settings' && <SystemSettings health={health} />}
        </main>
      </div>

      {/* Synthetic Demo Controller Modal */}
      <DemoControllerModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onEventGenerated={loadData}
        cameras={cameras}
      />
    </div>
  );
};
