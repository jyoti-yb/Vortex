import numpy as np

class DisruptionScorer:
    """
    Weighted rule-based disruption scorer.
    Weights calibrated from synthetic gig worker income data.
    """
    WEIGHTS = {
        "rain":    {"weight": 0.40, "scale": 10.0},   # 10mm = max impact
        "aqi":     {"weight": 0.35, "baseline": 50, "scale": 200.0},
        "traffic": {"weight": 0.25, "scale": 1.0}
    }

    def score(self, rainfall: float, aqi: float, traffic_index: float) -> float:
        rain_component    = min(rainfall / self.WEIGHTS["rain"]["scale"], 1.0) * self.WEIGHTS["rain"]["weight"] * 100
        aqi_adj           = max(aqi - self.WEIGHTS["aqi"]["baseline"], 0)
        aqi_component     = min(aqi_adj / self.WEIGHTS["aqi"]["scale"], 1.0) * self.WEIGHTS["aqi"]["weight"] * 100
        traffic_component = min(traffic_index / self.WEIGHTS["traffic"]["scale"], 1.0) * self.WEIGHTS["traffic"]["weight"] * 100
        return round(rain_component + aqi_component + traffic_component, 2)

    def severity(self, score: float) -> str:
        if score >= 75: return "critical"
        if score >= 50: return "high"
        if score >= 25: return "medium"
        return "low"