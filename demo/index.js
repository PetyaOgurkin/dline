/* const map = L.map('map').setView([56, 93], 11);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox/streets-v11'
}).addTo(map);

const rand = (min, max) => Math.random() * (max - min) + min;

const gridSize = 1500;

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
    const bands = dline.isobands(grid, [0.05, 0.1, 0.15, 0.2, 0.3, 0.6])
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
    const bands = dline.isobands(grid, [140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340, 360, 380, 400, 450, 500]);
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
    for (let i = 0; i < 250; i++) {
        points.push([rand(55.9, 56.1), rand(92.6, 93.1), rand(0, 1)])
    }

    // const breaks = [0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.10, 0.11, 0.12, 0.13, 0.14, 0.15, 0.16, 0.17, 0.18, 0.19, 0.20, 0.21, 0.22, 0.23, 0.24, 0.25, 0.26, 0.27, 0.28, 0.29, 0.30, 0.31, 0.32, 0.33, 0.34, 0.35, 0.36, 0.37, 0.38, 0.39, 0.40, 0.41, 0.42, 0.43, 0.44, 0.45, 0.46, 0.47, 0.48, 0.49, 0.50, 0.51, 0.52, 0.53, 0.54, 0.55, 0.56, 0.57, 0.58, 0.59, 0.60, 0.61, 0.62, 0.63, 0.64, 0.65, 0.66, 0.67, 0.68, 0.69, 0.70, 0.71, 0.72, 0.73, 0.74, 0.75, 0.76, 0.77, 0.78, 0.79, 0.80, 0.81, 0.82, 0.83, 0.84, 0.85, 0.86, 0.87, 0.88, 0.89, 0.90, 0.91, 0.92, 0.93, 0.94, 0.95, 0.96, 0.97, 0.98, 0.99, 1];


    const breaks = [0.05, 0.1, 0.15, 0.2, 0.3, 0.6];

    const g = dline.IDW(points, gridSize, { exponent: 4, units: ['meters', 'degrees'] })

    console.time('bands')
    const bands = dline.isobands(g, breaks)
    console.timeEnd('bands')

    const c = ["fc0102", "fa0204", "f80307", "f60409", "f4050c", "f2060e", "f00711", "ee0813", "ec0a15", "ea0b18", "e70c1a", "e50d1d", "e30e1f", "e10f22", "df1024", "dd1126", "db1329", "d9142b", "d7152e", "d41630", "d21733", "d01835", "ce1937", "cc1a3a", "ca1c3c", "c81d3f", "c61e41", "c41f44", "c22046", "c02148", "bd224b", "bb234d", "b92450", "b72652", "b52755", "b32857", "b12959", "af2a5c", "ad2b5e", "aa2c61", "a82d63", "a62f66", "a43068", "a2316a", "a0326d", "9e336f", "9c3472", "9a3574", "983677", "953879", "93397b", "913a7e", "8f3b80", "8d3c83", "8b3d85", "893e88", "873f8a", "85408c", "83428f", "804391", "7e4494", "7c4596", "7a4699", "78479b", "76489d", "7449a0", "724ba2", "704ca5", "6e4da7", "6b4eaa", "694fac", "6750ae", "6551b1", "6352b3", "6154b6", "5f55b8", "5d56bb", "5b57bd", "5958bf", "5659c2", "545ac4", "525bc7", "505cc9", "4e5ecc", "4c5fce", "4a60d0", "4861d3", "4662d5", "4463d8", "4164da", "3f65dd", "3d67df", "3b68e1", "3969e4", "376ae6", "356be9", "336ceb", "316dee", "2f6ef0", "2c70f3"];

    const cout = {};
    for (let i = 0; i < breaks.length - 1; i++) {

        cout[breaks[i] + "-" + breaks[i + 1]] = "#" + c[i];
    }

    console.log(cout);




    const cout = {
        "<0.05": "#00CC00",
        "0.05-0.1": "#FFFF00",
        "0.1-0.15": "#FFAA00",
        "0.15-0.2": "#FF1300",
        "0.2-0.3": "#C30083",
        "0.3-0.6": "#2C17B1",
        "0.6<": "#000000"
    };

    bands.features.forEach((feature, idx) => {
        L.geoJSON(feature, { color: cout[feature.properties.value], weight: 0, fillOpacity: 0.7, type: "band" }).bindPopup(feature.properties.value.toString()).addTo(map);
    });

    g.toGeoJson().features.forEach((feature, idx) => {
        L.geoJSON(feature, { type: "band" }).bindPopup(feature.properties.value.toString()).addTo(map);
    });
} */



