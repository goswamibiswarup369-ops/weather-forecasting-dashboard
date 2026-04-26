const BASE_URL = 'https://api.openweathermap.org/data/2.5';

/**
 * Map an OWM weather condition ID to a representative emoji.
 * Full code list: https://openweathermap.org/weather-conditions
 * @param {number|string} code
 * @returns {string}
 */
function weatherEmoji(code) {
  const id = parseInt(code, 10);
  if (id >= 200 && id < 300) return '⛈';   // Thunderstorm
  if (id >= 300 && id < 400) return '🌦';   // Drizzle
  if (id >= 500 && id < 600) return '🌧';   // Rain
  if (id >= 600 && id < 700) return '❄️';   // Snow
  if (id >= 700 && id < 800) return '🌫';   // Atmosphere (fog, haze…)
  if (id === 800)             return '☀️';   // Clear sky
  if (id === 801)             return '🌤';   // Few clouds
  if (id === 802)             return '⛅';   // Scattered clouds
  if (id === 803 || id === 804) return '☁️'; // Broken / overcast
  return '🌡';
}


/**
 * Pull only the fields the UI needs from a /weather response.
 * @param {Object} raw - raw JSON from OWM /weather endpoint
 * @returns {Object}
 */
function normaliseCurrentWeather(raw) {
  return {
    city:        raw.name,
    country:     raw.sys.country,
    temp:        Math.round(raw.main.temp),
    feelsLike:   Math.round(raw.main.feels_like),
    description: raw.weather[0].description,
    conditionId: raw.weather[0].id,
    emoji:       weatherEmoji(raw.weather[0].id),
    humidity:    raw.main.humidity,
    windSpeed:   raw.wind.speed,
    pressure:    raw.main.pressure,
    visibility:  raw.visibility ? (raw.visibility / 1000).toFixed(1) : null,
  };
}

/**
 * Collapse 3-hourly forecast entries into one object per calendar day.
 * @param {Array} list - raw list[] from OWM /forecast endpoint
 * @returns {Array}  - up to 5 day objects
 */
function normaliseForecast(list) {
  const byDay = {};

  list.forEach(entry => {
    const date = entry.dt_txt.slice(0, 10); // 'YYYY-MM-DD'
    if (!byDay[date]) {
      byDay[date] = { highs: [], lows: [], conditionIds: [], pops: [] };
    }
    byDay[date].highs.push(entry.main.temp_max);
    byDay[date].lows.push(entry.main.temp_min);
    byDay[date].conditionIds.push(entry.weather[0].id);
    byDay[date].pops.push(entry.pop || 0);
  });

  return Object.entries(byDay)
    .slice(1, 6) // skip today, take next 5 days
    .map(([date, d]) => {
      const midId = d.conditionIds[Math.floor(d.conditionIds.length / 2)];
      return {
        date,
        dayLabel:  new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
        high:      Math.round(Math.max(...d.highs)),
        low:       Math.round(Math.min(...d.lows)),
        emoji:     weatherEmoji(midId),
        rainChance: Math.round(Math.max(...d.pops) * 100),
      };
    });
}


/**
 * Fetch current weather + 5-day forecast by city name.
 * @param {string} city
 * @param {string} units - 'metric' | 'imperial'
 * @returns {Promise<{ current: Object, forecast: Array }>}
 * @throws {Error} with a user-friendly message
 */
async function fetchWeatherByCity(city, units) {
  const key = loadFromStorage(STORAGE_KEYS.apiKey, '941211f50267905bb9bb87ced254bb1d');
  if (!key) throw new Error('No API key set. Please add your OpenWeatherMap key above.');

  const cityEncoded = encodeURIComponent(city);
  const [curRes, foreRes] = await Promise.all([
    fetch(`${BASE_URL}/weather?q=${cityEncoded}&appid=${key}&units=${units}`),
    fetch(`${BASE_URL}/forecast?q=${cityEncoded}&appid=${key}&units=${units}&cnt=40`),
  ]);

  if (!curRes.ok) {
    const err = await curRes.json().catch(() => ({}));
    throw new Error(err.message || 'City not found. Please check the spelling.');
  }

  const [curData, foreData] = await Promise.all([curRes.json(), foreRes.json()]);

  return {
    current:  normaliseCurrentWeather(curData),
    forecast: normaliseForecast(foreData.list),
  };
}

/**
 * Fetch current weather + 5-day forecast by geographic coordinates.
 * @param {number} lat
 * @param {number} lon
 * @param {string} units - 'metric' | 'imperial'
 * @returns {Promise<{ current: Object, forecast: Array }>}
 * @throws {Error}
 */
async function fetchWeatherByCoords(lat, lon, units) {
  const key = loadFromStorage(STORAGE_KEYS.apiKey, '941211f50267905bb9bb87ced254bb1d');
  if (!key) throw new Error('No API key set. Please add your OpenWeatherMap key above.');

  const [curRes, foreRes] = await Promise.all([
    fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${key}&units=${units}`),
    fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${key}&units=${units}&cnt=40`),
  ]);

  if (!curRes.ok) throw new Error('Could not fetch weather for your location.');

  const [curData, foreData] = await Promise.all([curRes.json(), foreRes.json()]);

  return {
    current:  normaliseCurrentWeather(curData),
    forecast: normaliseForecast(foreData.list),
  };
}
