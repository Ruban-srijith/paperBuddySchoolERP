from pydantic import BaseModel
from typing import List, Dict, Any

class SchoolHealthSummaryResponse(BaseModel):
    health_score: float  # 0.0 - 100.0
    overall_status: str  # Excellent, Good, Attention Required
    metrics: Dict[str, Any]
    critical_alerts: List[str]
    ai_recommendations: List[str]
