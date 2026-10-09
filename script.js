// State Management
let currentCityData = null;
let selectedDate = new Date();
let calendarMonth = new Date().getMonth();
let calendarYear = new Date().getFullYear();
let targetTimezone = "Asia/Manila";
let currentLocationName = "Manila, PH";
let isFahrenheit = false;
let favoriteCities = JSON.parse(localStorage.getItem("weather_favs")) || ["Manila", "Tokyo", "London", "New York"];

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// DOM Elements
const themeToggle = document.getElementById("themeToggle");
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const geoBtn = document.getElementById("geoBtn");
const unitBtn = document.getElementById("unitBtn");
const speechBtn = document.getElementById("speechBtn");
const addFavBtn = document.getElementById("addFavBtn");
const favoritesBar = document.getElementById("favoritesBar");
const weatherBox = document.getElementById("weatherBox");
const errorMsg = document.getElementById("errorMsg");
const weatherIcon = document.getElementById("weatherIcon");
const toggleSatelliteBtn = document.getElementById("toggleSatelliteBtn");
const satelliteBox = document.getElementById("satelliteBox");
const satelliteFrame = document.getElementById("satelliteFrame");
const alertBanner = document.getElementById("alertBanner");

// Weather Themes Dictionary
const weatherThemes = {
  clear: {
    bgGradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    cardBg: 'rgba(255, 255, 255, 0.9)',
    accent: '#ff7043',
    badgeBg: '#ffe0b2',
    badgeText: '#bf360c',
    inputBorder: '#ffb74d',
    cellHover: '#ffe0b2',
    shadow: 'rgba(255, 112, 67, 0.35)',
    emojis: ['☀️', '✨', '🌻']
  },
  clouds: {
    bgGradient: 'linear-gradient(135deg, #d397fa 0%, #83a4d4 100%)',
    cardBg: 'rgba(255, 255, 255, 0.88)',
    accent: '#7e57c2',
    badgeBg: '#ede7f6',
    badgeText: '#4a148c',
    inputBorder: '#b39ddb',
    cellHover: '#ede7f6',
    shadow: 'rgba(126, 87, 194, 0.35)',
    emojis: ['☁️', '🌤️', '🕊️']
  },
  rain: {
    bgGradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
    cardBg: 'rgba(240, 248, 255, 0.92)',
    accent: '#1e88e5',
    badgeBg: '#bbdefb',
    badgeText: '#0d47a1',
    inputBorder: '#64b5f6',
    cellHover: '#e3f2fd',
    shadow: 'rgba(30, 136, 229, 0.35)',
    emojis: ['🌧️', '💧', '☔']
  },
  snow: {
    bgGradient: 'linear-gradient(135deg, #e6e9f0 0%, #eef1f5 100%)',
    cardBg: 'rgba(255, 255, 255, 0.94)',
    accent: '#546e7a',
    badgeBg: '#cfd8dc',
    badgeText: '#263238',
    inputBorder: '#90a4ae',
    cellHover: '#eceff1',
    shadow: 'rgba(84, 110, 122, 0.3)',
    emojis: ['❄️', '⛄', '🏔️']
  },
  thunderstorm: {
    bgGradient: 'linear-gradient(135deg, #373b44 0%, #4286f4 100%)',
    cardBg: 'rgba(30, 35, 50, 0.92)',
    accent: '#ffa726',
    badgeBg: '#ffe0b2',
    badgeText: '#e65100',
    inputBorder: '#ffb74d',
    cellHover: '#ffe0b2',
    shadow: 'rgba(0, 0, 0, 0.6)',
    emojis: ['⛈️', '⚡', '🌧️']
  },
  fog: {
    bgGradient: 'linear-gradient(135deg, #3a6073 0%, #3a7bd5 100%)',
    cardBg: 'rgba(255, 255, 255, 0.9)',
    accent: '#607d8b',
    badgeBg: '#cfd8dc',
    badgeText: '#263238',
    inputBorder: '#90a4ae',
    cellHover: '#eceff1',
    shadow: 'rgba(58, 96, 115, 0.35)',
    emojis: ['🌫️', '🍃', '☁️']
  }
};

