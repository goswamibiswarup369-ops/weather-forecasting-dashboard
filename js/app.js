const state = {
  apiKey:      loadFromStorage(STORAGE_KEYS.apiKey, ''),
  prefs:       loadFromStorage(STORAGE_KEYS.prefs,  { units: 'metric', lastCity: '' }),
  favorites:   loadFromStorage(STORAGE_KEYS.favorites, ['London', 'Tokyo', 'New York','India']),
  currentCity: null,
};

const $ = id => document.getElementById(id);

const searchInput  = $('searchInput');
const searchBtn    = $('searchBtn');
const apiKeyInput  = $('apiKeyInput');
const saveKeyBtn   = $('saveKeyBtn');
const setupBanner  = $('setupBanner');
const msgBar       = $('msgBar');
const loadingOL    = $('loadingOverlay');
const emptyState   = $('emptyState');
const weatherMain  = $('weatherMain');
const favChips     = $('favChips');
const geoBtn       = $('geoBtn');


function showMsg(text, type = 'error') {
  msgBar.textContent = text;
  msgBar.className = `msg-bar ${type}`;
  if (type === 'info') setTimeout(() => { msgBar.style.display = 'none'; }, 4000);
}

function clearMsg() {
  msgBar.style.display = 'none';
  msgBar.className = 'msg-bar';
}

function setLoading(on) {
  loadingOL.classList.toggle('active', on);
}

function setUnitsUI(units) {
  $('btnMetric').classList.toggle('active', units === 'metric');
  $('btnImperial').classList.toggle('active', units === 'imperial');
}


