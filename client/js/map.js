// init map
function buildMap(){
  var map = L.map("map", { zoomControl:false }).setView([24.59, -103.14], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);


  var lc = L.control.locate({
    position: "topright",
    icon: "fa fa-location-arrow",
    // iconLoading: "fas fa-spinner",
    createButtonCallback: function (container, options) {
      L.DomUtil.setClass(container, "leaflet-control-locate leaflet-control-simplebutton  leaflet-control");

      var link = L.DomUtil.create('a', 'leaflet-bar-part leaflet-bar-part-single', container);
      link.title = options.strings.title;

      console.log(options);
      var icon = L.DomUtil.create(options.iconElementTag, options.icon + " white-icon", link);

      return { link: link, icon: icon };
    }
  }).addTo(map);

  addButtonToMap(map, "fa-search-plus", function(evt){
    map.zoomIn();
  });

  addButtonToMap(map, "fa-search-minus", function(){
    map.zoomOut();
  });

  window.map = map;
}


function addButtonToMap(map, icon, callback){
  new L.Control.SimpleButton({
    click: callback,
    faIcon: "fa " + icon
  }).addTo(map);
}


function addButton(map){
  L.Control.RemoveAll = L.Control.extend({
    options: {
      position: 'topleft',
    },
    onAdd: function (map) {
      var controlDiv = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');

      L.DomEvent
      .addListener(controlDiv, 'click', L.DomEvent.stopPropagation)
      .addListener(controlDiv, 'click', L.DomEvent.preventDefault)
      .addListener(controlDiv, 'click', function () {
        drawnItems.clearLayers();
      });

      var controlUI = L.DomUtil.create('a', '', controlDiv);
      controlUI.title = 'Remove All Polygons';
      controlUI.href = '#';

      return controlDiv;
    }
  });

  var removeAllControl = new L.Control.RemoveAll();
  map.addControl(removeAllControl);
}




var AddLayerControl = function(opt_options) {
  var options = opt_options || {};
  this.active = options.active || false;

  var this_ = this;

  var handleAddLayer = function(e) {
    $("#newLayerDialog").modal("show");
  };

  // this will be the ui of the component
  var anchor = document.createElement('a');
  anchor.href = '#add-layer-button';
  anchor.innerHTML = 'Agregar capa';


  // bind to click and touchevents to support mobile
  anchor.addEventListener('click', handleAddLayer, false);
  anchor.addEventListener('touchstart', handleAddLayer, false);

  var element = document.createElement('div');
  element.className = 'ol-control draw-point ol-unselectable';
  element.appendChild(anchor);

  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });
};


function buildPopup(map, wmsLayer, mapView){
  // Popup
  var infoPopup = new ol.Overlay.Popup();
  map.addOverlay(infoPopup);

  map.on("singleclick", function(evt) {
    var viewResolution = /** @type {number} */ (mapView.getResolution());
    var coordinates = evt.coordinate;

    var url = wmsLayer.getGetFeatureInfoUrl(coordinates, viewResolution, "EPSG:4326", {"info_format": "application/json"});

    $.get(url, function(data){
      var featureInfo = data.features[0].properties;

      var html = "<div>";
      for(var key in featureInfo){
        html += "<small><b>" + key + "</b>: " + featureInfo[key] + "</small><br>";
      }
      html += "</div>";

      infoPopup.show(coordinates, html);
    });
  });
}
