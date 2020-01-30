# dline
saasdasdads
## Istallation
  use npm to install **dline** in node.js 
```
 npm i dline
```
 or CDN to include **dline** in browser
```
 <script src="#"></script>
```
## Documentation

### Interpolation

  **dline** uses the IDW method as interpolation. There is also an experimental function of using a mask to calculate a unique weight in each cell of the output grid.

```
 dline.IDW(points, cellSize, options);
```
#### Arguments
 - `points` - reference point array `[[lat1,long1,z1],[lat2,long2,z2]...]`
 - `cellSize` - `[latCellSize,longCellSize]` only for degrees or `value` for degrees or meters units
 - `options` - additional optional settings

#### Options
 - `bbox` - default `[0,0]`, can be an ordinary bbox like `[minLong, minLat, maxLong, maxLat]`  or `[longPercent, latPercent]`, in this case increases the size of the grid by `longPercent,latPercent` from extreme points
 - `units` - default `["meters","meters"]`, can be `[cellSizeUnits,distanceUnits]`, where `cellSizeUnits` - output grid cell size, `distanceUnits` - units of distance in IDW method. If you set only  `"degrees"` it equal `["degrees","degrees"]`, with meters as well
 - `exponent` - default `2`,  exponent of distance in IDW method
 - `mask` - grid to adjust the weight of each point in each cell, `{grid,latCellSize,longCellSize,bbox,noData}`, converting from GeoJSON or Esri ASCII, see [converters](#converters)
 - `boundaries` - using only with mask, array of reference `values` which increases or decreases weight by some `x` value if the mask cell differs from the cell lying on the path to the desired value, `[[value1,x1],[value2,x2]...]`

## Isobands

  

## Isolines

  

## Converters
asd
  

### ascToArray

  

### pointGridToArray

  

### pointsToArray