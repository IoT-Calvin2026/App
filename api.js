const apiBaseUrl =
  window.GARDEN_GUARD_API_BASE_URL ||
  localStorage.getItem("garden-guard-api-base-url") ||
  "http://localhost:5001";

const apiUrl = (path) => `${apiBaseUrl.replace(/\/$/, "")}${path}`;

const get = async (path) => {
  const response = await fetch(apiUrl(path), {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
};

// Keep the backend contract in one place so the UI can connect when the API is available.
window.gardenGuardApi = {
  health: () => get("/api/health"),
  rootHealth: () => get("/"),
  events: () => get("/api/events"),
  event: (documentId) => get(`/api/events/${encodeURIComponent(documentId)}`),
  motion: () => get("/api/motion"),
  motionReading: (documentId) =>
    get(`/api/motion/${encodeURIComponent(documentId)}`),
  soilMoisture: () => get("/api/soil-moisture"),
  soilMoistureReading: (documentId) =>
    get(`/api/soil-moisture/${encodeURIComponent(documentId)}`),
  latestReadings: () => get("/api/readings/latest"),
};
