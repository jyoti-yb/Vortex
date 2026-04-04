const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const axios = require('axios');

const VALID_CITIES     = ['Hyderabad', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai'];
const VALID_PLATFORMS  = ['Zomato', 'Swiggy', 'Zepto'];

// POST /api/register
router.post('/register', async (req, res) => {
  try {
    const { name, phone, email, password, city, platform } = req.body;

    if (!name || !phone || !email || !password || !city || !platform)
      return res.status(400).json({ error: 'All fields are required' });
    if (!/^\d{10}$/.test(phone))
      return res.status(400).json({ error: 'Phone must be exactly 10 digits' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    if (!VALID_CITIES.includes(city))
      return res.status(400).json({ error: `City must be one of: ${VALID_CITIES.join(', ')}` });
    if (!VALID_PLATFORMS.includes(platform))
      return res.status(400).json({ error: `Platform must be one of: ${VALID_PLATFORMS.join(', ')}` });

    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing) return res.status(400).json({ error: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);

    // Call ML service to get initial risk score
    let riskScore = 50;
    try {
      const mlResp = await axios.post(`${process.env.ML_SERVICE_URL}/risk-score`, {
        city, platform, rainfall: 0, aqi: 80, trafficIndex: 0.3
      });
      riskScore = mlResp.data.riskScore;
    } catch (e) {
      console.log('ML service unavailable, using default risk score');
    }

    const user = new User({ name, phone, email, password: hashed, city, platform, riskScore });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name, city, platform, riskScore } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, city: user.city, platform: user.platform, riskScore: user.riskScore } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;