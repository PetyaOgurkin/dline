const map = L.map('map').setView([56, 93], 11);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox/streets-v11'
}).addTo(map);

L.control.ruler().addTo(map);

const rand = (min, max) => Math.random() * (max - min) + min;

let grid;

const gridSize = 100;

const pointGrid = {
    "type": "FeatureCollection",
    "features": []
}

async function generateGrid() {

    const points = [];
    for (let i = 0; i < 20; i++) {
        points.push([rand(55.9, 56.1), rand(92.6, 93.1), rand(-1, 11)])
    }

    const srtmGrid = await fetch('./krsk.json').then(res => res.json());
    const delta = 0.000833333333;
    const minlat = 55.85;
    const minlong = 92.55;

    const mask = {
        grid: srtmGrid,
        delta,
        minlat,
        minlong
    }

    // const barriers = await fetch("./bar.json").then(res => res.json());

    console.time('IDW')
    grid = dline.IDW2(points, gridSize, { bbox: [92.6, 55.9, 93.1, 56.1], exponent: 2, units: ['meters', 'degrees'], mask, buf: 20, weightUp: [50, 0.5], weightDown: [100, 0.1] });
    console.timeEnd('IDW')


    console.log(grid);


    pointGrid.features = [];
    for (let i = 0; i < grid.grid.length; i++) {
        for (let j = 0; j < grid.grid[i].length; j++) {
            if (grid.grid[i][j]) {
                pointGrid.features.push({
                    "type": "Feature",
                    "properties": { "value": grid.grid[i][j] },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [j * grid.degreeLongCellSize + grid.bbox[0], i * grid.degreeLatCellSize + grid.bbox[1]]
                    }
                })
            }
        }
    }
}

async function srtmDline() {
    map.eachLayer(layer => {
        if (layer.options.type === "band") {
            map.removeLayer(layer)
        }
    })

    const srtmGrid = await fetch('./krsk.json').then(res => res.json());
    const delta = 0.000833333333;
    const minlat = 55.85;
    const minlong = 92.55;

    const st = {
        "type": "CustomValues",
        "values": [500, 450, 400, 380, 360, 340, 320, 300, 280, 260, 240, 220, 200, 180, 160, 140]
    }

    console.time('srtmDLINE')
    const bands = dline.DrawIsobandsWithCustomGrid(srtmGrid, st, delta, delta, minlat, minlong);
    console.timeEnd('srtmDLINE')

    const colors = {
        "less than 140": "#1240AB",
        "160": "#0B61A4",
        "180": "#009999",
        "200": "#00AE68",
        "220": "#00CC00",
        "240": "#5DE100",
        "260": "#9BED00",
        "280": "#CCF600",
        "300": "#FFFF00",
        "320": "#FFE800",
        "340": "#FFD300",
        "360": "#FFBF00",
        "380": "#FFAA00",
        "400": "#FF9200",
        "450": "#FF7100",
        "500": "#FF4900",
        "more than 500": "#FF0000",
    };

    bands.features.forEach(feature => {
        L.geoJSON(feature, { color: colors[feature.properties.value], weight: 0, fillOpacity: 0.7, type: "band" }).bindPopup(feature.properties.value.toString()).addTo(map);
    });

}

async function srtmTurf() {
    map.eachLayer(layer => {
        if (layer.options.type === "band") {
            map.removeLayer(layer)
        }
    })

    const srtmGrid = await fetch('./srtm_kras.json').then(res => res.json());
    const delta = 0.00083333333333333;
    const minLat = 60 - (4920 * delta);
    const minLong = 90 + (3240 * delta);

    const srtmPointGrid = {
        "type": "FeatureCollection",
        "features": []
    }

    for (let i = 0; i < srtmGrid.length; i++) {
        for (let j = 0; j < srtmGrid[i].length; j++) {
            if (srtmGrid[i][j]) {
                srtmPointGrid.features.push({
                    "type": "Feature",
                    "properties": { "value": srtmGrid[i][j] },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [j * delta + minLong, i * delta + minLat]
                    }
                })
            }
        }
    }

    const breaks = [0, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340, 360, 380, 400, 450, 500, 1000];

    console.time('srtmTURF')
    const bands = turf.isobands(srtmPointGrid, breaks, { zProperty: 'value' });
    console.timeEnd('srtmTURF')


    const colorsTurf = {
        "0-140": "#1240AB",
        "140-160": "#0B61A4",
        "160-180": "#009999",
        "180-200": "#00AE68",
        "200-220": "#00CC00",
        "220-240": "#5DE100",
        "240-260": "#9BED00",
        "260-280": "#CCF600",
        "280-300": "#FFFF00",
        "300-320": "#FFE800",
        "320-340": "#FFD300",
        "340-360": "#FFBF00",
        "360-380": "#FFAA00",
        "380-400": "#FF9200",
        "400-450": "#FF7100",
        "450-500": "#FF4900",
        "500-1000": "#FF0000",
    };

    bands.features.forEach(feature => {
        L.geoJSON(feature, { color: colorsTurf[feature.properties.value], weight: 0, fillOpacity: .7, type: "band" }).bindPopup(feature.properties.value.toString()).addTo(map);
    });

}

function bandsTurf() {
    map.eachLayer(layer => {
        if (layer.options.type === "band") {
            map.removeLayer(layer)
        }
    })

    const breaks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    console.time('bandsTURF')
    const bands = turf.isobands(pointGrid, breaks, { zProperty: 'value' });
    console.timeEnd('bandsTURF')

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

    bands.features.forEach(feature => {
        L.geoJSON(feature, { color: colorsTurf[feature.properties.value], weight: 0, fillOpacity: .7, type: "band" }).bindPopup(feature.properties.value.toString()).addTo(map);
    });
}

function bandsDline() {
    map.eachLayer(layer => {
        if (layer.options.type === "band") {
            map.removeLayer(layer)
        }
    })

    step = {
        "type": "CustomValues",
        "values": [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
    }



    console.time('bandsDline')
    const bands = dline.DrawIsobandsWithCustomGrid(grid.grid, step, grid.degreeLatCellSize, grid.degreeLongCellSize, grid.bbox[1], grid.bbox[0], 11, 0)
    console.timeEnd('bandsDline')


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

    bands.features.forEach(feature => {
        L.geoJSON(feature, { color: colors[feature.properties.value], weight: 0, fillOpacity: 0.7, type: "band" }).bindPopup(feature.properties.value.toString()).addTo(map);
    });


}