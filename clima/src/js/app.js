const API_KEY = "731c81228bdb4293a8d50052252610";

const hero = document.getElementById("hero");
const effect = document.getElementById("weather-effect");
const orb = document.getElementById("orb");
const cityEl = document.getElementById("city");
const countryEl = document.getElementById("country");
const iconEl = document.getElementById("icon");
const tempEl = document.getElementById("temp");
const descEl = document.getElementById("desc");
const adviceEl = document.getElementById("advice");
const loader = document.getElementById("loader");
const windEl = document.getElementById("wind");
const humidityEl = document.getElementById("humidity");
const pressureEl = document.getElementById("pressure");
const cloudEl = document.getElementById("cloud");
const sunriseEl = document.getElementById("sunrise");
const sunsetEl = document.getElementById("sunset");
const uvEl = document.getElementById("uv");
const visEl = document.getElementById("vis");

window.addEventListener("load", () => {
  lucide.createIcons();
  init();
});

function init() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => getWeather(pos.coords.latitude, pos.coords.longitude),
      () => fallbackIP()
    );
  } else fallbackIP();
}

async function fallbackIP() {
  const res = await fetch("https://ipapi.co/json/");
  const data = await res.json();
  getWeather(data.latitude, data.longitude);
}

async function getWeather(lat, lon) {
  loader.style.display = "block";
  try {
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${lat},${lon}&days=1&aqi=no`;
    const res = await fetch(url);
    const d = await res.json();
    renderWeather(d);
  } catch (e) {
    loader.textContent = "Error al obtener datos del clima";
    console.error(e);
  }
}

function renderWeather(d) {
  loader.style.display = "none";
  const cur = d.current;
  const loc = d.location;
  const astro = d.forecast.forecastday[0].astro;

  cityEl.textContent = loc.name;
  countryEl.textContent = loc.country;
  iconEl.src = "https:" + cur.condition.icon;
  updateValue(tempEl, `${cur.temp_c}°C`);
  descEl.textContent = cur.condition.text;

  updateValue(windEl, `${cur.wind_kph} km/h`);
  updateValue(humidityEl, `${cur.humidity}%`);
  updateValue(pressureEl, `${cur.pressure_mb} hPa`);
  updateValue(cloudEl, `${cur.cloud}%`);
  updateValue(sunriseEl, astro.sunrise);
  updateValue(sunsetEl, astro.sunset);
  updateValue(uvEl, `${cur.uv} UV`);
  updateValue(visEl, `${cur.vis_km} km`);

  const code = cur.condition.code;
  const isDay = cur.is_day === 1;
  hero.className = `hero ${isDay ? "day" : "night"}`;

  // cambia color segun temp
  const temp = cur.temp_c;
  const root = document.documentElement;
  if (temp < 10) root.style.setProperty("--accent", "#8ab4ff");
  else if (temp < 25) root.style.setProperty("--accent", "#5ab2ff");
  else root.style.setProperty("--accent", "#ff9966");

  orb.style.opacity = isDay ? 0.3 : 0.25;
  showWeatherEffect(code);
  showAdvice(code, temp, cur.uv);
  lucide.createIcons();
}

function updateValue(el, value) {
  el.textContent = value;
  el.classList.add("updated");
  setTimeout(() => el.classList.remove("updated"), 300);
}

/* === efectos visuales === */
function showWeatherEffect(code) {
  effect.innerHTML = "";
  effect.style.background = "none";
  const create = (cls, qty) => {
    for (let i = 0; i < qty; i++) {
      const e = document.createElement("div");
      e.className = cls;
      e.style.left = Math.random() * 100 + "%";
      e.style.animationDelay = Math.random() * 5 + "s";
      effect.appendChild(e);
    }
  };
  if (code === 1000) return;
  if ([1003,1006,1009].includes(code)) create("cloud",6);
  else if (code >= 1063 && code <= 1189) create("rain-drop",50);
  else if (code >= 1210 && code <= 1225) create("snow",30);
  else if (code >= 1273 && code <= 1282){create("rain-drop",40);const f=document.createElement("div");f.className="flash";effect.appendChild(f);}
  else if ([1030,1135,1147].includes(code)){effect.style.background="rgba(255,255,255,0.1)";effect.style.backdropFilter="blur(10px)";}
}

/* === mensajes inteligentes === */
function showAdvice(code,temp,uv){
  let msg="";
  if(code>=1063 && code<=1189) msg="🌧 Lleva paraguas, podría llover.";
  else if(temp<10) msg="🧣 Hace frío, abrígate bien.";
  else if(temp>30) msg="🔥 Mucho calor, mantente hidratado.";
  else if(uv>7) msg="☀️ UV alto, usa protector solar.";
  else if([1030,1135,1147].includes(code)) msg="🌫 Visibilidad baja, ten precaución.";
  adviceEl.textContent = msg;
}
