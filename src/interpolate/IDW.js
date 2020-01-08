import { cellSizes } from '../common/cellSizes';
import { distance } from '../common/distance';

function IDW(points, cellSize, options = {}) {

    const { bbox, units, exponent } = optionsParser(options, points);

    const { latSize, longSize, degreeLatCellSize, degreeLongCellSize } = cellSizes(bbox, cellSize, units[0]);

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
                _points.forEach(point => {
                    const d = ((cellCenter[0] - point[0]) ** 2 + (cellCenter[1] - point[1]) ** 2) ** 2;
                    top += point[2] / d ** exponent;
                    bot += 1 / d ** exponent;
                })
                Grid[i][j] = top / bot;
            }
        }
        return Grid;
    }

    function calcInMeters() {
        const Grid = [];

        let start;
        for (let i = 0; i < latSize; i++) {
            Grid[i] = [];

            start = i % 2 === 0 ? 0 : 1;
            for (let j = start; j < longSize; j += 2) {

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
    let { bbox, units, exponent } = options


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

    return { bbox, units, exponent }
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


export { IDW }