function renderCurrent(data) {
  const units = state.prefs.units;

  $('cityName').textContent        = data.city;
  $('countryCode').textContent     = data.country || '';
  $('weatherDesc').textContent     = data.description;
  $('weatherIconMain').textContent = data.emoji;
  $('tempVal').textContent         = data.temp;
  $('tempUnit').textContent        = units === 'metric' ? '°C' : '°F';
  $('tempFeels').textContent       = `Feels like ${data.feelsLike}${units === 'metric' ? '°C' : '°F'}`;
  $('humVal').textContent          = data.humidity;
  $('humBar').style.width          = `${data.humidity}%`;
  $('windVal').textContent         = data.windSpeed.toFixed(1);
  $('windUnit').textContent        = units === 'metric' ? 'm/s' : 'mph';
  $('pressVal').textContent        = data.pressure;
  $('visVal').textContent          = data.visibility ?? '—';

  const now = new Date();
  $('localTime').textContent = `Updated ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

function renderForecast(days) {
  const units = state.prefs.units;
  const deg   = units === 'metric' ? '°C' : '°F';

  $('forecastGrid').innerHTML = days.map(d => `
    <div class="forecast-card">
      <div class="forecast-day">${d.dayLabel}</div>
      <div class="forecast-icon">${d.emoji}</div>
      <div class="forecast-temp-hi">${d.high}${deg}</div>
      <div class="forecast-temp-lo">${d.low}${deg}</div>
      ${d.rainChance > 10 ? `<div class="forecast-rain">💧 ${d.rainChance}%</div>` : ''}
    </div>
  `).join('');
}


async function loadCity(city) {
  setLoading(true);
  clearMsg();
  try {
    const { current, forecast } = await fetchWeatherByCity(city, state.prefs.units);

    state.currentCity    = current.city;
    state.prefs.lastCity = current.city;
    saveToStorage(STORAGE_KEYS.prefs, state.prefs);

    renderCurrent(current);
    renderForecast(forecast);

    emptyState.style.display = 'none';
    weatherMain.classList.add('visible');
  } catch (err) {
    showMsg(`⚠ ${err.message}`);
  } finally {
    setLoading(false);
  }
}

async function loadByLocation() {
  if (!navigator.geolocation) {
    showMsg('Geolocation is not supported by your browser.');
    return;
  }

  geoBtn.textContent = '📍 Locating…';
  setLoading(true);
  clearMsg();

  navigator.geolocation.getCurrentPosition(
    async pos => {
      try {
        const { current, forecast } = await fetchWeatherByCoords(
          pos.coords.latitude,
          pos.coords.longitude,
          state.prefs.units
        );

        state.currentCity    = current.city;
        state.prefs.lastCity = current.city;
        saveToStorage(STORAGE_KEYS.prefs, state.prefs);
        searchInput.value = current.city;

        renderCurrent(current);
        renderForecast(forecast);

        emptyState.style.display = 'none';
        weatherMain.classList.add('visible');
      } catch (err) {
        showMsg(`⚠ ${err.message}`);
      } finally {
        setLoading(false);
        geoBtn.textContent = '📍 Use My Location';
      }
    },
    err => {
      setLoading(false);
      geoBtn.textContent = '📍 Use My Location';
      showMsg(`Location error: ${err.message}`);
    }
  );
}


function renderFavs() {
  favChips.innerHTML =
    state.favorites.map(city => `
      <div class="chip" data-city="${city}">
        ${city}
        <span class="chip-del" data-del="${city}" title="Remove">✕</span>
      </div>
    `).join('') +
    `<button class="add-fav-btn" id="addFavBtn">+ Save Current</button>`;

  favChips.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', e => {
      if (e.target.dataset.del) {
        removeFavorite(e.target.dataset.del);
      } else {
        const city = chip.dataset.city;
        searchInput.value = city;
        loadCity(city);
      }
    });
  });

  $('addFavBtn').addEventListener('click', () => {
    if (!state.currentCity) {
      showMsg('Search for a city first, then save it.');
      return;
    }
    addFavorite(state.currentCity);
  });
}

function addFavorite(city) {
  if (!state.favorites.includes(city)) {
    state.favorites.push(city);
    saveToStorage(STORAGE_KEYS.favorites, state.favorites);
    renderFavs();
    showMsg(`${city} added to favorites.`, 'info');
  }
}

function removeFavorite(city) {
  state.favorites = state.favorites.filter(c => c !== city);
  saveToStorage(STORAGE_KEYS.favorites, state.favorites);
  renderFavs();
}

let debounceTimer;
function debounce(fn, delay) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(fn, delay);
}


searchBtn.addEventListener('click', () => {
  const city = searchInput.value.trim();
  if (city) loadCity(city);
  else showMsg('Please enter a city name.');
});

searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const city = searchInput.value.trim();
    if (city) loadCity(city);
  }
});


searchInput.addEventListener('input', () => {
  debounce(() => { /* autocomplete placeholder */ }, 400);
});

saveKeyBtn.addEventListener('click', () => {
  const key = apiKeyInput.value.trim();
  if (!key) { showMsg('Please paste a valid API key.'); return; }
  state.apiKey = key;
  saveToStorage(STORAGE_KEYS.apiKey, key);
  setupBanner.style.display = 'none';
  apiKeyInput.value = '';
  showMsg('API key saved! Try searching for a city.', 'info');
});

$('btnMetric').addEventListener('click', () => {
  state.prefs.units = 'metric';
  saveToStorage(STORAGE_KEYS.prefs, state.prefs);
  setUnitsUI('metric');
  if (state.currentCity) loadCity(state.currentCity);
});

$('btnImperial').addEventListener('click', () => {
  state.prefs.units = 'imperial';
  saveToStorage(STORAGE_KEYS.prefs, state.prefs);
  setUnitsUI('imperial');
  if (state.currentCity) loadCity(state.currentCity);
});

geoBtn.addEventListener('click', loadByLocation);


function init() {

  setupBanner.style.display = state.apiKey ? 'none' : 'flex';

  setUnitsUI(state.prefs.units);

  renderFavs();

  if (state.apiKey && state.prefs.lastCity) {
    searchInput.value = state.prefs.lastCity;
    loadCity(state.prefs.lastCity);
  }
}

init();