const map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png'
            }),
        })
    ],
    view: new ol.View({
        center: ol.proj.transform([92.765433, 56.029337], 'EPSG:4326', 'EPSG:3857'),
        zoom: 12
    })
});


async function go() {


    map.getLayers().forEach(function (layer) {
        if (layer.values_.name === 'band')
            map.removeLayer(layer);
    });

    const rand = (min, max) => Math.random() * (max - min) + min;

    const points = [];
    for (let i = 0; i < 50; i++) {
        points.push([rand(55.9, 56.1), rand(92.6, 93.1), rand(0, 0.32)])
    }

    // const breaks = [0.05, 0.1, 0.15, 0.2, 0.3, 0.6];

    /*   const cout = {
          "<0.05": "#00CC00",
          "0.05-0.1": "#FFFF00",
          "0.1-0.15": "#FFAA00",
          "0.15-0.2": "#FF1300",
          "0.2-0.3": "#C30083",
          "0.3-0.6": "#2C17B1",
          "0.6<": "#000000"
      }; */

    /*  const breaks = [0, 0.0500, 0.0525, 0.0550, 0.0575, 0.0600, 0.0625, 0.0650, 0.0675, 0.0700, 0.0725, 0.0750, 0.0775, 0.0800, 0.0825, 0.0850, 0.0875, 0.0900, 0.0925, 0.0950, 0.0975, 0.1000, 0.1025, 0.1050, 0.1075, 0.1100, 0.1125, 0.1150, 0.1175, 0.1200, 0.1225, 0.1250, 0.1275, 0.1300, 0.1325, 0.1350, 0.1375, 0.1400, 0.1425, 0.1450, 0.1475, 0.1500, 0.1525, 0.1550, 0.1575, 0.1600, 0.1625, 0.1650, 0.1675, 0.1700, 0.1725, 0.1750, 0.1775, 0.1800, 0.1825, 0.1850, 0.1875, 0.1900, 0.1925, 0.1950, 0.1975, 0.2000, 0.2050, 0.2100, 0.2150, 0.2200, 0.2250, 0.2300, 0.2350, 0.2400, 0.2450, 0.2500, 0.2550, 0.2600, 0.2650, 0.2700, 0.2750, 0.2800, 0.2850, 0.2900, 0.2950, 0.3000, 0.3150, 0.3300, 0.3450, 0.3600, 0.3750, 0.3900, 0.4050, 0.4200, 0.4350, 0.4500, 0.4650, 0.4800, 0.4950, 0.5100, 0.5250, 0.5400, 0.5550, 0.5700, 0.5850, 0.6000, 1];
     const colors = ["0c9c63", "199f60", "26a35e", "33a65b", "3faa59", "4cad56", "59b154", "65b451", "72b84f", "7fbb4c", "8cbe49", "a5c544", "b2c942", "bfcc3f", "ccd03d", "d8d33a", "f2da35", "ffde32",
         "ffd733", "ffd333", "ffd033", "ffc932", "ffc533", "ffc233", "ffbe33", "ffbb33", "ffb833", "ffb433", "ffb133", "ffad33", "ffa633", "ffa333", "ff9f33", "ff9c33", "ff9833",
         "f98933", "f78233", "f47a33", "ef6b32", "ed6333", "ea5b33", "e85433", "e54c33", "e24433", "e03d33", "dd3533", "db2d33", "d61e33", "d31633", "d10f33", "ce0733", "cc0033",
         "c1003d", "bc0042", "b70047", "ad0051", "a80056", "a3005b", "9e0060", "990065", "93006b", "8e0070", "890075", "84007a", "7f007f", "7a0084", "750089", "70008e", "6b0093", "650099",
         "68008d", "6a0081", "6d0075", "6e006f", "6f0069", "700063", "72005e", "730058", "740052", "75004c", "760046", "780040", "79003a", "7a0034", "7b002e", "7c0028", "7e0022",
         "71001f", "6b001d", "64001c", "580018", "510016", "4b0015", "450013", "3f0011", "38000f", "32000e", "2c000c", "1f0008", "190006", "120005"]
 
 
     const cout = {
         "<0.05": "#0c9c63",
         "0.6<": "#060001",
     };
     for (let i = 0; i < breaks.length - 1; i++) {
 
         cout[breaks[i] + "-" + breaks[i + 1]] = "#" + colors[i];
     } */

    // console.time('req')
    // const mask = dline.ascToArray(await fetch('./krs_cut.asc').then(res => res.text()));
    // console.timeEnd('req')

    const g = dline.IDW(points, 100, { exponent: 2, units: ['meters', 'degrees'] }, 30)

    console.log(g);

    console.time('srtm')
    const bands = dline.isobands(g, [0, 0.02, 0.04, 0.06, 0.08, 0.1, 0.12, 0.14, 0.16, 0.18, 0.2, 0.22, 0.24, 0.26, 0.28, 0.3]);
    console.timeEnd('srtm')

    console.log(bands);


    const cout = {
        "<0": "#1240AB",
        "0-0.02": "#0B61A4",
        "0.02-0.04": "#009999",
        "0.04-0.06": "#00AE68",
        "0.06-0.08": "#00CC00",
        "0.08-0.1": "#5DE100",
        "0.1-0.12": "#9BED00",
        "0.12-0.14": "#CCF600",
        "0.14-0.16": "#FFFF00",
        "0.16-0.18": "#FFE800",
        "0.18-0.2": "#FFD300",
        "0.2-0.22": "#FFBF00",
        "0.22-0.24": "#FFAA00",
        "0.24-0.26": "#FF9200",
        "0.26-0.28": "#FF7100",
        "0.28-0.3": "#FF4900",
        "0.3<": "#FF0000",
    };






    /* console.time('IDW with mask')
    const idw = dline.IDW(points, 700, { bbox: [10, 10], exponent: 3, units: ['meters', 'degrees'], mask, boundaries: [[20, 0.2], [-50, 0.1]] });
    console.timeEnd('IDW with mask')
 */
    /*   console.time('IDW')
      const idw = dline.IDW(points, 700, { bbox: [10, 10], exponent: 3, units: ['meters', 'degrees'], });
      console.timeEnd('IDW')
   */
    /* console.time('asd');
    // const bands = turf.isobands(idw, breaks, { zProperty: 'value' });
    const bands = dline.isobands(idw, breaks);
    console.timeEnd('asd'); */

    let vectorSourceP = new ol.source.Vector({
        features: (new ol.format.GeoJSON({
            featureProjection: 'EPSG:3857',
            dataProjection: 'EPSG:4326'
        })).readFeatures(bands)
    })

    let vectorLayerP = new ol.layer.Vector({
        source: vectorSourceP,
        name: 'band'
    });

    vectorLayerP.setOpacity(0.7)
    vectorLayerP.setStyle((e) => new ol.style.Style({
        fill: new ol.style.Fill({ color: cout[e.values_.value] }),
        stroke: new ol.style.Stroke({ width: 0, color: cout[e.values_.value] })
    }))

    /*  let sP = new ol.source.Vector({
         features: (new ol.format.GeoJSON({
             featureProjection: 'EPSG:3857',
             dataProjection: 'EPSG:4326'
         })).readFeatures(idw.toGeoJson())
     })
 
     let lP = new ol.layer.Vector({
         source: sP,
         name: 'band'
     }); */

    map.addLayer(vectorLayerP);
    // map.addLayer(lP);
}


