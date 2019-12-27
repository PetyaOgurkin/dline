import { getIsolines } from '../common/getIsolines';
import { findIsobands } from './findIsobands';
import { compareBands } from './compareBands';
import { stepOption } from '../common/stepOption';

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

    Bands.push(getIsolines(findIsobands(Grid, lower_h, upper_h, LongFinish, LatFinish)));

    BandsValue.push("more than " + Steps[0]);

    for (let i = 0; i < Steps.length - 1; i++) {
        lower_h = Steps[i + 1], upper_h = Steps[i];
        Bands.push(getIsolines(findIsobands(Grid, lower_h, upper_h, LongFinish, LatFinish)));
        BandsValue.push(upper_h);
    }

    lower_h = -Infinity, upper_h = Steps[Steps.length - 1];
    Bands.push(getIsolines(findIsobands(Grid, lower_h, upper_h, LongFinish, LatFinish)));
    BandsValue.push("less than " + Steps[Steps.length - 1]);

    let thrid;
    for (let i = 0; i < Bands.length; i++) {
        for (let j = 0; j < Bands[i].length; j++) {
            for (let k = 0; k < Bands[i][j].length; k++) {
                // переводим координаты точек в градусы
                thrid = Bands[i][j][k][0] * DeltaLat + Grid_Min_Lat;
                Bands[i][j][k][0] = Bands[i][j][k][1] * DeltaLong + Grid_Min_Long;
                Bands[i][j][k][1] = thrid;
            }
        }
    }

    for (let i = 0; i < Bands.length; i++) {
        GeoJson.features.push({
            "type": "Feature",
            "properties": {
                "value": BandsValue[i]
            },
            "geometry": {
                "type": "MultiPolygon",
                "coordinates": compareBands(Bands[i])
            }
        })
    }

    return GeoJson;
}

export { drawIsobands }