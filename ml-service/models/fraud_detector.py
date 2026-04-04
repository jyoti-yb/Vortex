import numpy as np
from sklearn.ensemble import IsolationForest
import joblib, os

class FraudDetector:
    """
    Isolation Forest anomaly detection for fraudulent payout claims.
    Features: payout amount, weekly claim frequency, city risk profile.
    """
    MODEL_PATH = "/tmp/fraud_model.pkl"
    CITY_RISK = {"Mumbai": 0.6, "Delhi": 0.7, "Hyderabad": 0.4, "Bangalore": 0.5, "Chennai": 0.45}

    def __init__(self):
        if os.path.exists(self.MODEL_PATH):
            self.model = joblib.load(self.MODEL_PATH)
        else:
            self._train()

    def _generate_normal_data(self, n=1500):
        np.random.seed(0)
        amounts      = np.random.normal(300, 150, n).clip(10, 1200)
        weekly_count = np.random.poisson(1.5, n).clip(0, 5)
        city_risk    = np.random.uniform(0.3, 0.7, n)
        return np.column_stack([amounts, weekly_count, city_risk])

    def _train(self):
        X = self._generate_normal_data()
        self.model = IsolationForest(contamination=0.05, random_state=42, n_estimators=100)
        self.model.fit(X)
        joblib.dump(self.model, self.MODEL_PATH)
        print("✅ FraudDetector (IsolationForest) trained")

    def predict(self, payout_amount: float, event_type: str, weekly_count: int, city: str) -> float:
        city_risk = self.CITY_RISK.get(city, 0.5)
        X = np.array([[payout_amount, weekly_count, city_risk]])
        # IsolationForest: -1 = anomaly, 1 = normal
        prediction = self.model.predict(X)[0]
        score = self.model.decision_function(X)[0]
        # Convert to 0-1 fraud probability (lower decision score = more anomalous)
        fraud_prob = max(0, min(1, (0.1 - score) / 0.3))
        # Boost score for suspiciously high frequency
        if weekly_count > 5:
            fraud_prob = min(fraud_prob + 0.3, 1.0)
        return round(fraud_prob, 3)