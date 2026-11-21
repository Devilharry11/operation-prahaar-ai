"""
Operation Prahaar AI - Edge Node Configuration
"""

import os


class EdgeSettings:
    """Configuration for Edge Processing Node (Mini PC simulation on laptop)."""

    DEVICE_ID: str = os.getenv("EDGE_DEVICE_ID", "EDGE-IND-DELHI-001")
    LOCATION_NAME: str = os.getenv("EDGE_LOCATION", "Sector 4 - Public Transit Hub")
    BACKEND_API_URL: str = os.getenv("BACKEND_API_URL", "http://127.0.0.1:8000/api/v1")
    
    # Vision & Resource Caps (Ensures 8 GB RAM laptop is never overloaded)
    MAX_PROCESSING_FPS: int = int(os.getenv("EDGE_FRAME_SAMPLING_RATE", "5"))
    FRAME_WIDTH: int = 640
    FRAME_HEIGHT: int = 360
    
    # Event Trigger Thresholds
    CROWD_CONGESTION_THRESHOLD: float = float(os.getenv("CROWD_CONGESTION_THRESHOLD", "0.75"))
    RESTRICTED_ZONE_DETECTION: bool = True
    
    # Telemetry Heartbeat
    HEARTBEAT_INTERVAL_SECONDS: int = int(os.getenv("EDGE_HEARTBEAT_INTERVAL_SECONDS", "10"))


edge_settings = EdgeSettings()
