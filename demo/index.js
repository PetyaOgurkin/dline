const map = L.map('map').setView([56, 93], 11);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox/streets-v11'
}).addTo(map);

const rand = (min, max) => Math.random() * (max - min) + min;

const gridSize = 500;

async function bandsWithMask() {
    map.eachLayer(layer => {
        if (layer.options.type === "band") {
            map.removeLayer(layer)
        }
    })

    const points = [
        [55.986571, 92.762222, 0.0747704775481111],
        [56.0293, 92.76537, 0.213907208633093],
        [56.0987, 92.7427, 0.194830447761194],
        [55.986571, 92.762222, 0.0780714346895075],
        [55.997332, 92.777325, 0.0329284796573876],
        [56.013546, 92.877796, 0.195634773722628],
        [56.07743, 92.70456, 0.18732241900648],
        [56.00772, 92.82126, 0.226432948717949],
        [56.044, 92.72676, 0.172057313432836],
        [56.081751, 93.084937, 0.0836207620416966],
        [56.02562, 92.86059, 0.1409071682044],
        [56.089951, 92.859047, 0.106069063829787],
        [56.057395, 92.857812, 0.247632416725726],
        [56.01204, 92.97329, 0.136497572254335],
        [56.02594, 92.79871, 0.215188414192614],
        [55.978387, 92.677273, 0.065931373937677]
    ];
    // points.forEach(p => L.marker([p[0], p[1]]).bindPopup(p[2].toString()).addTo(map))

    const mask = dline.ascToArray(await fetch('./krs_cut.asc').then(res => res.text()));

    console.time('IDW with mask')
    const grid = dline.IDW(points, gridSize, { bbox: [10, 10], exponent: 3, units: ['meters', 'degrees'], mask, boundaries: [[20, 0.2], [-50, 0.1]] });
    console.timeEnd('IDW with mask')

    console.time('bands')
    const bands = dline.isobands(grid, [0.6, 0.3, 0.2, 0.15, 0.1, 0.05])
    console.timeEnd('bands')


    const colors = {
        "<0.05": "#34D800",
        "0.05-0.1": "#FFFF00",
        "0.1-0.15": "#FF9000",
        "0.15-0.2": "#FF0700",
        "0.2-0.3": "#A101A6",
        "0.3-0.6": "#4A11AE",
        "0.6<": "#090974",
    };

    bands.features.forEach(feature => {
        L.geoJSON(feature, { color: colors[feature.properties.value], weight: 0, fillOpacity: 0.7, type: "band" }).bindPopup(feature.properties.value.toString()).addTo(map);
    });
}

async function srtm() {
    map.eachLayer(layer => {
        if (layer.options.type === "band") {
            map.removeLayer(layer)
        }
    })

    console.time('convert')
    const grid = dline.ascToArray(await fetch('./krs_cut.asc').then(res => res.text()));
    console.timeEnd('convert')

    console.time('srtm')
    const bands = dline.isobands(grid, [500, 450, 400, 380, 360, 340, 320, 300, 280, 260, 240, 220, 200, 180, 160, 140]);
    console.timeEnd('srtm')

    const colors = {
        "<140": "#1240AB",
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
        "500<": "#FF0000",
    };

    bands.features.forEach(feature => {
        L.geoJSON(feature, { color: colors[feature.properties.value], weight: 0, fillOpacity: 0.7, type: "band" }).bindPopup(feature.properties.value.toString()).addTo(map);
    });

}

function bands() {
    map.eachLayer(layer => {
        if (layer.options.type === "band") {
            map.removeLayer(layer)
        }
    })

    const points = [];
    for (let i = 0; i < 20; i++) {
        points.push([rand(55.9, 56.1), rand(92.6, 93.1), rand(0, 0.7)])
    }

    console.time('bands')
    const bands = dline.isobands(dline.IDW(points, gridSize), [0.6, 0.3, 0.2, 0.15, 0.1, 0.05])
    console.timeEnd('bands')

    const colors = {
        "<0.05": "#34D800",
        "0.05-0.1": "#FFFF00",
        "0.1-0.15": "#FF9000",
        "0.15-0.2": "#FF0700",
        "0.2-0.3": "#A101A6",
        "0.3-0.6": "#4A11AE",
        "0.6<": "#090974",
    };

    bands.features.forEach(feature => {
        L.geoJSON(feature, { color: colors[feature.properties.value], weight: 0, fillOpacity: 0.7, type: "band" }).bindPopup(feature.properties.value.toString()).addTo(map);
    });
}