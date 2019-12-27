function DrawGrid(Dots, Grid_Lat_Length, Grid_Long_Length, DeltaLat, DeltaLong, Grid_Min_Lat, Grid_Min_Long) {
    const Grid = Array(Grid_Lat_Length);

    // генерируем сетку
    for (let i = 0; i < Grid_Lat_Length; i++) {
        Grid[i] = Array(Grid_Long_Length);
    }

    // массив исходных ячеек
    const Cells = [];
    let tempLong, tempLat;

    // заполняем известные ячейки значениями
    for (let i = 0; i < Dots.length; i++) {
        tempLong = Math.abs(Grid_Min_Long - Dots[i][1]) / DeltaLong;
        tempLat = Math.abs(Grid_Min_Lat - Dots[i][0]) / DeltaLat;

        Grid[Math.floor(tempLat)][Math.floor(tempLong)] = Dots[i][2];
        Cells.push([Math.floor(tempLat), Math.floor(tempLong), Dots[i][2]]);

    }

    // числитель, знаминатель
    let up = 0;
    let down = 0;

    // переменная для первой ячейки строки (0 или 1, т.к. заполняется в шахматном порядке)
    let start;

    // заполняем сетку значениями в шахматном порядке (т.к. для алгоритма MarchingSquares нужны только угловые и центральное значения)
    for (let i = 0; i < Grid_Lat_Length; i++) {
        start = i % 2 === 0 ? 0 : 1;
        for (let j = start; j < Grid_Long_Length; j += 2) {
            if (Grid[i][j] == null) {
                // считаем среднее взвешанное от всех изначальных ячеек (в качестве веса обратное значение квадрата расстояния (1/r^2))
                for (let k = 0; k < Cells.length; k++) {
                    up += Cells[k][2] * (1 / Math.pow(((i - Cells[k][0]) * (i - Cells[k][0]) + (j - Cells[k][1]) * (j - Cells[k][1])), 2));
                    down += 1 / Math.pow(((i - Cells[k][0]) * (i - Cells[k][0]) + (j - Cells[k][1]) * (j - Cells[k][1])), 2);

                }
                // добавляем в ячейку значение, зануляем числитель и знаминатель
                Grid[i][j] = up / down;
                up = 0;
                down = 0;
            }
        }
    }

    return Grid;
}

export { DrawGrid }