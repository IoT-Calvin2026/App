const menuTrigger = document.querySelector(".menu-trigger");
const menuPanel = document.querySelector(".menu-panel");
const menuLabel = document.querySelector(".menu-label");
const menuOptions = document.querySelectorAll(".menu-option");
const weatherTrigger = document.querySelector(".weather");
const weatherPanel = document.querySelector(".weather-panel");
const settingsTrigger = document.querySelector(".settings");
const settingsPanel = document.querySelector(".settings-panel");
const darkModeToggle = document.querySelector(".dark-mode-toggle");
const contentViews = document.querySelectorAll(".content-view");
const userImage = document.querySelector(".user-image");
const productOptions = document.querySelectorAll(".product-card");
const backToProductsButtons = document.querySelectorAll(".back-to-products");
const weatherCondition = document.querySelector("#weather-condition");
const weatherLocation = document.querySelector("#weather-location");
const weatherTemperature = document.querySelector("#weather-temperature");
const weatherHumidity = document.querySelector("#weather-humidity");
const weatherWind = document.querySelector("#weather-wind");
const weatherRain = document.querySelector("#weather-rain");
const dashboardTemperature = document.querySelector("#dashboard-temperature");
const dashboardWeatherNote = document.querySelector("#dashboard-weather-note");
const weatherForecast = Array.from({ length: 4 }, (_, index) => ({
  day: document.querySelector(`#forecast-day-${index}`),
  temperature: document.querySelector(`#forecast-temperature-${index}`),
  condition: document.querySelector(`#forecast-condition-${index}`),
}));
const dropdowns = [
  { trigger: menuTrigger, panel: menuPanel, wrapper: ".menu-wrap" },
  { trigger: weatherTrigger, panel: weatherPanel, wrapper: ".weather-wrap" },
  { trigger: settingsTrigger, panel: settingsPanel, wrapper: ".settings-wrap" },
];

const closeDropdown = ({ trigger, panel }) => {
  trigger.setAttribute("aria-expanded", "false");
  panel.hidden = true;
};

const closeAllDropdowns = () => {
  dropdowns.forEach(closeDropdown);
};

const toggleDropdown = (dropdown) => {
  const isOpen = dropdown.trigger.getAttribute("aria-expanded") === "true";
  closeAllDropdowns();
  dropdown.trigger.setAttribute("aria-expanded", String(!isOpen));
  dropdown.panel.hidden = isOpen;
};

const savedDarkMode = localStorage.getItem("garden-guard-dark-mode") === "true";
document.body.classList.toggle("dark-mode", savedDarkMode);
darkModeToggle.checked = savedDarkMode;

const updateMenuOptions = (activeView) => {
  menuOptions.forEach((option) => {
    option.hidden = option.dataset.view === activeView;
  });
};

updateMenuOptions("main-view");

const weatherCodeLabels = {
  0: "Clear",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Rain showers",
  82: "Heavy showers",
  95: "Thunderstorm",
  96: "Hailstorm",
  99: "Hailstorm",
};

const getUserCoordinates = () => {
  const savedCoordinates = localStorage.getItem("garden-guard-location");
  if (savedCoordinates) {
    try {
      const coordinates = JSON.parse(savedCoordinates);
      if (
        Number.isFinite(coordinates.latitude) &&
        Number.isFinite(coordinates.longitude)
      ) {
        return Promise.resolve(coordinates);
      }
    } catch {
      localStorage.removeItem("garden-guard-location");
    }
  }

  if (!navigator.geolocation) {
    return Promise.reject(
      new Error("Location is not available in this browser."),
    );
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const coordinates = {
          latitude: coords.latitude,
          longitude: coords.longitude,
        };
        localStorage.setItem(
          "garden-guard-location",
          JSON.stringify(coordinates),
        );
        resolve(coordinates);
      },
      () => reject(new Error("Location permission was denied.")),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 900000 },
    );
  });
};

