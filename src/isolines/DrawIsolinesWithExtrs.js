import { DrawGridWithExtrs } from '../interpolate/DrawGridWithExtrs';
import { drawIsolines } from './drawIsolines';

function DrawIsolinesWithExtrs(Dots, Step, Detalization, bbox) {
    const Grid = DrawGridWithExtrs(Dots, bbox, Detalization);
    return drawIsolines(Grid.Grid, Step, Grid.DeltaLat, Grid.DeltaLong, Grid.Grid_Min_Lat, Grid.Grid_Min_Long, Grid.Dot_Max_Z, Grid.Dot_Min_Z);
}

export { DrawIsolinesWithExtrs }