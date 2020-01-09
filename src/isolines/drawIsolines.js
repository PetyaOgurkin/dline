import { getIsolines } from '../common/getIsolines';
import { stepOption } from '../common/stepOption';
import computeIsolines from './computeIsolines';


function drawIsolines(Grid, Step, DeltaLat, DeltaLong, Grid_Min_Lat, Grid_Min_Long, Dot_Max_Z, Dot_Min_Z) {
    const Isolines = [];
    const IsolinesValue = [];

    const GeoJson = {
        "type": "FeatureCollection",
        "features": []
    };


    const Steps = stepOption(Step, Dot_Max_Z, Dot_Min_Z);
    let h;


    for (let i = 0; i < Steps.length; i++) {

        h = Steps[i];
        Isolines.push(getIsolines(computeIsolines(Grid, h)));
        IsolinesValue.push(h);
    }

    let thrid;
    for (let i = 0; i < Isolines.length; i++) {
        for (let j = 0; j < Isolines[i].length; j++) {
            for (let k = 0; k < Isolines[i][j].length; k++) {
                // переводим координаты точек в градусы
                thrid = Isolines[i][j][k][0] * DeltaLat + Grid_Min_Lat;
                Isolines[i][j][k][0] = Isolines[i][j][k][1] * DeltaLong + Grid_Min_Long;
                Isolines[i][j][k][1] = thrid;
            }

            GeoJson.features.push({
                "type": "Feature",
                "properties": {
                    "value": IsolinesValue[i]
                },
                "geometry": {
                    "type": "LineString",
                    "coordinates": Isolines[i][j]
                }
            })
        }
    }

    return GeoJson;
}


export { drawIsolines }