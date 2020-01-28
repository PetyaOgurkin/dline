import toLine from '../common/toLine';
import computeIsolines from './computeIsolines';

function isolines(grid, intervals) {
    const Isolines = [];
    const IsolinesValue = [];

    const GeoJson = {
        "type": "FeatureCollection",
        "features": []
    };

    for (let i = 0; i < intervals.length; i++) {
        const h = intervals[i];
        Isolines.push(toLine(computeIsolines(grid.grid, h)));
        IsolinesValue.push(h);
    }

    for (let i = 0; i < Isolines.length; i++) {
        for (let j = 0; j < Isolines[i].length; j++) {
            for (let k = 0; k < Isolines[i][j].length; k++) {
                // переводим координаты точек в градусы
                const tmp = Isolines[i][j][k][0] * grid.latCellSize + grid.bbox[1];
                Isolines[i][j][k][0] = Isolines[i][j][k][1] * grid.longCellSize + grid.bbox[0];
                Isolines[i][j][k][1] = tmp;
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


export { isolines }