function applyWeatherTheme(weatherCode) {
  if (document.body.hasAttribute("data-theme")) return;

  let type = 'clear';
  if (weatherCode === 0) type = 'clear';
  else if (weatherCode >= 1 && weatherCode <= 3) type = 'clouds';
  else if (weatherCode === 45 || weatherCode === 48) type = 'fog';
  else if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) type = 'rain';
  else if ((weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86)) type = 'snow';
  else if (weatherCode >= 95 && weatherCode <= 99) type = 'thunderstorm';

  const theme = weatherThemes[type];
  const root = document.documentElement;

  root.style.setProperty('--bg-gradient', theme.bgGradient);
  root.style.setProperty('--card-bg', theme.cardBg);
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--badge-bg', theme.badgeBg);
  root.style.setProperty('--badge-text', theme.badgeText);
  root.style.setProperty('--input-border', theme.inputBorder);
  root.style.setProperty('--cell-hover', theme.cellHover);
  root.style.setProperty('--shadow', theme.shadow);

  document.getElementById("bg1").innerText = theme.emojis[0];
  document.getElementById("bg2").innerText = theme.emojis[1];
  document.getElementById("bg3").innerText = theme.emojis[2];
}

// Toggle Theme
themeToggle.addEventListener("click", () => {
  const isDark = document.body.getAttribute("data-theme") === "dark";
  if (isDark) {
    document.body.removeAttribute("data-theme");
    themeToggle.innerText = "🌙";
    if (currentCityData) displayWeatherForDate(selectedDate);
  } else {
    document.body.setAttribute("data-theme", "dark");
    themeToggle.innerText = "☀️";
  }
});

// Toggle Celsius / Fahrenheit Unit
unitBtn.addEventListener("click", () => {
  isFahrenheit = !isFahrenheit;
  unitBtn.innerText = isFahrenheit ? "°F" : "°C";
  if (currentCityData) displayWeatherForDate(selectedDate);
});

// Text-To-Speech Reader
speechBtn.addEventListener("click", () => {
  if (!currentCityData) return;
  const city = currentCityData.displayName;
  const tempText = document.getElementById("temp").innerText;
  const text = `Current weather forecast for ${city} is ${tempText}. ${document.getElementById("recommendationBox").innerText}`;
  
  const utterance = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utterance);
});

// Auto-Geolocation
geoBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      await fetchWeatherByCoords(lat, lon, "Your Current Location");
    }, () => {
      alert("Location access denied or unavailable.");
    });
  }
});

// Favorites Pill Management
function renderFavorites() {
  favoritesBar.innerHTML = "";
  favoriteCities.forEach(city => {
    const pill = document.createElement("button");
    pill.className = "fav-pill";
    pill.innerText = city;
    pill.addEventListener("click", () => searchCity(city));
    favoritesBar.appendChild(pill);
  });
}

addFavBtn.addEventListener("click", () => {
  if (currentLocationName && !favoriteCities.includes(currentLocationName)) {
    favoriteCities.push(currentLocationName);
    localStorage.setItem("weather_favs", JSON.stringify(favoriteCities));
    renderFavorites();
  }
});

// Satellite Toggle
toggleSatelliteBtn.addEventListener("click", () => {
  if (satelliteBox.style.display === "block") {
    satelliteBox.style.display = "none";
    toggleSatelliteBtn.innerText = "📡 Satellite Radar";
  } else {
    satelliteBox.style.display = "block";
    toggleSatelliteBtn.innerText = "❌ Hide Radar";
  }
});

