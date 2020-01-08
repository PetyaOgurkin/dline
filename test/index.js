const map = L.map('map').setView([56.002185782874385, 92.80699768043269], 15);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox/streets-v11'
}).addTo(map);


L.control.ruler().addTo(map);


const rand = (min, max) => Math.random() * (max - min) + min;


const dots = [
    /*   [-61.99, 85.77, 0],
      [55.01, 87.82, 1],
      [58.96, 88.78, 2],
      [60.98, 90.87, 3],
      [62.00, 91.96, 4],
      [63.02, 93.07, 5],
      [65.05, 94.94, 8],
      [68.09, 95.01, 9],
      [70.07, 96.70, 11] */
]

for (let i = 0; i < 50; i++) {
    dots.push([rand(56, 56.01), rand(92.79, 92.81), rand(-1, 11)])

}


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

const gridSize = 50;


function drawTurf() {

    const options = { gridType: 'points', property: 'value', units: 'meters', weight: 2 };
    console.time('interpolateTruf')
    const grid = turf.interpolate(points, gridSize, options);
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


    console.time('IDW')
    const IDW = dline.IDW(dots, gridSize / 2, { bbox: [0, 0], exponent: 2, units: ['meters', 'meters'] });
    console.timeEnd('IDW')

    console.log(IDW);


    const lin = dline.DrawIsolinesWitchCustomGrid(IDW.grid, step, IDW.degreeLatCellSize, IDW.degreeLongCellSize, IDW.bbox[1], IDW.bbox[0], 11, 0)

    console.log(lin);


    map.eachLayer(layer => {
        if (layer.options.type === "band") {
            map.removeLayer(layer)
        }
    })
    lin.features.forEach(feature => {
        L.geoJSON(feature, { type: "band" }).bindPopup(feature.properties.value.toString()).addTo(map);
    });

    /* console.time('isobandsDline')
    const bands = dline.DrawIsobandsWithCustomGrid(IDW.grid, step, IDW.degreeLatCellSize, IDW.degreeLongCellSize, IDW.bbox[1], IDW.bbox[0], 11, 0)
    console.timeEnd('isobandsDline')

    console.log(bands);


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
    bands.GeoJson.features.forEach(feature => {
        L.geoJSON(feature, { color: colors[feature.properties.value], weight: 0, fillOpacity: 1, type: "band" }).bindPopup(feature.properties.value.toString()).addTo(map);
    });



    let cunt = -1;

    function next() {

        if (cunt === bands.chache.length - 1) return;
        cunt++;
        map.eachLayer(layer => {
            if (layer.options.type === "line") {
                map.removeLayer(layer)
            }
        })

        for (let i = 0; i < bands.chache[cunt].length; i++) {
            const nb = bands.chache[cunt][i].map(e => [...e]);
            L.polyline(nb.map(e => e.reverse()), { color: '#fff', type: "line" }).addTo(map);
        }
    }

    function prev() {

        if (cunt === 0) return;

        cunt--;
        map.eachLayer(layer => {
            if (layer.options.type === "line") {
                map.removeLayer(layer)
            }
        })

        for (let i = 0; i < bands.chache[cunt].length; i++) {
            const nb = bands.chache[cunt][i].map(e => [...e]);
            L.polyline(nb.map(e => e.reverse()), { color: '#fff', type: "line" }).addTo(map);
        }
    }

    next();

    document.querySelector('#next').addEventListener('click', next)
    document.querySelector('#prev').addEventListener('click', prev) */

}


function drawDlineBands() {
    step = {
        "type": "CustomValues",
        "values": [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
    }


    const extrs = [85.77, -61.99, 96.70, 75.07]


    console.time('IDW')
    const IDW = dline.IDW(dots, gridSize / 2, { bbox: [0, 0], exponent: 2, units: ['meters', 'meters'] });
    console.timeEnd('IDW')

    map.eachLayer(layer => {
        if (layer.options.type === "band") {
            map.removeLayer(layer)
        }
    })

    console.time('isobandsDline')
    const bands = dline.DrawIsobandsWithCustomGrid(IDW.grid, step, IDW.degreeLatCellSize, IDW.degreeLongCellSize, IDW.bbox[1], IDW.bbox[0], 11, 0)
    console.timeEnd('isobandsDline')

    console.log(bands);


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
    bands.GeoJson.features.forEach(feature => {
        L.geoJSON(feature, { color: colors[feature.properties.value], weight: 0, fillOpacity: 1, type: "band" }).bindPopup(feature.properties.value.toString()).addTo(map);
    });
}