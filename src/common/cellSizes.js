import { distance } from './distance';

function cellSizes(bbox, cellSize) {

    const odd = value => {
        const ceil = Math.ceil(value);
        return !(ceil % 2) ? Math.floor(value) : ceil;
    };

    /* размер сетки по широте, размер ячейки по широте */
    const northPoint = [bbox[3], bbox[0]];
    const southPoint = [bbox[1], bbox[0]];
    const LatDistance = distance(southPoint, northPoint);
    const latSize = odd(LatDistance / cellSize);
    const degreeLatCellSize = Math.abs(bbox[1] - bbox[3]) * cellSize / LatDistance;

    /* по долготе */
    // const westPoint = [bbox[1] + LatDistance / 2 / cellSize * degreeLatCellSize, bbox[0]];
    // const eastPoint = [bbox[1] + LatDistance / 2 / cellSize * degreeLatCellSize, bbox[2]];

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
}

export { cellSizes }
