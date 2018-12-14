var sld_body = '<?xml version="1.0" encoding="ISO-8859-1"?> \
                <StyledLayerDescriptor version="1.0.0" \
                 xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd" \
                 xmlns="http://www.opengis.net/sld" \
                 xmlns:ogc="http://www.opengis.net/ogc" \
                 xmlns:xlink="http://www.w3.org/1999/xlink" \
                 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\
                  <NamedLayer>\
                    <Name>ckan:{0}</Name>\
                    <UserStyle>\
                      <Title>general map style</Title>\
                      <FeatureTypeStyle> \
                      <Rule> \
                         <PointSymbolizer> \
                           <Graphic> \
                             <Mark> \
                               <WellKnownName>circle</WellKnownName> \
                               <Fill> \
                                 <CssParameter name="fill">{1}</CssParameter> \
                               </Fill> \
                               <Stroke> \
                                 <CssParameter name="stroke">#000000</CssParameter> \
                                 <CssParameter name="stroke-width">1</CssParameter> \
                               </Stroke> \
                             </Mark> \
                             <Size>6</Size> \
                           </Graphic> \
                         </PointSymbolizer> \
                       </Rule> \
                       <Rule>\
                         <PolygonSymbolizer>\
                           <Fill>\
                             <CssParameter name="fill">{1}</CssParameter>\
                           </Fill>\
                           <Stroke> \
                             <CssParameter name="stroke">#000000</CssParameter> \
                             <CssParameter name="stroke-width">1</CssParameter> \
                           </Stroke> \
                         </PolygonSymbolizer>\
                       </Rule>\
                      </FeatureTypeStyle>\
                    </UserStyle>\
                  </NamedLayer>\
                </StyledLayerDescriptor>';


// init map
function buildMap(callback){
  var opacityDefault = 0.8;


  var map = L.map("map", {
    zoomControl:false
  }).setView([24.59, -103.14], 5);

  var hash = new L.Hash(map);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  buildButtons(map);

  var layerControl, htmlLegend;
  map.addWmsLayer = function(geoserverId, title, color){
    var wmsOptions = {
      layers: "ckan:" + geoserverId,
      transparent: true,
      format: "image/png",
      opacity: opacityDefault
    }

    if( color != null ){
      wmsOptions["sld_body"] = sld_body.format(geoserverId, color);
    }

    window.layers[geoserverId] = {
      "layer": L.tileLayer.betterWms("https://geo.datos.gob.mx/geoserver/ows", wmsOptions).addTo(map),
      "title": title,
      "color": color
    };
    window.layers[geoserverId]["label"] = buildLabel(title, geoserverId);

    if( window.buildInit ){
      if( Object.keys(window.layers).length == window.layersInitCount ){
        var addLayers = true;
        layerControl = buildLayerControl(addLayers);

        window.buildInit = false;
      }
    }else{
      if( !layerControl ){
        // addLayerControl
        layerControl = buildLayerControl();
      }

      layerControl.addOverlay(window.layers[geoserverId]["layer"], window.layers[geoserverId]["label"]);
    }
  }

  map.updateLayerColor = function(geoserverId, color){
    window.layers[geoserverId]["color"] = color;
    window.layers[geoserverId]["layer"].setParams({"sld_body": sld_body.format(geoserverId, color)});
  }

  $(window).on("resize", function(){
    map.invalidateSize();
  });

  window.map = map;

  if(callback){
    map.whenReady(callback);
  }
}


function buildLabel(title, geoserverId){
  // var html = '<div class="row layerControlHolder"> \
  //               <div class="col-sm-1"><input type="color" onchange="updateLayerColor(\'{1}\');" id="{1}-color" value="{2}"/></div> \
  //               <div class="col-sm-11 layerName">{0}</div> \
  //             </div>'

  var html = '<div class="layerControlHolder"> \
                <div class="layerName">{0}</div> \
                <div class="row" style="padding-left:15px;"> \
                  <div class="col-sm-2"> \
                    <input type="color" onchange="updateLayerColor(\'{1}\');" id="{1}-color" value="{2}"/> \
                  </div> \
                  <div class="col-sm-5"> \
                    <input type="range" min="0" max="1" value="0.8" step="0.1" class="slider" id="{1}-range" onchange="updateOpacityLayer(\'{1}\');" > \
                  </div> \
                </div> \
              </div>';

  return html.format(title, geoserverId, window.layers[geoserverId]["color"])
}


function updateOpacityLayer(geoserverId){
  var opacityValue = $( "#" + geoserverId + "-range").val();
  window.layers[geoserverId]["layer"].setOpacity(parseFloat(opacityValue));
}


function buildLayerControl(addLayers){
  var overlays = {};

  if(addLayers){
    var config = getUrlParameter("config").slice("1", "-1").split(",");

    var layerConfig;
    for ( var i = config.length-1; i >= 0; i--){
      layerConfig = config[i];

      geoserverId = layerConfig.split(":")[0];
      overlays[window.layers[geoserverId]["label"]] = window.layers[geoserverId]["layer"]
    }
  }

  var control = L.control.layers({}, overlays, {position: "topleft", collapsed: false}).addTo(map);

  $(".leaflet-control-layers").prepend("<label class='h3' style='margin-top:0px;'>Capas en el mapa</label>");

  return control;
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
  var customControl =  L.Control.extend({
    options: {
      position: "topleft"
    },

    onAdd: function (map) {
      var container = L.DomUtil.create("input", "map-text-button");
      container.type="button";
      container.title="Agregar nueva capa al mapa";
      container.value="Agregar nueva capa al mapa";

      container.onclick = function(){
        $("#addLayerModal").modal({});
      }

      return container;
    }
  });

  map.addControl(new customControl());
}


function addButtonToMap(map, icon, position, callback){
  new L.Control.SimpleButton({
    position: position,
    click: callback,
    faIcon: "fa " + icon
  }).addTo(map);
}
