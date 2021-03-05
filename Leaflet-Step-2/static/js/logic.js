// Creating base layers
var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "satellite-v9",
  accessToken: API_KEY
});

var grayscale = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "light-v10",
  accessToken: API_KEY
});

var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "outdoors-v11",
  accessToken: API_KEY
});

// Create a baseMaps object
var baseMaps = {
  "Satellite": satellite,
	"Grayscale": grayscale,
	"Outdoors": outdoors
};

// Initialize all of the LayerGroups we'll be using
var layers = {
  tectonicLayer: new L.LayerGroup(),
  earthquakeLayer: new L.LayerGroup()
};

// Define a map object
var myMap = L.map("mapid", {
	center: [37.09, -95.71],
	zoom: 4,
  layers: [
		layers.tectonicLayer,
		layers.earthquakeLayer
	]
});

// Add satellite layer to the map
satellite.addTo(myMap);

// Create an overlay object to add to the layer control
var overlayMaps = {
	"Fault Lines": layers.tectonicLayer,
  "Earthquakes": layers.earthquakeLayer
};

// Pass our map layers into our layer control
// Add the layer control to the map
L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(myMap);

var tectonicUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
var earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Grabbing tectonic data
d3.json(tectonicUrl, function(tectonicData) {

	// Grab the features of tectonic data
	var tectonic = tectonicData.features;

	for (var i = 0; i < tectonic.length; i++) {

		var coordinates = tectonic[i].geometry.coordinates;
		var coordinateList = [];

		coordinateList.push(
			coordinates.map(coordinate => [coordinate[1], coordinate[0]])
		);

		// Tectonic lines
		var lines = L.polyline(coordinateList, {color: "rgb(255, 165, 0)"});
		
		// Tectonic mark
		lines.addTo(layers.tectonicLayer);
	};
});

//JSON data
d3.json(earthquakeUrl, function (data) {
  var earthquakes = data.features;

 

  function getColor(depth) {
      if (depth >= -10 && depth < 10) {
          return "#00cc00";
      }
      else if (depth >= 10 && depth < 30) {
        return "#cccc00";
      }
      else if (depth >= 30 && depth < 50) {
        return "#ffcc00";
      }
      else if (depth >= 50 && depth < 70) {
        return "#ff9900";
      }
      else if (depth >= 70 && depth < 90) {
        return "#ff6600";
      }
      else if (depth >= 90) {
        return "#ff3300";
      }
    };

  // Add variables

  for (var i = 0; i < earthquakes.length; i++) {
      var latitude = earthquakes[i].geometry.coordinates[1];
      var longitude = earthquakes[i].geometry.coordinates[0];
      var magnitude = earthquakes[i].properties.mag;
      var depth = earthquakes[i].geometry.coordinates[2];

      // Add markers
      var earthquakeMarker = L.circleMarker([latitude, longitude], {
          radius: magnitude * 5,
          color: "black",
          fillColor: getColor(depth),
          fillOpacity: 1,
          weight: 1
      });
      earthquakeMarker.addTo(layers.earthquakeLayer);


      // Binding pop-up
      earthquakeMarker.bindPopup("<h3> " + new Date(earthquakes[i].properties.time) + "</h3><h4>Magnitude: " + magnitude +
          "<br>Location: " + earthquakes[i].properties.place + "</h4><br>");
  };
  
  //legend
  var legend = L.control({ position: 'bottomright'
  });
  
  legend.onAdd = function (color) {
      var div = L.DomUtil.create('div', 'info legend');
      var depth = ['-10-10', '10-30', '30-50', '50-70', '70-90', '90+'];
      var colors = ['#00cc00', '#cccc00', '#ffcc00', '#ff9900', '#ff6600', '#ff3300']
      for (var i = 0; i < depth.length; i++) {
          div.innerHTML += '<i style="background:' + colors[i] + '"></i>' + depth[i] + '<br>';
      }
      return div;
  };

  legend.addTo(myMap);
});
