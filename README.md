# 🌤 Stratus — Weather Intelligence Dashboard

> Advanced JavaScript & APIs

A responsive weather dashboard that fetches real-time data from the OpenWeatherMap API, displays current conditions and a 5-day forecast, and saves user preferences using Local Storage.


## 🚀 Live Demo

Open `index.html` directly in your browser — no server or build tools required.

---

## ✨ Features

- 🔍 **City Search** — search any city with Enter key or button
- 🌡 **Current Weather** — temperature, feels-like, humidity, wind, pressure, visibility
- 📅 **5-Day Forecast** — daily high/low, weather icon, rain probability
- 📍 **Geolocation** — one-click "Use My Location"
- ⚡ **Unit Toggle** — switch between °C / m/s and °F / mph
- ⭐ **Favorites** — save and reload cities, persisted in Local Storage
- 💾 **Auto-restore** — last searched city and unit preference reload on refresh
- ⚠️ **Error Handling** — friendly messages for invalid city, network failure, missing key
- 📱 **Responsive** — works on mobile, tablet, and desktop

---

## 📁 Project Structure

```
stratus/
├── index.html           # Main HTML structure
├── css/
│   └── styles.css       # All styles and responsive layout
├── js/
│   ├── storage.js       # localStorage helper functions
│   ├── api.js           # OpenWeatherMap API calls
│   └── app.js           # Main controller, rendering, events
├── screenshots/
│   ├── dashboard.png
│   ├── forecast.png
│   └── mobile.png
└── README.md
```

---

## ⚙️ Setup & Installation

### Step 1 — Clone the repository

```bash
git clone https://github.com/your-username/stratus-weather.git
cd stratus-weather
```

### Step 2 — Get a free API key

1. Go to [openweathermap.org](https://openweathermap.org) and create a free account
2. Navigate to **API Keys** in my dashboard
3. Copy my default API key



### Step 4 — Open in browser

Simply open `index.html` in any modern browser. No npm, no server needed.

---

## 🔧 Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Semantic page structure |
| CSS3 | Styling, animations, CSS Grid, responsive layout |
| JavaScript (ES6+) | App logic, async/await, DOM manipulation |
| Fetch API | HTTP requests to OpenWeatherMap |
| localStorage | Persisting preferences and favorites |
| Geolocation API | Browser location detection |
| OpenWeatherMap API | Live weather and forecast data |

---

## 📡 API Reference

**Base URL:** `https://api.openweathermap.org/data/2.5`

| Endpoint | Method | Description |
|---|---|---|
| `/weather?q={city}` | GET | Current weather by city name |
| `/weather?lat={lat}&lon={lon}` | GET | Current weather by coordinates |
| `/forecast?q={city}&cnt=40` | GET | 5-day forecast (3-hour intervals) |

**Query Parameters:**

| Parameter | Value |
|---|---|
| `appid` | Your API key |
| `units` | `metric` (°C) or `imperial` (°F) |
| `cnt` | Number of forecast steps (40 = 5 days) |

---

## 💡 Key Concepts Demonstrated

### Async / Await
```js
async function fetchWeatherByCity(city, units) {
  const [curRes, foreRes] = await Promise.all([
    fetch(`${BASE_URL}/weather?q=${city}&appid=${key}&units=${units}`),
    fetch(`${BASE_URL}/forecast?q=${city}&appid=${key}&units=${units}&cnt=40`),
  ]);
  const [curData, foreData] = await Promise.all([curRes.json(), foreRes.json()]);
  return { current: normaliseCurrentWeather(curData), forecast: normaliseForecast(foreData.list) };
}
```

### Local Storage
```js
function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadFromStorage(key, fallback = null) {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : fallback;
}
```

### Debouncing
```js
let debounceTimer;
function debounce(fn, delay) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(fn, delay);
}
```

### Error Handling
```js
try {
  const data = await fetchWeatherByCity(city, units);
  renderCurrent(data.current);
} catch (err) {
  showMsg(`⚠ ${err.message}`);
} finally {
  setLoading(false); // always runs
}
```

---

## 📦 Local Storage Keys

| Key | What it stores |
|---|---|
| `stratus_api_key` | OpenWeatherMap API key |
| `stratus_prefs` | `{ units, lastCity }` |
| `stratus_favorites` | Array of saved city names |

---

## 🌐 Browser Support

| Browser | Support |
|---|---|
| Chrome 90+ | ✅ Full |
| Firefox 88+ | ✅ Full |
| Safari 14+ | ✅ Full |
| Edge 90+ | ✅ Full |
| Mobile Chrome | ✅ Responsive |
| Mobile Safari | ✅ Responsive |

---

## Checklist

- [x] Fetch data from weather API using async/await
- [x] Display current weather and 5-day forecast
- [x] Implement city search functionality
- [x] Save user preferences in Local Storage
- [x] Add loading states and error handling
- [x] Make responsive and accessible

---

## 👨‍💻 Author

**Your Name**
- GitHub: [goswamibiswarup369-ops](https://github.com/goswamibiswarup369-ops)