const exp = 4;
const si = 100;


async function bandsWithMask() {
    map.getLayers().forEach(function (layer) {
        if (layer.values_.name === 'band')
            map.removeLayer(layer);
    });

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
    const grid = dline.IDW(points, si, { bbox: [10, 10], exponent: exp, units: ['meters', 'meters'], mask, boundaries: [[20, 0.2], [-50, 0.1]] });
    console.timeEnd('IDW with mask')

    console.time('bands')
    const bands = dline.isobands(grid, [0.05, 0.1, 0.15, 0.2, 0.3, 0.6])
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

    let vectorSourceP = new ol.source.Vector({
        features: (new ol.format.GeoJSON({
            featureProjection: 'EPSG:3857',
            dataProjection: 'EPSG:4326'
        })).readFeatures(bands)
    })

    let vectorLayerP = new ol.layer.Vector({
        source: vectorSourceP,
        name: 'band'
    });

    vectorLayerP.setOpacity(0.7)
    vectorLayerP.setStyle((e) => new ol.style.Style({
        fill: new ol.style.Fill({ color: colors[e.values_.value] }),
        stroke: new ol.style.Stroke({ width: 0, color: colors[e.values_.value] })
    }))

    map.addLayer(vectorLayerP);

}


async function srtm() {
    map.getLayers().forEach(function (layer) {
        if (layer.values_.name === 'band')
            map.removeLayer(layer);
    });

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

    // const mask = dline.ascToArray(await fetch('./krs_cut.asc').then(res => res.text()));

    console.time('IDW with mask')
    const grid = dline.IDW(points, si, { bbox: [10, 10], exponent: exp, units: ['meters', 'meters'] });
    console.timeEnd('IDW with mask')

    console.time('bands')
    const bands = dline.isobands(grid, [0.05, 0.1, 0.15, 0.2, 0.3, 0.6])
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

    let vectorSourceP = new ol.source.Vector({
        features: (new ol.format.GeoJSON({
            featureProjection: 'EPSG:3857',
            dataProjection: 'EPSG:4326'
        })).readFeatures(bands)
    })

    let vectorLayerP = new ol.layer.Vector({
        source: vectorSourceP,
        name: 'band'
    });

    vectorLayerP.setOpacity(0.7)
    vectorLayerP.setStyle((e) => new ol.style.Style({
        fill: new ol.style.Fill({ color: colors[e.values_.value] }),
        stroke: new ol.style.Stroke({ width: 0, color: colors[e.values_.value] })
    }))

    map.addLayer(vectorLayerP);

}


