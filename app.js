const INITIAL_VIEW_STATE = {
  longitude: 73.7898,
  latitude: 19.9975,
  zoom: 14,
  pitch: 0,
  bearing: 0
};

// UI Elements
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const opacitySlider = document.getElementById('opacitySlider');
const opacityValue = document.getElementById('opacityValue');
const playPauseBtn = document.getElementById('playPauseBtn');
const activeVehicles = document.getElementById('activeVehicles');
const currentTimeEl = document.getElementById('currentTime');

// State
let time = 0;
let isPaused = false;
let animationSpeed = parseInt(speedSlider.value, 10);
let trailOpacity = parseFloat(opacitySlider.value);
let animationId = null;
let tripsData = [];

// Initialize Map
const map = new maplibregl.Map({
  container: 'map',
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
  zoom: INITIAL_VIEW_STATE.zoom,
  pitch: INITIAL_VIEW_STATE.pitch,
  bearing: INITIAL_VIEW_STATE.bearing,
  interactive: true
});

// Initialize DeckGL Canvas Overlay
const deckgl = new deck.DeckGL({
  mapStyle: null, // Let maplibre handle the base map
  container: 'map',
  initialViewState: INITIAL_VIEW_STATE,
  controller: true,
  onViewStateChange: ({viewState}) => {
    map.jumpTo({
      center: [viewState.longitude, viewState.latitude],
      zoom: viewState.zoom,
      bearing: viewState.bearing,
      pitch: viewState.pitch,
    });
  },
  layers: []
});

// Load data and start animation
fetch('nashik_trips.json')
  .then(response => response.json())
  .then(data => {
    tripsData = data;
    activeVehicles.textContent = data.length;
    animate();
  })
  .catch(err => console.error("Error loading trips data:", err));

function renderLayers() {
  const tripsLayer = new deck.TripsLayer({
    id: 'trips-layer',
    data: tripsData,
    getPath: d => d.path,
    getTimestamps: d => d.timestamps,
    getColor: d => d.vendor === 0 ? [0, 242, 254] : [255, 51, 102], // Neon Blue & Neon Pink
    opacity: trailOpacity,
    widthMinPixels: 3,
    rounded: true,
    trailLength: 60,
    currentTime: time,
    shadowEnabled: false
  });

  deckgl.setProps({
    layers: [tripsLayer]
  });
}

function animate() {
  if (!isPaused) {
    time = (time + animationSpeed * 0.1) % 500;
    
    // Update time display (pseudo-time representation)
    const hours = Math.floor(time / 20) % 24;
    const minutes = Math.floor(time % 20 * 3);
    currentTimeEl.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  
  renderLayers();
  animationId = requestAnimationFrame(animate);
}

// Event Listeners
speedSlider.addEventListener('input', (e) => {
  animationSpeed = parseInt(e.target.value, 10);
  speedValue.textContent = animationSpeed;
});

opacitySlider.addEventListener('input', (e) => {
  trailOpacity = parseFloat(e.target.value);
  opacityValue.textContent = trailOpacity.toFixed(1);
});

playPauseBtn.addEventListener('click', () => {
  isPaused = !isPaused;
  if (isPaused) {
    playPauseBtn.textContent = 'Play Simulation';
    playPauseBtn.classList.add('paused');
  } else {
    playPauseBtn.textContent = 'Pause Simulation';
    playPauseBtn.classList.remove('paused');
  }
});
