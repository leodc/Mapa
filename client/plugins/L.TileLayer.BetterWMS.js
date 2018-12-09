L.TileLayer.BetterWMS = L.TileLayer.WMS.extend({

  onAdd: function (map) {
    // Triggered when the layer is added to a map.
    //   Register a click listener, then do all the upstream WMS things
    L.TileLayer.WMS.prototype.onAdd.call(this, map);
    map.on('click', this.getFeatureInfo, this);
  },

  onRemove: function (map) {
    // Triggered when the layer is removed from a map.
    //   Unregister a click listener, then do all the upstream WMS things
    L.TileLayer.WMS.prototype.onRemove.call(this, map);
    map.off('click', this.getFeatureInfo, this);
  },

  getFeatureInfo: function (evt) {
    // Make an AJAX request to the server and hope for the best
    var url = this.getFeatureInfoUrl(evt.latlng),
        showResults = L.Util.bind(this.showGetFeatureInfo, this);
    $.ajax({
      url: url,
      success: function (data, status, xhr) {
        var err = typeof data === 'string' ? null : data;
        showResults(err, evt.latlng, data);
      },
      error: function (xhr, status, error) {
        showResults(error);
      }
    });
  },

  getFeatureInfoUrl: function (latlng) {
    // Construct a GetFeatureInfo request URL given a point
    var point = this._map.latLngToContainerPoint(latlng, this._map.getZoom()),
        size = this._map.getSize(),

        params = {
          request: 'GetFeatureInfo',
          service: 'WMS',
          srs: 'EPSG:4326',
          styles: this.wmsParams.styles,
          transparent: this.wmsParams.transparent,
          version: this.wmsParams.version,
          format: this.wmsParams.format,
          bbox: this._map.getBounds().toBBoxString(),
          height: size.y,
          width: size.x,
          layers: this.wmsParams.layers,
          query_layers: this.wmsParams.layers,
          info_format: 'application/json'
        };

    params[params.version === '1.3.0' ? 'i' : 'x'] = point.x;
    params[params.version === '1.3.0' ? 'j' : 'y'] = point.y;

    // return this._url + L.Util.getParamString(params, this._url, true);

    var url = this._url + L.Util.getParamString(params, this._url, true);

	  /**
	   * CORS workaround (using a basic php proxy)
	   *
	   * Added 2 new options:
	   *  - proxy
	   *  - proxyParamName
	   *
	   */

	  // check if "proxy" option is defined (PS: path and file name)
	  if(typeof this.wmsParams.proxy !== "undefined") {

		  // check if proxyParamName is defined (instead, use default value)
  		if(typeof this.wmsParams.proxyParamName !== "undefined")
  			this.wmsParams.proxyParamName = 'url';

  		// build proxy (es: "proxy.php?url=" )
  		_proxy = this.wmsParams.proxy + '?' + this.wmsParams.proxyParamName + '=';

  		url = _proxy + encodeURIComponent(url);

  	}

  	return url;

  },

  showGetFeatureInfo: function (err, latlng, content) {
    if ( latlng == null || content == null){
      console.log(err);
      return;
    }

    for (feature of content.features){
      var popContent = "<b>{0}</b><br><br>".format( window.layers[feature["id"].split(".")[0]]["title"] );

      for (key in feature.properties){
        if( key != "bbox" && feature.properties[key] != null ){
          popContent += "<b>{0}</b>: {1}<br>".format(key, feature.properties[key]);
        }
      }

      break;
    }

    if( content.features.length > 0) {

      if( $("#popupContent").length == 0 ){
        L.responsivePopup()
          .setLatLng(latlng)
          .setContent("<div id='popupContent'>" + popContent + "</div>" )
          .openOn(this._map);
      }else{
        $("#popupContent").append("<hr>" + popContent);
      }
    }
  }
});

L.tileLayer.betterWms = function (url, options) {
  return new L.TileLayer.BetterWMS(url, options);
};
