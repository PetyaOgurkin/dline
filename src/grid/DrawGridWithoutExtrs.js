import { getDelta } from '../common/getDelta';
import { DrawGrid } from './DrawGrid';

function DrawGridWithoutExtrs(Dots, Detalization, Percent_size) {

    const Dot_Min_Lat = Math.min(...Dots.map(Dot => Dot[0]));
    const Dot_Max_Lat = Math.max.apply(null, Dots.map(Dot => Dot[0]));
    const Dot_Min_Long = Math.min.apply(null, Dots.map(Dot => Dot[1]));
    const Dot_Max_Long = Math.max.apply(null, Dots.map(Dot => Dot[1]));
    const Dot_Min_Z = Math.min.apply(null, Dots.map(Dot => Dot[2]));
    const Dot_Max_Z = Math.max.apply(null, Dots.map(Dot => Dot[2]));

    // расстояние между крайними точками в координатах
    const Dot_Long = Dot_Max_Long - Dot_Min_Long;
    const Dot_Lat = Dot_Max_Lat - Dot_Min_Lat;

    // расстояние между границами сетки в координатах
    const Grid_Long = Dot_Long * (100 + Percent_size) / 100;
    const Grid_Lat = Dot_Lat * (100 + Percent_size) / 100;

    // вершины сетки
    const Grid_Min_Long = Dot_Min_Long - (Grid_Long - Dot_Long) / 2;
    const Grid_Min_Lat = Dot_Min_Lat - (Grid_Lat - Dot_Lat) / 2;
    const Grid_Max_Long = Dot_Max_Long + (Grid_Long - Dot_Long) / 2;
    const Grid_Max_Lat = Dot_Max_Lat + (Grid_Lat - Dot_Lat) / 2;

    // шаг
    const DeltaLong = getDelta([Grid_Min_Lat, Grid_Min_Long], [Grid_Min_Lat, Grid_Max_Long], Detalization, "Long");
    const DeltaLat = getDelta([Grid_Min_Lat, Grid_Min_Long], [Grid_Max_Lat, Grid_Min_Long], Detalization, "Lat");

    // колличество ячеек сетки
    const Grid_Long_Length = Math.ceil(Grid_Long / DeltaLong);
    const Grid_Lat_Length = Math.ceil(Grid_Lat / DeltaLat);

    const Grid = DrawGrid(Dots, Grid_Lat_Length, Grid_Long_Length, DeltaLat, DeltaLong, Grid_Min_Lat, Grid_Min_Long);

    return {
        "Grid": Grid,
        "DeltaLat": DeltaLat,
        "DeltaLong": DeltaLong,
        "Grid_Min_Lat": Grid_Min_Lat,
        "Grid_Min_Long": Grid_Min_Long,
        "Grid_Max_Lat": Grid_Max_Lat,
        "Grid_Max_Long": Grid_Max_Long,
        "Dot_Max_Z": Dot_Max_Z,
        "Dot_Min_Z": Dot_Min_Z
    };
}

export { DrawGridWithoutExtrs }