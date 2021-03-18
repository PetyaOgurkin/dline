# dline
JavaScript library for  interpolating and generating contours
## Istallation
  use npm to install **dline** in node.js 
```
 npm i dline
```
 or CDN to include **dline** in browser
```
 <script src="https://unpkg.com/dline@1.0.3/dist/dline.min.js"></script>
```
## Documentation
### Converters
Helper methods for converting formats
#### ascToArray and pointGridToArray
Converting string [Esri ASCII](https://en.wikipedia.org/wiki/Esri_grid) grid or [GeoJSON](https://geojson.org/) pointgird to **dline** array `{grid,latCellSize,longCellSize,bbox,noData}`
```
 dline.ascToArray(asc)
```
```
 dline.pointGridToArray(geoJson,z)
```
`z` -  the property name, default `'value'`

### pointsToArray

Converting GeoJSON points to `[[lat1,long1,z1],[lat2,long2,z2]...]`
```
 dline.pointsToArray(geoJson,z)
```
`z` -  the property name, default `'value'`

### Interpolation

  **dline** uses the [IDW](https://en.wikipedia.org/wiki/Inverse_distance_weighting) method as interpolation. There is also an experimental function of using a mask to calculate a unique weight in each cell of the output grid

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
 - `mask` - the grid to adjust the weight of each point in each cell, `{grid,latCellSize,longCellSize,bbox,noData}`, converting from GeoJSON or Esri ASCII, see [converters](#converters)
 - `boundaries` - using only with mask, array of reference `values` which increases or decreases weight by some `x` value if the mask cell differs from the cell lying on the path to the desired value, `[[value1,x1],[value2,x2]...]`

#### Example
```
const  points = [
	[55.98, 92.76, 4],
	[56.02, 92.76, 7],
	[56.09, 92.74, 2],
	[56.02, 92.79, 18],
	[55.97, 92.67, 4]
];
const  mask = dline.ascToArray(await  fetch('./some_asc_file.asc').then(res  =>  res.text()));
const  grid = dline.IDW(points, 100, { bbox: [10, 10], exponent:  3, units: ['meters', 'degrees'], mask, boundaries: [[20, 0.2], [-50, 0.1]] });
```
### Isolines and Isobands

Uses [Marching squares](https://en.wikipedia.org/wiki/Marching_squares) algorithm for generating contours. Return GeoJSON.
```
 dline.isolines(grid,breaks)
```
```
 dline.isobands(grid,breaks)
```
#### Arguments
 - `grid` - grid that the [dline.IDW](#interpolation) method returns. If you whant to use GeoJSON pointgrid or Esri ASCII, see [converters](#converters)
 - `breaks` - array of contour values,  `[v1,v2,v3...]`  

#### Example
```
const  points = // some random points
const  bands = dline.isobands(dline.IDW(points,500),[1,2,3,4,5])
```
