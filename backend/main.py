"""
NutriQuest FastAPI Backend
"""
from __future__ import annotations

import os
import json
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="NutriQuest API", version="1.0.0")

# CORS — add your Cloud Run frontend URL here
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:4173",
    os.getenv("FRONTEND_URL", ""),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o for o in ALLOWED_ORIGINS if o],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"


# ─── Health Check ─────────────────────────────────────────────────────────────

@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "version": "1.0"}


# ─── Models ───────────────────────────────────────────────────────────────────

class MealParseRequest(BaseModel):
    description: str

class OracleRequest(BaseModel):
    user_message: str
    hero_class: str
    hero_level: int
    stats: dict[str, float]
    active_quests: list[str]
    recent_meals: list[str]

class ImageScanRequest(BaseModel):
    image_base64: str  # base64 encoded image


# ─── Gemini helper ────────────────────────────────────────────────────────────

async def call_gemini(prompt: str, image_base64: str | None = None) -> str:
    if not GEMINI_API_KEY:
        return _mock_response(prompt)

    parts: list[dict[str, Any]] = [{"text": prompt}]
    if image_base64:
        parts.append({"inlineData": {"mimeType": "image/jpeg", "data": image_base64}})

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{GEMINI_URL}?key={GEMINI_API_KEY}",
            json={"contents": [{"parts": parts}]},
        )
        resp.raise_for_status()
        data = resp.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]


def _mock_response(prompt: str) -> str:
    if "JSON array" in prompt:
        return json.dumps([
            {"name": "Dal Rice", "calories": 350, "protein": 14,
             "carbs": 62, "fat": 4, "fiber": 8, "isHealthy": True}
        ])
    return (
        "Seeker, your path to greatness begins with consistent nourishment. "
        "The Oracle sees great potential in your stats — focus on protein today "
        "to strengthen your STR. Add your GEMINI_API_KEY for full prophecy access."
    )


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.post("/api/meal/parse")
async def parse_meal(req: MealParseRequest) -> dict[str, Any]:
    """Parse a natural language meal description into nutritional data."""
    prompt = f"""You are NutriQuest's food analysis engine.
    The user described their meal: "{req.description}"
    Respond ONLY with a JSON array:
    [{{"name": "Food Name", "calories": 200, "protein": 20, "carbs": 30, "fat": 5, "fiber": 3, "isHealthy": true}}]
    Be realistic with nutritional values. Include all items mentioned."""

    try:
        result = await call_gemini(prompt)
        # Extract JSON from response
        start = result.find("[")
        end = result.rfind("]") + 1
        if start >= 0 and end > start:
            items = json.loads(result[start:end])
        else:
            items = json.loads(result)
        return {"items": items, "source": "gemini" if GEMINI_API_KEY else "mock"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/oracle/ask")
async def ask_oracle(req: OracleRequest) -> dict[str, str]:
    """Get AI coach response from The Oracle."""
    prompt = f"""You are The Oracle, a mystical AI diet coach in NutriQuest health RPG.
    Hero: Level {req.hero_level} {req.hero_class}
    Current Stats: {json.dumps(req.stats)}
    Active Quests: {", ".join(req.active_quests) or "None"}
    Recent Meals: {", ".join(req.recent_meals) or "None logged today"}
    User asks: "{req.user_message}"
    Respond as The Oracle — wise, mystical, practical. Use RPG language with real nutrition advice.
    Under 150 words. Reference hero class and stats."""

    try:
        response = await call_gemini(prompt)
        return {"response": response, "source": "gemini" if GEMINI_API_KEY else "mock"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/meal/scan-image")
async def scan_food_image(req: ImageScanRequest) -> dict[str, Any]:
    """Scan food image and identify items."""
    prompt = """Analyze this food image for NutriQuest health RPG.
    Identify all food items and return ONLY a JSON array:
    [{"name": "Food Name", "calories": 200, "protein": 20, "carbs": 30, "fat": 5, "fiber": 3, "isHealthy": true}]"""

    try:
        result = await call_gemini(prompt, req.image_base64)
        start = result.find("[")
        end = result.rfind("]") + 1
        items = json.loads(result[start:end])
        return {"items": items}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/report/weekly")
async def weekly_report(data: dict[str, Any]) -> dict[str, str]:
    """Generate weekly battle report."""
    prompt = f"""You are NutriQuest's battle historian. Write a weekly battle report for:
    Hero: {data.get('heroName')}, {data.get('heroClass')}
    Meals Logged: {data.get('mealsLogged')}
    Average Health Score: {data.get('avgHealthScore')}/100
    Stat Changes: {json.dumps(data.get('statChanges', {}))}
    Quests Completed: {data.get('questsCompleted')}
    Write 3-4 sentences in epic RPG narrative style. Be encouraging. Reference specific stats."""

    try:
        report = await call_gemini(prompt)
        return {"report": report}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
