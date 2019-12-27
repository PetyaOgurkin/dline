import { drawIsolines } from './drawIsolines';

function DrawIsolinesWitchCustomGrid(Grid, Step, Delta, minLat, minLong, minZ, maxZ) {
    return drawIsolines(Grid, Step, Delta, Delta, minLat, minLong, maxZ, minZ);
}

export { DrawIsolinesWitchCustomGrid } 