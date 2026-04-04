const axios = require('axios');

exports.getDisruptionScore = async (payload) => {
  try {
    const resp = await axios.post(`${process.env.ML_SERVICE_URL}/disruption-score`, payload);
    return resp.data;
  } catch (e) {
    // Fallback: rule-based scoring if ML service is down
    const { rainfall = 0, aqi = 80, trafficIndex = 0.3 } = payload;
    let score = 0;
    score += Math.min(rainfall / 10, 1) * 40;
    score += Math.min((aqi - 50) / 200, 1) * 35;
    score += Math.min(trafficIndex, 1) * 25;
    return { disruptionScore: Math.round(score), source: 'fallback' };
  }
};