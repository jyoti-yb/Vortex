require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User   = require('./models/User');
  const Policy = require('./models/Policy');
  const Event  = require('./models/Event');
  const Payout = require('./models/Payout');
  const RiskScore = require('./models/RiskScore');

  // Wipe existing demo data
  await Promise.all([
    User.deleteMany({ email: 'ravi@demo.com' }),
    Policy.deleteMany({}),
    Event.deleteMany({}),
    Payout.deleteMany({}),
    RiskScore.deleteMany({})
  ]);

  const hash = await bcrypt.hash('demo123', 10);

  const user = await User.create({
    name: 'Ravi Kumar', phone: '9876543210',
    email: 'ravi@demo.com', password: hash,
    city: 'Hyderabad', platform: 'Swiggy', riskScore: 55
  });

  const policy = await Policy.create({
    userId: user._id, plan: 'standard',
    weeklyPremium: 99, maxWeeklyPayout: 1200,
    coverageTypes: ['rain', 'aqi', 'traffic'],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  // Seed a live risk snapshot for Hyderabad (triggers both rain + AQI)
  await RiskScore.create({
    city: 'Hyderabad', disruptionScore: 78,
    rainfall: 7.3, aqi: 240, trafficIndex: 0.82
  });

  // Seed two triggered events
  const rainEvent = await Event.create({
    city: 'Hyderabad', eventType: 'rain', severity: 'high',
    rawData: { rainfall: 7.3, aqi: 240, trafficIndex: 0.82, description: 'heavy rain' },
    disruptionScore: 78, payoutsTriggered: 1
  });

  const aqiEvent = await Event.create({
    city: 'Hyderabad', eventType: 'aqi', severity: 'high',
    rawData: { rainfall: 7.3, aqi: 240, trafficIndex: 0.82, description: 'poor air quality' },
    disruptionScore: 78, payoutsTriggered: 1
  });

  // Seed payouts for those events
  await Payout.create({
    userId: user._id, policyId: policy._id, eventId: rainEvent._id,
    amount: 340, status: 'paid', fraudScore: 0.02,
    reason: 'Auto-triggered: rain event in Hyderabad (score: 78)',
    paidAt: new Date()
  });

  await Payout.create({
    userId: user._id, policyId: policy._id, eventId: aqiEvent._id,
    amount: 210, status: 'paid', fraudScore: 0.04,
    reason: 'Auto-triggered: aqi event in Hyderabad (score: 78)',
    paidAt: new Date()
  });

  // Seed a flagged payout from Mumbai (fraud demo)
  const mumbaiUser = await User.create({
    name: 'Test Fraud', phone: '9000000001',
    email: 'fraud@demo.com', password: hash,
    city: 'Mumbai', platform: 'Zomato', riskScore: 70
  });
  const mumbaiPolicy = await Policy.create({
    userId: mumbaiUser._id, plan: 'premium',
    weeklyPremium: 230, maxWeeklyPayout: 2500,
    coverageTypes: ['rain', 'aqi', 'traffic', 'civic'],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });
  const mumbaiEvent = await Event.create({
    city: 'Mumbai', eventType: 'rain', severity: 'medium',
    rawData: { rainfall: 5.1, aqi: 160, trafficIndex: 0.6, description: 'moderate rain' },
    disruptionScore: 55, payoutsTriggered: 1
  });
  await Payout.create({
    userId: mumbaiUser._id, policyId: mumbaiPolicy._id, eventId: mumbaiEvent._id,
    amount: 875, status: 'flagged', fraudScore: 0.91,
    reason: 'Auto-triggered: rain event in Mumbai (score: 55)',
    paidAt: null
  });

  console.log('✅ Seed complete.');
  console.log('   Login: ravi@demo.com / demo123');
  console.log('   Ravi has ₹550 in payouts (rain ₹340 + AQI ₹210)');
  console.log('   Mumbai fraud claim flagged (fraudScore: 0.91)');
  process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