// Real-Time Local Clock
function updateCountryTime() {
  try {
    const now = new Date();
    const optionsDate = { timeZone: targetTimezone, weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    const optionsTime = { timeZone: targetTimezone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };

    document.getElementById("locationBadge").innerText = `📍 ${currentLocationName}`;
    document.getElementById("localDate").innerText = new Intl.DateTimeFormat('en-US', optionsDate).format(now);
    document.getElementById("localTime").innerText = new Intl.DateTimeFormat('en-US', optionsTime).format(now);
    document.getElementById("tzName").innerText = `Timezone: ${targetTimezone}`;
  } catch (e) {
    document.getElementById("localDate").innerText = new Date().toDateString();
    document.getElementById("localTime").innerText = new Date().toLocaleTimeString();
  }
}
setInterval(updateCountryTime, 1000);

// Calendar Render
function renderCalendar() {
  const grid = document.getElementById("calendarGrid");
  grid.innerHTML = "";
  document.getElementById("calMonthYear").innerText = `${monthNames[calendarMonth]} ${calendarYear}`;

  dayNames.forEach(day => {
    const d = document.createElement("div");
    d.className = "day-name";
    d.innerText = day;
    grid.appendChild(d);
  });

  const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const today = new Date();
  const maxForecastDate = new Date();
  maxForecastDate.setDate(today.getDate() + 6);

  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "day-cell empty";
    grid.appendChild(emptyCell);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("div");
    cell.className = "day-cell";
    cell.innerText = day;

    const cellDate = new Date(calendarYear, calendarMonth, day);
    cellDate.setHours(0, 0, 0, 0);

    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const maxStart = new Date(maxForecastDate.getFullYear(), maxForecastDate.getMonth(), maxForecastDate.getDate());

    if (cellDate.getTime() === selectedDate.getTime()) cell.classList.add("selected");

    if (cellDate < todayStart || cellDate > maxStart) {
      cell.classList.add("disabled");
    } else {
      cell.addEventListener("click", () => {
        selectedDate = cellDate;
        renderCalendar();
        if (currentCityData) displayWeatherForDate(selectedDate);
      });
    }
    grid.appendChild(cell);
  }
}

document.getElementById("prevMonth").addEventListener("click", () => {
  calendarMonth--;
  if (calendarMonth < 0) { calendarMonth = 11; calendarYear--; }
  renderCalendar();
});

document.getElementById("nextMonth").addEventListener("click", () => {
  calendarMonth++;
  if (calendarMonth > 11) { calendarMonth = 0; calendarYear++; }
  renderCalendar();
});

function getWeatherEmoji(code) {
  if (code === 0) return '☀️';
  if (code >= 1 && code <= 3) return '🌤️';
  if (code === 45 || code === 48) return '🌫️';
  if (code >= 51 && code <= 57) return '🌦️';
  if (code >= 61 && code <= 67) return '🌧️';
  if (code >= 71 && code <= 77) return '❄️';
  if (code >= 80 && code <= 82) return '🌧️';
  if (code >= 85 && code <= 86) return '🌨️';
  if (code >= 95 && code <= 99) return '⛈️';
  return '🌈';
}

// AQI Code Evaluator
function getAQILabel(aqiVal) {
  if (aqiVal <= 20) return "Good 🟢";
  if (aqiVal <= 40) return "Fair 🟡";
  if (aqiVal <= 60) return "Moderate 🟠";
  if (aqiVal <= 80) return "Poor 🔴";
  return "Very Poor 🟣";
}

// Fetch Weather Data by Coordinates
async function fetchWeatherByCoords(lat, lon, displayName) {
  try {
    targetTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    currentLocationName = displayName;
    updateCountryTime();

    satelliteFrame.src = `https://www.rainviewer.com/map.html?loc=${lat},${lon},7&o8=1&c=1&o=83&v=1&run=1&sm=1&sn=1`;

    // Weather Forecast Endpoint
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,relative_humidity_2m_mean,wind_speed_10m_max,sunrise,sunset&hourly=temperature_2m,weather_code&timezone=${encodeURIComponent(targetTimezone)}`;
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();

    // Air Quality Endpoint
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi`;
    const aqiRes = await fetch(aqiUrl);
    const aqiData = await aqiRes.json();

    currentCityData = {
      displayName: currentLocationName,
      daily: weatherData.daily,
      hourly: weatherData.hourly,
      aqi: aqiData.current ? aqiData.current.european_aqi : null
    };

    displayWeatherForDate(selectedDate);
    errorMsg.style.display = "none";

  } catch (err) {
    errorMsg.style.display = "block";
    weatherBox.style.display = "none";
  }
}

async function searchCity(cityName) {
  if (!cityName) return;

  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      errorMsg.style.display = "block";
      weatherBox.style.display = "none";
      return;
    }

    const location = geoData.results[0];
    const dispName = `${location.name}${location.country_code ? ', ' + location.country_code.toUpperCase() : ''}`;
    targetTimezone = location.timezone || "UTC";

    await fetchWeatherByCoords(location.latitude, location.longitude, dispName);

  } catch (err) {
    errorMsg.style.display = "block";
    weatherBox.style.display = "none";
  }
}

