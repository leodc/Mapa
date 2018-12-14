function apiSearch(){
  text = $("#inputSearch").val();

  console.log("Searching layer " + text);

  var insertRow = true;
  var closeRow = false;

  var nameSearchUrl = "https://api.datos.gob.mx/v2/ckan-geoserver?name_resource=/{0}/i";
  var descriptionSearchUrl = "https://api.datos.gob.mx/v2/ckan-geoserver?description=/{0}/i";

  $("#searchResult").empty();

  $.getJSON( nameSearchUrl.format([text]) , function(nameSearchResponse){
    $.getJSON( descriptionSearchUrl.format([text]) , function(descriptionSearchResponse){
      var results = nameSearchResponse["results"].concat( descriptionSearchResponse["results"] );

      showResult(results);
    });
  });
}


function showResult(results){
  if( results["results"]){
    results = results["results"];
  }

  $("#searchMessage").remove();

  if(results.length == 0){
    var html = '<div class="alert alert-danger" id="searchMessage">No se encontro ninguna capa</div>';
    $("#resultHolder").prepend(html);
    return;
  }

  var insertRow = true;
  var closeRow = false;

  var html = "";
  results.forEach(function(element){
    if( insertRow ){
      html = "<div class='row'>"
      insertRow = false;
    }else{
      closeRow = true;
    }

    // tag
    html += "<div class='col-sm-6 result-element' onclick=\"addLayerToMap('{0}');\"><div class='col-sm-2'><span class='tag-icon tag-geoespacial'></span><br><strong><a href='{2}'>{1}</a></strong></div>".format(element.geoserver,element.organization.title, "url");

    // resource info
    html += "<div class='col-sm-9'><p class='title'>{0}</p><small>{1}</small></div></div>".format(element.name_resource, element.description);

    // organization
    // html += "<div class='col-sm-2'></div></div>".format(element.organization.title, "url");

    if( closeRow ){
      html += "</div>";
      insertRow = true;
      closeRow = false;

      $("#searchResult").append(html);
    }
  });

  if( !insertRow ){
    html += "</div>";
    $("#searchResult").append(html);
  }
}

function addLayerToMap(geoserverId, color){
  $.getJSON("https://api.datos.gob.mx/v2/ckan-geoserver?geoserver=" + geoserverId, function(data){
    data["results"].forEach(function(element){
      $("#searchMessage").remove();

      if (window.layers && window.layers[geoserverId]){
        console.log("La capa ya existe en el mapa");

        var html = '<div class="alert alert-danger" id="searchMessage">Error: La capa ya se encuentra en el mapa</div>';
        $("#resultHolder").prepend(html);
      }else{
        var controlColor = color ? color:"#00cc99";
        // map.addWmsLayer(geoserverId, '<div class="row layerControlHolder"><div class="col-sm-1"><input type="color" onchange="updateLayerColor(\'{1}\');" id="{1}-color" value="{2}"/></div><div class="col-sm-11 layerName">{0}</div></div>'.format(element.name_resource, geoserverId, controlColor), element.name_resource, color);

        map.addWmsLayer(geoserverId, element.name_resource, controlColor);

        $('#addLayerModal').modal("hide");
      }
    });
  });
}


function updateLayerColor(geoserverId){
  var objId = "#{0}-color".format(geoserverId);

  map.updateLayerColor(geoserverId, $( objId ).val());
}


function getUrlParameter(sParam) {
  var sPageURL = window.location.search.substring(1),
  sURLVariables = sPageURL.split('&'),
  sParameterName,
  i;

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=');

    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
    }
  }
};


$(function(){
  window.layers = {};

  if (!String.prototype.format) {
    String.prototype.format = function() {
      var args = arguments;
      return this.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != 'undefined'
        ? args[number]
        : match
        ;
      });
    };
  }

  if (getUrlParameter("embeded") == "true"){
    $("#header").hide();
    $("#footer").hide();

    $("body").css("padding", "0");
    $("body").css("margin", "0");

    $("#map").height( $("html").height() );
  } else {
    $("#map").height( $("html").height() - $("#header").position().top - $("#header").height() - 100 );
  }

  initialView = true;
  $("#addLayerModal").on("shown.bs.modal", function (e) {
    $("#inputSearch").focus();
    $("#searchMessage").remove();

    if(initialView){
      $.getJSON( "https://api.datos.gob.mx/v2/ckan-geoserver?sort=-insert-date&pageSize=10&organization" , showResult);

      initialView = false;
    }else{

    }
  });

  $("#inputSearch").keypress(function(e){
    if(e.which == 13) {
      apiSearch();
    }
  })

  buildMap(function(){

  });

  if (getUrlParameter("config")){
    var config = getUrlParameter("config").slice("1", "-1");

    var geoserverId, params, color, initLayers = config.split(",");

    window.buildInit = true;
    window.layersInitCount = initLayers.length;

    for (layerConfig of initLayers){
      params = layerConfig.split(":");

      geoserverId = params[0];
      color = params.length == 2 ? "#"+params[1]:null;

      addLayerToMap(geoserverId, color);
    }
  }
});
