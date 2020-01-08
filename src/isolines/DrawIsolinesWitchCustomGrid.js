import { drawIsolines } from './drawIsolines';

function DrawIsolinesWitchCustomGrid(Grid, Step, DeltaLat, DeltaLong, minLat, minLong, minZ, maxZ) {
    return drawIsolines(Grid, Step, DeltaLat, DeltaLong, minLat, minLong, maxZ, minZ);
}

export { DrawIsolinesWitchCustomGrid } 