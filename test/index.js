const map = L.map('map').setView([56.00392292119433, 92.8734346385504], 4);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox/streets-v11'
}).addTo(map);


L.control.ruler().addTo(map);




const dots = [
    [-61.99, 85.77, 0],
    [55.01, 87.82, 1],
    [58.96, 88.78, 2],
    [60.98, 90.87, 3],
    [62.00, 91.96, 4],
    [65.02, 93.07, 5],
    [68.05, 94.94, 8],
    [70.09, 95.01, 9],
    [75.07, 96.70, 11]
]


const pointsFeatures = dots.map(dot => {
    return {
        "type": "Feature",
        "properties": {
            "value": dot[2]
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                dot[1],
                dot[0]
            ]
        }
    }
})


const points = {
    "type": "FeatureCollection",
    "features": pointsFeatures
}

const gridSize = 70000;


function drawTurf() {

    const options = { gridType: 'points', property: 'value', units: 'meters', weight: 4 };
    console.time('interpolateTruf')
    const grid = turf.interpolate(points, gridSize, options);

    /*   grid.features.forEach(feature => {
          L.geoJSON(feature).bindPopup(feature.properties.value.toString()).addTo(map);
      });
   */
    console.timeEnd('interpolateTruf')
    const breaks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    console.time('isobandturf')
    const lines = turf.isobands(grid, breaks, { zProperty: 'value' });
    console.timeEnd('isobandturf')
    const colorsTurf = {
        "0-1": "#530FAD",
        "1-2": "#1B1BB3",
        "2-3": "#0B61A4",
        "3-4": "#00AF64",
        "4-5": "#67E300",
        "5-6": "#CCF600",
        "6-7": "#FFE800",
        "7-8": "#FFBF00",
        "8-9": "#FF9200",
        "9-10": "#FF4900",
        "10-11": "#FF0000",
    };

    map.eachLayer(layer => {
        if (layer.options.type === "band") {
            map.removeLayer(layer)
        }
    })
    lines.features.forEach(feature => {
        L.geoJSON(feature, { color: colorsTurf[feature.properties.value], weight: 0, fillOpacity: .6, type: "band" }).bindPopup(feature.properties.value.toString()).addTo(map);
    });
}

function drawDline() {
    step = {
        "type": "CustomValues",
        "values": [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
    }


    const extrs = [85.77, -61.99, 96.70, 75.07]

    L.marker([-61.99, 85.77]).bindPopup('s').addTo(map)
    L.marker([75.07, 96.70]).bindPopup('s').addTo(map)
    L.marker([-61.99, 96.70]).bindPopup('s').addTo(map)
    L.marker([6.539999999999999, 85.77]).bindPopup('s').addTo(map)

    console.time('interpolateDline')
    const grid = dline.DrawGridWithExtrs(dots, extrs, gridSize)
    console.timeEnd('interpolateDline')

    const cellSizes = dline.cellSizes(extrs, gridSize);

    console.time('IDW')
    const IDW = dline.IDW(dots, { bbox: extrs, exponent: 1, cellSize: gridSize, units: 'degrees' });
    console.timeEnd('IDW')



  /*   for (let i = 0; i < cellSizes.latSize; i++) {
        for (let j = 0; j < cellSizes.longSize; j++) {
            L.polygon([
                [extrs[1] + (cellSizes.degreeLatCellSize * i), extrs[0] + (cellSizes.degreeLongCellSize * j)],
                [extrs[1] + (cellSizes.degreeLatCellSize * i) + cellSizes.degreeLatCellSize, extrs[0] + (cellSizes.degreeLongCellSize * j)],
                [extrs[1] + (cellSizes.degreeLatCellSize * i) + cellSizes.degreeLatCellSize, extrs[0] + (cellSizes.degreeLongCellSize * j) + cellSizes.degreeLongCellSize],
                [extrs[1] + (cellSizes.degreeLatCellSize * i), extrs[0] + (cellSizes.degreeLongCellSize * j) + cellSizes.degreeLongCellSize]
            ]).addTo(map)
        }
    }
 */

    console.time('isobandsDline')
    const bands = dline.DrawIsobandsWithCustomGrid(IDW, step, cellSizes.degreeLatCellSize, cellSizes.degreeLongCellSize, extrs[1], extrs[0], 11, 0)
    console.timeEnd('isobandsDline')

    const colors = {
        "less than 1": "#530FAD",
        "2": "#1B1BB3",
        "3": "#0B61A4",
        "4": "#00AF64",
        "5": "#67E300",
        "6": "#CCF600",
        "7": "#FFE800",
        "8": "#FFBF00",
        "9": "#FF9200",
        "10": "#FF4900",
        "more than 10": "#FF0000",
    };


    map.eachLayer(layer => {
        if (layer.options.type === "band") {
            map.removeLayer(layer)
        }
    })
    bands.features.forEach(feature => {
        L.geoJSON(feature, { color: colors[feature.properties.value], weight: 0, fillOpacity: .6, type: "band" }).bindPopup(feature.properties.value.toString()).addTo(map);
    });
}