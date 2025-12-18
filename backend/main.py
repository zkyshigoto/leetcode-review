from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
from llm_service import LLMService
from models import ProblemData, ReviewRequest, ReviewResponse, ProblemMetadata
import database

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    database.init_db()

@app.get("/problems", response_model=List[ProblemMetadata])
async def get_problems():
    return database.list_problems()

@app.post("/problems")
async def add_problem(problem: ProblemMetadata):
    try:
        database.add_problem_id(problem.id, problem.title)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"status": "ok", "id": problem.id}

@app.delete("/problems/{problem_id}")
async def delete_problem(problem_id: str):
    try:
        database.delete_problem(problem_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"status": "ok", "id": problem_id}

@app.get("/fetch/{problem_id}")
async def fetch_problem(problem_id: str, x_llm_key: Optional[str] = Header(None), x_llm_base_url: Optional[str] = Header(None), x_llm_model: Optional[str] = Header("gpt-4o-mini")):
    if not x_llm_key:
        raise HTTPException(status_code=401, detail="X-LLM-Key header missing")
    
    llm = LLMService(api_key=x_llm_key, base_url=x_llm_base_url, model=x_llm_model)
    try:
        raw_markdown = await llm.fetch_problem_description(problem_id)
        # Optionally update title if found in markdown, but keeping it simple for now
        return {"markdown": raw_markdown}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM Error: {str(e)}")

@app.post("/check", response_model=ReviewResponse)
async def check_solution(req: ReviewRequest, x_llm_key: Optional[str] = Header(None), x_llm_base_url: Optional[str] = Header(None), x_llm_model: Optional[str] = Header("gpt-4o-mini")):
    if not x_llm_key:
        raise HTTPException(status_code=401, detail="X-LLM-Key header missing")
    
    llm = LLMService(api_key=x_llm_key, base_url=x_llm_base_url, model=x_llm_model)
    try:
        result = await llm.verify_solution(req.problem_id, req.user_code)
        
        # Log to DB
        status = "PASS" if result.get("correct") else "FAIL"
        database.log_review(req.problem_id, status, result.get("feedback", ""))
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM Error: {str(e)}")
