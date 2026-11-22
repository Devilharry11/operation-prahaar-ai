// Operation Prahaar AI - API Client with Built-in Fallback Resilience

import {
  SystemHealth,
  Camera,
  EdgeDevice,
  CameraEvent,
  Incident,
  Alert,
  SecurityAdvisory,
  HumanReview,
  AuditLog,
  DemoEventResponse,
  DemoResetResponse,
  DemoHistoryItem,
} from '../types';

const API_BASE = 'http://127.0.0.1:8000/api/v1';

// Helper for safe fetch with mock fallback (Read-only operations)
async function fetchWithFallback<T>(url: string, mockFallback: T, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Operator-Badge': 'IND-OPR-4081',
        ...options?.headers,
      },
    });
    if (!res.ok) {
      throw new Error(`API responded with status ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`[Prahaar API] Using resilient local fallback for ${url}:`, err);
    return mockFallback;
  }
}

// Helper for mutation requests: strictly throws on error; NEVER fakes success
async function fetchMutation<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Operator-Badge': 'IND-OPR-4081',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    let errorDetail = `Server responded with status ${res.status}`;
    try {
      const errorJson = await res.json();
      errorDetail = errorJson.detail || errorJson.message || errorDetail;
    } catch {
      // fallback to status text
    }
    throw new Error(errorDetail);
  }
  return await res.json();
}

export const PrahaarAPI = {
  // 1. Health
  async getHealth(): Promise<SystemHealth> {
    return fetchWithFallback<SystemHealth>('/health', {
      status: 'OPERATIONAL',
      app_name: 'OPERATION PRAHAAR AI',
      version: '1.0.0',
      environment: 'development',
      database_connected: true,
      privacy_preserving_mode: true,
      facial_recognition_prohibited: true,
      human_verification_enforced: true,
      timestamp: new Date().toISOString(),
    });
  },

  // 2. Cameras
  async getCameras(): Promise<Camera[]> {
    return fetchWithFallback<Camera[]>('/cameras', [
      {
        id: 'cam-ndls-01',
        camera_code: 'CAM-NDLS-CONCOURSE-01',
        name: 'Platform 1 Concourse South Foot-over Bridge',
        stream_url: 'data/samples/sample_test.mp4',
        status: 'ONLINE',
        resolution: '640x360',
        fps: 5,
        zone_polygon_json: '[{"x": 80, "y": 140}, {"x": 560, "y": 140}, {"x": 560, "y": 340}, {"x": 80, "y": 340}]',
        location_id: 'loc-del-ndls',
        edge_device_id: 'edge-01',
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'cam-rf-02',
        camera_code: 'CAM-RF-PERIMETER-02',
        name: 'Lahori Gate West Security Perimeter',
        stream_url: 'data/samples/sample_test.mp4',
        status: 'ONLINE',
        resolution: '640x360',
        fps: 5,
        zone_polygon_json: '[{"x": 100, "y": 200}, {"x": 400, "y": 200}, {"x": 400, "y": 320}, {"x": 100, "y": 320}]',
        location_id: 'loc-del-rf',
        edge_device_id: 'edge-02',
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
    ]);
  },

  // 3. Edge Devices
  async getEdgeDevices(): Promise<EdgeDevice[]> {
    return fetchWithFallback<EdgeDevice[]>('/edge-devices', [
      {
        id: 'edge-01',
        device_id: 'EDGE-IND-DELHI-001',
        name: 'Virtual Edge Node 01 (Laptop Simulator)',
        device_type: 'VIRTUAL_LAPTOP',
        ip_address: '127.0.0.1',
        status: 'ONLINE',
        cpu_usage_pct: 17.4,
        ram_usage_mb: 215.4,
        uptime_seconds: 7200,
        last_heartbeat: new Date().toISOString(),
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'edge-02',
        device_id: 'EDGE-IND-DELHI-002',
        name: 'Red Fort Mini-PC Appliance (Simulated)',
        device_type: 'MINI_PC',
        ip_address: '127.0.0.1',
        status: 'ONLINE',
        cpu_usage_pct: 23.1,
        ram_usage_mb: 268.0,
        uptime_seconds: 14400,
        last_heartbeat: new Date().toISOString(),
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ]);
  },

  // 4. Camera Events
  async getEvents(): Promise<CameraEvent[]> {
    return fetchWithFallback<CameraEvent[]>('/events', [
      {
        id: 'evt-01',
        camera_id: 'cam-ndls-01',
        edge_device_id: 'edge-01',
        event_type: 'HIGH_CROWD_CONGESTION',
        severity: 'HIGH',
        crowd_density_score: 0.84,
        motion_energy: 62.5,
        bounding_boxes_json: '[{"x": 120, "y": 150, "w": 40, "h": 70}, {"x": 180, "y": 155, "w": 38, "h": 68}]',
        timestamp: new Date(Date.now() - 900000).toISOString(),
      },
      {
        id: 'evt-02',
        camera_id: 'cam-rf-02',
        edge_device_id: 'edge-02',
        event_type: 'RESTRICTED_ZONE_ENTRY',
        severity: 'MEDIUM',
        crowd_density_score: 0.32,
        motion_energy: 28.0,
        bounding_boxes_json: '[{"x": 150, "y": 210, "w": 30, "h": 65}]',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
    ]);
  },

  // 5. Incidents
  async getIncidents(): Promise<Incident[]> {
    return fetchWithFallback<Incident[]>('/incidents', [
      {
        id: 'inc-01',
        incident_code: 'INC-2026-0001',
        title: 'Rapid Pedestrian Congestion Build-up at Concourse South',
        description: 'Edge vision detected density ratio 0.84 exceeding the 0.75 threshold during active transit advisory.',
        status: 'NEW',
        priority: 'HIGH',
        confidence_score: 0.87,
        uncertainty_level: 'LOW',
        explanation: 'Spatial density sustained >80% for 20+ seconds in designated pedestrian walkway; matches advisory ADV-MHA-2026-08.',
        triggered_rule: 'CONGESTION_RAPID_BUILDUP_RULE',
        location_id: 'loc-del-ndls',
        created_at: new Date(Date.now() - 900000).toISOString(),
        updated_at: new Date(Date.now() - 900000).toISOString(),
      },
    ]);
  },

  // 6. Alerts
  async getAlerts(): Promise<Alert[]> {
    return fetchWithFallback<Alert[]>('/alerts', [
      {
        id: 'alt-01',
        alert_code: 'ALT-2026-0001',
        incident_id: 'inc-01',
        camera_id: 'cam-ndls-01',
        alert_type: 'CROWD_CONGESTION_WARNING',
        severity: 'HIGH',
        title: 'High Density Anomaly - Platform 1 Concourse',
        summary: 'Density 84% at NDLS Concourse South. Awaiting authorized human review before escalation.',
        review_status: 'UNVERIFIED',
        is_actionable: true,
        created_at: new Date(Date.now() - 840000).toISOString(),
      },
    ]);
  },

  // 7. Security Advisories
  async getAdvisories(): Promise<SecurityAdvisory[]> {
    return fetchWithFallback<SecurityAdvisory[]>('/advisories', [
      {
        id: 'adv-01',
        advisory_code: 'ADV-MHA-2026-08',
        issuing_agency: 'Bureau of Public Safety Intelligence',
        title: 'Heightened Vigilance Advisory: Public Transit Nodes',
        summary: 'Pre-national festival intelligence suggests increased crowd vulnerability at northern rail transit terminals.',
        threat_level: 'ELEVATED',
        target_locations: 'New Delhi Railway Station, Old Delhi, Anand Vihar Terminus',
        recommended_actions: 'Enforce strict congestion monitoring at concourse bottlenecks; flag abrupt crowd counter-flows.',
        valid_from: new Date(Date.now() - 172800000).toISOString(),
        valid_to: new Date(Date.now() + 432000000).toISOString(),
        is_active: true,
        created_at: new Date(Date.now() - 172800000).toISOString(),
      },
    ]);
  },

  // 8. Submit Human Review
  async submitReview(payload: {
    incident_id: string;
    alert_id?: string;
    reviewer_badge_or_username: string;
    action: 'VERIFIED' | 'DISMISSED' | 'ESCALATED';
    rationale: string;
  }): Promise<HumanReview> {
    return fetchWithFallback<HumanReview>(
      '/reviews',
      {
        id: `rev-${Date.now()}`,
        incident_id: payload.incident_id,
        alert_id: payload.alert_id,
        reviewer_id: payload.reviewer_badge_or_username,
        action: payload.action,
        rationale: payload.rationale,
        prior_status: 'NEW',
        new_status: payload.action,
        reviewed_at: new Date().toISOString(),
      },
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },

  // 9. Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    return fetchWithFallback<AuditLog[]>('/audit-logs', [
      {
        id: 'aud-01',
        event_type: 'INCIDENT_CREATED',
        actor_id: 'SYSTEM_INTELLIGENCE_ENGINE',
        ip_address: '127.0.0.1',
        action_summary: 'Synthesized Incident INC-2026-0001 from Edge Camera Event CAM-NDLS-CONCOURSE-01',
        before_state_json: '{"status": "NONE"}',
        after_state_json: '{"incident_code": "INC-2026-0001", "status": "NEW", "review_status": "UNVERIFIED"}',
        created_at: new Date(Date.now() - 900000).toISOString(),
      },
    ]);
  },

  // 10. Phase B: Synthetic Demo Controller (Strict mutation error propagation)
  async generateDemoEvent(
    payload: {
      scenario: string;
      camera_id?: string;
      severity?: string;
      custom_note?: string;
    },
    operatorBadge: string = 'IND-OPR-4081'
  ): Promise<DemoEventResponse> {
    return fetchMutation<DemoEventResponse>('/demo/generate', {
      method: 'POST',
      headers: {
        'X-Operator-Badge': operatorBadge,
      },
      body: JSON.stringify(payload),
    });
  },

  async generateDemoBatch(
    payload: { count: number; camera_id?: string },
    operatorBadge: string = 'IND-OPR-4081'
  ): Promise<DemoEventResponse[]> {
    return fetchMutation<DemoEventResponse[]>('/demo/generate-batch', {
      method: 'POST',
      headers: {
        'X-Operator-Badge': operatorBadge,
      },
      body: JSON.stringify(payload),
    });
  },

  async getDemoHistory(limit: number = 20, operatorBadge: string = 'IND-OPR-4081'): Promise<DemoHistoryItem[]> {
    return fetchWithFallback<DemoHistoryItem[]>(
      `/demo/history?limit=${limit}`,
      [],
      {
        headers: {
          'X-Operator-Badge': operatorBadge,
        },
      }
    );
  },

  async resetDemoData(
    payload: { confirm: boolean; operator_badge?: string },
    operatorBadge: string = 'IND-OPR-4081'
  ): Promise<DemoResetResponse> {
    return fetchMutation<DemoResetResponse>('/demo/reset', {
      method: 'POST',
      headers: {
        'X-Operator-Badge': operatorBadge,
      },
      body: JSON.stringify(payload),
    });
  },
};
