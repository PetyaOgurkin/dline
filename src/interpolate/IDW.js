import cellSizes from './cellSizes';
import distance from './distance';
import optionsParser from './optionsParser';

function IDW(points, cellSize, options = {}) {

    const { bbox, units, exponent, mask, weightUp, weightDown } = optionsParser(options, points);

    const { latSize, longSize, degreeLatCellSize, degreeLongCellSize } = cellSizes(bbox, cellSize, units[0]);

    let grid;
    if (units[1] === 'degrees') {
        if (mask) {
            grid = calculate(caseWithMaskDegrees, getPointsForDegreesGrid(points));
        } else {
            grid = calculate(caseWithoutMaskDegrees, getPointsForDegreesGrid(points));
        }
    } else if (units[1] === 'meters') {
        if (mask) {
            grid = calculate(caseWithMaskMeters, points);
        } else {
            grid = calculate(caseWithoutMaskMeters, points);
        }
    } else {
        throw new Error('как такое вообще возможно?')
    }

    return { grid, degreeLatCellSize, degreeLongCellSize, bbox }

    function calculate(theCase, points) {
        const grid = [];
        for (let i = 0; i < latSize; i++) {
            grid[i] = [];
            for (let j = 0; j < longSize; j++) {
                grid[i][j] = theCase(points, i, j);
            }
        }
        return grid
    }

    function caseWithMaskDegrees(points, i, j) {
        const cellCenter = [i + 0.5, j + 0.5];
        let top = 0, bot = 0;

        points.forEach((point, index) => {
            const weight = getWeight(i, j, index);
            const d = Math.sqrt(((cellCenter[0] - point[0]) ** 2 + (cellCenter[1] - point[1]) ** 2));
            top += point[2] / d ** (exponent + weight);
            bot += 1 / d ** (exponent + weight);
        })
        return top / bot;
    }

    function caseWithoutMaskDegrees(points, i, j) {
        const cellCenter = [i + 0.5, j + 0.5];
        let top = 0, bot = 0;

        points.forEach(point => {
            const d = Math.sqrt(((cellCenter[0] - point[0]) ** 2 + (cellCenter[1] - point[1]) ** 2));
            top += point[2] / d ** exponent;
            bot += 1 / d ** exponent;
        })
        return top / bot;
    }

    function caseWithMaskMeters(points, i, j) {
        const cellCenter = [bbox[1] + (i + 0.5) * degreeLatCellSize, bbox[0] + (j + 0.5) * degreeLongCellSize];
        let top = 0, bot = 0;

        points.forEach((point, index) => {
            const weight = getWeight(i, j, index);
            const d = distance(point, cellCenter);
            top += point[2] / d ** (exponent + weight);
            bot += 1 / d ** (exponent + weight);
        })
        return top / bot;
    }

    function caseWithoutMaskMeters(points, i, j) {
        const cellCenter = [bbox[1] + (i + 0.5) * degreeLatCellSize, bbox[0] + (j + 0.5) * degreeLongCellSize];
        let top = 0, bot = 0;

        points.forEach(point => {
            const d = distance(point, cellCenter);
            top += point[2] / d ** exponent;
            bot += 1 / d ** exponent;
        })
        return top / bot;
    }

    function getPointsForDegreesGrid(points) {
        return points.map(point => [
            Math.abs(bbox[1] - point[0]) / degreeLatCellSize,
            Math.abs(bbox[0] - point[1]) / degreeLongCellSize,
            point[2]
        ]);
    }

    function getWeight(i, j, index) {
        const p1Long = Math.floor(Math.abs(mask.minLong - points[index][1]) / mask.cellsize);
        const p1Lat = Math.floor(Math.abs(mask.minLat - points[index][0]) / mask.cellsize);

        const p2Long = Math.floor(Math.abs(mask.minLong - (j * degreeLongCellSize + bbox[0])) / mask.cellsize);
        const p2Lat = Math.floor(Math.abs(mask.minLat - (i * degreeLatCellSize + bbox[1])) / mask.cellsize);

        const route = way(p1Lat, p1Long, p2Lat, p2Long);

        let weight = 0;
        route.forEach(c => {
            if (c !== mask.noData && route[0] !== mask.noData) {
                if (route[0] + weightUp[0] <= c) {
                    weight += weightUp[1];
                } else if (route[0] - weightDown[0] >= c) {
                    weight += weightDown[1];
                }
            }
        })

        return weight;
    }

    function way(x1, y1, x2, y2) {

        const line = [];

        const deltaX = Math.abs(x2 - x1);
        const deltaY = Math.abs(y2 - y1);
        const signX = x1 < x2 ? 1 : -1;
        const signY = y1 < y2 ? 1 : -1;

        let error = deltaX - deltaY;

        while (x1 != x2 || y1 != y2) {
            line.push(mask.grid[x1][y1]);
            const error2 = error * 2;

            if (error2 > -deltaY) {
                error -= deltaY;
                x1 += signX;
            }
            if (error2 < deltaX) {
                error += deltaX;
                y1 += signY;
            }
        }

        line.push(mask.grid[x2][y2]);
        return line;

    }

}

export { IDW }