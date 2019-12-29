import { drawIsobands } from './drawIsobands';

function DrawIsobandsWithCustomGrid(Grid, Step, DeltaLat, DeltaLong, minLat, minLong, minZ, maxZ) {
    return drawIsobands(Grid, Step, DeltaLat, DeltaLong, minLat, minLong, maxZ, minZ);
}

export { DrawIsobandsWithCustomGrid }