// Display Selected Date Forecast & Dynamic Recommendations
function displayWeatherForDate(targetDate) {
  if (!currentCityData) return;

  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  const dateString = `${year}-${month}-${day}`;

  const daily = currentCityData.daily;
  const index = daily.time.indexOf(dateString);

  if (index !== -1) {
    const wCode = daily.weather_code[index];
    let maxTempC = daily.temperature_2m_max[index];
    let displayTemp = isFahrenheit ? Math.round((maxTempC * 9/5) + 32) + "°F" : Math.round(maxTempC) + "°C";

    document.getElementById("city").innerText = currentCityData.displayName;
    document.getElementById("temp").innerText = displayTemp;
    document.getElementById("humidity").innerText = Math.round(daily.relative_humidity_2m_mean[index]) + "%";
    document.getElementById("wind").innerText = daily.wind_speed_10m_max[index].toFixed(1) + (isFahrenheit ? " mph" : " km/h");
    document.getElementById("aqi").innerText = currentCityData.aqi ? getAQILabel(currentCityData.aqi) : "N/A";

    // Sunrise / Sunset Tracker
    if (daily.sunrise && daily.sunset) {
      const riseTime = new Date(daily.sunrise[index]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const setTime = new Date(daily.sunset[index]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      document.getElementById("sunTracker").innerText = `${riseTime} / ${setTime}`;
    }

    weatherIcon.innerText = getWeatherEmoji(wCode);

    const formattedBadge = targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    document.getElementById("selectedDateBadge").innerText = `Forecast: ${formattedBadge}`;

    // Smart Outfit Recommendation Logic
    const recBox = document.getElementById("recommendationBox");
    if (wCode >= 61 && wCode <= 67 || wCode >= 80) {
      recBox.innerText = "👗 Outfit Tip: Rainy conditions ahead! Carry an umbrella ☔ and wear waterproof shoes.";
    } else if (maxTempC > 28) {
      recBox.innerText = "👗 Outfit Tip: Warm & sunny! Wear breathable cotton 👕, sunglasses 🕶️, and sunscreen.";
    } else if (maxTempC < 15) {
      recBox.innerText = "👗 Outfit Tip: Chilly weather! Bring a cozy jacket 🧥 or sweater to stay warm.";
    } else {
      recBox.innerText = "👗 Outfit Tip: Pleasant weather! Comfortable casual clothing or light layers will work best.";
    }

    // Severe Weather Alert Check
    if (wCode >= 95 || daily.wind_speed_10m_max[index] > 40) {
      alertBanner.style.display = "block";
      alertBanner.innerText = "⚠️ Severe Weather Warning: High winds or thunderstorms expected!";
    } else {
      alertBanner.style.display = "none";
    }

    // Populate 24-Hour Scroller
    const hourlyContainer = document.getElementById("hourlyContainer");
    hourlyContainer.innerHTML = "";
    const hourly = currentCityData.hourly;
    
    for (let i = 0; i < 24; i += 2) {
      if (!hourly.time[i]) break;
      const hTime = new Date(hourly.time[i]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const hTemp = isFahrenheit ? Math.round((hourly.temperature_2m[i] * 9/5) + 32) + "°" : Math.round(hourly.temperature_2m[i]) + "°";
      
      const card = document.createElement("div");
      card.className = "hourly-card";
      card.innerHTML = `
        <div class="hourly-time">${hTime}</div>
        <div class="hourly-icon">${getWeatherEmoji(hourly.weather_code[i])}</div>
        <div class="hourly-temp">${hTemp}</div>
      `;
      hourlyContainer.appendChild(card);
    }

    applyWeatherTheme(wCode);
    weatherBox.style.display = "block";
  } else {
    errorMsg.innerText = "Forecast only available within 7 days!";
    errorMsg.style.display = "block";
    weatherBox.style.display = "none";
  }
}

// Event Listeners
searchBtn.addEventListener("click", () => searchCity(cityInput.value.trim()));
cityInput.addEventListener("keypress", (e) => { if (e.key === "Enter") searchCity(cityInput.value.trim()); });

// Initial Setup
selectedDate.setHours(0, 0, 0, 0);
renderFavorites();
renderCalendar();
searchCity("Manila");