async function srtm2() {
    map.getLayers().forEach(function (layer) {
        if (layer.values_.name === 'band')
            map.removeLayer(layer);
    });

    console.time('convert')
    const grid = dline.ascToArray(await fetch('./ac_2019.asc').then(res => res.text()));
    console.timeEnd('convert')

    const rr = [100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340, 360, 380, 400, 420, 440, 460, 480, 500, 520, 540, 560, 580, 600, 620, 640, 660, 680, 700];
    const r2 = [270, 300, 330, 360, 390, 420, 450, 480, 510, 540, 570, 600, 630, 660, 690, 720, 750, 780, 810, 840, 870, 900];

    console.time('srtm')
    const bands = dline.isobands(grid, r2);
    console.timeEnd('srtm')

    const colors = generateScheme(r2);




    /* const colors = {
        "<100": "#0B61A4",
        "100-120": "#0776A0",
        "120-140": "#009999",
        "140-160": "#00A480",
        "160-180": "#00AF64",
        "180-200": "#00B945",
        "200-220": "#00C90D",
        "220-240": "#3BDA00",
        "240-260": "#62E200",
        "260-280": "#84E900",
        "280-300": "#9BED00",
        "300-320": "#B4F200",
        "320-340": "#C9F600",
        "340-360": "#E2FA00",
        "360-380": "#FFFD00",
        "380-400": "#FFEF00",
        "400-420": "#FFE500",
        "420-440": "#FFDD00",
        "440-460": "#FFD200",
        "460-480": "#FFC700",
        "480-500": "#FFBE00",
        "500-520": "#FFB600",
        "520-540": "#FFA900",
        "540-560": "#FF9C00",
        "560-580": "#FF9000",
        "580-600": "#FF8500",
        "600-620": "#FF7100",
        "620-640": "#FF5F00",
        "640-660": "#FF4500",
        "660-680": "#FF2300",
        "680-700": "#FD0006",
        "700<": "#EF002A",
    }; */
    console.log(colors);

    let vectorSourceP = new ol.source.Vector({
        features: (new ol.format.GeoJSON({
            featureProjection: 'EPSG:3857',
            dataProjection: 'EPSG:4326'
        })).readFeatures(bands)
    })

    let vectorLayerP = new ol.layer.Vector({
        source: vectorSourceP,
        name: 'band'
    });

    vectorLayerP.setOpacity(0.7)
    vectorLayerP.setStyle((e) => new ol.style.Style({
        fill: new ol.style.Fill({ color: colors[e.values_.value] }),
        stroke: new ol.style.Stroke({ width: 0, color: colors[e.values_.value] })
    }))

    map.addLayer(vectorLayerP);

}


