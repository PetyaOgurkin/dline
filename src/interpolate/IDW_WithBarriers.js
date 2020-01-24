import { cellSizes } from '../common/cellSizes';
import { distance } from '../common/distance';

function IDW(points, cellSize, options = {}) {

    const { bbox, units, exponent, mask, buf, weightUp, weightDown } = optionsParser(options, points);

    const { latSize, longSize, degreeLatCellSize, degreeLongCellSize } = cellSizes(bbox, cellSize, units[0]);


    const bufR = buf * Math.sqrt(2);

    // console.log(bufR);



    let grid;
    if (units[1] === 'degrees') {
        grid = calcInDegrees()
    } else if (units[1] === 'meters') {
        grid = calcInMeters()
    } else {
        throw new Error('как такое вообще возможно?')
    }

    return { grid, latSize, longSize, degreeLatCellSize, degreeLongCellSize, bbox }

    function calcInDegrees() {
        const _points = points.map(point => [
            Math.abs(bbox[1] - point[0]) / degreeLatCellSize,
            Math.abs(bbox[0] - point[1]) / degreeLongCellSize,
            point[2]
        ]);

        const Grid = [];

        for (let i = 0; i < latSize; i++) {
            Grid[i] = [];
            for (let j = 0; j < longSize; j++) {
                const cellCenter = [i + 0.5, j + 0.5];
                let top = 0, bot = 0;

                _points.forEach((point, index) => {

                    const d = ((cellCenter[0] - point[0]) ** 2 + (cellCenter[1] - point[1]) ** 2) ** 0.5;


                    // console.log(d, bufR);


                    if (d <= bufR) {
                        const p1Long = Math.floor(Math.abs(mask.minlong - points[index][1]) / mask.delta);
                        const p1Lat = Math.floor(Math.abs(mask.minlat - points[index][0]) / mask.delta);

                        const p2Long = Math.floor(Math.abs(mask.minlong - (j * degreeLongCellSize + bbox[0])) / mask.delta);
                        const p2Lat = Math.floor(Math.abs(mask.minlat - (i * degreeLatCellSize + bbox[1])) / mask.delta);


                        const route = way(p1Lat, p1Long, p2Lat, p2Long, mask.grid);

                        let weight = 0;
                        route.forEach(c => {
                            if (route[0] + weightUp[0] <= c) {
                                weight += weightUp[1];
                            } else if (route[0] - weightDown[0] >= c) {
                                weight += weightDown[1];
                            }
                        })
                        top += point[2] / d ** (exponent + weight);
                        bot += 1 / d ** (exponent + weight);
                    }



                })
                Grid[i][j] = top / bot;
            }
        }


        return Grid;
    }

    function calcInMeters() {
        const Grid = [];

        for (let i = 0; i < latSize; i++) {
            Grid[i] = [];
            for (let j = 0; j < longSize; j++) {

                const cellCenter = [bbox[1] + (i + 0.5) * degreeLatCellSize, bbox[0] + (j + 0.5) * degreeLongCellSize];

                let top = 0, bot = 0;

                points.forEach(point => {
                    const d = distance(point, cellCenter);
                    top += point[2] / d ** exponent;
                    bot += 1 / d ** exponent;
                })
                Grid[i][j] = top / bot;
            }
        }

        return Grid
    }
}

function optionsParser(options, points) {
    let { bbox, units, exponent, mask, buf, weightUp, weightDown } = options


    switch (typeof (bbox)) {
        case "undefined":
            bbox = bboxCalculator([0, 0], points);
            break;

        case "object":
            if (!Array.isArray(bbox)) throw new Error('bbox не является массивом');

            if (bbox.length === 0) {
                bbox = bboxCalculator([0, 0], points);

            } else if (bbox.length === 2) {
                bbox.forEach(e => {
                    if (typeof (e) !== "number" || e < 0) throw new Error('Неккоректные значения bbox')
                })
                bbox = bboxCalculator(bbox, points);

            } else if (bbox.length === 4) {
                bbox.forEach(e => {
                    if (typeof (e) !== "number") throw new Error('Неккоректные значения bbox')
                })

            } else throw new Error('Некорректное кол-во элементов массива bbox');
            break;

        default: throw new Error('bbox не является массивом');
    }

    switch (typeof (units)) {
        case 'string': case "undefined":
            if (units === 'meters' || units === undefined) {
                units = ['meters', 'meters']
            } else if (units === 'degrees') {
                units = ['degrees', 'degrees']
            } else throw new Error('Некорректные значения units')
            break;

        case 'object':
            if (!Array.isArray(units)) throw new Error('units не является массивом');

            if (units.length === 2) {
                units.forEach(e => {
                    if (e !== 'meters' && e !== 'degrees') throw new Error('Некорректные значения units');
                })
            } else throw new Error('Некорректное кол-во элементов массива units')
            break;

        default: throw new Error('Некорректные значения units')
    }

    if (exponent === undefined) {
        exponent = 2;
    } else if (typeof (exponent) !== "number" || exponent <= 0) {
        throw new Error('Неккоректное значение exponent')
    }

    if (!mask) {
        throw new Error('err')
    }

    return { bbox, units, exponent, mask, buf, weightUp, weightDown }
}

function bboxCalculator(percents, points) {

    if (!Array.isArray(percents)) {
        throw new Error('percents не Массив')
    }

    const minLat = Math.min(...points.map(point => point[0]))
    const minLong = Math.min(...points.map(point => point[1]))
    const maxLat = Math.max(...points.map(point => point[0]))
    const maxLong = Math.max(...points.map(point => point[1]))

    // расстояние между крайними точками в координатах
    const long = maxLong - minLong;
    const lat = maxLat - minLat;

    // расстояние между границами сетки в координатах
    const newLong = long * (100 + percents[0]) / 100;
    const newLat = lat * (100 + percents[1]) / 100;

    // вершины сетки
    const swLong = minLong - (newLong - long) / 2;
    const swLat = minLat - (newLat - lat) / 2;
    const neLong = maxLong + (newLong - long) / 2;
    const neLat = maxLat + (newLat - lat) / 2;

    return [swLong, swLat, neLong, neLat]
}


function way(x1, y1, x2, y2, grid) {

    const line = [];

    const deltaX = Math.abs(x2 - x1);
    const deltaY = Math.abs(y2 - y1);
    const signX = x1 < x2 ? 1 : -1;
    const signY = y1 < y2 ? 1 : -1;

    let error = deltaX - deltaY;

    while (x1 != x2 || y1 != y2) {
        line.push(grid[x1][y1]);
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

    line.push(grid[x2][y2]);
    return line;

}



export { IDW as IDW2 }