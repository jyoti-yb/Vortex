from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
import uvicorn

from models.risk_model import DisruptionScorer
from models.income_predictor import IncomePredictor
from models.fraud_detector import FraudDetector

app = FastAPI(title="GigShield ML Service")

# Initialize models (trained on startup)
scorer = DisruptionScorer()
predictor = IncomePredictor()
fraud_detector = FraudDetector()

# ── Schemas ──────────────────────────────────────────────
class DisruptionRequest(BaseModel):
    city: str
    rainfall: float = 0.0
    aqi: float = 80.0
    trafficIndex: float = 0.3
    platform: Optional[str] = "Swiggy"

class RiskScoreRequest(BaseModel):
    city: str
    platform: str
    rainfall: float = 0.0
    aqi: float = 80.0
    trafficIndex: float = 0.3

class FraudRequest(BaseModel):
    userId: str
    city: str
    payoutAmount: float
    eventType: str
    weeklyPayoutCount: int = 0

# ── Endpoints ────────────────────────────────────────────
@app.post("/disruption-score")
def get_disruption_score(req: DisruptionRequest):
    score = scorer.score(req.rainfall, req.aqi, req.trafficIndex)
    income_loss_pct = predictor.predict(req.rainfall, req.aqi, req.trafficIndex, req.platform)
    return {
        "disruptionScore": round(score, 2),
        "incomeLossPct": round(income_loss_pct, 2),
        "severity": scorer.severity(score),
        "components": {
            "rainComponent": round(min(req.rainfall / 10, 1) * 40, 2),
            "aqiComponent": round(min(max(req.aqi - 50, 0) / 200, 1) * 35, 2),
            "trafficComponent": round(min(req.trafficIndex, 1) * 25, 2)
        }
    }

@app.post("/risk-score")
def get_user_risk_score(req: RiskScoreRequest):
    """Initial risk score assigned at registration."""
    base_scores = {
        "Mumbai": 65, "Delhi": 70, "Hyderabad": 55,
        "Bangalore": 60, "Chennai": 58
    }
    platform_risk = {"Zomato": 5, "Swiggy": 5, "Zepto": 8}
    score = base_scores.get(req.city, 55) + platform_risk.get(req.platform, 5)
    return {"riskScore": min(score, 100)}

@app.post("/fraud-check")
def fraud_check(req: FraudRequest):
    fraud_score = fraud_detector.predict(
        payout_amount=req.payoutAmount,
        event_type=req.eventType,
        weekly_count=req.weeklyPayoutCount,
        city=req.city
    )
    return {
        "fraudScore": round(fraud_score, 3),
        "isFlagged": fraud_score > 0.8,
        "reason": "High payout frequency" if req.weeklyPayoutCount > 5 else "Normal"
    }

@app.get("/health")
def health():
    return {"status": "ok", "models": ["DisruptionScorer", "IncomePredictor", "FraudDetector"]}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)