from pydantic import BaseModel
from typing import Optional

class ProblemMetadata(BaseModel):
    id: str
    title: Optional[str] = None

class ProblemData(BaseModel):
    id: str
    description_md: str

class ReviewRequest(BaseModel):
    problem_id: str
    user_code: str

class ReviewResponse(BaseModel):
    correct: bool
    feedback: str
