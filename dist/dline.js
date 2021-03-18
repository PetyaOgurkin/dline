(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('martinez-polygon-clipping'), require('@turf')) :
  typeof define === 'function' && define.amd ? define(['exports', 'martinez-polygon-clipping', '@turf'], factory) :
  (global = global || self, factory(global.dline = {}, global.martinez, global.turf));
}(this, (function (exports, martinez, turf) { 'use strict';

  turf = turf && Object.prototype.hasOwnProperty.call(turf, 'default') ? turf['default'] : turf;

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function distance(D1, D2) {
    var EARTH_RADIUS = 6372795;

    var toRadians = function toRadians(point) {
      return point.map(function (c) {
        return c * Math.PI / 180;
      });
    };

    var A = toRadians(D1);
    var B = toRadians(D2);
    return EARTH_RADIUS * Math.acos(Math.sin(A[0]) * Math.sin(B[0]) + Math.cos(A[0]) * Math.cos(B[0]) * Math.cos(A[1] - B[1]));
  }

  function cellSizes(bbox, cellSize, units) {
    if (units === 'meters') {
      /* размер сетки по широте, размер ячейки по широте */
      var northPoint = [bbox[3], bbox[0]];
      var southPoint = [bbox[1], bbox[0]];
      var LatDistance = distance(southPoint, northPoint);
      var latSize = odd(LatDistance / cellSize);
      var latCellSize = Math.abs(bbox[1] - bbox[3]) * cellSize / LatDistance;
      /* по долготе */

      var westPoint = [bbox[1], bbox[0]];
      var eastPoint = [bbox[1], bbox[2]];
      var LongDistance = distance(eastPoint, westPoint);
      var longSize = odd(LongDistance / cellSize);
      var longCellSize = Math.abs(bbox[0] - bbox[2]) * cellSize / LongDistance;
      return {
        latSize: latSize,
        longSize: longSize,
        latCellSize: latCellSize,
        longCellSize: longCellSize
      };
    } else if (units === 'degrees') {
      var _cellSize;

      if (Array.isArray(cellSize)) {
        if (cellSize.length === 1) _cellSize = [cellSize[0], cellSize[0]];else if (cellSize.length === 2) _cellSize = _toConsumableArray(cellSize);
      } else _cellSize = [cellSize, cellSize];
      /* размер сетки по широте, размер ячейки по широте */


      var _LatDistance = Math.abs(bbox[1] - bbox[3]);

      var _latSize = odd(_LatDistance / _cellSize[0]);
      /* по долготе */


      var _LongDistance = Math.abs(bbox[0] - bbox[2]);

      var _longSize = odd(_LongDistance / _cellSize[1]);

      return {
        latSize: _latSize,
        longSize: _longSize,
        latCellSize: _cellSize[0],
        longCellSize: _cellSize[1]
      };
    } else {
      throw new Error('wtf');
    }

    function odd(value) {
      var ceil = Math.ceil(value);
      return !(ceil % 2) ? Math.floor(value) : ceil;
    }
  }

  function bboxCalculator(percents, points) {
    if (!Array.isArray(percents)) {
      throw new Error('percents is not array');
    }

    var minLat = Math.min.apply(Math, _toConsumableArray(points.map(function (point) {
      return point[0];
    })));
    var minLong = Math.min.apply(Math, _toConsumableArray(points.map(function (point) {
      return point[1];
    })));
    var maxLat = Math.max.apply(Math, _toConsumableArray(points.map(function (point) {
      return point[0];
    })));
    var maxLong = Math.max.apply(Math, _toConsumableArray(points.map(function (point) {
      return point[1];
    }))); // расстояние между крайними точками в координатах

    var _long = maxLong - minLong;

    var lat = maxLat - minLat; // расстояние между границами сетки в координатах

    var newLong = _long * (100 + percents[0]) / 100;
    var newLat = lat * (100 + percents[1]) / 100; // вершины сетки

    var swLong = minLong - (newLong - _long) / 2;
    var swLat = minLat - (newLat - lat) / 2;
    var neLong = maxLong + (newLong - _long) / 2;
    var neLat = maxLat + (newLat - lat) / 2;
    return [swLong, swLat, neLong, neLat];
  }

  function optionsParser(options, points) {
    var bbox = options.bbox,
        units = options.units,
        exponent = options.exponent,
        mask = options.mask,
        boundaries = options.boundaries;

    switch (_typeof(bbox)) {
      case "undefined":
        bbox = bboxCalculator([0, 0], points);
        break;

      case "object":
        if (!Array.isArray(bbox)) throw new Error('bbox is not array');

        if (bbox.length === 0) {
          bbox = bboxCalculator([0, 0], points);
        } else if (bbox.length === 2) {
          bbox.forEach(function (e) {
            if (typeof e !== "number" || e < 0) throw new Error('invalid bbox values');
          });
          bbox = bboxCalculator(bbox, points);
        } else if (bbox.length === 4) {
          bbox.forEach(function (e) {
            if (typeof e !== "number") throw new Error('invalid bbox values');
          });
        } else throw new Error('invalid bbox length');

        break;

      default:
        throw new Error('bbox is not array');
    }

    switch (_typeof(units)) {
      case 'string':
      case "undefined":
        if (units === 'meters' || units === undefined) {
          units = ['meters', 'meters'];
        } else if (units === 'degrees') {
          units = ['degrees', 'degrees'];
        } else throw new Error('invalid units values');

        break;

      case 'object':
        if (!Array.isArray(units)) throw new Error('units is not array');

        if (units.length === 2) {
          units.forEach(function (e) {
            if (e !== 'meters' && e !== 'degrees') throw new Error('invalid units values');
          });
        } else throw new Error('invalid units length');

        break;

      default:
        throw new Error('invalid units values');
    }

    if (!exponent) {
      exponent = 2;
    }

    var lowerIntervals, upperIntervals;

    if (mask) {
      if (boundaries) {
        var getHigherIntervals = function getHigherIntervals(w) {
          var tmp = w.filter(function (e) {
            return e[0] > 0;
          }).sort(function (a, b) {
            return b[0] - a[0];
          });
          tmp.unshift([Infinity]);
          return tmp.length ? tmp : false;
        };

        var getLowerIntervals = function getLowerIntervals(w) {
          var tmp = w.filter(function (e) {
            return e[0] < 0;
          }).sort(function (a, b) {
            return b[0] - a[0];
          });
          tmp.push([-Infinity]);
          return tmp.length ? tmp : false;
        };
        lowerIntervals = getLowerIntervals(boundaries);
        upperIntervals = getHigherIntervals(boundaries);
      } else throw new Error('boundaries is undefined');
    }

    return {
      bbox: bbox,
      units: units,
      exponent: exponent,
      mask: mask,
      lowerIntervals: lowerIntervals,
      upperIntervals: upperIntervals
    };
  }

  function toAsc() {
    var out = "ncols         ".concat(((this.bbox[2] - this.bbox[0]) / this.longCellSize).toFixed(), "\nnrows         ").concat(((this.bbox[3] - this.bbox[1]) / this.latCellSize).toFixed(), "\nxllcorner     ").concat(this.bbox[0], "\nyllcorner     ").concat(this.bbox[1], "\ncellsize      ").concat(this.latCellSize, "\nNODATA_value  -9999\n");

    for (var i = this.grid.length - 1; i >= 0; i--) {
      out += ' ' + this.grid[i].join(' ') + '\n';
    }

    return out;
  }

  function toGeoJson() {
    var pointGrid = {
      "type": "FeatureCollection",
      "features": []
    };

    for (var i = 0; i < this.grid.length; i++) {
      for (var j = 0; j < this.grid[i].length; j++) {
        if (this.grid[i][j]) {
          pointGrid.features.push({
            "type": "Feature",
            "properties": {
              "value": this.grid[i][j]
            },
            "geometry": {
              "type": "Point",
              "coordinates": [j * this.longCellSize + this.bbox[0], i * this.latCellSize + this.bbox[1]]
            }
          });
        }
      }
    }

    return pointGrid;
  }

  function IDW(points, cellSize) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var buffer = arguments.length > 3 ? arguments[3] : undefined;

    var _optionsParser = optionsParser(options, points),
        bbox = _optionsParser.bbox,
        units = _optionsParser.units,
        exponent = _optionsParser.exponent,
        mask = _optionsParser.mask;

    var _cellSizes = cellSizes(bbox, cellSize, units[0]),
        latSize = _cellSizes.latSize,
        longSize = _cellSizes.longSize,
        latCellSize = _cellSizes.latCellSize,
        longCellSize = _cellSizes.longCellSize;

    var grid;

    if (units[1] === 'degrees') {
      if (mask) {
        if (bbox[0] >= mask.bbox[0] && bbox[1] >= mask.bbox[1] && bbox[2] <= mask.bbox[2] && bbox[3] <= mask.bbox[3]) {
          grid = calculate(caseWithMaskDegrees, getPointsForDegreesGrid(points));
        } else {
          console.log(bbox, mask.bbox);
          throw new Error('mask shoud be bigger then bbox');
        }
      } else {
        grid = calculate(caseWithoutMaskDegrees, getPointsForDegreesGrid(points));
      }
    } else if (units[1] === 'meters') {
      if (mask) {
        if (bbox[0] >= mask.bbox[0] && bbox[1] >= mask.bbox[1] && bbox[2] <= mask.bbox[2] && bbox[3] <= mask.bbox[3]) {
          grid = calculate(caseWithMaskMeters, points);
        } else {
          console.log(bbox, mask.bbox);
          throw new Error('mask shoud be bigger then bbox');
        }
      } else {
        grid = calculate(caseWithoutMaskMeters, points);
      }
    }

    return {
      grid: grid,
      latCellSize: latCellSize,
      longCellSize: longCellSize,
      bbox: bbox,
      toAsc: toAsc,
      toGeoJson: toGeoJson
    };

    function calculate(theCase, points) {
      var grid = [];

      for (var i = 0; i < latSize; i++) {
        grid[i] = [];

        for (var j = 0; j < longSize; j++) {
          grid[i][j] = theCase(points, i, j);
        }
      }

      return grid;
    }

    function caseWithMaskDegrees(points, i, j) {
      var cellCenter = [i + 0.5, j + 0.5];
      var top = 0,
          bot = 0;

      for (var index = 0; index < points.length; index++) {
        var d = Math.sqrt(Math.pow(cellCenter[0] - points[index][0], 2) + Math.pow(cellCenter[1] - points[index][1], 2));

        if (buffer) {
          if (d > buffer) continue;
        }

        if (d === 0) return points[index][2];
        var weight = getWeight(i, j, index);
        var w = Math.pow(d, -(exponent + weight));
        top += points[index][2] * w;
        bot += w;
      }

      return top / bot;
    }

    function caseWithoutMaskDegrees(points, i, j) {
      var cellCenter = [i + 0.5, j + 0.5];
      var top = 0,
          bot = 0;

      for (var index = 0; index < points.length; index++) {
        var d = Math.sqrt(Math.pow(cellCenter[0] - points[index][0], 2) + Math.pow(cellCenter[1] - points[index][1], 2));
        if (d === 0) return points[index][2];
        var w = Math.pow(d, -exponent);
        top += points[index][2] * w;
        bot += w;
      }

      return top / bot;
    }

    function caseWithMaskMeters(points, i, j) {
      var cellCenter = [bbox[1] + (i + 0.5) * latCellSize, bbox[0] + (j + 0.5) * longCellSize];
      var top = 0,
          bot = 0;

      for (var index = 0; index < points.length; index++) {
        var weight = Math.pow(getWeight(i, j, index), 2);
        var d = distance(points[index], cellCenter);
        if (d === 0) return points[index][2]; // console.log(d, weight);

        var w = Math.pow(d + weight, -exponent
        /* + weight */
        );
        top += points[index][2] * w;
        bot += w;
      }

      return top / bot;
    }

    function caseWithoutMaskMeters(points, i, j) {
      var cellCenter = [bbox[1] + (i + 0.5) * latCellSize, bbox[0] + (j + 0.5) * longCellSize];
      var top = 0,
          bot = 0;

      for (var index = 0; index < points.length; index++) {
        var d = distance(points[index], cellCenter);
        if (d === 0) return points[index][2];
        var w = Math.pow(d, -exponent);
        top += points[index][2] * w;
        bot += w;
      }

      return top / bot;
    }

    function getPointsForDegreesGrid(points) {
      return points.map(function (point) {
        return [Math.abs(bbox[1] - point[0]) / latCellSize, Math.abs(bbox[0] - point[1]) / longCellSize, point[2]];
      });
    }

    function getWeight(i, j, index) {
      var p1Long = Math.floor(Math.abs(mask.bbox[0] - points[index][1]) / mask.longCellSize);
      var p1Lat = Math.floor(Math.abs(mask.bbox[1] - points[index][0]) / mask.latCellSize);
      var p2Long = Math.floor(Math.abs(mask.bbox[0] - (j * longCellSize + bbox[0])) / mask.longCellSize);
      var p2Lat = Math.floor(Math.abs(mask.bbox[1] - (i * latCellSize + bbox[1])) / mask.latCellSize);
      var route = way(p1Lat, p1Long, p2Lat, p2Long);
      var counter = 0;

      for (var _i = 0; _i < route.length - 1; _i++) {
        counter += Math.abs(route[_i + 1] - route[_i]);
      }
      /* let weight = 0;
      route.forEach(c => {
          if (c !== mask.noData && route[0] !== mask.noData) {
              const d = c - route[0];
              if (d > 0) {
                  if (upperIntervals) {
                      for (let i = 1; i < upperIntervals.length; i++) {
                          if (d >= upperIntervals[i][0] && d < upperIntervals[i - 1][0]) {
                              weight += upperIntervals[i][1];
                              break;
                          }
                      }
                  }
              } else if (d < 0) {
                  if (lowerIntervals) {
                      for (let i = 1; i < lowerIntervals.length; i++) {
                          if (d > lowerIntervals[i][0] && d <= lowerIntervals[i - 1][0]) {
                              weight += lowerIntervals[i - 1][1];
                              break;
                          }
                      }
                  }
              }
          }
      }) */


      return counter;
    }

    function way(x1, y1, x2, y2) {
      var line = [];
      var deltaX = Math.abs(x2 - x1);
      var deltaY = Math.abs(y2 - y1);
      var signX = x1 < x2 ? 1 : -1;
      var signY = y1 < y2 ? 1 : -1;
      var error = deltaX - deltaY;

      while (x1 != x2 || y1 != y2) {
        line.push(mask.grid[x1][y1]);
        var error2 = error * 2;

        if (error2 > -deltaY) {
          error -= deltaY;
          x1 += signX;
        }

        if (error2 < deltaX) {
          error += deltaX;
          y1 += signY;
        }
      }

      line.push(mask.grid[x2][y2]);
      return line;
    }
  }

  function ascToArray(asc) {
    var out = [];
    var grid = asc.split('\n');
    var idx = 0;
    var cols, rows, minLat, minLong, cellsize;
    var splt = grid[idx].split(' ');

    while (splt[0] !== 'NODATA_value') {
      switch (splt[0]) {
        case 'ncols':
          cols = +splt[splt.length - 1];
          break;

        case 'nrows':
          rows = +splt[splt.length - 1];
          break;

        case 'xllcorner':
          minLong = +splt[splt.length - 1];
          break;

        case 'yllcorner':
          minLat = +splt[splt.length - 1];
          break;

        case 'cellsize':
          cellsize = +splt[splt.length - 1];
          break;
      }

      idx++;
      splt = grid[idx].split(' ');
    }

    splt = grid[idx].split(' ');
    var noData = +splt[splt.length - 1];

    for (var i = idx + 1; i < grid.length - 1; i++) {
      out.push([]);
      var line = grid[i].split(' ');
      line.forEach(function (e) {
        if (e !== '') {
          out[out.length - 1].push(+e);
        }
      });
    }

    return {
      grid: out.reverse(),
      latCellSize: cellsize,
      longCellSize: cellsize,
      bbox: [minLong, minLat, minLong + cols * cellsize, minLat + rows * cellsize],
      noData: noData,
      toGeoJson: toGeoJson
    };
  }

  function pointGridToArray(geoJson) {
    var z = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'value';
    var bbox = [geoJson.features[0].geometry.coordinates[0], geoJson.features[0].geometry.coordinates[1]];

    if (geoJson.features[1].geometry.coordinates[0] === bbox[0]) {
      var latCellSize = geoJson.features[1].geometry.coordinates[1] - bbox[1];
      var longCellSize;
      var rows;

      for (var i = 1; i < geoJson.features.length; i++) {
        if (geoJson.features[i].geometry.coordinates[1] === bbox[1]) {
          longCellSize = geoJson.features[i].geometry.coordinates[0] - bbox[0];
          rows = i;
          break;
        }
      }

      var cols = geoJson.features.length / rows;
      bbox.push(bbox[0] + cols * longCellSize, bbox[1] + rows * latCellSize);
      var grid = [];
      geoJson.features.forEach(function (p, idx) {
        var i = Math.floor(idx / rows);
        var j = idx - i * rows;

        if (!grid[j]) {
          grid[j] = [];
        }

        grid[j][i] = p.properties[[z]];
      });
      return {
        grid: grid,
        latCellSize: latCellSize,
        longCellSize: longCellSize,
        bbox: bbox,
        toAsc: toAsc
      };
    } else {
      var _longCellSize = geoJson.features[1].geometry.coordinates[0] - bbox[0];

      var _latCellSize;

      var _cols;

      for (var _i = 1; _i < geoJson.features.length; _i++) {
        if (geoJson.features[_i].geometry.coordinates[0] === bbox[0]) {
          _latCellSize = geoJson.features[_i].geometry.coordinates[1] - bbox[1];
          _cols = _i;
          break;
        }
      }

      var _rows = geoJson.features.length / _cols;

      bbox.push(bbox[0] + _cols * _longCellSize, bbox[1] + _rows * _latCellSize);
      var _grid = [];
      geoJson.features.forEach(function (p, idx) {
        var i = Math.floor(idx / _cols);
        var j = idx - i * _cols;

        if (!_grid[i]) {
          _grid[i] = [];
        }

        _grid[i][j] = p.properties[[z]];
      });
      return {
        grid: _grid,
        latCellSize: _latCellSize,
        longCellSize: _longCellSize,
        bbox: bbox,
        toAsc: toAsc
      };
    }
  }

  var pointsToArray = function pointsToArray(geoJson) {
    var z = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'value';
    return geoJson.features.map(function (p) {
      return [].concat(_toConsumableArray(p.geometry.coordinates.reverse()), [p.properties[[z]]]);
    });
  };

  /* из пар точек делает последовательность */
  function toLine(couples) {
    var tmp = [];
    var endFlag = true;

    while (couples.length > 0) {
      if (endFlag === true) {
        tmp.push([]);
        tmp[tmp.length - 1].push([couples[0][0], couples[0][1]], [couples[0][2], couples[0][3]]);
        couples.splice(0, 1);
      }

      endFlag = true;

      for (var i = 0, len = couples.length; i < len; i++) {
        if (tmp[tmp.length - 1][tmp[tmp.length - 1].length - 1][0] === couples[i][0] && tmp[tmp.length - 1][tmp[tmp.length - 1].length - 1][1] === couples[i][1]) {
          tmp[tmp.length - 1].push([couples[i][2], couples[i][3]]);
          couples.splice(i, 1);
          endFlag = false;
          break;
        } else if (tmp[tmp.length - 1][tmp[tmp.length - 1].length - 1][0] === couples[i][2] && tmp[tmp.length - 1][tmp[tmp.length - 1].length - 1][1] === couples[i][3]) {
          tmp[tmp.length - 1].push([couples[i][0], couples[i][1]]);
          couples.splice(i, 1);
          endFlag = false;
          break;
        }

        if (tmp[tmp.length - 1][0][0] === couples[i][0] && tmp[tmp.length - 1][0][1] === couples[i][1]) {
          tmp[tmp.length - 1].unshift([couples[i][2], couples[i][3]]);
          couples.splice(i, 1);
          endFlag = false;
          break;
        } else if (tmp[tmp.length - 1][0][0] === couples[i][2] && tmp[tmp.length - 1][0][1] === couples[i][3]) {
          tmp[tmp.length - 1].unshift([couples[i][0], couples[i][1]]);
          couples.splice(i, 1);
          endFlag = false;
          break;
        }
      }
    }

    return tmp;
  }

  function compareBands(bands) {
    var accessoriesList = {};

    for (var i = 0; i < bands.length; i++) {
      var own = [];

      for (var j = 0; j < bands.length; j++) {
        if (i !== j) {
          if (inPoly(bands[i][0][1], bands[i][0][0], bands[j])) {
            own.push(j);
          }
        }
      }

      accessoriesList[[i]] = own;
    }

    var totalBands = [];

    for (var _i = 0; _i < bands.length; _i++) {
      var tmpChild = [];

      for (var band in accessoriesList) {
        if (accessoriesList[band][accessoriesList[band].length - 1] === _i && (accessoriesList[band].length - 1) % 2 === 0) {
          tmpChild.push(bands[band]);
        }
      }

      if ((accessoriesList[[_i]].length - 1) % 2 !== 0) totalBands.push([bands[_i]].concat(tmpChild));
    }

    return totalBands;
  }
  /*  принадлежность точки к полигону */

  function inPoly(x, y, pol) {
    var npol = pol.length;
    var j = npol - 1,
        c = false;

    for (var i = 0; i < npol; i++) {
      if ((pol[i][0] <= y && y < pol[j][0] || pol[j][0] <= y && y < pol[i][0]) && x > (pol[j][1] - pol[i][1]) * (y - pol[i][0]) / (pol[j][0] - pol[i][0]) + pol[i][1]) {
        c = !c;
      }

      j = i;
    }

    return c;
  }

  function computeIsobands(grid, low, up) {
    var interpolate = function interpolate(p1, p2, c) {
      return p1 > c ? (c - p2) / (p1 - p2) : (c - p1) / (p2 - p1);
    };
    /* values of vertexes */


    var A = function A(x, y) {
      return grid[x + 1][y] || low;
    };

    var B = function B(x, y) {
      return grid[x + 1][y + 1] || low;
    };

    var C = function C(x, y) {
      return grid[x][y + 1] || low;
    };

    var D = function D(x, y) {
      return grid[x][y] || low;
    };
    /* coordinates of points on edges */


    var M = function M(x, y, c, h) {
      return [x + 1, y + Math.abs(c - interpolate(A(x, y), B(x, y), h))];
    };

    var N = function N(x, y, c, h) {
      return [x + Math.abs(c - interpolate(B(x, y), C(x, y), h)), y + 1];
    };

    var P = function P(x, y, c, h) {
      return [x, y + Math.abs(c - interpolate(C(x, y), D(x, y), h))];
    };

    var Q = function Q(x, y, c, h) {
      return [x + Math.abs(c - interpolate(D(x, y), A(x, y), h)), y];
    };

    var getTernaryCode = function getTernaryCode(a, b, c, d) {
      var check = function check(v) {
        return v <= low ? '0' : v > low && v <= up ? '1' : '2';
      };

      return check(a) + check(b) + check(c) + check(d);
    };
    /* returns cells to be connected */


    function edges(way, x, y, h) {
      switch (way) {
        case "a-":
          return [].concat(_toConsumableArray(M(x, y, 0, h)), _toConsumableArray(Q(x, y, 1, h)));

        case "b-":
          return [].concat(_toConsumableArray(N(x, y, 1, h)), _toConsumableArray(M(x, y, 1, h)));

        case "c-":
          return [].concat(_toConsumableArray(P(x, y, 1, h)), _toConsumableArray(N(x, y, 0, h)));

        case "d-":
          return [].concat(_toConsumableArray(Q(x, y, 0, h)), _toConsumableArray(P(x, y, 0, h)));

        case "a+":
          return [].concat(_toConsumableArray(M(x, y, 1, h)), _toConsumableArray(Q(x, y, 0, h)));

        case "b+":
          return [].concat(_toConsumableArray(N(x, y, 0, h)), _toConsumableArray(M(x, y, 0, h)));

        case "c+":
          return [].concat(_toConsumableArray(P(x, y, 0, h)), _toConsumableArray(N(x, y, 1, h)));

        case "d+":
          return [].concat(_toConsumableArray(Q(x, y, 1, h)), _toConsumableArray(P(x, y, 1, h)));

        case "l>r":
          return [].concat(_toConsumableArray(M(x, y, 1, h)), _toConsumableArray(P(x, y, 1, h)));

        case "r>l":
          return [].concat(_toConsumableArray(M(x, y, 0, h)), _toConsumableArray(P(x, y, 0, h)));

        case "t>b":
          return [].concat(_toConsumableArray(N(x, y, 0, h)), _toConsumableArray(Q(x, y, 0, h)));

        case "b>t":
          return [].concat(_toConsumableArray(N(x, y, 1, h)), _toConsumableArray(Q(x, y, 1, h)));

        default:
          throw new Error('imposible');
      }
    }

    function borderCheck(x, y) {
      if (x !== 0 && y !== 0 && x !== grid.length - 2 && y !== grid[x].length - 2) return 0;else if (x === grid.length - 2 && y !== 0 && y !== grid[x].length - 2) return "top";else if (x !== grid.length - 2 && x !== 0 && y === grid[x].length - 2) return "right";else if (x === 0 && y !== grid[x].length - 2 && y !== 0) return "bot";else if (x !== grid.length - 2 && y === 0 && x !== 0) return "left";else if (x === grid.length - 2 && y === 0) return "A";else if (x === grid.length - 2 && y === grid[x].length - 2) return "B";else if (x === 0 && y === grid[x].length - 2) return "C";else if (x === 0 && y === 0) return "D";else throw new Error('invalid x or y');
    }

    function getCenterOfCell(x, y) {
      var o = (A(x, y) + B(x, y) + C(x, y) + D(x, y)) / 4;
      return o <= low ? 0 : o > low && o <= up ? 1 : 2;
    }

    function insideContouring(code, x, y) {
      var o;

      switch (code) {
        /* single triangle */
        case 79:
          isobands.push(edges("d-", x, y, up));
          break;
        // 2221

        case 41:
          isobands.push(edges("d+", x, y, up));
          break;
        // 1112

        case 1:
          isobands.push(edges("d+", x, y, low));
          break;
        // 0001

        case 39:
          isobands.push(edges("d-", x, y, low));
          break;
        // 1110

        case 77:
          isobands.push(edges("c-", x, y, up));
          break;
        // 2212

        case 43:
          isobands.push(edges("c+", x, y, up));
          break;
        // 1121

        case 3:
          isobands.push(edges("c+", x, y, low));
          break;
        // 0010

        case 37:
          isobands.push(edges("c-", x, y, low));
          break;
        // 1101

        case 71:
          isobands.push(edges("b-", x, y, up));
          break;
        // 2122

        case 49:
          isobands.push(edges("b+", x, y, up));
          break;
        // 1211

        case 9:
          isobands.push(edges("b+", x, y, low));
          break;
        // 0100

        case 31:
          isobands.push(edges("b-", x, y, low));
          break;
        // 1011

        case 53:
          isobands.push(edges("a-", x, y, up));
          break;
        // 1222

        case 67:
          isobands.push(edges("a+", x, y, up));
          break;
        // 2111

        case 27:
          isobands.push(edges("a+", x, y, low));
          break;
        // 1000

        case 13:
          isobands.push(edges("a-", x, y, low));
          break;
        // 0111

        /* single rectangle */

        case 4:
          isobands.push(edges("b>t", x, y, low));
          break;
        //  0011

        case 36:
          isobands.push(edges("t>b", x, y, low));
          break;
        //  1100

        case 76:
          isobands.push(edges("t>b", x, y, up));
          break;
        //  2211

        case 44:
          isobands.push(edges("b>t", x, y, up));
          break;
        //  1122

        case 12:
          isobands.push(edges("r>l", x, y, low));
          break;
        //  0110

        case 28:
          isobands.push(edges("l>r", x, y, low));
          break;
        //  1001

        case 68:
          isobands.push(edges("l>r", x, y, up));
          break;
        //  2112

        case 52:
          isobands.push(edges("r>l", x, y, up));
          break;
        //  1221

        case 72:
          isobands.push(edges("t>b", x, y, up), edges("t>b", x, y, low));
          break;
        //  2200

        case 8:
          isobands.push(edges("b>t", x, y, up), edges("b>t", x, y, low));
          break;
        //  0022

        case 56:
          isobands.push(edges("l>r", x, y, up), edges("l>r", x, y, low));
          break;
        //  2002

        case 24:
          isobands.push(edges("r>l", x, y, up), edges("r>l", x, y, low));
          break;
        //  0220

        /* single trapezoid */

        case 78:
          isobands.push(edges("d-", x, y, up), edges("d-", x, y, low));
          break;
        //  2220

        case 2:
          isobands.push(edges("d+", x, y, low), edges("d+", x, y, up));
          break;
        //  0002

        case 74:
          isobands.push(edges("c-", x, y, up), edges("c-", x, y, low));
          break;
        //  2202

        case 6:
          isobands.push(edges("c+", x, y, low), edges("c+", x, y, up));
          break;
        //  0020

        case 62:
          isobands.push(edges("b-", x, y, up), edges("b-", x, y, low));
          break;
        //  2022

        case 18:
          isobands.push(edges("b+", x, y, low), edges("b+", x, y, up));
          break;
        //  0200

        case 26:
          isobands.push(edges("a-", x, y, up), edges("a-", x, y, low));
          break;
        //  0222

        case 54:
          isobands.push(edges("a+", x, y, low), edges("a+", x, y, up));
          break;
        //  2000

        /*  single pentagon */

        case 45:
          isobands.push(edges("b+", x, y, up), edges("t>b", x, y, low));
          break;
        //  1200

        case 15:
          isobands.push(edges("c+", x, y, up), edges("r>l", x, y, low));
          break;
        //  0120

        case 5:
          isobands.push(edges("d+", x, y, up), edges("b>t", x, y, low));
          break;
        //  0012

        case 55:
          isobands.push(edges("a+", x, y, up), edges("l>r", x, y, low));
          break;
        //  2001

        case 35:
          isobands.push(edges("b-", x, y, low), edges("b>t", x, y, up));
          break;
        //  1022

        case 65:
          isobands.push(edges("c-", x, y, low), edges("l>r", x, y, up));
          break;
        //  2102

        case 75:
          isobands.push(edges("d-", x, y, low), edges("t>b", x, y, up));
          break;
        //  2210

        case 25:
          isobands.push(edges("a-", x, y, low), edges("r>l", x, y, up));
          break;
        //  0221

        case 29:
          isobands.push(edges("d+", x, y, up), edges("l>r", x, y, low));
          break;
        //  1002

        case 63:
          isobands.push(edges("a+", x, y, up), edges("t>b", x, y, low));
          break;
        //  2100

        case 21:
          isobands.push(edges("b+", x, y, up), edges("r>l", x, y, low));
          break;
        //  0210

        case 7:
          isobands.push(edges("c+", x, y, up), edges("b>t", x, y, low));
          break;
        //  0021

        case 51:
          isobands.push(edges("d-", x, y, low), edges("r>l", x, y, up));
          break;
        //  1220

        case 17:
          isobands.push(edges("a-", x, y, low), edges("b>t", x, y, up));
          break;
        //  0122

        case 59:
          isobands.push(edges("b-", x, y, low), edges("l>r", x, y, up));
          break;
        //  2012

        case 73:
          isobands.push(edges("c-", x, y, low), edges("t>b", x, y, up));
          break;
        //  2201

        /* single hexagon */

        case 22:
          isobands.push(edges("a-", x, y, low), edges("b+", x, y, up));
          break;
        //  0211

        case 66:
          isobands.push(edges("a+", x, y, up), edges("d-", x, y, low));
          break;
        //  2110

        case 38:
          isobands.push(edges("c-", x, y, low), edges("d+", x, y, up));
          break;
        //  1102

        case 34:
          isobands.push(edges("b-", x, y, low), edges("c+", x, y, up));
          break;
        //  1021

        case 58:
          isobands.push(edges("a+", x, y, up), edges("b-", x, y, low));
          break;
        //  2011

        case 14:
          isobands.push(edges("a-", x, y, low), edges("d+", x, y, up));
          break;
        //  0112

        case 42:
          isobands.push(edges("c+", x, y, up), edges("d-", x, y, low));
          break;
        //  1120

        case 46:
          isobands.push(edges("b+", x, y, up), edges("c-", x, y, low));
          break;
        //  1201

        case 64:
          isobands.push(edges("a+", x, y, up), edges("c-", x, y, low));
          break;
        //  2101

        case 16:
          isobands.push(edges("a-", x, y, low), edges("c+", x, y, up));
          break;
        //  0121

        case 32:
          isobands.push(edges("b-", x, y, low), edges("d+", x, y, up));
          break;
        //  1012

        case 48:
          isobands.push(edges("b+", x, y, up), edges("d-", x, y, low));
          break;
        //  1210

        /* center */

        case 60:
          //  2020
          o = getCenterOfCell(x, y);
          if (o === 0) isobands.push(edges("a+", x, y, up), edges("a+", x, y, low), edges("c+", x, y, up), edges("c+", x, y, low));else if (o === 1) isobands.push(edges("a+", x, y, up), edges("b-", x, y, low), edges("c+", x, y, up), edges("d-", x, y, low));else if (o === 2) isobands.push(edges("b-", x, y, up), edges("b-", x, y, low), edges("d-", x, y, up), edges("d-", x, y, low));
          break;

        case 20:
          //  0202
          o = getCenterOfCell(x, y);
          if (o === 0) isobands.push(edges("b+", x, y, up), edges("b+", x, y, low), edges("d+", x, y, up), edges("d+", x, y, low));else if (o === 1) isobands.push(edges("a-", x, y, low), edges("b+", x, y, up), edges("c-", x, y, low), edges("d+", x, y, up));else if (o === 2) isobands.push(edges("a-", x, y, up), edges("a-", x, y, low), edges("c-", x, y, up), edges("c-", x, y, low));
          break;

        case 10:
          //  0101
          o = getCenterOfCell(x, y);
          if (o === 0) isobands.push(edges("b+", x, y, low), edges("d+", x, y, low));else if (o === 1) isobands.push(edges("a-", x, y, low), edges("c-", x, y, low));
          break;

        case 30:
          //  1010
          o = getCenterOfCell(x, y);
          if (o === 0) isobands.push(edges("a+", x, y, low), edges("c+", x, y, low));else if (o === 1) isobands.push(edges("b-", x, y, low), edges("d-", x, y, low));
          break;

        case 70:
          //  2121
          o = getCenterOfCell(x, y);
          if (o === 1) isobands.push(edges("a+", x, y, up), edges("c+", x, y, up));else if (o === 2) isobands.push(edges("b-", x, y, up), edges("d-", x, y, up));
          break;

        case 50:
          //  1212
          o = getCenterOfCell(x, y);
          if (o === 1) isobands.push(edges("b+", x, y, up), edges("d+", x, y, up));else if (o === 2) isobands.push(edges("a-", x, y, up), edges("c-", x, y, up));
          break;

        case 69:
          //  2120
          o = getCenterOfCell(x, y);
          if (o === 0 || o === 1) isobands.push(edges("a+", x, y, up), edges("c+", x, y, up), edges("d-", x, y, low));else if (o === 2) isobands.push(edges("b-", x, y, up), edges("d-", x, y, up), edges("d-", x, y, low));
          break;

        case 61:
          //  2021
          o = getCenterOfCell(x, y);
          if (o === 0 || o === 1) isobands.push(edges("a+", x, y, up), edges("b-", x, y, low), edges("c+", x, y, up));else if (o === 2) isobands.push(edges("b-", x, y, up), edges("b-", x, y, low), edges("d-", x, y, up));
          break;

        case 47:
          //  1202
          o = getCenterOfCell(x, y);
          if (o === 0 || o === 1) isobands.push(edges("b+", x, y, up), edges("c-", x, y, low), edges("d+", x, y, up));else if (o === 2) isobands.push(edges("a-", x, y, up), edges("c-", x, y, up), edges("c-", x, y, low));
          break;

        case 23:
          //  0212
          o = getCenterOfCell(x, y);
          if (o === 0 || o === 1) isobands.push(edges("a-", x, y, low), edges("b+", x, y, up), edges("d+", x, y, up));else if (o === 2) isobands.push(edges("a-", x, y, up), edges("a-", x, y, low), edges("c-", x, y, up));
          break;

        case 11:
          //  0102
          o = getCenterOfCell(x, y);
          if (o === 0) isobands.push(edges("b+", x, y, low), edges("d+", x, y, up), edges("d+", x, y, low));else if (o === 1 || o === 2) isobands.push(edges("a-", x, y, low), edges("c-", x, y, low), edges("d+", x, y, up));
          break;

        case 19:
          //  0201
          o = getCenterOfCell(x, y);
          if (o === 0) isobands.push(edges("b+", x, y, up), edges("b+", x, y, low), edges("d+", x, y, low));else if (o === 1 || o === 2) isobands.push(edges("a-", x, y, low), edges("b+", x, y, up), edges("c-", x, y, low));
          break;

        case 33:
          //  1020
          o = getCenterOfCell(x, y);
          if (o === 0) isobands.push(edges("a+", x, y, low), edges("c+", x, y, up), edges("c+", x, y, low));else if (o === 1 || o === 2) isobands.push(edges("b-", x, y, low), edges("c+", x, y, up), edges("d-", x, y, low));
          break;

        case 57:
          //  2010
          o = getCenterOfCell(x, y);
          if (o === 0) isobands.push(edges("a+", x, y, up), edges("a+", x, y, low), edges("c+", x, y, low));else if (o === 1 || o === 2) isobands.push(edges("a+", x, y, up), edges("b-", x, y, low), edges("d-", x, y, low));
          break;
      }
    }

    function outsideContouring(code, x, y, side) {
      var tmp;

      switch (side) {
        case "top":
          tmp = top(code[0] + code[1]);
          if (tmp) isobands.push(tmp);
          break;

        case "right":
          tmp = right(code[1] + code[2]);
          if (tmp) isobands.push(tmp);
          break;

        case "bot":
          tmp = bot(code[2] + code[3]);
          if (tmp) isobands.push(tmp);
          break;

        case "left":
          tmp = left(code[3] + code[0]);
          if (tmp) isobands.push(tmp);
          break;

        case "A":
          tmp = left(code[3] + code[0]);
          if (tmp) isobands.push(tmp);
          tmp = top(code[0] + code[1]);
          if (tmp) isobands.push(tmp);
          break;

        case "B":
          tmp = top(code[0] + code[1]);
          if (tmp) isobands.push(tmp);
          tmp = right(code[1] + code[2]);
          if (tmp) isobands.push(tmp);
          break;

        case "C":
          tmp = right(code[1] + code[2]);
          if (tmp) isobands.push(tmp);
          tmp = bot(code[2] + code[3]);
          if (tmp) isobands.push(tmp);
          break;

        case "D":
          tmp = bot(code[2] + code[3]);
          if (tmp) isobands.push(tmp);
          tmp = left(code[3] + code[0]);
          if (tmp) isobands.push(tmp);
          break;
      }

      function top(code) {
        switch (code) {
          case '01':
            return [].concat(_toConsumableArray(M(x, y, 0, low)), [x + 1, y + 1]);

          case '02':
            return [].concat(_toConsumableArray(M(x, y, 0, low)), _toConsumableArray(M(x, y, 0, up)));

          case '10':
            return [].concat(_toConsumableArray(M(x, y, 1, low)), [x + 1, y]);

          case '11':
            return [x + 1, y, x + 1, y + 1];

          case '12':
            return [].concat(_toConsumableArray(M(x, y, 0, up)), [x + 1, y]);

          case '20':
            return [].concat(_toConsumableArray(M(x, y, 1, low)), _toConsumableArray(M(x, y, 1, up)));

          case '21':
            return [].concat(_toConsumableArray(M(x, y, 1, up)), [x + 1, y + 1]);

          default:
            return false;
        }
      }

      function right(code) {
        switch (code) {
          case '01':
            return [].concat(_toConsumableArray(N(x, y, 1, low)), [x, y + 1]);

          case '02':
            return [].concat(_toConsumableArray(N(x, y, 1, low)), _toConsumableArray(N(x, y, 1, up)));

          case '10':
            return [].concat(_toConsumableArray(N(x, y, 0, low)), [x + 1, y + 1]);

          case '11':
            return [x + 1, y + 1, x, y + 1];

          case '12':
            return [].concat(_toConsumableArray(N(x, y, 1, up)), [x + 1, y + 1]);

          case '20':
            return [].concat(_toConsumableArray(N(x, y, 0, low)), _toConsumableArray(N(x, y, 0, up)));

          case '21':
            return [].concat(_toConsumableArray(N(x, y, 0, up)), [x, y + 1]);

          default:
            return false;
        }
      }

      function bot(code) {
        switch (code) {
          case '01':
            return [].concat(_toConsumableArray(P(x, y, 1, low)), [x, y]);

          case '02':
            return [].concat(_toConsumableArray(P(x, y, 1, low)), _toConsumableArray(P(x, y, 1, up)));

          case '10':
            return [].concat(_toConsumableArray(P(x, y, 0, low)), [x, y + 1]);

          case '11':
            return [x, y + 1, x, y];

          case '12':
            return [].concat(_toConsumableArray(P(x, y, 1, up)), [x, y + 1]);

          case '20':
            return [].concat(_toConsumableArray(P(x, y, 0, low)), _toConsumableArray(P(x, y, 0, up)));

          case '21':
            return [].concat(_toConsumableArray(P(x, y, 0, up)), [x, y]);

          default:
            return false;
        }
      }

      function left(code) {
        switch (code) {
          case '01':
            return [].concat(_toConsumableArray(Q(x, y, 0, low)), [x + 1, y]);

          case '02':
            return [].concat(_toConsumableArray(Q(x, y, 0, low)), _toConsumableArray(Q(x, y, 0, up)));

          case '10':
            return [].concat(_toConsumableArray(Q(x, y, 1, low)), [x, y]);

          case '11':
            return [x, y, x + 1, y];

          case '12':
            return [].concat(_toConsumableArray(Q(x, y, 0, up)), [x, y]);

          case '20':
            return [].concat(_toConsumableArray(Q(x, y, 1, low)), _toConsumableArray(Q(x, y, 1, up)));

          case '21':
            return [].concat(_toConsumableArray(Q(x, y, 1, up)), [x + 1, y]);

          default:
            return false;
        }
      }
    }

    var isobands = [];
    /* walk on the grid and computing contour */

    for (var i = 0, len = grid.length - 1; i < len; i++) {
      for (var j = 0, len1 = grid[i].length - 1; j < len1; j++) {
        var ternaryCode = getTernaryCode(A(i, j), B(i, j), C(i, j), D(i, j));
        var decimalCode = parseInt(ternaryCode, 3);

        if (decimalCode === 0 || decimalCode === 80) {
          continue;
        }

        if (decimalCode !== 40) {
          insideContouring(decimalCode, i, j);
        }

        var border = borderCheck(i, j);

        if (border) {
          outsideContouring(ternaryCode, i, j, border);
        }
      }
    }

    return isobands;
  }

  function isobands(grid, intervals, cutMask) {
    var GeoJson = {
      "type": "FeatureCollection",
      "features": []
    };
    var Bands = [],
        BandsValue = [];
    var lower_h = intervals[0] - 100,
        upper_h = intervals[0];
    Bands.push(toLine(computeIsobands(grid.grid, lower_h, upper_h)));
    BandsValue.push("<" + intervals[0]);

    for (var i = 0; i < intervals.length - 1; i++) {
      lower_h = intervals[i], upper_h = intervals[i + 1];
      Bands.push(toLine(computeIsobands(grid.grid, lower_h, upper_h)));
      BandsValue.push(lower_h + "-" + upper_h);
    }

    lower_h = intervals[intervals.length - 1], upper_h = Infinity;
    Bands.push(toLine(computeIsobands(grid.grid, lower_h, upper_h)));
    BandsValue.push(intervals[intervals.length - 1] + "<");
    var newBands = [];

    for (var _i = 0; _i < Bands.length; _i++) {
      newBands.push([]);

      for (var j = 0; j < Bands[_i].length; j++) {
        newBands[_i].push([]);

        for (var k = 0; k < Bands[_i][j].length; k++) {
          newBands[_i][j].push([Bands[_i][j][k][1] * grid.longCellSize + grid.bbox[0], Bands[_i][j][k][0] * grid.latCellSize + grid.bbox[1]]);
        }
      }
    }

    if (cutMask) {
      for (var _i2 = 0; _i2 < newBands.length; _i2++) {
        var tmpBands = compareBands(newBands[_i2]);

        if (tmpBands.length) {
          var geom = martinez.intersection(cutMask.geometry.coordinates, tmpBands) || [];
          GeoJson.features.push({
            "type": "Feature",
            "properties": {
              "value": BandsValue[_i2]
            },
            "geometry": {
              "type": "MultiPolygon",
              "coordinates": geom
            }
          });
        }
      }

      GeoJson.features.forEach(function (f) {
        f.properties.area = turf.area(f);
      });
    } else {
      for (var _i3 = 0; _i3 < newBands.length; _i3++) {
        GeoJson.features.push({
          "type": "Feature",
          "properties": {
            "value": BandsValue[_i3]
          },
          "geometry": {
            "type": "MultiPolygon",
            "coordinates": compareBands(newBands[_i3])
          }
        });
      }
    }

    return GeoJson;
  }

  function computeIsolines(grid, h) {
    var interpolate = function interpolate(p1, p2) {
      return p1 > h ? (h - p2) / (p1 - p2) : (h - p1) / (p2 - p1);
    };
    /* 
    .
    A_____M_____B
    |           |
    |           |
    Q     O     N
    |           |
    |___________|
    D     P     C
    .
    */


    var A = function A(x, y) {
      return grid[x + 1][y];
    };

    var B = function B(x, y) {
      return grid[x + 1][y + 1];
    };

    var C = function C(x, y) {
      return grid[x][y + 1];
    };

    var D = function D(x, y) {
      return grid[x][y];
    };

    var M = function M(x, y, c) {
      return [x + 1, y + Math.abs(c - interpolate(A(x, y), B(x, y)))];
    };

    var N = function N(x, y, c) {
      return [x + Math.abs(c - interpolate(B(x, y), C(x, y))), y + 1];
    };

    var P = function P(x, y, c) {
      return [x, y + Math.abs(c - interpolate(C(x, y), D(x, y)))];
    };

    var Q = function Q(x, y, c) {
      return [x + Math.abs(c - interpolate(D(x, y), A(x, y))), y];
    };

    var center = function center(x, y) {
      return (A(x, y) + B(x, y) + C(x, y) + D(x, y)) / 4 <= h ? 0 : 1;
    };

    var getBinaryCode = function getBinaryCode(a, b, c, d) {
      var check = function check(v) {
        return v <= h ? "0" : "1";
      };

      return parseInt(check(a) + check(b) + check(c) + check(d), 2);
    };

    function edges(way, x, y) {
      switch (way) {
        case "a-":
          return [].concat(_toConsumableArray(M(x, y, 0)), _toConsumableArray(Q(x, y, 1)));

        case "b-":
          return [].concat(_toConsumableArray(N(x, y, 1)), _toConsumableArray(M(x, y, 1)));

        case "c-":
          return [].concat(_toConsumableArray(P(x, y, 1)), _toConsumableArray(N(x, y, 0)));

        case "d-":
          return [].concat(_toConsumableArray(Q(x, y, 0)), _toConsumableArray(P(x, y, 0)));

        case "a+":
          return [].concat(_toConsumableArray(M(x, y, 1)), _toConsumableArray(Q(x, y, 0)));

        case "b+":
          return [].concat(_toConsumableArray(N(x, y, 0)), _toConsumableArray(M(x, y, 0)));

        case "c+":
          return [].concat(_toConsumableArray(P(x, y, 0)), _toConsumableArray(N(x, y, 1)));

        case "d+":
          return [].concat(_toConsumableArray(Q(x, y, 1)), _toConsumableArray(P(x, y, 1)));

        case "l>r":
          return [].concat(_toConsumableArray(M(x, y, 1)), _toConsumableArray(P(x, y, 1)));

        case "r>l":
          return [].concat(_toConsumableArray(M(x, y, 0)), _toConsumableArray(P(x, y, 0)));

        case "t>b":
          return [].concat(_toConsumableArray(N(x, y, 0)), _toConsumableArray(Q(x, y, 0)));

        case "b>t":
          return [].concat(_toConsumableArray(N(x, y, 1)), _toConsumableArray(Q(x, y, 1)));

        default:
          console.error('wtf?');
          break;
      }
    }

    var isolines = [];

    for (var i = 0, len = grid.length - 1; i < len; i++) {
      for (var j = 0, len1 = grid[i].length - 1; j < len1; j++) {
        contouring(getBinaryCode(A(i, j), B(i, j), C(i, j), D(i, j)), i, j);
      }
    }

    function contouring(val, x, y) {
      if (val === 0 || val === 15) return;
      var o;

      switch (val) {
        case 14:
          isolines.push(edges("d-", x, y));
          break;
        //  1110

        case 1:
          isolines.push(edges("d+", x, y));
          break;
        //  0001

        case 13:
          isolines.push(edges("c-", x, y));
          break;
        //  1101

        case 2:
          isolines.push(edges("c+", x, y));
          break;
        //  0010

        case 11:
          isolines.push(edges("b-", x, y));
          break;
        //  1011

        case 4:
          isolines.push(edges("b+", x, y));
          break;
        //  0100

        case 7:
          isolines.push(edges("a-", x, y));
          break;
        //  0111

        case 8:
          isolines.push(edges("a+", x, y));
          break;
        //  1000

        case 12:
          isolines.push(edges("t>b", x, y));
          break;
        //  1100

        case 3:
          isolines.push(edges("b>t", x, y));
          break;
        //  0011

        case 9:
          isolines.push(edges("l>r", x, y));
          break;
        //  1001

        case 6:
          isolines.push(edges("r>l", x, y));
          break;
        //  0110

        case 10:
          //  1010
          o = center(x, y);
          if (o === 0) isolines.push(edges("a+", x, y), edges("c+", x, y));else if (o === 1) isolines.push(edges("b-", x, y), edges("d-", x, y));
          break;

        case 5:
          //  0101
          o = center(x, y);
          if (o === 0) isolines.push(edges("b+", x, y), edges("d+", x, y));else if (o === 1) isolines.push(edges("a-", x, y), edges("c-", x, y));
          break;
      }
    }

    return isolines;
  }

  function isolines(grid, intervals) {
    var Isolines = [];
    var IsolinesValue = [];
    var GeoJson = {
      "type": "FeatureCollection",
      "features": []
    };

    for (var i = 0; i < intervals.length; i++) {
      var h = intervals[i];
      Isolines.push(toLine(computeIsolines(grid.grid, h)));
      IsolinesValue.push(h);
    }

    for (var _i = 0; _i < Isolines.length; _i++) {
      for (var j = 0; j < Isolines[_i].length; j++) {
        for (var k = 0; k < Isolines[_i][j].length; k++) {
          // переводим координаты точек в градусы
          var tmp = Isolines[_i][j][k][0] * grid.latCellSize + grid.bbox[1];
          Isolines[_i][j][k][0] = Isolines[_i][j][k][1] * grid.longCellSize + grid.bbox[0];
          Isolines[_i][j][k][1] = tmp;
        }

        GeoJson.features.push({
          "type": "Feature",
          "properties": {
            "value": IsolinesValue[_i]
          },
          "geometry": {
            "type": "LineString",
            "coordinates": Isolines[_i][j]
          }
        });
      }
    }

    return GeoJson;
  }

  exports.IDW = IDW;
  exports.ascToArray = ascToArray;
  exports.isobands = isobands;
  exports.isolines = isolines;
  exports.pointGridToArray = pointGridToArray;
  exports.pointsToArray = pointsToArray;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
