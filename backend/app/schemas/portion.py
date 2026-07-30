from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class TopicDetail(BaseModel):
    id: str
    chapter_name: str
    topic_name: str
    weightage_percent: float
    is_completed: bool
    completed_at: Optional[datetime] = None

class PortionProgressResponse(BaseModel):
    subject_id: str
    subject_code: str
    subject_name: str
    total_nodes: int
    completed_nodes: int
    completion_percentage: float
    completed_weightage_percent: float
    topics: List[TopicDetail]
