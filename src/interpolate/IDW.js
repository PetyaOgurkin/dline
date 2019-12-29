import { cellSizes } from '../common/cellSizes';
import { distance } from '../common/distance';

function IDW(points, options) {

    const { bbox, exponent, cellSize, units } = options;
    const { latSize, longSize, degreeLatCellSize, degreeLongCellSize } = cellSizes(bbox, cellSize);

    const Grid = [];

    const _points = units !== 'degrees' ? [...points] : points.map(point => [
        Math.abs(bbox[1] - point[0]) / degreeLatCellSize,
        Math.abs(bbox[0] - point[1]) / degreeLongCellSize, point[2]
    ]);

    for (let i = 0; i < latSize; i++) {
        Grid[i] = [];
        for (let j = 0; j < longSize; j++) {

            const cellCenter = units !== 'degrees' ? [bbox[1] + (i + 0.5) * degreeLatCellSize, bbox[0] + (j + 0.5) * degreeLongCellSize] : [i + 0.5, j + 0.5];

            let top = 0, bot = 0;

            _points.forEach(point => {
                const d = units !== 'degrees' ? distance(point, cellCenter) : ((cellCenter[0] - point[0]) ** 2 + (cellCenter[1] - point[1]) ** 2) ** 2;
                top += point[2] / d ** exponent;
                bot += 1 / d ** exponent;
            })
            Grid[i][j] = top / bot;
        }
    }

    return Grid
}

export { IDW }