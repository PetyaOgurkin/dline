import { getDelta } from '../common/getDelta';
import { DrawGrid } from './DrawGrid';

function DrawGridWithExtrs(Dots, bbox, Detalization) {
    const Dot_Min_Z = Math.min.apply(null, Dots.map(Dot => Dot[2]));
    const Dot_Max_Z = Math.max.apply(null, Dots.map(Dot => Dot[2]));

    // расстояние между границами сетки в координатах
    const Grid_Long = bbox[2] - bbox[0];
    const Grid_Lat = bbox[3] - bbox[1];

    // шаг
    const DeltaLong = getDelta([bbox[1], bbox[0]], [bbox[1], bbox[2]], Detalization, "Long");
    const DeltaLat = getDelta([bbox[1], bbox[0]], [bbox[3], bbox[0]], Detalization, "Lat");

    // колличество ячеек сетки
    const Grid_Long_Length = Math.ceil(Grid_Long / DeltaLong);
    const Grid_Lat_Length = Math.ceil(Grid_Lat / DeltaLat);

    const Grid = DrawGrid(Dots, Grid_Lat_Length, Grid_Long_Length, DeltaLat, DeltaLong, bbox[1], bbox[0]);

    return {
        "Grid": Grid,
        "DeltaLat": DeltaLat,
        "DeltaLong": DeltaLong,
        "Grid_Min_Lat": bbox[1],
        "Grid_Min_Long": bbox[0],
        "Dot_Max_Z": Dot_Max_Z,
        "Dot_Min_Z": Dot_Min_Z
    };
}


export { DrawGridWithExtrs }