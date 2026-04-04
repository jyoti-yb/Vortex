const mongoose = require('mongoose');

const RiskScoreSchema = new mongoose.Schema({
  city: { type: String, required: true },
  disruptionScore: { type: Number },
  rainfall: Number,
  aqi: Number,
  trafficIndex: Number,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RiskScore', RiskScoreSchema);