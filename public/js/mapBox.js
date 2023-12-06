/* eslint-disable */

const displayMap = (locations)=>{


  mapboxgl.accessToken = 'pk.eyJ1IjoibXVzdGFmYXJhbWFkYW4xNiIsImEiOiJjbHBscWVhNnEwMzQxMmtxeTlnOWZkMHowIn0.7yvS4Svrcow_aKLyl_ZFVQ';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mustafaramadan16/clplttwt300xd01pg5gne4b5e',
    scrollZoom: false
    // center: [-118.113491, 34.111745],
    // zoom: 10,
    // interactive: true
  })
  
  
  
  
  const bounds = new mapboxgl.LngLatBounds();
  
  locations.forEach((loc)=>{
  
    // create Marker
    const el = document.createElement('div')
    el.className = 'marker'
  
  // add marker
    new mapboxgl.Marker({
      Element: el,
      anchor: 'bottom'
    }).setLngLat(loc.coordinates).addTo(map);
  
  
    // add popup 
    
    new mapboxgl.Popup({
      offset: 30
    })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day} : ${loc.description}</p>`)
    .addTo(map);
  
    // extend map bounds to include the current location   
    bounds.extend(loc.coordinates)
  });
  
  
  map.fitBounds(bounds, {
    padding: {
      top: 200,
    bottom: 50,
    right: 100,
    left:100 
    }
  });
  
}

const mapBox = document.getElementById('map');

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);

  displayMap(locations);
}
