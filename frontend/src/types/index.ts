// Operation Prahaar AI - Frontend Type Definitions

export interface SystemHealth {
  status: string;
  app_name: string;
  version: string;
  environment: string;
  database_connected: boolean;
  privacy_preserving_mode: boolean;
  facial_recognition_prohibited: boolean;
  human_verification_enforced: boolean;
  timestamp: string;
}

export interface Camera {
  id: string;
  camera_code: string;
  name: string;
  stream_url: string;
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
  resolution: string;
  fps: number;
  zone_polygon_json?: string;
  location_id: string;
  edge_device_id?: string;
  created_at: string;
}

export interface EdgeDevice {
  id: string;
  device_id: string;
  name: string;
  device_type: 'VIRTUAL_LAPTOP' | 'MINI_PC' | 'RUGGED_EDGE';
  ip_address: string;
  status: 'ONLINE' | 'OFFLINE';
  cpu_usage_pct: number;
  ram_usage_mb: number;
  uptime_seconds: number;
  location_id?: string;
  last_heartbeat: string;
  created_at: string;
}

export interface CameraEvent {
  id: string;
  camera_id: string;
  edge_device_id?: string;
  event_type: 'HIGH_CROWD_CONGESTION' | 'RESTRICTED_ZONE_ENTRY' | 'RAPID_DISPERSAL' | 'SUSPICIOUS_LOITERING_CLUSTER' | 'ANOMALOUS_MOTION_SURGE';
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  crowd_density_score: number;
  motion_energy: number;
  bounding_boxes_json?: string;
  timestamp: string;
  metadata_json?: string;
}

export interface Incident {
  id: string;
  incident_code: string;
  title: string;
  description: string;
  status: 'NEW' | 'UNDER_REVIEW' | 'VERIFIED' | 'DISMISSED' | 'ESCALATED' | 'RESOLVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence_score: number;
  uncertainty_level: 'LOW' | 'MODERATE' | 'HIGH';
  explanation: string;
  triggered_rule: string;
  location_id: string;
  advisory_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Alert {
  id: string;
  alert_code: string;
  incident_id: string;
  camera_id: string;
  alert_type: string;
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  summary: string;
  review_status: 'UNVERIFIED' | 'VERIFIED' | 'REJECTED' | 'ESCALATED';
  is_actionable: boolean;
  created_at: string;
}

export interface SecurityAdvisory {
  id: string;
  advisory_code: string;
  issuing_agency: string;
  title: string;
  summary: string;
  threat_level: 'ADVISORY' | 'ELEVATED' | 'IMMINENT';
  target_locations: string;
  recommended_actions: string;
  valid_from: string;
  valid_to: string;
  is_active: boolean;
  created_at: string;
}

export interface HumanReview {
  id: string;
  alert_id?: string;
  incident_id: string;
  reviewer_id: string;
  action: 'VERIFIED' | 'DISMISSED' | 'ESCALATED';
  rationale: string;
  prior_status: string;
  new_status: string;
  reviewed_at: string;
}

export interface AuditLog {
  id: string;
  event_type: string;
  actor_id: string;
  ip_address: string;
  action_summary: string;
  before_state_json?: string;
  after_state_json?: string;
  created_at: string;
}

// Phase B: Synthetic Demo Controller Types
export type DemoScenarioType =
  | 'AGGREGATE_OCCUPANCY_EXCEEDED'
  | 'SIMULATED_CONGESTION_ADVISORY'
  | 'SYSTEM_HEALTH_WARNING'
  | 'EDGE_CONNECTIVITY_INTERRUPTION'
  | 'INFORMATION_ADVISORY';

export interface DemoEventRequest {
  scenario: DemoScenarioType;
  camera_id?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  custom_note?: string;
}

export interface DemoBatchRequest {
  count: number;
  camera_id?: string;
}

export interface DemoEventResponse {
  success: boolean;
  message: string;
  scenario: string;
  event_id: string;
  incident_id: string;
  incident_code: string;
  alert_id: string;
  alert_code: string;
  review_status: string;
  timestamp: string;
}

export interface DemoResetRequest {
  confirm: boolean;
  operator_badge: string;
}

export interface DemoResetResponse {
  success: boolean;
  message: string;
  deleted_events_count: number;
  deleted_incidents_count: number;
  deleted_alerts_count: number;
  audit_log_id: string;
  timestamp: string;
}

export interface DemoHistoryItem {
  incident_id: string;
  incident_code: string;
  title: string;
  status: string;
  alert_code: string;
  review_status: string;
  confidence_score: number;
  created_at: string;
}
