const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Payout = require('../models/Payout');
const User = require('../models/User');

// GET /api/payouts
router.get('/payouts', auth, async (req, res) => {
  try {
    const payouts = await Payout.find({ userId: req.user.userId })
      .populate('eventId', 'eventType city triggeredAt')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(payouts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/payouts/summary
router.get('/payouts/summary', auth, async (req, res) => {
  try {
    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [totals] = await Payout.aggregate([
      { $match: { userId: req.user.userId } },
      {
        $group: {
          _id: null,
          totalPayouts: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          thisWeekAmount: {
            $sum: { $cond: [{ $gte: ['$createdAt', weekStart] }, '$amount', 0] }
          }
        }
      }
    ]);
    res.json(totals
      ? { totalPayouts: totals.totalPayouts, totalAmount: totals.totalAmount, thisWeekAmount: totals.thisWeekAmount }
      : { totalPayouts: 0, totalAmount: 0, thisWeekAmount: 0 }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;