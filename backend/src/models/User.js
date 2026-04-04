const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  city: { type: String, required: true },           // "Hyderabad", "Mumbai", etc.
  platform: { type: String, required: true },        // "Zomato", "Swiggy", "Zepto"
  riskScore: { type: Number, default: 50 },          // 0-100
  bankAccount: { type: String, default: 'mock_upi_id' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);