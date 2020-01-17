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
    [56.0084, 92.7759, 1.1],
    [56.0076, 92.8122, 1.2],
    [56.0114, 92.8657, 6.2],
    [56.0277, 92.8250, 6.5],
    [56.0396, 92.8788, 3.7],
    [56.0634, 92.9461, 4.2],
    [55.9826, 92.8815, 6],
    [56.0155, 93.0041, 5.9]
]

/* for (let i = 0; i < 50; i++) {
    dots.push([rand(55.9, 56.1), rand(92.7, 93.2), rand(-1, 11)])

} */


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

const gridSize = 1000;


function drawTurf() {

    const options = { gridType: 'points', property: 'value', units: 'meters', weight: 2 };
    // console.time('interpolateTruf')
    // const grid = turf.interpolate(points, gridSize, options);
    // console.timeEnd('interpolateTruf')

    // console.log(grid);

    const breaks = [0, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340, 360, 380, 400, 450, 500, 1000];
    // const breaks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    console.time('isobandturf')
    const lines = turf.isobands(pgrid, breaks, { zProperty: 'value' });
    console.timeEnd('isobandturf')

    // console.log(lines);



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
    /* 
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
        }; */

    map.eachLayer(layer => {
        if (layer.options.type === "band") {
            map.removeLayer(layer)
        }
    })
    lines.features.forEach(feature => {
        L.geoJSON(feature, { color: colorsTurf[feature.properties.value], weight: 0, fillOpacity: .7, type: "band" }).bindPopup(feature.properties.value.toString()).addTo(map);
    });

}

