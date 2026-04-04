const axios = require('axios');

const CITY_COORDS = {
  Hyderabad: { lat: 17.38, lon: 78.47 },
  Mumbai:    { lat: 19.07, lon: 72.87 },
  Delhi:     { lat: 28.67, lon: 77.22 },
  Bangalore: { lat: 12.97, lon: 77.59 },
  Chennai:   { lat: 13.08, lon: 80.27 }
};

exports.getWeather = async (city) => {
  const coords = CITY_COORDS[city] || CITY_COORDS.Hyderabad;
  try {
    const resp = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat: coords.lat, lon: coords.lon,
        appid: process.env.OPENWEATHER_API_KEY,
        units: 'metric'
      }
    });
    const d = resp.data;
    return {
      city,
      rainfall: d.rain?.['1h'] || 0,
      temperature: d.main.temp,
      windSpeed: d.wind.speed,
      description: d.weather[0].description,
      humidity: d.main.humidity
    };
  } catch (e) {
    console.error(`Weather fetch failed for ${city}:`, e.message);
    // Return mock data if API fails
    return { city, rainfall: Math.random() * 8, temperature: 28, windSpeed: 12, description: 'mock data' };
  }
};