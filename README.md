# dline

## Interpolation

### Example

### Arguments
- `points` - массив входных точек **[lat, long, z]**
- `cellSize` - размер ячейки выходной сетки
    - **[lat, long]** работает только если размер ячейки задан в градусах
    - **value** одинаковые размеры по lat и по long
- `options` - дополнительные опции

### Options
- `bbox` - по умолчанию **[]**, в таком случае крайние точки будут высчитаны из `points`. 
    - **[minLong, minLat, maxLong, maxLat]**, фиксированные размеры выходной сетки
    - **[longPercent, latPercent]**, увеличивает размеры сетки на **longPercent** / **latPercent** от станадртных
- `units` - по умолчанию **'meters'**
    - **'value'**, может быть **'meters'** или **'degrees'**
    - **['cellSizeUnits', 'distanceUnits']**, задается в случае если считать расстояния в ОВР нужно в других еденицах измерения
- `exponent` - по умолчанию **2**, степень, в которую возводится расстояние в ОВР

## Isobands

## Isolines

## Converters

### ascToArray

### pointGridToArray

### pointsToArray