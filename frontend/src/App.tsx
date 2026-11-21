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
    <div className="min-h-screen bg-[#0A0D0B] text-gray-200 flex flex-col font-sans">
      {/* Tactical Top Header */}
      <Header health={health} unverifiedCount={unverifiedCount} />

      {/* Main Command Center Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          onSelectView={setCurrentView}
          unverifiedCount={unverifiedCount}
          activeAlertCount={activeAlertCount}
        />

        {/* Dynamic Section View */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#0E1410]">
          {currentView === 'overview' && (
            <OverviewDashboard
              cameras={cameras}
              incidents={incidents}
              alerts={alerts}
              edgeDevices={edgeDevices}
              events={events}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'cameras' && <CameraManagement cameras={cameras} />}

          {currentView === 'video-monitor' && <LiveVideoMonitoring cameras={cameras} />}

          {currentView === 'crowd-analytics' && <CrowdAnalytics events={events} />}

          {currentView === 'safety-events' && <SafetyEvents events={events} />}

          {currentView === 'incidents' && (
            <IncidentManagement incidents={incidents} onNavigate={setCurrentView} />
          )}

          {currentView === 'intelligence' && <SecurityIntelligence advisories={advisories} />}

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

          {currentView === 'audit-logs' && <AuditLogs logs={auditLogs} />}

          {currentView === 'edge-devices' && <EdgeDeviceManagement devices={edgeDevices} />}

          {currentView === 'settings' && <SystemSettings health={health} />}
        </main>
      </div>
    </div>
  );
};
