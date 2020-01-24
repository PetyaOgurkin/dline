import { cellSizes } from '../common/cellSizes';
import { distance } from '../common/distance';

function IDW(points, cellSize, options = {}) {

    const { bbox, units, exponent, barriers } = optionsParser(options, points);

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
        if (barriers) {
            barriers.forEach(barrier => {
                for (let i = 0; i < barrier.coordinates.length; i++) {
                    const tmp = Math.abs(bbox[1] - barrier.coordinates[i][1]) / degreeLatCellSize;
                    barrier.coordinates[i][1] = Math.abs(bbox[0] - barrier.coordinates[i][0]) / degreeLongCellSize;
                    barrier.coordinates[i][0] = tmp;
                }
            })


            for (let i = 0; i < latSize; i++) {
                Grid[i] = [];
                for (let j = 0; j < longSize; j++) {
                    const cellCenter = [i + 0.5, j + 0.5];
                    let top = 0, bot = 0;
                    _points.forEach(point => {

                        let weight = 0;
                        barriers.forEach(barrier => {
                            const tmpW = intersection(barrier, [point, cellCenter]);
                            if (tmpW) {
                                weight += tmpW;
                            }
                        })
                        const d = ((cellCenter[0] - point[0]) ** 2 + (cellCenter[1] - point[1]) ** 2) ** 0.5;
                        top += point[2] / d ** (exponent + weight);
                        bot += 1 / d ** (exponent + weight);
                    })
                    Grid[i][j] = top / bot;
                }
            }
        } else {
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
    let { bbox, units, exponent, barriers } = options


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

    if (barriers) {
        barriers = barriers.features.map(barrier => {
            return {
                coordinates: barrier.geometry.coordinates,
                left: barrier.properties.left,
                right: barrier.properties.right,
            }
        })
    }

    return { bbox, units, exponent, barriers }
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

function intersection(barrier, segment) {
    const getVector = (p1, p2) => [p2[0] - p1[0], p2[1] - p1[1]];
    const obliqueProduct = (v1, v2) => v1[0] * v2[1] - v2[0] * v1[1];

    const ans = [];
    for (let i = 0; i < barrier.coordinates.length - 1; i++) {
        const tmp = check([barrier.coordinates[i], barrier.coordinates[i + 1]], segment);
        if (tmp) {
            ans.push(tmp)
        }
    }

    if (ans.length % 2) {
        return ans[0];
    } else {
        return false;
    }

    function check(a, b) {
        let one = false;
        let two = false;

        let segment = getVector(b[0], b[1]);
        let vec1 = getVector(b[0], a[0]);
        let vec2 = getVector(b[0], a[1]);

        let fst = obliqueProduct(segment, vec1)
        let sec = obliqueProduct(segment, vec2)

        if (fst * sec < 0) {
            one = true
        }

        segment = getVector(a[0], a[1]);
        vec1 = getVector(a[0], b[0]);
        vec2 = getVector(a[0], b[1]);

        fst = obliqueProduct(segment, vec1)
        sec = obliqueProduct(segment, vec2)


        if (fst * sec < 0) {
            two = true
        }

        if (one && two) {
            if (sec < 0) {
                return barrier.left;
            } else {
                return barrier.left;
            }
        }

        return false
    }
}

export { IDW }