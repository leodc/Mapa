// init map
function buildMap(){
  var map = L.map("map", {
    zoomControl:false,
    // crs: L.CRS.EPSG4326
  }).setView([24.59, -103.14], 5);

  var hash = new L.Hash(map);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  buildButtons(map);

  // addLayerControl
  var layerControl = L.control.layers({}, {}, {position: "topleft", collapsed: false}).addTo(map);

  map.addWmsLayer = function(geoserverId, title){
    var wmsLayer = L.tileLayer.wms("https://geo.datos.gob.mx/geoserver/ows?", {
      layers: "ckan:" + geoserverId,
      transparent: true,
      format: "image/png",
      // crs: L.CRS.EPSG4326
    }).addTo(map);

    layerControl.addOverlay(wmsLayer, title)
  }

  window.map = map;
}

function buildButtons(map){
  // locate control
  var lc = L.control.locate({
    position: "topright",
    icon: "fa fa-location-arrow",
    // iconLoading: "fas fa-spinner",
    createButtonCallback: function (container, options) {
      L.DomUtil.setClass(container, "leaflet-control-locate leaflet-control-simplebutton  leaflet-control");

      var link = L.DomUtil.create('a', 'leaflet-bar-part leaflet-bar-part-single', container);
      link.title = options.strings.title;

      var icon = L.DomUtil.create(options.iconElementTag, options.icon + " white-icon", link);

      return { link: link, icon: icon };
    }
  }).addTo(map);

  // zoom +
  addButtonToMap(map, "fa-search-plus", "topright", function(evt){
    map.zoomIn();
  });

  // zoom -
  addButtonToMap(map, "fa-search-minus", "topright", function(){
    map.zoomOut();
  });


  // addLayer
  addButtonToMap(map, "fa-plus", "topleft", function(evt){
    $('#addLayerModal').modal({})
  });
}


function addButtonToMap(map, icon, position, callback){
  new L.Control.SimpleButton({
    position: position,
    click: callback,
    faIcon: "fa " + icon
  }).addTo(map);
}
