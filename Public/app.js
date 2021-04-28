console.log("¡Funciona!");

(function () {
  var myConnector = tableau.makeConnector();

  myConnector.getSchema = function (schemaCallback) {
    const cols = [
      {
        id: "tipo_de_energia",
        dataType: tableau.dataTypeEnum.string,
      },
      {
        id: "fecha_de_última_actualizacion",
        dataType: tableau.dataTypeEnum.string,
      },
      {
        id: "energia",
        dataType: tableau.dataTypeEnum.string,
      },
      {
        id: "idenergia",
        dataType: tableau.dataTypeEnum.string,
      },
      {
        id: "Porcentaje",
        dataType: tableau.dataTypeEnum.float,
      },
      {
        id: "Valor",
        dataType: tableau.dataTypeEnum.int,
      },
      {
        id: "FechaHora",
        dataType: tableau.dataTypeEnum.string,
      },
    ];

    let apiTableSchema = {
      id: "REData",
      alias: "Datos de la REData API",
      columns: cols,
    };

    schemaCallback([apiTableSchema]);
  };

  myConnector.getData = function (table, doneCallback) {
    let tableData = [];
    var i = 0;
    var j = 0;
    var h = 0;

    $.getJSON(
      "https://apidatos.ree.es/es/datos/balance/balance-electrico?start_date=2021-04-27T00:00&end_date=2021-04-27T22:00&time_trunc=day",
      function (resp) {
        var apiData = resp.included;
        // Iterate over the JSON object
        for (i = 0, len = apiData.length; i < len; i++) {
          for (j = 0; j < apiData[i].attributes.content.attributes.values.length; j++) {
            for (h = 0; h < apiData[i].attributes.content.length; h++) {
            var nestedData = apiData[i].attributes.content.attributes.values[j];
            tableData.push({
              datetime: nestedData.datetime,
              percentage: nestedData.percentage,
              value: Number(nestedData.value),
              fecha_de_última_actualizacion: resp.data.attributes["last-update"],
              tipo_de_energia: apiData[i].tipo_de_energia,
              idenergia: apiData[i].attributes.content.attributes.idenergia,
              energia: apiData[i].attributes.content.attributes.energia
            });
          }    
        }
        table.appendRows(tableData);
        doneCallback();
      }
    });
  };

  tableau.registerConnector(myConnector);
})();

document.querySelector("#getData").addEventListener("click", getData);

function getData() {
  tableau.connectionName = "REData";
  tableau.submit();
}
