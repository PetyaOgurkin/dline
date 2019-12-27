import { getDelta } from '../common/getDelta';
import { DrawGrid } from './DrawGrid';

function DrawGridWithExtrs(Dots, SW, NE, Detalization) {
    const Dot_Min_Z = Math.min.apply(null, Dots.map(Dot => Dot[2]));
    const Dot_Max_Z = Math.max.apply(null, Dots.map(Dot => Dot[2]));

    // расстояние между границами сетки в координатах
    const Grid_Long = NE.Long - SW.Long;
    const Grid_Lat = NE.Lat - SW.Lat;

    // шаг
    const DeltaLong = getDelta([SW.Lat, SW.Long], [SW.Lat, NE.Long], Detalization, "Long");
    const DeltaLat = getDelta([SW.Lat, SW.Long], [NE.Lat, SW.Long], Detalization, "Lat");

    // колличество ячеек сетки
    const Grid_Long_Length = Math.ceil(Grid_Long / DeltaLong);
    const Grid_Lat_Length = Math.ceil(Grid_Lat / DeltaLat);

    const Grid = DrawGrid(Dots, Grid_Lat_Length, Grid_Long_Length, DeltaLat, DeltaLong, SW.Lat, SW.Long);

    return {
        "Grid": Grid,
        "DeltaLat": DeltaLat,
        "DeltaLong": DeltaLong,
        "Grid_Min_Lat": SW.Lat,
        "Grid_Min_Long": SW.Long,
        "Dot_Max_Z": Dot_Max_Z,
        "Dot_Min_Z": Dot_Min_Z
    };
}


export { DrawGridWithExtrs }