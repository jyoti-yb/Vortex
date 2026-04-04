const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Policy = require('../models/Policy');
const User = require('../models/User');
const RiskScore = require('../models/RiskScore');

// Premium calculation logic
const calculatePremium = (plan, riskScore, city) => {
  const base = { basic: 49, standard: 99, premium: 199 };
  const riskMultiplier = 1 + (riskScore - 50) / 200; // ±25% adjustment
  const cityMultiplier = { Mumbai: 1.15, Delhi: 1.1, Hyderabad: 1.0, Bangalore: 1.05 };
  const cm = cityMultiplier[city] || 1.0;
  return Math.round(base[plan] * riskMultiplier * cm);
};

const getMaxPayout = (plan) => ({ basic: 500, standard: 1200, premium: 2500 }[plan]);

const VALID_PLANS = ['basic', 'standard', 'premium'];

// POST /api/calculate-premium
router.post('/calculate-premium', auth, async (req, res) => {
  try {
    const { plan } = req.body;
    if (!VALID_PLANS.includes(plan)) return res.status(400).json({ error: 'Invalid plan. Must be basic, standard, or premium.' });
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const premium = calculatePremium(plan, user.riskScore, user.city);
    const maxPayout = getMaxPayout(plan);
    const coverageTypes = plan === 'basic'
      ? ['rain']
      : plan === 'standard'
      ? ['rain', 'aqi', 'traffic']
      : ['rain', 'aqi', 'traffic', 'civic'];

    res.json({ plan, weeklyPremium: premium, maxWeeklyPayout: maxPayout, coverageTypes, riskScore: user.riskScore });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/subscribe
router.post('/subscribe', auth, async (req, res) => {
  try {
    const { plan } = req.body;
    if (!VALID_PLANS.includes(plan)) return res.status(400).json({ error: 'Invalid plan. Must be basic, standard, or premium.' });
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Expire existing active policy
    await Policy.updateMany({ userId: user._id, status: 'active' }, { status: 'expired' });

    const premium = calculatePremium(plan, user.riskScore, user.city);
    const maxPayout = getMaxPayout(plan);
    const coverageTypes = plan === 'basic'
      ? ['rain']
      : plan === 'standard'
      ? ['rain', 'aqi', 'traffic']
      : ['rain', 'aqi', 'traffic', 'civic'];

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    const policy = new Policy({
      userId: user._id, plan, weeklyPremium: premium,
      maxWeeklyPayout: maxPayout, coverageTypes, endDate
    });
    await policy.save();
    res.status(201).json(policy);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/get-policy
router.get('/get-policy', auth, async (req, res) => {
  try {
    const policy = await Policy.findOne({ userId: req.user.userId, status: 'active' });
    if (!policy) return res.status(404).json({ error: 'No active policy' });
    res.json(policy);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/risk-snapshot  (current city risk)
router.get('/risk-snapshot', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const latest = await RiskScore.findOne({ city: user.city }).sort({ timestamp: -1 });
    res.json(latest || { city: user.city, disruptionScore: 20, rainfall: 0, aqi: 80, trafficIndex: 0.2 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;