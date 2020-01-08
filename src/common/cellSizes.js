import { distance } from './distance';

function cellSizes(bbox, cellSize, units) {

    if (units === 'meters') {
        /* размер сетки по широте, размер ячейки по широте */
        const northPoint = [bbox[3], bbox[0]];
        const southPoint = [bbox[1], bbox[0]];
        const LatDistance = distance(southPoint, northPoint);
        const latSize = odd(LatDistance / cellSize);
        const degreeLatCellSize = Math.abs(bbox[1] - bbox[3]) * cellSize / LatDistance;

        /* по долготе */
        const westPoint = [bbox[1], bbox[0]];
        const eastPoint = [bbox[1], bbox[2]];
        const LongDistance = distance(eastPoint, westPoint);
        const longSize = odd(LongDistance / cellSize);
        const degreeLongCellSize = Math.abs(bbox[0] - bbox[2]) * cellSize / LongDistance;

        return {
            latSize,
            longSize,
            degreeLatCellSize,
            degreeLongCellSize
        }

    } else if (units === 'degrees') {

        let _cellSize;
        if (Array.isArray(cellSize)) {
            if (cellSize.length === 1) _cellSize = [cellSize[0], cellSize[0]]
            else if (cellSize.length === 2) _cellSize = [...cellSize]
            else throw new Error('так не может быть')
        } else _cellSize = [cellSize, cellSize]



        /* размер сетки по широте, размер ячейки по широте */
        const LatDistance = Math.abs(bbox[1] - bbox[3]);
        const latSize = odd(LatDistance / _cellSize[0]);

        /* по долготе */
        const LongDistance = Math.abs(bbox[0] - bbox[2]);
        const longSize = odd(LongDistance / _cellSize[1]);

        return {
            latSize,
            longSize,
            degreeLatCellSize: _cellSize[0],
            degreeLongCellSize: _cellSize[1]
        }
    } else {
        throw new Error('wtf')
    }

    function odd(value) {
        const ceil = Math.ceil(value);
        return !(ceil % 2) ? Math.floor(value) : ceil;
    };
}

export { cellSizes }
