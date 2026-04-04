const cron = require('node-cron');
const weatherService = require('../services/weatherService');
const aqiService = require('../services/aqiService');
const aiService = require('../services/aiService');
const Event = require('../models/Event');
const RiskScore = require('../models/RiskScore');
const payoutService = require('../services/payoutService');

const CITIES = ['Hyderabad', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai'];

const THRESHOLDS = {
  rainfall:     { value: 5,   eventType: 'rain' },
  aqi:          { value: 200, eventType: 'aqi'  },
  trafficIndex: { value: 0.7, eventType: 'traffic' }
};

// Per-city deterministic traffic offsets so demo results are consistent
const CITY_TRAFFIC_BASE = { Hyderabad: 0.55, Mumbai: 0.65, Delhi: 0.60, Bangalore: 0.58, Chennai: 0.52 };

const mockTrafficIndex = (city) => {
  const hour = new Date().getHours();
  const isPeak = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20);
  const base = CITY_TRAFFIC_BASE[city] || 0.55;
  // Add small deterministic jitter based on current minute so it isn't completely static
  const jitter = (new Date().getMinutes() % 10) / 100;
  return isPeak ? Math.min(base + jitter, 1.0) : Math.max(base - 0.2 + jitter, 0);
};

const processCity = async (city) => {
  try {
    const [weather, aqiData] = await Promise.all([
      weatherService.getWeather(city),
      aqiService.getAQI(city)
    ]);
    const trafficIndex = mockTrafficIndex(city);

    const { disruptionScore } = await aiService.getDisruptionScore({
      city, rainfall: weather.rainfall, aqi: aqiData.aqi, trafficIndex
    });

    // Save risk score snapshot (after threshold checks so a failed payout loop doesn't orphan a snapshot)
    const checks = [
      { field: weather.rainfall,  type: 'rainfall',    eventType: 'rain' },
      { field: aqiData.aqi,       type: 'aqi',         eventType: 'aqi'  },
      { field: trafficIndex,      type: 'trafficIndex', eventType: 'traffic' }
    ];

    for (const check of checks) {
      const thr = THRESHOLDS[check.type];
      if (check.field >= thr.value) {
        console.log(`🚨 Trigger: ${check.eventType} in ${city} (${check.field})`);

        const event = new Event({
          city,
          eventType: check.eventType,
          severity: disruptionScore > 75 ? 'critical' : disruptionScore > 50 ? 'high' : 'medium',
          rawData: { rainfall: weather.rainfall, aqi: aqiData.aqi, trafficIndex, description: weather.description },
          disruptionScore
        });
        await event.save();

        const payoutCount = await payoutService.processPayouts(event);
        event.payoutsTriggered = payoutCount;
        await event.save();

        console.log(`✅ ${payoutCount} payouts processed for ${city} ${check.eventType} event`);
      }
    }

    await RiskScore.create({
      city, disruptionScore,
      rainfall: weather.rainfall,
      aqi: aqiData.aqi,
      trafficIndex
    });

    console.log(`[${city}] Rain: ${weather.rainfall}mm | AQI: ${aqiData.aqi} | Traffic: ${trafficIndex.toFixed(2)} | Score: ${disruptionScore}`);
  } catch (err) {
    console.error(`Scheduler error for ${city}:`, err.message);
  }
};

const startScheduler = () => {
  // Run every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    console.log('\n🔄 Scheduler tick:', new Date().toISOString());
    await Promise.all(CITIES.map(processCity));
  });

  // Also run immediately on startup
  setTimeout(async () => {
    console.log('🚀 Initial scheduler run...');
    await Promise.all(CITIES.map(processCity));
  }, 3000);

  console.log('⏰ Scheduler started (every 10 min)');
};

module.exports = { startScheduler };