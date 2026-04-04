const User = require('../models/User');
const Policy = require('../models/Policy');
const Payout = require('../models/Payout');
const axios = require('axios');

const TRIGGER_THRESHOLDS = {
  rain:        { field: 'rainfall',     threshold: 5,    payoutPct: 0.4 },
  aqi:         { field: 'aqi',          threshold: 200,  payoutPct: 0.3 },
  traffic:     { field: 'trafficIndex', threshold: 0.7,  payoutPct: 0.25 },
  civic:       { field: 'trafficIndex', threshold: 0.5,  payoutPct: 0.35 },
  demand_drop: { field: 'trafficIndex', threshold: 0.6,  payoutPct: 0.2  }
};

exports.processPayouts = async (event) => {
  const { city, eventType, disruptionScore } = event;
  const config = TRIGGER_THRESHOLDS[eventType];
  if (!config) return 0;

  // Find all users in the affected city with active policies
  const users = await User.find({ city, isActive: true });
  let payoutCount = 0;

  for (const user of users) {
    const policy = await Policy.findOne({
      userId: user._id,
      status: 'active',
      coverageTypes: { $in: [eventType] }
    });
    if (!policy) continue;

    // Check if this week's payout limit is reached
    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyPayouts = await Payout.find({
      userId: user._id,
      policyId: policy._id,
      createdAt: { $gte: weekStart }
    });
    const weeklyTotal = weeklyPayouts.reduce((sum, p) => sum + p.amount, 0);
    if (weeklyTotal >= policy.maxWeeklyPayout) continue;

    // Calculate payout amount
    const baseAmount = policy.maxWeeklyPayout * config.payoutPct;
    const severityMultiplier = disruptionScore / 100;
    const payoutAmount = Math.min(
      Math.round(baseAmount * severityMultiplier),
      policy.maxWeeklyPayout - weeklyTotal
    );

    if (payoutAmount < 10) continue; // minimum payout ₹10

    // Fraud check via ML service
    let fraudScore = 0;
    try {
      const fraudResp = await axios.post(`${process.env.ML_SERVICE_URL}/fraud-check`, {
        userId: user._id.toString(),
        city,
        payoutAmount,
        eventType,
        weeklyPayoutCount: weeklyPayouts.length
      });
      fraudScore = fraudResp.data.fraudScore;
    } catch (e) {
      console.log('Fraud service unavailable');
    }

    const status = fraudScore > 0.8 ? 'flagged' : 'paid';
    const reason = `Auto-triggered: ${eventType.replace('_', ' ')} event in ${city} (score: ${disruptionScore})`;

    const payout = new Payout({
      userId: user._id,
      policyId: policy._id,
      eventId: event._id,
      amount: payoutAmount,
      reason,
      status,
      fraudScore,
      paidAt: status === 'paid' ? new Date() : null
    });
    await payout.save();

    // Update policy total
    await Policy.findByIdAndUpdate(policy._id, {
      $inc: { totalPayoutsReceived: payoutAmount }
    });

    payoutCount++;
  }

  return payoutCount;
};