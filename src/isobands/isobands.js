import toLine from '../common/toLine';
import compareBands from './compareBands';
import computeIsobands from './computeIsobands';

function isobands(grid, intervals) {
    const GeoJson = {
        "type": "FeatureCollection",
        "features": []
    };

    const Bands = [], BandsValue = [];

    let lower_h = intervals[0], upper_h = Infinity;
    Bands.push(toLine(computeIsobands(grid.grid, lower_h, upper_h)));
    BandsValue.push(intervals[0] + "<");

    for (let i = 0; i < intervals.length - 1; i++) {

        lower_h = intervals[i + 1], upper_h = intervals[i];
        Bands.push(toLine(computeIsobands(grid.grid, lower_h, upper_h)));
        BandsValue.push(lower_h + "-" + upper_h);

    }

    lower_h = -Infinity, upper_h = intervals[intervals.length - 1];
    Bands.push(toLine(computeIsobands(grid.grid, lower_h, upper_h)));
    BandsValue.push("<" + intervals[intervals.length - 1]);

    const newBands = [];

    for (let i = 0; i < Bands.length; i++) {
        newBands.push([]);
        for (let j = 0; j < Bands[i].length; j++) {
            newBands[i].push([]);
            for (let k = 0; k < Bands[i][j].length; k++) {
                newBands[i][j].push([Bands[i][j][k][1] * grid.longCellSize + grid.bbox[0], Bands[i][j][k][0] * grid.latCellSize + grid.bbox[1]])
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

export { isobands }