import { getIsolines } from '../common/getIsolines';
import { findIsobands } from './findIsobands';
import { compareBands } from './compareBands';
import { stepOption } from '../common/stepOption';
import { simplify } from '../common/simplify';
import { divideBands } from './divideBands';
import { bezier } from '../common/bezierInterpolation';

function drawIsobands(Grid, Step, DeltaLat, DeltaLong, Grid_Min_Lat, Grid_Min_Long, Dot_Max_Z, Dot_Min_Z) {
    // четность/нечетность маски (чтобы не вылететь за пределы)
    const LongFinish = Grid[0].length % 2 === 0 ? 1 : 0,
        LatFinish = Grid.length % 2 === 0 ? 1 : 0;

    const GeoJson = {
        "type": "FeatureCollection",
        "features": []
    };

    const Bands = [], BandsValue = [];

    const Steps = stepOption(Step, Dot_Max_Z, Dot_Min_Z);

    let lower_h = Steps[0], upper_h = Infinity;

    Bands.push(getIsolines(findIsobands(Grid, lower_h, upper_h, LongFinish, LatFinish), Grid[0].length - 0.5, Grid.length - 0.5));

    BandsValue.push("more than " + Steps[0]);

    for (let i = 0; i < Steps.length - 1; i++) {


        lower_h = Steps[i + 1], upper_h = Steps[i];
        Bands.push(getIsolines(findIsobands(Grid, lower_h, upper_h, LongFinish, LatFinish), Grid[0].length - 0.5, Grid.length - 0.5));
        BandsValue.push(upper_h);

    }

    lower_h = -Infinity, upper_h = Steps[Steps.length - 1];
    Bands.push(getIsolines(findIsobands(Grid, lower_h, upper_h, LongFinish, LatFinish), Grid[0].length - 0.5, Grid.length - 0.5));
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

    const bbox = [
        minlongbb * DeltaLong + Grid_Min_Long,
        minlatbb * DeltaLat + Grid_Min_Lat,
        maxlongbb * DeltaLong + Grid_Min_Long,
        maxlatbb * DeltaLat + Grid_Min_Lat
    ]



    for (let i = 0; i < newBands.length; i++) chache.push([]);


    for (let i = 0; i < newBands.length; i++) {
        /* for (let j = 0; j < newBands[i].length; j++) {

            const dividedBands = divideBands(newBands[i][j], bbox);

            if (i > 0) {
                if (chache[i - 1].length > 0) {
                    chacheCheck(dividedBands, chache[i - 1])
                }
            }

            dividedBands.forEach((line, idx) => {
                if (line.length > 1) {
                    if (line[line.length - 1] === 'from chache') {
                        line.splice(line.length - 1, 1);
                    } else {
                        dividedBands[idx] = [...bezier(simplify(line, (DeltaLong) / 50000))]
                        chache[i].push([...dividedBands[idx]])
                    }
                }
            })

            newBands[i][j] = []
            dividedBands.forEach(line => {
                newBands[i][j].push(...line);
            })
        } */


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


    return { GeoJson, chache };
}

export { drawIsobands }



function chacheCheck(src, chache) {
    for (let i = 0; i < src.length; i++) {
        for (let j = 0; j < chache.length; j++) {

            if (src[i].length > 1) {

                // equal
                if (src[i][0][0] === chache[j][0][0] && src[i][0][1] === chache[j][0][1]) {
                    src[i] = [...chache[j]]
                    src[i].push('from chache')
                }

                // reverse
                if (src[i][0][0] === chache[j][chache[j].length - 1][0] && src[i][0][1] === chache[j][chache[j].length - 1][1]) {
                    src[i] = [...chache[j].reverse()]
                    src[i].push('from chache')
                }
            }
        }
    }
}