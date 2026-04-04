const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  city: { type: String, required: true },
  eventType: { type: String, enum: ['rain', 'aqi', 'traffic', 'civic', 'demand_drop'], required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
  rawData: {
    rainfall: Number,    // mm/hr
    aqi: Number,
    trafficIndex: Number,
    description: String
  },
  disruptionScore: { type: Number },   // 0-100, from AI
  triggeredAt: { type: Date, default: Date.now },
  payoutsTriggered: { type: Number, default: 0 }
});

module.exports = mongoose.model('Event', EventSchema);