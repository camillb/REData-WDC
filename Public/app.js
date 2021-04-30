console.log("¡Funciona!");

(function () {
  var myConnector = tableau.makeConnector();

  myConnector.getSchema = function (schemaCallback) {
    const cols = [
      {
        id: "ID",
        dataType: tableau.dataTypeEnum.string,
      },
      {
        id: "Tipologia",
        dataType: tableau.dataTypeEnum.string,
      },
      {
        id: "FechaHora",
        dataType: tableau.dataTypeEnum.string,
      },
      {
        id: "Valor",
        dataType: tableau.dataTypeEnum.int,
      },
      {
        id: "Porcentaje",
        dataType: tableau.dataTypeEnum.float,
      },
      {
        id: "Ultima_actualizacion",
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

    var startDate = new Date();
    var endDate = new Date();

    // startDate será hoy, y endDate mañana (con lo que la API solo devuelve 1 dato, el de hoy a las 00:00)
    // Se pueden restar días para obtener días a partir de ayer
    startDate.setDate(startDate.getDate() + 0);
    endDate.setDate(endDate.getDate() + 1);

    // Convertimos al formato YYYY-MM-DD
    startDate = startDate.toISOString().slice(0, 10);
    endDate = endDate.toISOString().slice(0, 10);

    $.getJSON(
      `https://apidatos.ree.es/es/datos/demanda/demanda-tiempo-real?start_date=${startDate}T00:00&end_date=${endDate}T23:59&time_trunc=hour`,
      function (resp) {
        var apiData = resp.included;
        // Iterate over the JSON object
        for (i = 0, len = apiData.length; i < len; i++) {
          for (j = 0; j < apiData[i].attributes.values.length; j++) {
            var nestedData = apiData[i].attributes.values[j];
            tableData.push({
              FechaHora: nestedData.datetime,
              Porcentaje: nestedData.percentage,
              Valor: Number(nestedData.value),
              Ultima_actualizacion: resp.data.attributes["last-update"],
              Tipologia: apiData[i].type,
              ID: apiData[i].id,
            });
          }
        }
        table.appendRows(tableData);
        doneCallback();
      }
    );
  };

  tableau.registerConnector(myConnector);
})();

document.querySelector("#getData").addEventListener("click", getData);

function getData() {
  tableau.connectionName = "REData";
  tableau.submit();
}
