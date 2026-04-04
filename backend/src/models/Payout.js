const mongoose = require('mongoose');

const PayoutSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  policyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Policy', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  amount: { type: Number, required: true },       // INR
  reason: { type: String, required: true },
  status: { type: String, enum: ['processing', 'paid', 'flagged'], default: 'processing' },
  fraudScore: { type: Number, default: 0 },       // 0-1 from Isolation Forest
  createdAt: { type: Date, default: Date.now },
  paidAt: { type: Date }
});

module.exports = mongoose.model('Payout', PayoutSchema);