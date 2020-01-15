import { getIsolines } from '../common/getIsolines';
import { compareBands } from './compareBands';
import { stepOption } from '../common/stepOption';

import computeIsobands from './computeIsobands';

function drawIsobands(Grid, Step, DeltaLat, DeltaLong, Grid_Min_Lat, Grid_Min_Long, Dot_Max_Z, Dot_Min_Z) {

    const GeoJson = {
        "type": "FeatureCollection",
        "features": []
    };

    const Bands = [], BandsValue = [];

    const Steps = stepOption(Step, Dot_Max_Z, Dot_Min_Z);

    let lower_h = Steps[0], upper_h = Infinity;

    Bands.push(getIsolines(computeIsobands(Grid, lower_h, upper_h)));

    BandsValue.push("more than " + Steps[0]);

    for (let i = 0; i < Steps.length - 1; i++) {

        lower_h = Steps[i + 1], upper_h = Steps[i];

        Bands.push(getIsolines(computeIsobands(Grid, lower_h, upper_h)));
        BandsValue.push(upper_h);

    }

    lower_h = -Infinity, upper_h = Steps[Steps.length - 1];

    Bands.push(getIsolines(computeIsobands(Grid, lower_h, upper_h)));

    BandsValue.push("less than " + Steps[Steps.length - 1]);

    const newBands = [];


    let minlatbb = Infinity, maxlatbb = -Infinity
    let minlongbb = Infinity, maxlongbb = -Infinity
    const chache = [];

    for (let i = 0; i < Bands.length; i++) {
        newBands.push([]);
        for (let j = 0; j < Bands[i].length; j++) {
            newBands[i].push([]);
            for (let k = 0; k < Bands[i][j].length; k++) {
                if (k > 0 && k < Bands[i][j].length - 1) {
                    if ((Bands[i][j][k][0] === Bands[i][j][k + 1][0] && Bands[i][j][k][0] === Bands[i][j][k - 1][0]) ||
                        (Bands[i][j][k][1] === Bands[i][j][k + 1][1] && Bands[i][j][k][1] === Bands[i][j][k - 1][1])) {

                        if (Bands[i][j][k][0] < minlatbb) minlatbb = Bands[i][j][k][0];
                        if (Bands[i][j][k][0] > maxlatbb) maxlatbb = Bands[i][j][k][0];
                        if (Bands[i][j][k][1] < minlongbb) minlongbb = Bands[i][j][k][1];
                        if (Bands[i][j][k][1] > maxlongbb) maxlongbb = Bands[i][j][k][1];

                        continue;
                    }
                }


                newBands[i][j].push([Bands[i][j][k][1] * DeltaLong + Grid_Min_Long, Bands[i][j][k][0] * DeltaLat + Grid_Min_Lat])
            }
        }
    }



    for (let i = 0; i < newBands.length; i++) {

        GeoJson.features.push({
            "type": "Feature",
            "properties": {
                "value": BandsValue[i]
            },
            "geometry": {
                "type": "MultiPolygon",
                "coordinates": compareBands(newBands[i])
            }
        })
    }

    return GeoJson;
}

export { drawIsobands }

