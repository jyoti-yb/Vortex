const mongoose = require('mongoose');

const PolicySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: String, enum: ['basic', 'standard', 'premium'], default: 'standard' },
  weeklyPremium: { type: Number, required: true },    // INR
  maxWeeklyPayout: { type: Number, required: true },  // INR
  coverageTypes: [{ type: String }],                  // ['rain','aqi','traffic','civic']
  status: { type: String, enum: ['active','expired','pending'], default: 'active' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  totalPayoutsReceived: { type: Number, default: 0 }
});

module.exports = mongoose.model('Policy', PolicySchema);