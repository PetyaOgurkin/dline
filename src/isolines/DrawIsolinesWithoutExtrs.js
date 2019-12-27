import { DrawGridWithoutExtrs } from '../grid/DrawGridWithoutExtrs';
import { drawIsolines } from './drawIsolines';

function DrawIsolinesWithoutExtrs(Dots, Step, Detalization, Percent_size) {
    const Grid = DrawGridWithoutExtrs(Dots, Detalization, Percent_size);
    return drawIsolines(Grid.Grid, Step, Grid.DeltaLat, Grid.DeltaLong, Grid.Grid_Min_Lat, Grid.Grid_Min_Long, Grid.Dot_Max_Z, Grid.Dot_Min_Z);
}

export { DrawIsolinesWithoutExtrs } 