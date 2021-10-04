//entire function from mapbox
mapboxgl.accessToken = mapToken//variable set from detail ejs
  const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/streets-v11', // style URL
  center: campgrounds.geometry.coordinates, // starting position [lng, lat], coordinates is from detail.ejs. it require geoJSON
  zoom: 4 // starting zoom
  });
 // Create a default Marker and add it to the map.
new mapboxgl.Marker()
.setLngLat(campgrounds.geometry.coordinates)
.setPopup(
  new mapboxgl.Popup({offset:25})
     .setHTML(
    `<h5>${campgrounds.title}</h5><p>${campgrounds.location}</p>`
    )
)
.addTo(map);
