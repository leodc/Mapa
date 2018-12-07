function apiSearch(){
  text = $("#inputSearch").val();

  console.log("Searching layer " + text);

  var insertRow = true;
  var closeRow = false;

  $.getJSON("https://api.datos.gob.mx/v2/ckan-geoserver?pageSize=20&page=100", function(data){
    data["results"].forEach(function(element){
      var html = "";
      if( insertRow ){
        html += "<div class='row'>"
        insertRow = false;
      }else{
        closeRow = true;
      }

      // tag
      html += "<div class='col-sm-6 result-element' onclick=\"addLayerToMap('{0}', '{1}');\"><div class='col-sm-1'><span class='tag-icon tag-geoespacial'></span></div>".format(element.geoserver, element.name_resource);

      // resource info
      html += "<div class='col-sm-9'><p class='title'>{0}</p><small>{1}</small></div>".format(element.name_resource, element.description);

      // organization
      html += "<div class='col-sm-2'><div class='resource-item-org'><strong><a href='{1}'>{0}</a></strong></div></div></div>".format(element.organization.title, "url");

      if( closeRow ){
        html += "</div>"
        insertRow = true;
        closeRow = false;

        $("#searchResult").append(html);
      }



      // addLayerToMap(element.geoserver, element.name_resource);
    });
  });
}

function addLayerToMap(geoserverId, title){
  map.addWmsLayer(geoserverId, title);

  $('#addLayerModal').modal("hide");
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


  if (getUrlParameter("config")){
    var config = getUrlParameter("config").slice("1", "-1");

    for (geoserverId of config.split(",")){

      $.getJSON("https://api.datos.gob.mx/v2/ckan-geoserver?geoserver=" + geoserverId, function(data){
        data["results"].forEach(function(element){
          addLayerToMap(element.geoserver, element.name_resource);
        });
      });

    }
  }

  $('#addLayerModal').on('shown.bs.modal', function (e) {
    $("#searchResult").empty();
    apiSearch();
  });

  buildMap();
});
