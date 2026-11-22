"""
Operation Prahaar AI - Phase C Explainable AI (XAI) Schemas
Defines transparent, rule-based explainability response structures for public safety decision support.
Strictly non-identifying; zero profiling; zero predictive policing.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class ExplainabilityFactor(BaseModel):
    """Specific measurable heuristic factor contributing to indicator generation."""
    factor_name: str = Field(..., example="Spatial Occupancy Ratio")
    measured_value: str = Field(..., example="0.88 (88%)")
    threshold_value: str = Field(..., example="0.75 (75%)")
    contribution_weight: float = Field(..., example=0.65)
    evaluation_status: str = Field(..., example="THRESHOLD_EXCEEDED")  # NOMINAL, ELEVATED, THRESHOLD_EXCEEDED


class IncidentExplainabilityResponse(BaseModel):
    """Complete transparent explanation of why an incident or indicator was generated."""
    incident_id: str
    incident_code: str
    indicator_name: str
    severity: str
    confidence_score: float
    uncertainty_level: str  # LOW, MODERATE, HIGH
    input_values: Dict[str, Any]
    applied_calculation_or_rule: str
    rule_description: str
    explanation: str
    contributing_factors: List[ExplainabilityFactor]
    data_quality: Dict[str, Any]
    synthetic_data_marker: str = "[SYNTHETIC DEMO]"
    is_synthetic: bool = Field(True, description="Strict synthetic data marker")
    limitations: str = (
        "Demonstration heuristic operates purely on 2D aggregate zone occupancy and flow velocity. "
        "Strictly non-identifying; zero facial recognition or individual tracking is performed."
    )
    generated_at: str
