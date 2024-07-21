mapboxgl.accessToken = 'pk.eyJ1IjoiMDA3ZGFubnkiLCJhIjoiY2x3eTJiOHl2MWUxbTJ6cjE0OGd0cTdheSJ9.wpcCxKAvq0uBlNPCC2oDNQ';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/outdoors-v12',
  center: [6.5481, 9.6139], // Minna, Nigeria
  zoom: 12
});

// Add zoom controls
map.addControl(new mapboxgl.NavigationControl());

// Add geolocate control
const geolocate = new mapboxgl.GeolocateControl({
  positionOptions: {
    enableHighAccuracy: true
  },
  trackUserLocation: true
});
map.addControl(geolocate);

const markers = [];
const popups = [];
let currentPopup = null; // Track the currently opened popup

// Function to get marker color based on status
function getMarkerColor(status) {
  switch (status.toLowerCase()) {
    case 'active':
      return '#00FF00'; // Green
    case 'dilapidated':
      return '#FFFF00'; // Yellow
    case 'destroyed':
      return '#FF0000'; // Red
    default:
      return '#808080'; // Gray for unknown status
  }
}

// Function to format coordinates
function formatCoordinates(lng, lat) {
  return `${lng.toFixed(6)}, ${lat.toFixed(6)}`;
}

// Function to show enlarged image
function showEnlargedImage(imageSrc, storeName) {
  const overlay = document.createElement('div');
  overlay.className = 'image-overlay';
  
  const img = document.createElement('img');
  img.src = imageSrc;
  img.alt = storeName;
  
  const caption = document.createElement('p');
  caption.textContent = storeName;
  
  overlay.appendChild(img);
  overlay.appendChild(caption);
  
  overlay.addEventListener('click', () => {
    document.body.removeChild(overlay);
  });
  
  document.body.appendChild(overlay);
}

// Add markers and popups for each store
storeData.forEach((store) => {
  const marker = new mapboxgl.Marker({
    color: getMarkerColor(store.status)
  })
    .setLngLat([store.coordinates.lng, store.coordinates.lat])
    .addTo(map);

  const popupContent = `
    <h3>${store.name}</h3>
    <img src="${store.image}" alt="${store.name}" width="100" class="clickable-image">
    <p>Coordinates: ${formatCoordinates(store.coordinates.lng, store.coordinates.lat)}</p>
    <p>Status: ${store.status}</p>
    <a href="https://www.google.com/maps/search/?api=1&query=${store.coordinates.lat},${store.coordinates.lng}" target="_blank" rel="noopener noreferrer">Navigate to Coordinate</a>
  `;

  const popup = new mapboxgl.Popup({ offset: 25 })
    .setHTML(popupContent);

  marker.setPopup(popup);

  markers.push(marker);
  popups.push(popup);

  // Close the current popup when opening a new one
  marker.getElement().addEventListener('click', () => {
    if (currentPopup) {
      currentPopup.remove();
    }
    popup.addTo(map);
    currentPopup = popup;

    // Add click event to the image after popup is added to the map
    setTimeout(() => {
      const popupImage = document.querySelector('.mapboxgl-popup-content .clickable-image');
      if (popupImage) {
        popupImage.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          showEnlargedImage(store.image, store.name);
        });
      }
    }, 100);
  });
});

// User location
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition((position) => {
    const userLocation = [position.coords.longitude, position.coords.latitude];
    map.flyTo({
      center: userLocation,
      zoom: 15,
      essential: true
    });
  });
}

// Search functionality
const searchInput = document.getElementById('search');
const storeList = document.getElementById('store-list');

// Populate the store list initially
storeData.forEach((store) => {
  const listItem = document.createElement('li');
  listItem.textContent = store.name;
  listItem.addEventListener('click', () => {
    map.flyTo({
      center: [store.coordinates.lng, store.coordinates.lat],
      zoom: 15,
      essential: true
    });
    const index = storeData.findIndex((s) => s.name === store.name);
    if (currentPopup) {
      currentPopup.remove();
    }
    popups[index].addTo(map);
    currentPopup = popups[index];
  });
  storeList.appendChild(listItem);
});

searchInput.addEventListener('input', () => {
  const searchTerm = searchInput.value.toLowerCase();
  Array.from(storeList.children).forEach((item) => {
    const storeName = item.textContent.toLowerCase();
    if (storeName.includes(searchTerm)) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
});