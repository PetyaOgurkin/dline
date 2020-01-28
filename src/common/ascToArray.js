import toGeoJson from './toGeoJson'

function ascToArray(asc) {
    const out = [];
    const grid = asc.split('\n');

    let idx = 0;
    let cols, rows, minLat, minLong, cellsize;

    let splt = grid[idx].split(' ');
    while (splt[0] !== 'NODATA_value') {

        switch (splt[0]) {
            case 'ncols': cols = +splt[splt.length - 1]; break;
            case 'nrows': rows = +splt[splt.length - 1]; break;
            case 'xllcorner': minLong = +splt[splt.length - 1]; break;
            case 'yllcorner': minLat = +splt[splt.length - 1]; break;
            case 'cellsize': cellsize = +splt[splt.length - 1]; break;
            default:
                break;
        }
        idx++;
        splt = grid[idx].split(' ');
    }

    splt = grid[idx].split(' ');
    const noData = +splt[splt.length - 1];

    for (let i = idx + 1; i < grid.length - 1; i++) {
        out.push([]);
        const line = grid[i].split(' ');
        line.forEach(e => {
            if (e !== '') {
                out[out.length - 1].push(+e);
            }
        })
    }

    return {
        grid: out.reverse(),
        latCellSize: cellsize,
        longCellSize: cellsize,
        bbox: [
            minLong,
            minLat,
            minLong + cols * cellsize,
            minLat + rows * cellsize
        ],
        noData,
        toGeoJson
    }
}


export { ascToArray }