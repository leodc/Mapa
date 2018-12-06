function searchLayerHandler(){
  console.log("Searching layer")
  // text = $("#search-layer-inpupt").val()

  var api_geo_response = [
    {
      geo_id: "d5618157_bbeb_473c_b4aa_a9c641da3a79",
      geo_title: "Chile verde año agricola 2013",
      abstract: ""
    },
    {
      geo_id: "49c7971b_f932_4c36_8955_cda297d13443__localidad50_a",
      geo_title: "Conjunto de datos vectoriales de información topográfica G14A25 (Don Martín) escala 1:50 000 serie III - localidad50_a",
      abstract: "Contienen información sobre los diversos datos espaciales presentes en los conjuntos de datos, como curvas de nivel, hidrografía, vías de comunicación, localidades, entre otros. Estos rasgos son representados digitalmente por un componente geométrico (puntos, líneas o áreas) y componentes descriptivos (los atributos del dato). Los topónimos o nombres geográficos, se incluyen como atributos propios de cada uno de los datos que conforman cada conjunto de datos y que por su naturaleza los requieren. En esta serie se actualizaron las localidades, vías de comunicación y cuerpos de agua, por ser estos los rasgos con mayor dinámica con respecto al tiempo, además de todos aquellos objetos que por su relación espacial con las anteriores necesiten ajustarse.",
      keywords: "inegi, acueducto"
    },
    {
      geo_id: "a8694801_716f_4487_8c4e_e1f099c28888",
      geo_title: "Avena graño año agricola 2013",
      abstract: ""
    },
    {
      geo_id: "37f29fcc_4b57_4962_a52c_9cebefae615d",
      geo_title: "Comercio al por mayor 01/2016",
      abstract: "Ofrece datos de identificación, ubicación, actividad económica y tamaño de los negocios activos en el territorio nacional, actualizados, fundamentalmente, en el segmento de los establecimientos grandes. Esta versión se actualizó con base en los resultados definitivos de los Censos Económicos 2014 y del operativo de verificación de unidades económicas nuevas realizado por el INEGI en el segundo semestre del 2015. Resultado de esto, en el DENUE 01-2016 se publican los datos de 5 millones 4 mil 986 negocios a nivel nacional. De ellos, 4 millones 912 mil 324 ya estaban registrados en la versión anterior del DENUE y se incluyen 92 mil 662 establecimientos nuevos. Este archivo contiene 35,368 registros que corresponde al total de unidades económicas activas en el estado de Colima.",
      keywords: "inegi, agricultura,alimentos"
    }
  ]

  api_geo_response.forEach(function(layer){
    var html = "<a onclick='map.addWmsLayer(\"" + layer.geo_id + "\", \"" + layer.geo_title + "\")'>";

    html += "<b>" + layer.geo_title + "</b><br>"
    html += "<small>" + layer.abstract + "</small>"

    html += "</a>";

    $("#layer_result_list").append(html);
  })
}


$(function(){
  buildMap();
});
