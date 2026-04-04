const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Event = require('../models/Event');

// GET /api/events?city=Hyderabad
router.get('/events', auth, async (req, res) => {
  try {
    const { city } = req.query;
    const filter = city ? { city } : {};
    const events = await Event.find(filter)
      .sort({ triggeredAt: -1 })
      .limit(20);
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
