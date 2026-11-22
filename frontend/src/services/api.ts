// Operation Prahaar AI - API Client with Built-in Fallback Resilience & Phase C Extensions

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
  ZoneMetrics,
  TrendPoint,
  HotspotItem,
  AnalyticsSummary,
  IncidentExplainability,
  GovernanceQueueResponse,
  GovernanceReviewResponse,
  AuditVerificationResponse,
} from '../types';

const DEFAULT_API_BASE = 'http://127.0.0.1:8000/api/v1';
const API_BASE = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE).replace(/\/$/, '');

export function getActiveBadge(): string {
  try {
    return localStorage.getItem('prahaar_active_badge') || 'IND-OPR-4081';
  } catch {
    return 'IND-OPR-4081';
  }
}

export function setActiveBadge(badge: string): void {
  try {
    localStorage.setItem('prahaar_active_badge', badge);
  } catch {
    // ignore
  }
}

// Helper for safe fetch with mock fallback (Read-only operations)
async function fetchWithFallback<T>(url: string, mockFallback: T, options?: RequestInit): Promise<T> {
  const badge = getActiveBadge();
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Operator-Badge': badge,
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
  const badge = getActiveBadge();
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Operator-Badge': badge,
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
  // Badge management
  getActiveBadge,
  setActiveBadge,

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
    ]);
  },

  // 3. Edge Devices
  async getEdgeDevices(): Promise<EdgeDevice[]> {
    return fetchWithFallback<EdgeDevice[]>('/health', [] as any);
  },

  // 4. Camera Events
  async getEvents(): Promise<CameraEvent[]> {
    return fetchWithFallback<CameraEvent[]>('/events', []);
  },

  // 5. Incidents
  async getIncidents(): Promise<Incident[]> {
    return fetchWithFallback<Incident[]>('/incidents', []);
  },

  // 6. Alerts
  async getAlerts(): Promise<Alert[]> {
    return fetchWithFallback<Alert[]>('/alerts', []);
  },

  // 7. Security Advisories
  async getAdvisories(): Promise<SecurityAdvisory[]> {
    return fetchWithFallback<SecurityAdvisory[]>('/advisories', []);
  },

  // 8. Submit Human Review (Legacy / Direct)
  async submitReview(payload: {
    incident_id: string;
    alert_id?: string;
    reviewer_badge_or_username: string;
    action: 'VERIFIED' | 'DISMISSED' | 'ESCALATED';
    rationale: string;
  }): Promise<HumanReview> {
    return fetchMutation<HumanReview>('/reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // 9. Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    return fetchWithFallback<AuditLog[]>('/audit-logs', []);
  },

  // 10. Phase B: Synthetic Demo Controller
  async generateDemoEvent(
    payload: {
      scenario: string;
      camera_id?: string;
      severity?: string;
      custom_note?: string;
    },
    operatorBadge?: string
  ): Promise<DemoEventResponse> {
    const badge = operatorBadge || getActiveBadge();
    return fetchMutation<DemoEventResponse>('/demo/generate', {
      method: 'POST',
      headers: {
        'X-Operator-Badge': badge,
      },
      body: JSON.stringify(payload),
    });
  },

  async generateDemoBatch(
    payload: { count: number; camera_id?: string },
    operatorBadge?: string
  ): Promise<DemoEventResponse[]> {
    const badge = operatorBadge || getActiveBadge();
    return fetchMutation<DemoEventResponse[]>('/demo/generate-batch', {
      method: 'POST',
      headers: {
        'X-Operator-Badge': badge,
      },
      body: JSON.stringify(payload),
    });
  },

  async getDemoHistory(limit: number = 20, operatorBadge?: string): Promise<DemoHistoryItem[]> {
    const badge = operatorBadge || getActiveBadge();
    return fetchWithFallback<DemoHistoryItem[]>(
      `/demo/history?limit=${limit}`,
      [],
      {
        headers: {
          'X-Operator-Badge': badge,
        },
      }
    );
  },

  async resetDemoData(
    payload: { confirm: boolean; operator_badge?: string },
    operatorBadge?: string
  ): Promise<DemoResetResponse> {
    const badge = operatorBadge || getActiveBadge();
    return fetchMutation<DemoResetResponse>('/demo/reset', {
      method: 'POST',
      headers: {
        'X-Operator-Badge': badge,
      },
      body: JSON.stringify(payload),
    });
  },

  // ==========================================
  // Phase C: Milestone C.1 — Aggregate Analytics
  // ==========================================
  async getAnalyticsTrends(zone?: string): Promise<TrendPoint[]> {
    const query = zone ? `?zone=${encodeURIComponent(zone)}` : '';
    return fetchWithFallback<TrendPoint[]>(`/analytics/trends${query}`, []);
  },

  async getAnalyticsHotspots(): Promise<HotspotItem[]> {
    return fetchWithFallback<HotspotItem[]>('/analytics/hotspots', []);
  },

  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    return fetchWithFallback<AnalyticsSummary>('/analytics/summary', {
      system_density_ratio: 0.62,
      critical_zones_count: 1,
      total_monitored_zones: 4,
      avg_flow_velocity_mps: 1.15,
      active_surge_alerts: 1,
      zones: [
        {
          zone_id: 'ZONE-A',
          zone_name: 'Main Concourse',
          capacity_limit: 500,
          current_occupancy: 380,
          occupancy_ratio: 0.76,
          flow_velocity_mps: 0.95,
          congestion_level: 'MODERATE',
          density_trend: 'RISING',
          uncertainty_score: 0.12,
          is_synthetic: true,
        },
        {
          zone_id: 'ZONE-B',
          zone_name: 'Entry Hall',
          capacity_limit: 300,
          current_occupancy: 255,
          occupancy_ratio: 0.85,
          flow_velocity_mps: 0.72,
          congestion_level: 'CRITICAL',
          density_trend: 'RISING',
          uncertainty_score: 0.14,
          is_synthetic: true,
        },
        {
          zone_id: 'ZONE-C',
          zone_name: 'Waiting Area',
          capacity_limit: 400,
          current_occupancy: 180,
          occupancy_ratio: 0.45,
          flow_velocity_mps: 1.35,
          congestion_level: 'NOMINAL',
          density_trend: 'STABLE',
          uncertainty_score: 0.08,
          is_synthetic: true,
        },
        {
          zone_id: 'ZONE-D',
          zone_name: 'Exit Corridor',
          capacity_limit: 250,
          current_occupancy: 105,
          occupancy_ratio: 0.42,
          flow_velocity_mps: 1.48,
          congestion_level: 'NOMINAL',
          density_trend: 'FALLING',
          uncertainty_score: 0.10,
          is_synthetic: true,
        },
      ],
      is_synthetic: true,
      generated_at: new Date().toISOString(),
    });
  },

  // ==========================================
  // Phase C: Milestone C.2 — Explainable AI (XAI)
  // ==========================================
  async getIncidentExplainability(incidentId: string): Promise<IncidentExplainability> {
    return fetchWithFallback<IncidentExplainability>(
      `/incidents/${incidentId}/explainability`,
      {
        incident_id: incidentId,
        incident_code: 'INC-DEMO',
        title: '[SYNTHETIC DEMO] Explainability Factor Assessment',
        rule_id: 'DEMO_OCCUPANCY_THRESHOLD_RULE',
        rule_description: 'Heuristic spatial threshold evaluation triggered on aggregate crowd influx.',
        confidence_score: 0.86,
        uncertainty_level: 'LOW',
        data_quality_score: 0.94,
        factors: [
          {
            factor_name: 'Aggregate Headcount Density',
            measured_value: '380 occupants (76% envelope)',
            safety_baseline: 'Max 375 occupants (75% threshold)',
            weight_pct: 45.0,
            diagnostic: 'Measured spatial volume exceeds safety comfort threshold.',
          },
          {
            factor_name: 'Flow Velocity Deceleration',
            measured_value: '0.95 m/s',
            safety_baseline: 'Nominal 1.30 m/s',
            weight_pct: 35.0,
            diagnostic: 'Pedestrian velocity slowed below nominal egress corridor benchmark.',
          },
          {
            factor_name: 'Edge Telemetry Quality & Frame Rate',
            measured_value: '5 FPS (0 dropped frames)',
            safety_baseline: 'Min 4 FPS',
            weight_pct: 20.0,
            diagnostic: 'Edge hardware operational with high sensor confidence.',
          },
        ],
        reproducible_hash: 'd3b07384d113edec49eaa6238ad5ff00',
        non_identifying_disclaimer:
          'ATTENTION: This assessment is derived strictly from non-identifying aggregate occupancy and motion metrics. Zero facial recognition or individual tracking.',
        is_synthetic: true,
      }
    );
  },

  // ==========================================
  // Phase C: Milestone C.3 — Multi-Tier Human Governance
  // ==========================================
  async getGovernanceQueues(): Promise<GovernanceQueueResponse> {
    return fetchWithFallback<GovernanceQueueResponse>('/governance/queue', {
      tier1_pending: [],
      tier2_pending: [],
      tier3_pending: [],
      total_pending: 0,
      is_synthetic: true,
      generated_at: new Date().toISOString(),
    });
  },

  async submitTier1Review(payload: {
    incident_id: string;
    alert_id?: string;
    action: 'VERIFIED' | 'DISMISSED';
    rationale: string;
  }): Promise<GovernanceReviewResponse> {
    return fetchMutation<GovernanceReviewResponse>('/governance/tier1', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async submitTier2Review(payload: {
    incident_id: string;
    action: 'CONFIRMED' | 'RETURNED';
    explanation: string;
  }): Promise<GovernanceReviewResponse> {
    return fetchMutation<GovernanceReviewResponse>('/governance/tier2', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async submitTier3Review(payload: {
    incident_id: string;
    advisory_id?: string;
    action: 'APPROVED' | 'REJECTED';
    controller_comments: string;
  }): Promise<GovernanceReviewResponse> {
    return fetchMutation<GovernanceReviewResponse>('/governance/tier3', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // ==========================================
  // Phase C: Milestone C.4 — Cryptographic Audit Verification
  // ==========================================
  async verifyAuditChain(): Promise<AuditVerificationResponse> {
    return fetchMutation<AuditVerificationResponse>('/audit-logs/verify-chain', {
      method: 'POST',
    });
  },

  async backfillAuditChain(): Promise<{ success: boolean; records_backfilled: number; message: string }> {
    return fetchMutation<{ success: boolean; records_backfilled: number; message: string }>('/audit-logs/backfill-chain', {
      method: 'POST',
    });
  },
};
