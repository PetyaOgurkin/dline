import cellSizes from './cellSizes';
import distance from './distance';
import optionsParser from './optionsParser';
import toAsc from '../common/toAsc';
import toGeoJson from '../common/toGeoJson';

function IDW(points, cellSize, options = {}) {

    const { bbox, units, exponent, mask, lowerIntervals, upperIntervals } = optionsParser(options, points);

    const { latSize, longSize, latCellSize, longCellSize } = cellSizes(bbox, cellSize, units[0]);

    let grid;
    if (units[1] === 'degrees') {
        if (mask) {
            if (bbox[0] >= mask.bbox[0] && bbox[1] >= mask.bbox[1] && bbox[2] <= mask.bbox[2] && bbox[3] <= mask.bbox[3]) {
                grid = calculate(caseWithMaskDegrees, getPointsForDegreesGrid(points));
            } else {
                throw new Error('mask shoud be bigger then bbox');
            }

        } else {
            grid = calculate(caseWithoutMaskDegrees, getPointsForDegreesGrid(points));
        }
    } else if (units[1] === 'meters') {
        if (mask) {
            if (bbox[0] >= mask.bbox[0] && bbox[1] >= mask.bbox[1] && bbox[2] <= mask.bbox[2] && bbox[3] <= mask.bbox[3]) {
                grid = calculate(caseWithMaskMeters, points);
            } else {
                throw new Error('mask shoud be bigger then bbox');
            }

        } else {
            grid = calculate(caseWithoutMaskMeters, points);
        }
    }

    return { grid, latCellSize, longCellSize, bbox, toAsc, toGeoJson }

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
        const cellCenter = [bbox[1] + (i + 0.5) * latCellSize, bbox[0] + (j + 0.5) * longCellSize];
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
        const cellCenter = [bbox[1] + (i + 0.5) * latCellSize, bbox[0] + (j + 0.5) * longCellSize];
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
            Math.abs(bbox[1] - point[0]) / latCellSize,
            Math.abs(bbox[0] - point[1]) / longCellSize,
            point[2]
        ]);
    }

    function getWeight(i, j, index) {
        const p1Long = Math.floor(Math.abs(mask.bbox[0] - points[index][1]) / mask.longCellSize);
        const p1Lat = Math.floor(Math.abs(mask.bbox[1] - points[index][0]) / mask.latCellSize);

        const p2Long = Math.floor(Math.abs(mask.bbox[0] - (j * longCellSize + bbox[0])) / mask.longCellSize);
        const p2Lat = Math.floor(Math.abs(mask.bbox[1] - (i * latCellSize + bbox[1])) / mask.latCellSize);

        const route = way(p1Lat, p1Long, p2Lat, p2Long);

        let weight = 0;
        route.forEach(c => {
            if (c !== mask.noData && route[0] !== mask.noData) {
                const d = c - route[0];
                if (d > 0) {
                    if (upperIntervals) {
                        for (let i = 1; i < upperIntervals.length; i++) {
                            if (d >= upperIntervals[i][0] && d < upperIntervals[i - 1][0]) {
                                weight += upperIntervals[i][1];
                                break;
                            }
                        }
                    }
                } else if (d < 0) {
                    if (lowerIntervals) {
                        for (let i = 1; i < lowerIntervals.length; i++) {
                            if (d > lowerIntervals[i][0] && d <= lowerIntervals[i - 1][0]) {
                                weight += lowerIntervals[i - 1][1];
                                break;
                            }
                        }
                    }
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