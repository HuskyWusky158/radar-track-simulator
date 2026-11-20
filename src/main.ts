
import "./style.css";

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <h1>Seattle Aircraft Tracker</h1>
  <p id="status">Loading aircraft data...</p>
  <ul id="aircraft-list"></ul>
`;

type OpenSkyResponse = {
  states: unknown[][] | null;
};

const status = document.querySelector<HTMLParagraphElement>("#status");

if (!status) {
  throw new Error("Could not find the status paragraph.");
}

async function loadAircraft() {
  const response = await fetch(
    "/opensky/states/all?lamin=47.3&lomin=-122.7&lamax=47.9&lomax=-121.9"
  );

  if (!response.ok) {
    throw new Error(`OpenSky returned status ${response.status}`);
  }

  const data: OpenSkyResponse = await response.json();
  const count = data.states?.length ?? 0;
  const firstWithPosition = data.states?.find(
  (state) => state[5] !== null && state[6] !== null
);

if (!firstWithPosition) {
  status.textContent = `Aircraft found: ${count}, but none had a position.`;
} else {
  const callsign = String(firstWithPosition[1] ?? "").trim()
    || String(firstWithPosition[0]);
  const longitude = Number(firstWithPosition[5]).toFixed(3);
  const latitude = Number(firstWithPosition[6]).toFixed(3);

  status.textContent =
    `Aircraft found: ${count}. First position: ${callsign} at ${latitude}, ${longitude}`;
}
}

loadAircraft().catch((error: unknown) => {
  status.textContent = `Could not load aircraft: ${String(error)}`;
});