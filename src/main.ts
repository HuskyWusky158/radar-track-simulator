
import "./style.css";


document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <h1>Seattle Aircraft Tracker</h1>
  <p id="status">Loading aircraft data...</p>
  <div id="radar-display" role="img" aria-label="Aircraft positions in the Seattle search area"></div>
  <ul id="aircraft-list"></ul>
`;

type OpenSkyResponse = {
  states: unknown[][] | null;
};


const status = document.querySelector<HTMLParagraphElement>("#status");
const aircraftList = document.querySelector<HTMLUListElement>("#aircraft-list");
const radarDisplay = document.querySelector<HTMLDivElement>("#radar-display");

const minLatitude = 47.3;
const maxLatitude = 47.9;
const minLongitude = -122.7;
const maxLongitude = -121.9;

if (!status || !aircraftList || !radarDisplay) {
  throw new Error("Could not find a required page element.");
}

async function loadAircraft() {
  const response = await fetch(
    `/opensky/states/all?lamin=${minLatitude}&lomin=${minLongitude}&lamax=${maxLatitude}&lomax=${maxLongitude}`
  );

  if (!response.ok) {
    throw new Error(`OpenSky returned status ${response.status}`);
  }

  const data: OpenSkyResponse = await response.json();
  const states = data.states ?? [];
  const aircraftWithPosition = states.filter(
    (state) => state[5] !== null && state[6] !== null
  );

  status.textContent = `Aircraft found: ${states.length}`;
  aircraftList.replaceChildren();
  radarDisplay.replaceChildren();

  for (const state of aircraftWithPosition) {
    const callsign =
      String(state[1] ?? "").trim() || String(state[0]);
    const longitude = Number(state[5]);
    const latitude = Number(state[6]);
    const track = state[10];
    const trackText =
      typeof track === "number" ? `${track.toFixed(0)}°` : "unavailable";

    const xPercent =
      ((longitude - minLongitude) / (maxLongitude - minLongitude)) * 100;
    const yPercent =
      (1 - (latitude - minLatitude) / (maxLatitude - minLatitude)) * 100;

    const marker = document.createElement("span");
    marker.className = "aircraft-marker";
    marker.style.left = `${xPercent}%`;
    marker.style.top = `${yPercent}%`;
    if (typeof track === "number") {
  marker.style.transform = `translate(-50%, -50%) rotate(${track}deg)`;
} else {
  marker.classList.add("no-track");
}
    marker.title = `${callsign}: track ${trackText}`;
    radarDisplay.append(marker);

    const item = document.createElement("li");
    item.textContent =
      `${callsign}: ${latitude.toFixed(3)}, ${longitude.toFixed(3)}, track ${trackText}`;
    aircraftList.append(item);
  }
}

loadAircraft().catch((error: unknown) => {
  status.textContent = `Could not load aircraft: ${String(error)}`;
});