function drawDline() {
    step = {
        "type": "CustomValues",
        "values": [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
    }


    map.eachLayer(layer => {
        if (layer.options.type === "band") {
            map.removeLayer(layer)
        }
    })


    console.time('IDW')
    // const IDW = dline.IDW(dots, gridSize, { bbox: [100, 100], exponent: 2, units: ['meters', 'degrees'] });
    console.timeEnd('IDW')

    console.time('dline isolines')
    // const lin = dline.DrawIsolinesWitchCustomGrid(IDW.grid, step, IDW.degreeLatCellSize, IDW.degreeLongCellSize, IDW.bbox[1], IDW.bbox[0], 11, 0)
    console.timeEnd('dline isolines')

    const st = {
        "type": "CustomValues",
        "values": [500, 450, 400, 380, 360, 340, 320, 300, 280, 260, 240, 220, 200, 180, 160, 140]
    }
    const delta = 0.00083333333333333;
    const minLat = 60 - (4920 * delta);
    const minLong = 90 + (3240 * delta);
    const Isolines = dline.DrawIsolinesWitchCustomGrid(Grid, st, delta, delta, minLat, minLong);

    Isolines.features.forEach(feature => {
        L.geoJSON(feature, { type: "band" }).bindPopup(feature.properties.value.toString()).addTo(map);
    });

}

const pgrid = {
    "type": "FeatureCollection"
};

function drawDlineBands() {
    step = {
        "type": "CustomValues",
        "values": [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
    }
    map.eachLayer(layer => {
        if (layer.options.type === "band") {
            map.removeLayer(layer)
        }
    })

    console.time('IDW')
    // const IDW = dline.IDW(dots, gridSize, { bbox: [100, 100], exponent: 2, units: ['meters', 'degrees']/* , barriers: bar */ });
    console.timeEnd('IDW')


    /*   pgrid.features = [];
      for (let i = 0; i < IDW.grid.length; i++) {
          for (let j = 0; j < IDW.grid[i].length; j++) {
              if (IDW.grid[i][j]) {
                  pgrid.features.push({
                      "type": "Feature",
                      "properties": { "value": IDW.grid[i][j] },
                      "geometry": {
                          "type": "Point",
                          "coordinates": [j * IDW.degreeLongCellSize + IDW.bbox[0], i * IDW.degreeLatCellSize + IDW.bbox[1]]
                      }
                  })
              }
          }
      } */


    const st = {
        "type": "CustomValues",
        "values": [500, 450, 400, 380, 360, 340, 320, 300, 280, 260, 240, 220, 200, 180, 160, 140]
    }
    const delta = 0.00083333333333333;
    const minLat = 60 - (4920 * delta);
    const minLong = 90 + (3240 * delta);
    console.time('isobandsDline')
    const bands = dline.DrawIsobandsWithCustomGrid(Grid, st, delta, delta, minLat, minLong);
    console.timeEnd('isobandsDline')
    // console.log(bands);


    pgrid.features = [];
    for (let i = 0; i < Grid.length; i++) {
        for (let j = 0; j < Grid[i].length; j++) {
            if (Grid[i][j]) {
                pgrid.features.push({
                    "type": "Feature",
                    "properties": { "value": Grid[i][j] },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [j * delta + minLong, i * delta + minLat]
                    }
                })
            }
        }
    }

    // console.log(pgrid);


    /* console.time('isobandsDline')
    const bands = dline.DrawIsobandsWithCustomGrid(IDW.grid, step, IDW.degreeLatCellSize, IDW.degreeLongCellSize, IDW.bbox[1], IDW.bbox[0], 11, 0)
    console.timeEnd('isobandsDline') */

    /*  pgrid.features.forEach((feature, index) => {
         if ((index > 100490 + 480 * 11 && index < 100510 + 480 * 11) ||
             (index > 100490 + 480 * 12 && index < 100510 + 480 * 12) ||
             (index > 100490 + 480 * 13 && index < 100510 + 480 * 13) ||
             (index > 100490 + 480 * 14 && index < 100510 + 480 * 14)) {
             L.geoJSON(feature, { type: "band" }).bindPopup(feature.properties.value.toString() + '-' + index.toString()).addTo(map);
         }
 
     }); */

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

    /* const colors = {
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
    }; */

    // L.geoJSON(bands.features[1], { /* color: colors[bands.features[0].properties.value], weight: 0, fillOpacity: 0.7,  */type: "band" }).bindPopup(bands.features[1].properties.value.toString()).addTo(map);

    bands.features.forEach(feature => {
        L.geoJSON(feature, { color: colors[feature.properties.value], weight: 0, fillOpacity: 0.7, type: "band" }).bindPopup(feature.properties.value.toString()).addTo(map);
    });
}




const bar = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "left": 0.5,
                "right": 0.5
            },
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [
                        92.65937805175781,
                        55.9680343620409
                    ],
                    [
                        92.75962829589844,
                        55.97764029006278
                    ],
                    [
                        92.84065246582031,
                        55.9949249504244
                    ],
                    [
                        92.93128967285156,
                        56.01757535614984
                    ],
                    [
                        92.97660827636719,
                        56.03714382224381
                    ],
                    [
                        93.00407409667969,
                        56.06743618189347
                    ],
                    [
                        93.03977966308594,
                        56.078933377711124
                    ],
                    [
                        93.06861877441405,
                        56.080849243571706
                    ],
                    [
                        93.09539794921875,
                        56.07318520852947
                    ],
                    [
                        93.11187744140625,
                        56.057469170970556
                    ],
                    [
                        93.12904357910156,
                        56.05056742320484
                    ]
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "left": 0,
                "right": 0.5,
            },
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [
                        92.6751708984375,
                        55.98071368329446
                    ],
                    [
                        92.73799896240234,
                        55.990508494407635
                    ],
                    [
                        92.79361724853516,
                        55.99991685836362
                    ],
                    [
                        92.8070068359375,
                        56.00797934776373
                    ],
                    [
                        92.80323028564452,
                        56.02179684466609
                    ],
                    [
                        92.76100158691406,
                        56.030046603476265
                    ],
                    [
                        92.7187728881836,
                        56.032732191080335
                    ],
                    [
                        92.67654418945312,
                        56.03714382224381
                    ],
                    [
                        92.66006469726562,
                        56.041171392920404
                    ]
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "left": 0,
                "right": 0.5,
            },
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [
                        92.77610778808594,
                        56.05785256518918
                    ],
                    [
                        92.8231430053711,
                        56.03695202267881
                    ],
                    [
                        92.85301208496094,
                        56.02352368423712
                    ],
                    [
                        92.89249420166016,
                        56.02582601687069
                    ],
                    [
                        92.89970397949219,
                        56.03445854159011
                    ],
                    [
                        92.90142059326172,
                        56.04385620651251
                    ],
                    [
                        92.9110336303711,
                        56.0685860558204
                    ],
                    [
                        92.91275024414061,
                        56.08487225180311
                    ],
                    [
                        92.90794372558594,
                        56.097513257245794
                    ],
                    [
                        92.89421081542969,
                        56.106704109947565
                    ]
                ]
            }
        }
    ]
}