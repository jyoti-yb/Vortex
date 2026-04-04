import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
import joblib, os

class IncomePredictor:
    """
    Simple linear regression: weather features → income loss %.
    Trained on synthetic data representing gig worker patterns.
    """
    MODEL_PATH = "/tmp/income_model.pkl"

    def __init__(self):
        if os.path.exists(self.MODEL_PATH):
            data = joblib.load(self.MODEL_PATH)
            self.model = data["model"]
            self.scaler = data["scaler"]
        else:
            self._train()

    def _generate_synthetic_data(self, n=2000):
        np.random.seed(42)
        rainfall    = np.random.exponential(2, n)          # mm/hr
        aqi         = np.random.normal(120, 60, n).clip(10, 500)
        traffic     = np.random.uniform(0, 1, n)
        # Income loss: rain has biggest impact, AQI moderate, traffic moderate
        loss = (
            np.minimum(rainfall / 10, 1.0) * 50
            + np.maximum(aqi - 100, 0) / 400 * 30
            + traffic * 20
            + np.random.normal(0, 5, n)          # noise
        ).clip(0, 100)
        X = np.column_stack([rainfall, aqi, traffic])
        return X, loss

    def _train(self):
        X, y = self._generate_synthetic_data()
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)
        self.model = LinearRegression()
        self.model.fit(X_scaled, y)
        joblib.dump({"model": self.model, "scaler": self.scaler}, self.MODEL_PATH)
        print("✅ IncomePredictor trained")

    def predict(self, rainfall: float, aqi: float, traffic_index: float, platform: str = "Swiggy") -> float:
        X = np.array([[rainfall, aqi, traffic_index]])
        X_scaled = self.scaler.transform(X)
        loss_pct = float(self.model.predict(X_scaled)[0])
        # Platform adjustment: Zepto slightly more sensitive (faster deliveries)
        multiplier = {"Zepto": 1.1, "Zomato": 1.0, "Swiggy": 1.0}.get(platform, 1.0)
        return min(max(loss_pct * multiplier, 0), 100)