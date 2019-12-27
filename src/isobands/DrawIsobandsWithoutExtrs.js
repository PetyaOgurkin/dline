import { DrawGridWithoutExtrs } from '../grid/DrawGridWithoutExtrs';
import { drawIsobands } from './drawIsobands';

function DrawIsobandsWithoutExtrs(Dots, Step, Detalization, Percent_size) {
    const Grid = DrawGridWithoutExtrs(Dots, Detalization, Percent_size);
    const Bands = drawIsobands(Grid.Grid, Step, Grid.DeltaLat, Grid.DeltaLong, Grid.Grid_Min_Lat, Grid.Grid_Min_Long, Grid.Dot_Max_Z, Grid.Dot_Min_Z);
    return Bands
}

export { DrawIsobandsWithoutExtrs }