const formatForecastDay = (dateString, index, timeZone) => {
  if (index === 0) return "Today";
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    timeZone,
  }).format(new Date(`${dateString}T12:00:00`));
};

const loadWeather = async () => {
  weatherCondition.textContent = "Loading";
  weatherLocation.textContent = "Finding your location...";

  try {
    const { latitude, longitude } = await getUserCoordinates();
    const params = new URLSearchParams({
      latitude,
      longitude,
      current:
        "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
      hourly: "precipitation_probability",
      daily: "temperature_2m_max,weather_code,precipitation_probability_max",
      temperature_unit: "fahrenheit",
      wind_speed_unit: "mph",
      timezone: "auto",
      forecast_days: "4",
    });
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?${params}`,
    );
    if (!response.ok) throw new Error("Weather service is unavailable.");
    const weather = await response.json();

    weatherCondition.textContent =
      weatherCodeLabels[weather.current.weather_code] || "Current conditions";
    weatherLocation.textContent = `Your location · Updated ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
    weatherTemperature.textContent = `${Math.round(weather.current.temperature_2m)} F`;
    weatherHumidity.textContent = `${Math.round(weather.current.relative_humidity_2m)}%`;
    weatherWind.textContent = `${Math.round(weather.current.wind_speed_10m)} mph`;
    weatherRain.textContent = `${weather.hourly.precipitation_probability[0]}%`;
    dashboardTemperature.textContent = `${Math.round(weather.current.temperature_2m)} F`;
    dashboardWeatherNote.textContent =
      weatherCodeLabels[weather.current.weather_code] || "Current conditions";

    weatherForecast.forEach((forecast, index) => {
      forecast.day.textContent = formatForecastDay(
        weather.daily.time[index],
        index,
        weather.timezone,
      );
      forecast.temperature.textContent = `${Math.round(weather.daily.temperature_2m_max[index])} F`;
      forecast.condition.textContent =
        weatherCodeLabels[weather.daily.weather_code[index]] || "Variable";
    });
  } catch (error) {
    weatherCondition.textContent = "Unavailable";
    weatherLocation.textContent = `${error.message} Open weather to try again.`;
    dashboardTemperature.textContent = "--";
    dashboardWeatherNote.textContent = "Weather unavailable";
  }
};

loadWeather();

menuTrigger.addEventListener("click", () => {
  toggleDropdown(dropdowns[0]);
});

menuOptions.forEach((option) => {
  option.addEventListener("click", () => {
    menuLabel.textContent = option.textContent;
    closeDropdown(dropdowns[0]);
    contentViews.forEach((view) => {
      view.hidden = view.id !== option.dataset.view;
    });
    updateMenuOptions(option.dataset.view);
  });
});

productOptions.forEach((product) => {
  product.addEventListener("click", () => {
    window.location.href = product.dataset.productPage;
  });
});

backToProductsButtons.forEach((button) => {
  button.addEventListener("click", () => {
    contentViews.forEach((view) => {
      view.hidden = view.id !== "add-products-view";
    });
  });
});

userImage.addEventListener("click", () => {
  menuLabel.textContent = "User Settings";
  contentViews.forEach((view) => {
    view.hidden = view.id !== "user-settings-view";
  });
  closeDropdown(dropdowns[0]);
  updateMenuOptions("user-settings-view");
});

weatherTrigger.addEventListener("click", (event) => {
  event.stopPropagation();
  if (weatherCondition.textContent === "Unavailable") loadWeather();
  toggleDropdown(dropdowns[1]);
});

settingsTrigger.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleDropdown(dropdowns[2]);
});

darkModeToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark-mode", darkModeToggle.checked);
  localStorage.setItem(
    "garden-guard-dark-mode",
    String(darkModeToggle.checked),
  );
});

document.addEventListener("click", (event) => {
  dropdowns.forEach((dropdown) => {
    if (!event.target.closest(dropdown.wrapper)) closeDropdown(dropdown);
  });
});