async function srtm3() {
    map.getLayers().forEach(function (layer) {
        if (layer.values_.name === 'band')
            map.removeLayer(layer);
    });

    console.time('convert')
    const grid = dline.ascToArray(await fetch('./ac_2019.asc').then(res => res.text()));
    console.timeEnd('convert')

    const rr = [100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340, 360, 380, 400, 420, 440, 460, 480, 500, 520, 540, 560, 580, 600, 620, 640, 660, 680, 700];
    const r2 = [270, 300, 330, 360, 390, 420, 450, 480, 510, 540, 570, 600, 630, 660, 690, 720, 750, 780, 810, 840, 870, 900];

    console.time('srtm')
    const bands = dline.isolines(grid, r2);
    console.timeEnd('srtm')

    console.log(bands);

    const colors = generateScheme(r2);


    /* const colors = {
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
    }; */

    let vectorSourceP = new ol.source.Vector({
        features: (new ol.format.GeoJSON({
            featureProjection: 'EPSG:3857',
            dataProjection: 'EPSG:4326'
        })).readFeatures(bands)
    })

    let vectorLayerP = new ol.layer.Vector({
        source: vectorSourceP,
        name: 'band'
    });

    vectorLayerP.setOpacity(0.7)
    vectorLayerP.setStyle((e) => new ol.style.Style({
        fill: new ol.style.Fill({ color: "#000" }),
        stroke: new ol.style.Stroke({ width: 0, color: "#0000FF" }),
        /* text: new ol.style.Text({
            font: "8px sans-serif",
            text: e.values_.value.toString(),
            fill: new ol.style.Fill({ color: "#000" }),
            stroke: new ol.style.Stroke({ width: 0, color: "#fff" }),

        }) */
    }))

    map.addLayer(vectorLayerP);

}


function GenerateColor(colorStart, colorEnd, colorCount) {
    // The beginning of your gradient
    var start = [
        colorStart.split(',')[0].split('rgb(')[1],
        colorStart.split(',')[1],
        colorStart.split(',')[2].split(')')[0],
    ]
    // The end of your gradient
    var end = [
        colorEnd.split(',')[0].split('rgb(')[1],
        colorEnd.split(',')[1],
        colorEnd.split(',')[2].split(')')[0],
    ];
    // The number of colors to compute
    var len = colorCount - 1;
    //Alpha blending amount
    var alpha = 0.0;
    var saida = [];
    saida.push(colorEnd);
    for (let i = 0; i < len; i++) {
        var c = [];
        alpha += (1.0 / len);
        c[0] = (start[0] * alpha + (1 - alpha) * end[0]).toFixed(0);
        c[1] = (start[1] * alpha + (1 - alpha) * end[1]).toFixed(0);
        c[2] = (start[2] * alpha + (1 - alpha) * end[2]).toFixed(0);
        saida.push(`rgb(${c[0]},${c[1]},${c[2]})`);
    }
    return saida;
};


function generateScheme(range) {



    const c1 = GenerateColor('rgb(59,218,0)', 'rgb(255,255,0)', 7);
    c1.splice(c1.length, 1)

    const c2 = GenerateColor('rgb(15,77,168)', 'rgb(59,218,0)', 9);
    c2.splice(c2.length, 1)

    const c3 = GenerateColor('rgb(104,11,171)', 'rgb(15,77,168)', 6);

    console.log(c1, c2, c3);




    const clrs = [...c1, ...c2, ...c3];

    console.log(clrs);


    const out = {};

    out['<' + range[0]] = clrs[0];

    for (let i = 0; i < range.length - 1; i++) {
        out[range[i] + '-' + range[i + 1]] = clrs[i];
    }

    out[range[range.length - 1] + '<'] = clrs[clrs.length - 1];


    return out;

}
