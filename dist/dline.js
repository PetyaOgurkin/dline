(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.dline = {}));
}(this, (function (exports) { 'use strict';

  function _typeof(obj) {
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
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
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
      var degreeLatCellSize = Math.abs(bbox[1] - bbox[3]) * cellSize / LatDistance;
      /* по долготе */

      var westPoint = [bbox[1], bbox[0]];
      var eastPoint = [bbox[1], bbox[2]];
      var LongDistance = distance(eastPoint, westPoint);
      var longSize = odd(LongDistance / cellSize);
      var degreeLongCellSize = Math.abs(bbox[0] - bbox[2]) * cellSize / LongDistance;
      return {
        latSize: latSize,
        longSize: longSize,
        degreeLatCellSize: degreeLatCellSize,
        degreeLongCellSize: degreeLongCellSize
      };
    } else if (units === 'degrees') {
      var _cellSize;

      if (Array.isArray(cellSize)) {
        if (cellSize.length === 1) _cellSize = [cellSize[0], cellSize[0]];else if (cellSize.length === 2) _cellSize = _toConsumableArray(cellSize);else throw new Error('так не может быть');
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
        degreeLatCellSize: _cellSize[0],
        degreeLongCellSize: _cellSize[1]
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
      throw new Error('percents не Массив');
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
        weightUp = options.weightUp,
        weightDown = options.weightDown;

    switch (_typeof(bbox)) {
      case "undefined":
        bbox = bboxCalculator([0, 0], points);
        break;

      case "object":
        if (!Array.isArray(bbox)) throw new Error('bbox не является массивом');

        if (bbox.length === 0) {
          bbox = bboxCalculator([0, 0], points);
        } else if (bbox.length === 2) {
          bbox.forEach(function (e) {
            if (typeof e !== "number" || e < 0) throw new Error('Неккоректные значения bbox');
          });
          bbox = bboxCalculator(bbox, points);
        } else if (bbox.length === 4) {
          bbox.forEach(function (e) {
            if (typeof e !== "number") throw new Error('Неккоректные значения bbox');
          });
        } else throw new Error('Некорректное кол-во элементов массива bbox');

        break;

      default:
        throw new Error('bbox не является массивом');
    }

    switch (_typeof(units)) {
      case 'string':
      case "undefined":
        if (units === 'meters' || units === undefined) {
          units = ['meters', 'meters'];
        } else if (units === 'degrees') {
          units = ['degrees', 'degrees'];
        } else throw new Error('Некорректные значения units');

        break;

      case 'object':
        if (!Array.isArray(units)) throw new Error('units не является массивом');

        if (units.length === 2) {
          units.forEach(function (e) {
            if (e !== 'meters' && e !== 'degrees') throw new Error('Некорректные значения units');
          });
        } else throw new Error('Некорректное кол-во элементов массива units');

        break;

      default:
        throw new Error('Некорректные значения units');
    }

    if (exponent === undefined) {
      exponent = 2;
    } else if (typeof exponent !== "number" || exponent <= 0) {
      throw new Error('Неккоректное значение exponent');
    }

    return {
      bbox: bbox,
      units: units,
      exponent: exponent,
      mask: mask,
      weightUp: weightUp,
      weightDown: weightDown
    };
  }

  function IDW(points, cellSize) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var _optionsParser = optionsParser(options, points),
        bbox = _optionsParser.bbox,
        units = _optionsParser.units,
        exponent = _optionsParser.exponent,
        mask = _optionsParser.mask,
        weightUp = _optionsParser.weightUp,
        weightDown = _optionsParser.weightDown;

    var _cellSizes = cellSizes(bbox, cellSize, units[0]),
        latSize = _cellSizes.latSize,
        longSize = _cellSizes.longSize,
        degreeLatCellSize = _cellSizes.degreeLatCellSize,
        degreeLongCellSize = _cellSizes.degreeLongCellSize;

    var grid;

    if (units[1] === 'degrees') {
      if (mask) {
        grid = calculate(caseWithMaskDegrees, getPointsForDegreesGrid(points));
      } else {
        grid = calculate(caseWithoutMaskDegrees, getPointsForDegreesGrid(points));
      }
    } else if (units[1] === 'meters') {
      if (mask) {
        grid = calculate(caseWithMaskMeters, points);
      } else {
        grid = calculate(caseWithoutMaskMeters, points);
      }
    } else {
      throw new Error('как такое вообще возможно?');
    }

    return {
      grid: grid,
      degreeLatCellSize: degreeLatCellSize,
      degreeLongCellSize: degreeLongCellSize,
      bbox: bbox
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
      points.forEach(function (point, index) {
        var weight = getWeight(i, j, index);
        var d = Math.sqrt(Math.pow(cellCenter[0] - point[0], 2) + Math.pow(cellCenter[1] - point[1], 2));
        top += point[2] / Math.pow(d, exponent + weight);
        bot += 1 / Math.pow(d, exponent + weight);
      });
      return top / bot;
    }

    function caseWithoutMaskDegrees(points, i, j) {
      var cellCenter = [i + 0.5, j + 0.5];
      var top = 0,
          bot = 0;
      points.forEach(function (point) {
        var d = Math.sqrt(Math.pow(cellCenter[0] - point[0], 2) + Math.pow(cellCenter[1] - point[1], 2));
        top += point[2] / Math.pow(d, exponent);
        bot += 1 / Math.pow(d, exponent);
      });
      return top / bot;
    }

    function caseWithMaskMeters(points, i, j) {
      var cellCenter = [bbox[1] + (i + 0.5) * degreeLatCellSize, bbox[0] + (j + 0.5) * degreeLongCellSize];
      var top = 0,
          bot = 0;
      points.forEach(function (point, index) {
        var weight = getWeight(i, j, index);
        var d = distance(point, cellCenter);
        top += point[2] / Math.pow(d, exponent + weight);
        bot += 1 / Math.pow(d, exponent + weight);
      });
      return top / bot;
    }

    function caseWithoutMaskMeters(points, i, j) {
      var cellCenter = [bbox[1] + (i + 0.5) * degreeLatCellSize, bbox[0] + (j + 0.5) * degreeLongCellSize];
      var top = 0,
          bot = 0;
      points.forEach(function (point) {
        var d = distance(point, cellCenter);
        top += point[2] / Math.pow(d, exponent);
        bot += 1 / Math.pow(d, exponent);
      });
      return top / bot;
    }

    function getPointsForDegreesGrid(points) {
      return points.map(function (point) {
        return [Math.abs(bbox[1] - point[0]) / degreeLatCellSize, Math.abs(bbox[0] - point[1]) / degreeLongCellSize, point[2]];
      });
    }

    function getWeight(i, j, index) {
      var p1Long = Math.floor(Math.abs(mask.minLong - points[index][1]) / mask.cellsize);
      var p1Lat = Math.floor(Math.abs(mask.minLat - points[index][0]) / mask.cellsize);
      var p2Long = Math.floor(Math.abs(mask.minLong - (j * degreeLongCellSize + bbox[0])) / mask.cellsize);
      var p2Lat = Math.floor(Math.abs(mask.minLat - (i * degreeLatCellSize + bbox[1])) / mask.cellsize);
      var route = way(p1Lat, p1Long, p2Lat, p2Long);
      var weight = 0;
      route.forEach(function (c) {
        if (c !== mask.noData && route[0] !== mask.noData) {
          if (route[0] + weightUp[0] <= c) {
            weight += weightUp[1];
          } else if (route[0] - weightDown[0] >= c) {
            weight += weightDown[1];
          }
        }
      });
      return weight;
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
      cols: cols,
      rows: rows,
      minLong: minLong,
      minLat: minLat,
      cellsize: cellsize,
      noData: noData,
      grid: out.reverse()
    };
  }

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

  function compareBands(bnds) {
    var bands = _toConsumableArray(bnds);

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
      return p1 > c ? (c + 0.0001 - p2) / (p1 - p2) : (c + 0.0001 - p1) / (p2 - p1);
    };
    /* values of vertexes */


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
        return v <= low || Number.isNaN(v) ? '0' : v > low && v <= up ? '1' : '2';
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
      var O = (A(x, y) + B(x, y) + C(x, y) + D(x, y)) / 4;
      return O <= low ? 0 : O > low && O <= up ? 1 : 2;
    }

    function insideContouring(code, x, y) {
      var o;

      switch (code) {
        /* single triangle */
        case "2221":
          isobands.push(edges("d-", x, y, up));
          break;

        case "1112":
          isobands.push(edges("d+", x, y, up));
          break;

        case "0001":
          isobands.push(edges("d+", x, y, low));
          break;

        case "1110":
          isobands.push(edges("d-", x, y, low));
          break;

        case "2212":
          isobands.push(edges("c-", x, y, up));
          break;

        case "1121":
          isobands.push(edges("c+", x, y, up));
          break;

        case "0010":
          isobands.push(edges("c+", x, y, low));
          break;

        case "1101":
          isobands.push(edges("c-", x, y, low));
          break;

        case "2122":
          isobands.push(edges("b-", x, y, up));
          break;

        case "1211":
          isobands.push(edges("b+", x, y, up));
          break;

        case "0100":
          isobands.push(edges("b+", x, y, low));
          break;

        case "1011":
          isobands.push(edges("b-", x, y, low));
          break;

        case "1222":
          isobands.push(edges("a-", x, y, up));
          break;

        case "2111":
          isobands.push(edges("a+", x, y, up));
          break;

        case "1000":
          isobands.push(edges("a+", x, y, low));
          break;

        case "0111":
          isobands.push(edges("a-", x, y, low));
          break;

        /* single rectangle */

        case "0011":
          isobands.push(edges("b>t", x, y, low));
          break;

        case "1100":
          isobands.push(edges("t>b", x, y, low));
          break;

        case "2211":
          isobands.push(edges("t>b", x, y, up));
          break;

        case "1122":
          isobands.push(edges("b>t", x, y, up));
          break;

        case "0110":
          isobands.push(edges("r>l", x, y, low));
          break;

        case "1001":
          isobands.push(edges("l>r", x, y, low));
          break;

        case "2112":
          isobands.push(edges("l>r", x, y, up));
          break;

        case "1221":
          isobands.push(edges("r>l", x, y, up));
          break;

        case "2200":
          isobands.push(edges("t>b", x, y, up), edges("t>b", x, y, low));
          break;

        case "0022":
          isobands.push(edges("b>t", x, y, up), edges("b>t", x, y, low));
          break;

        case "2002":
          isobands.push(edges("l>r", x, y, up), edges("l>r", x, y, low));
          break;

        case "0220":
          isobands.push(edges("r>l", x, y, up), edges("r>l", x, y, low));
          break;

        /* single trapezoid */

        case "2220":
          isobands.push(edges("d-", x, y, up), edges("d-", x, y, low));
          break;

        case "0002":
          isobands.push(edges("d+", x, y, low), edges("d+", x, y, up));
          break;

        case "2202":
          isobands.push(edges("c-", x, y, up), edges("c-", x, y, low));
          break;

        case "0020":
          isobands.push(edges("c+", x, y, low), edges("c+", x, y, up));
          break;

        case "2022":
          isobands.push(edges("b-", x, y, up), edges("b-", x, y, low));
          break;

        case "0200":
          isobands.push(edges("b+", x, y, low), edges("b+", x, y, up));
          break;

        case "0222":
          isobands.push(edges("a-", x, y, up), edges("a-", x, y, low));
          break;

        case "2000":
          isobands.push(edges("a+", x, y, low), edges("a+", x, y, up));
          break;

        /*  single pentagon */

        case "1200":
          isobands.push(edges("b+", x, y, up), edges("t>b", x, y, low));
          break;

        case "0120":
          isobands.push(edges("c+", x, y, up), edges("r>l", x, y, low));
          break;

        case "0012":
          isobands.push(edges("d+", x, y, up), edges("b>t", x, y, low));
          break;

        case "2001":
          isobands.push(edges("a+", x, y, up), edges("l>r", x, y, low));
          break;

        case "1022":
          isobands.push(edges("b-", x, y, low), edges("b>t", x, y, up));
          break;

        case "2102":
          isobands.push(edges("c-", x, y, low), edges("l>r", x, y, up));
          break;

        case "2210":
          isobands.push(edges("d-", x, y, low), edges("t>b", x, y, up));
          break;

        case "0221":
          isobands.push(edges("a-", x, y, low), edges("r>l", x, y, up));
          break;

        case "1002":
          isobands.push(edges("d+", x, y, up), edges("l>r", x, y, low));
          break;

        case "2100":
          isobands.push(edges("a+", x, y, up), edges("t>b", x, y, low));
          break;

        case "0210":
          isobands.push(edges("b+", x, y, up), edges("r>l", x, y, low));
          break;

        case "0021":
          isobands.push(edges("c+", x, y, up), edges("b>t", x, y, low));
          break;

        case "1220":
          isobands.push(edges("d-", x, y, low), edges("r>l", x, y, up));
          break;

        case "0122":
          isobands.push(edges("a-", x, y, low), edges("b>t", x, y, up));
          break;

        case "2012":
          isobands.push(edges("b-", x, y, low), edges("l>r", x, y, up));
          break;

        case "2201":
          isobands.push(edges("c-", x, y, low), edges("t>b", x, y, up));
          break;

        /* single hexagon */

        case "0211":
          isobands.push(edges("a-", x, y, low), edges("b+", x, y, up));
          break;

        case "2110":
          isobands.push(edges("a+", x, y, up), edges("d-", x, y, low));
          break;

        case "1102":
          isobands.push(edges("c-", x, y, low), edges("d+", x, y, up));
          break;

        case "1021":
          isobands.push(edges("b-", x, y, low), edges("c+", x, y, up));
          break;

        case "2011":
          isobands.push(edges("a+", x, y, up), edges("b-", x, y, low));
          break;

        case "0112":
          isobands.push(edges("a-", x, y, low), edges("d+", x, y, up));
          break;

        case "1120":
          isobands.push(edges("c+", x, y, up), edges("d-", x, y, low));
          break;

        case "1201":
          isobands.push(edges("b+", x, y, up), edges("c-", x, y, low));
          break;

        case "2101":
          isobands.push(edges("a+", x, y, up), edges("c-", x, y, low));
          break;

        case "0121":
          isobands.push(edges("a-", x, y, low), edges("c+", x, y, up));
          break;

        case "1012":
          isobands.push(edges("b-", x, y, low), edges("d+", x, y, up));
          break;

        case "1210":
          isobands.push(edges("b+", x, y, up), edges("d-", x, y, low));
          break;

        /* center */

        case "2020":
          o = getCenterOfCell(x, y);
          if (o === 0) isobands.push(edges("a+", x, y, up), edges("a+", x, y, low), edges("c+", x, y, up), edges("c+", x, y, low));else if (o === 1) isobands.push(edges("a+", x, y, up), edges("b-", x, y, low), edges("c+", x, y, up), edges("d-", x, y, low));else if (o === 2) isobands.push(edges("b-", x, y, up), edges("b-", x, y, low), edges("d-", x, y, up), edges("d-", x, y, low));
          break;

        case "0202":
          o = getCenterOfCell(x, y);
          if (o === 0) isobands.push(edges("b+", x, y, up), edges("b+", x, y, low), edges("d+", x, y, up), edges("d+", x, y, low));else if (o === 1) isobands.push(edges("a-", x, y, low), edges("b+", x, y, up), edges("c-", x, y, low), edges("d+", x, y, up));else if (o === 2) isobands.push(edges("a-", x, y, up), edges("a-", x, y, low), edges("c-", x, y, up), edges("c-", x, y, low));
          break;

        case "0101":
          o = getCenterOfCell(x, y);
          if (o === 0) isobands.push(edges("b+", x, y, low), edges("d+", x, y, low));else if (o === 1) isobands.push(edges("a-", x, y, low), edges("c-", x, y, low));
          break;

        case "1010":
          o = getCenterOfCell(x, y);
          if (o === 0) isobands.push(edges("a+", x, y, low), edges("c+", x, y, low));else if (o === 1) isobands.push(edges("b-", x, y, low), edges("d-", x, y, low));
          break;

        case "2121":
          o = getCenterOfCell(x, y);
          if (o === 1) isobands.push(edges("a+", x, y, up), edges("c+", x, y, up));else if (o === 2) isobands.push(edges("b-", x, y, up), edges("d-", x, y, up));
          break;

        case "1212":
          o = getCenterOfCell(x, y);
          if (o === 1) isobands.push(edges("b+", x, y, up), edges("d+", x, y, up));else if (o === 2) isobands.push(edges("a-", x, y, up), edges("c-", x, y, up));
          break;

        case "2120":
          o = getCenterOfCell(x, y);
          if (o === 1) isobands.push(edges("a+", x, y, up), edges("c+", x, y, up), edges("d-", x, y, low));else if (o === 2) isobands.push(edges("b-", x, y, up), edges("d-", x, y, up), edges("d-", x, y, low));
          break;

        case "2021":
          o = getCenterOfCell(x, y);
          if (o === 1) isobands.push(edges("a+", x, y, up), edges("b-", x, y, low), edges("c+", x, y, up));else if (o === 2) isobands.push(edges("b-", x, y, up), edges("b-", x, y, low), edges("d-", x, y, up));
          break;

        case "1202":
          o = getCenterOfCell(x, y);
          if (o === 1) isobands.push(edges("b+", x, y, up), edges("c-", x, y, low), edges("d+", x, y, up));else if (o === 2) isobands.push(edges("a-", x, y, up), edges("c-", x, y, up), edges("c-", x, y, low));
          break;

        case "0212":
          o = getCenterOfCell(x, y);
          if (o === 1) isobands.push(edges("a-", x, y, low), edges("b+", x, y, up), edges("d+", x, y, up));else if (o === 2) isobands.push(edges("a-", x, y, up), edges("a-", x, y, low), edges("c-", x, y, up));
          break;

        case "0102":
          o = getCenterOfCell(x, y);
          if (o === 0) isobands.push(edges("b+", x, y, low), edges("d+", x, y, up), edges("d+", x, y, low));else if (o === 1) isobands.push(edges("a-", x, y, low), edges("c-", x, y, low), edges("d+", x, y, up));
          break;

        case "0201":
          o = getCenterOfCell(x, y);
          if (o === 0) isobands.push(edges("b+", x, y, up), edges("b+", x, y, low), edges("d+", x, y, low));else if (o === 1) isobands.push(edges("a-", x, y, low), edges("b+", x, y, up), edges("c-", x, y, low));
          break;

        case "1020":
          o = getCenterOfCell(x, y);
          if (o === 0) isobands.push(edges("a+", x, y, low), edges("c+", x, y, up), edges("c+", x, y, low));else if (o === 1) isobands.push(edges("b-", x, y, low), edges("c+", x, y, up), edges("d-", x, y, low));
          break;

        case "2010":
          o = getCenterOfCell(x, y);
          if (o === 0) isobands.push(edges("a+", x, y, up), edges("a+", x, y, low), edges("c+", x, y, low));else if (o === 1) isobands.push(edges("a+", x, y, up), edges("b-", x, y, low), edges("d-", x, y, low));
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
    /* walk on the grid and computing conture */

    for (var i = 0, len = grid.length - 1; i < len; i++) {
      for (var j = 0, len1 = grid[i].length - 1; j < len1; j++) {
        var ternaryCode = getTernaryCode(A(i, j), B(i, j), C(i, j), D(i, j));

        if (ternaryCode === '0000' || ternaryCode === '2222') {
          continue;
        }

        if (ternaryCode !== '1111') {
          insideContouring(ternaryCode, i, j);
        }

        var border = borderCheck(i, j);

        if (border) {
          outsideContouring(ternaryCode, i, j, border);
        }
      }
    }

    return isobands;
  }

  function isobands(grid, intervals) {
    var GeoJson = {
      "type": "FeatureCollection",
      "features": []
    };
    var Bands = [],
        BandsValue = [];
    var lower_h = intervals[0],
        upper_h = Infinity;
    Bands.push(toLine(computeIsobands(grid.grid, lower_h, upper_h)));
    BandsValue.push(intervals[0] + "<");

    for (var i = 0; i < intervals.length - 1; i++) {
      lower_h = intervals[i + 1], upper_h = intervals[i];
      Bands.push(toLine(computeIsobands(grid.grid, lower_h, upper_h)));
      BandsValue.push(lower_h + "-" + upper_h);
    }

    lower_h = -Infinity, upper_h = intervals[intervals.length - 1];
    Bands.push(toLine(computeIsobands(grid.grid, lower_h, upper_h)));
    BandsValue.push(">" + intervals[intervals.length - 1]);
    var newBands = [];

    for (var _i = 0; _i < Bands.length; _i++) {
      newBands.push([]);

      for (var j = 0; j < Bands[_i].length; j++) {
        newBands[_i].push([]);

        for (var k = 0; k < Bands[_i][j].length; k++) {
          newBands[_i][j].push([Bands[_i][j][k][1] * grid.degreeLongCellSize + grid.bbox[0], Bands[_i][j][k][0] * grid.degreeLatCellSize + grid.bbox[1]]);
        }
      }
    }

    for (var _i2 = 0; _i2 < newBands.length; _i2++) {
      GeoJson.features.push({
        "type": "Feature",
        "properties": {
          "value": BandsValue[_i2]
        },
        "geometry": {
          "type": "MultiPolygon",
          "coordinates": compareBands(newBands[_i2])
        }
      });
    }

    return GeoJson;
  }

  function computeIsolines(grid, h) {
    var interpolate = function interpolate(p1, p2) {
      return p1 > h ? (h - p2) / (p1 - p2) : (h - p1) / (p2 - p1);
    };
    /* 
    .....................................................
    .
    A_____M_____B
    |           |
    |           |
    Q     O     N
    |           |
    |___________|
    D     P     C
    .
    .....................................................
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

    var getTernaryCode = function getTernaryCode(a, b, c, d) {
      var check = function check(v) {
        return v <= h ? "0" : "1";
      };

      return check(a) + check(b) + check(c) + check(d);
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
        contouring(getTernaryCode(A(i, j), B(i, j), C(i, j), D(i, j)), i, j);
      }
    }

    function contouring(val, x, y) {
      if (val === "0000" || val === "1111") return;
      var o;

      switch (val) {
        case "1110":
          isolines.push(edges("d-", x, y));
          break;

        case "0001":
          isolines.push(edges("d+", x, y));
          break;

        case "1101":
          isolines.push(edges("c-", x, y));
          break;

        case "0010":
          isolines.push(edges("c+", x, y));
          break;

        case "1011":
          isolines.push(edges("b-", x, y));
          break;

        case "0100":
          isolines.push(edges("b+", x, y));
          break;

        case "0111":
          isolines.push(edges("a-", x, y));
          break;

        case "1000":
          isolines.push(edges("a+", x, y));
          break;

        case "1100":
          isolines.push(edges("t>b", x, y));
          break;

        case "0011":
          isolines.push(edges("b>t", x, y));
          break;

        case "1001":
          isolines.push(edges("l>r", x, y));
          break;

        case "0110":
          isolines.push(edges("r>l", x, y));
          break;

        case "1010":
          o = center(x, y);
          if (o === 0) isolines.push(edges("a+", x, y), edges("c+", x, y));else if (o === 1) isolines.push(edges("b-", x, y), edges("d-", x, y));
          break;

        case "0101":
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
          var tmp = Isolines[_i][j][k][0] * grid.degreeLatCellSize + grid.bbox[1];
          Isolines[_i][j][k][0] = Isolines[_i][j][k][1] * grid.degreeLongCellSize + grid.bbox[0];
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

  Object.defineProperty(exports, '__esModule', { value: true });

})));
