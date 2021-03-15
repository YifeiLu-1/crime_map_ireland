function constructPopupHTML(data, stationId, year) {
  let html = "<table>";
  const crimeLabel = data["crimeLabel"];
  const crimeDataInYear = data["stations"][stationId]["crimeData"][year];
  console.log(crimeDataInYear);
  for (let offenceId in crimeDataInYear) {
    const offenceName = crimeLabel[offenceId];
    const offenceCount = crimeDataInYear[offenceId];
    html +=
      "<tr><th>" +
      offenceName +
      ": </th><th><strong>" +
      offenceCount +
      "</th></strong></tr>";
  }
  return html + "</table>";
}

function addMarkers(data, year, markers) {
  for (let stationId in data["stations"]) {
    const stationData = data["stations"][stationId];
    const latLonArray = stationData["locations"];
    const lat = latLonArray[0],
      lon = latLonArray[1];
    const stationName = stationData["stationName"];
    const crimeData = stationData["crimeData"];
    const totalCrimeCount = crimeData[year]["0"];

    for (let i = 0; i < totalCrimeCount; i++) {
      let marker = L.marker(new L.LatLng(lat, lon), { stationId: stationId });
      marker.bindPopup(stationId);
      markers.addLayer(marker);
    }
  }
  markers.on("clusterclick", function (a) {
    if (a.layer._zoom == 16) {
      var markers = a.layer.getAllChildMarkers();
      const stationId = markers[0].options.stationId;
      const html = constructPopupHTML(data, stationId, year);
      var popup = L.popup({ minWidth: 480 })
        .setLatLng(a.layer.getLatLng())
        .setContent(html)
        .openOn(map);
    }
  });
}

let year = "2019",
  county = "Dublin",
  latlng = L.latLng(53.3498, -6.2603);

const tiles = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    maxZoom: 16,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Points &copy 2012 LINZ',
  }
);

const map = L.map("map", { center: latlng, zoom: 13, layers: [tiles] });

let stationLayer = L.layerGroup();
map.addLayer(stationLayer);

const markersConfig = {
  spiderfyOnMaxZoom: false,
  chunkedLoading: true,
  showCoverageOnHover: false,
  iconCreateFunction: function (cluster) {
    // get the number of items in the cluster
    let count = cluster.getChildCount();

    // figure out how many digits long the number is
    let digits = (count + "").length;

    // Return a new L.DivIcon with our classes so we can
    // style them with CSS. Take a look at the CSS in
    // the <head> to see these styles. You have to set
    // iconSize to null if you want to use CSS to set the
    // width and height.
    return L.divIcon({
      html: count,
      className: "cluster digits-" + digits,
      iconSize: null,
    });
  },
};

let markers = L.markerClusterGroup(markersConfig);

// listen to the county user selected from the drop
// down menu and change relevant h2 heading and
// map center location
$("#county").change(function () {
  const county = $(this).val();

  // change h2 in html
  $("#map-section h1").text(county + " Crimes in " + year);

  const countyLocations = {
    Carlow: [52.8365, -6.9341],
    Cavan: [53.9897, -7.3633],
    Clare: [52.9045, -8.9811],
    Cork: [51.8985, -8.4756],
    Donegal: [54.6538, -8.1096],
    Dublin: [53.3498, -6.2603],
    Galway: [53.2707, -9.0568],
    Kerry: [52.1545, 9.5669],
    Kildare: [53.1589, -6.9096],
    Kilkenny: [52.6541, -7.2448],
    Laois: [52.9943, -7.3323],
    Leitrim: [54.1247, -8.002],
    Limerick: [52.6638, -8.6267],
    Longford: [53.7276, -7.7933],
    Louth: [53.9508, -6.5406],
    Mayo: [54.0153, -9.4289],
    Meath: [53.6055, -6.6564],
    Monaghan: [54.2492, -6.9683],
    Offaly: [53.2357, -7.7122],
    Roscommon: [53.634, -8.1819],
    Sligo: [54.2766, -8.4761],
    Tipperary: [52.4747, -8.1544],
    Waterford: [52.2593, -7.1101],
    Westmeath: [53.5345, -7.4653],
    Wexford: [52.3369, -6.4633],
    Wicklow: [52.9808, -6.0446],
  };
  latLonArray = countyLocations[county];
  let newLatLon = new L.latLng(latLonArray[0], latLonArray[1]);
  map.setView(newLatLon, 13);
});


// populate the data object and draw the map
$.get(
  "./api/data/2019",
  function (data) {
    addMarkers(data, year, markers);
    stationLayer.addLayer(markers);
  },
  "json"
);

$("#year").change(function () {
  year = $(this).val();
  // change h2 in html
  $("#map-section h1").text(county + " Crimes in " + year);

  stationLayer.clearLayers();
  markers = L.markerClusterGroup(markersConfig);

  const urlPath = "./api/data/" + year;

  $.get(
    urlPath,
    function (data) {
      addMarkers(data, year, markers);
      stationLayer.addLayer(markers);
    },
    "json"
  );
});
