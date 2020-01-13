(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.dline = {}));
}(this, (function (exports) { 'use strict';

    /* Считает шаг по координатам */
    function getDelta(D1, D2, L, LongOrLat) {
      // радиус земли в метрах
      var Earth = 6372795; // переводим координаты из градусов в радианы

      var lat1 = D1[0] * Math.PI / 180;
      var lat2 = D2[0] * Math.PI / 180;
      var long1 = D1[1] * Math.PI / 180;
      var long2 = D2[1] * Math.PI / 180; // расстояние между точками в градусах

      var d = LongOrLat === "Long" ? Math.abs(D1[1] - D2[1]) : LongOrLat === "Lat" ? Math.abs(D1[0] - D2[0]) : NaN; // считаем расстояние между точками

      var Distance = Earth * Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(long1 - long2));
      return d * L / Distance;
    }

    function DrawGrid(Dots, Grid_Lat_Length, Grid_Long_Length, DeltaLat, DeltaLong, Grid_Min_Lat, Grid_Min_Long) {
      var Grid = Array(Grid_Lat_Length); // генерируем сетку

      for (var i = 0; i < Grid_Lat_Length; i++) {
        Grid[i] = Array(Grid_Long_Length);
      } // массив исходных ячеек


      var Cells = [];
      var tempLong, tempLat; // заполняем известные ячейки значениями

      for (var _i = 0; _i < Dots.length; _i++) {
        tempLong = Math.abs(Grid_Min_Long - Dots[_i][1]) / DeltaLong;
        tempLat = Math.abs(Grid_Min_Lat - Dots[_i][0]) / DeltaLat;
        Grid[Math.floor(tempLat)][Math.floor(tempLong)] = Dots[_i][2];
        Cells.push([Math.floor(tempLat), Math.floor(tempLong), Dots[_i][2]]);
      } // числитель, знаминатель


      var up = 0;
      var down = 0; // переменная для первой ячейки строки (0 или 1, т.к. заполняется в шахматном порядке)

      for (var _i2 = 0; _i2 < Grid_Lat_Length; _i2++) {
        /* start = i % 2 === 0 ? 0 : 1; */
        for (var j =
        /* start */
        0; j < Grid_Long_Length; j++) {
          if (Grid[_i2][j] == null) {
            // считаем среднее взвешанное от всех изначальных ячеек (в качестве веса обратное значение квадрата расстояния (1/r^2))
            for (var k = 0; k < Cells.length; k++) {
              up += Cells[k][2] * (1 / Math.pow(Math.pow(_i2 - Cells[k][0], 2) + Math.pow(j - Cells[k][1], 2), 2));
              down += 1 / Math.pow(Math.pow(_i2 - Cells[k][0], 2) + Math.pow(j - Cells[k][1], 2), 2);
            } // добавляем в ячейку значение, зануляем числитель и знаминатель


            Grid[_i2][j] = up / down;
            up = 0;
            down = 0;
          }
        }
      }

      return Grid;
    }

    function DrawGridWithExtrs(Dots, bbox, Detalization) {
      var Dot_Min_Z = Math.min.apply(null, Dots.map(function (Dot) {
        return Dot[2];
      }));
      var Dot_Max_Z = Math.max.apply(null, Dots.map(function (Dot) {
        return Dot[2];
      })); // расстояние между границами сетки в координатах

      var Grid_Long = bbox[2] - bbox[0];
      var Grid_Lat = bbox[3] - bbox[1]; // шаг

      var DeltaLong = getDelta([bbox[1], bbox[0]], [bbox[1], bbox[2]], Detalization, "Long");
      var DeltaLat = getDelta([bbox[1], bbox[0]], [bbox[3], bbox[0]], Detalization, "Lat"); // колличество ячеек сетки

      var Grid_Long_Length = Math.ceil(Grid_Long / DeltaLong);
      var Grid_Lat_Length = Math.ceil(Grid_Lat / DeltaLat);
      var Grid = DrawGrid(Dots, Grid_Lat_Length, Grid_Long_Length, DeltaLat, DeltaLong, bbox[1], bbox[0]);
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

    /* из пар точек делает последовательность */
    function getIsolines(RawIsolines) {
      var TempIsolines = [];
      var End_Isoline = true;

      while (RawIsolines.length > 0) {
        if (End_Isoline === true) {
          TempIsolines.push([]);
          TempIsolines[TempIsolines.length - 1].push([RawIsolines[0][0], RawIsolines[0][1]], [RawIsolines[0][2], RawIsolines[0][3]]);
          RawIsolines.splice(0, 1);
        }

        End_Isoline = true;

        for (var i = 0, len = RawIsolines.length; i < len; i++) {
          if (TempIsolines[TempIsolines.length - 1][TempIsolines[TempIsolines.length - 1].length - 1][0] === RawIsolines[i][0] && TempIsolines[TempIsolines.length - 1][TempIsolines[TempIsolines.length - 1].length - 1][1] === RawIsolines[i][1]) {
            TempIsolines[TempIsolines.length - 1].push([RawIsolines[i][2], RawIsolines[i][3]]);
            RawIsolines.splice(i, 1);
            End_Isoline = false;
            break;
          } else if (TempIsolines[TempIsolines.length - 1][TempIsolines[TempIsolines.length - 1].length - 1][0] === RawIsolines[i][2] && TempIsolines[TempIsolines.length - 1][TempIsolines[TempIsolines.length - 1].length - 1][1] === RawIsolines[i][3]) {
            TempIsolines[TempIsolines.length - 1].push([RawIsolines[i][0], RawIsolines[i][1]]);
            RawIsolines.splice(i, 1);
            End_Isoline = false;
            break;
          }

          if (TempIsolines[TempIsolines.length - 1][0][0] === RawIsolines[i][0] && TempIsolines[TempIsolines.length - 1][0][1] === RawIsolines[i][1]) {
            TempIsolines[TempIsolines.length - 1].unshift([RawIsolines[i][2], RawIsolines[i][3]]);
            RawIsolines.splice(i, 1);
            End_Isoline = false;
            break;
          } else if (TempIsolines[TempIsolines.length - 1][0][0] === RawIsolines[i][2] && TempIsolines[TempIsolines.length - 1][0][1] === RawIsolines[i][3]) {
            TempIsolines[TempIsolines.length - 1].unshift([RawIsolines[i][0], RawIsolines[i][1]]);
            RawIsolines.splice(i, 1);
            End_Isoline = false;
            break;
          }
        }
      }

      return TempIsolines;
    }

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

    function compareBands(bnds) {
      var bands = _toConsumableArray(bnds);

      bands.sort(function (a, b) {
        return a.length - b.length;
      }).reverse();
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

    function stepOption(options, Dot_Max_Z, Dot_Min_Z) {
      switch (options.type) {
        case "CustomValues":
          return options.values;

        case "Range":
          return stepParse(options.max, options.min, options.step);

        case "FullRange":
          return stepParse(Dot_Max_Z, Dot_Min_Z, options.step);
      }

      function stepParse(max, min, d) {
        var fixLen = d.toString().includes('.') ? d.toString().split('.').pop().length : 0;
        var steps = [];
        var h = max;

        while (h >= min) {
          steps.push(h);
          h -= d;
          h = parseFloat(h.toFixed(fixLen));
        }

        return steps;
      }
    }

    function computeIsobands(grid, low, up) {
      var interpolate = function interpolate(p1, p2, c) {
        return p1 > c ? (c - p2) / (p1 - p2) : (c - p1) / (p2 - p1);
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
          return v < low ? '0' : v >= low && v < up ? '1' : '2';
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
        return O < low ? 0 : O >= low && O < up ? 1 : 2;
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

    function drawIsobands(Grid, Step, DeltaLat, DeltaLong, Grid_Min_Lat, Grid_Min_Long, Dot_Max_Z, Dot_Min_Z) {
      var GeoJson = {
        "type": "FeatureCollection",
        "features": []
      };
      var Bands = [],
          BandsValue = [];
      var Steps = stepOption(Step, Dot_Max_Z, Dot_Min_Z);
      var lower_h = Steps[0],
          upper_h = Infinity;
      Bands.push(getIsolines(computeIsobands(Grid, lower_h, upper_h)));
      BandsValue.push("more than " + Steps[0]);

      for (var i = 0; i < Steps.length - 1; i++) {
        lower_h = Steps[i + 1], upper_h = Steps[i];
        Bands.push(getIsolines(computeIsobands(Grid, lower_h, upper_h)));
        BandsValue.push(upper_h);
      }

      lower_h = -Infinity, upper_h = Steps[Steps.length - 1];
      Bands.push(getIsolines(computeIsobands(Grid, lower_h, upper_h)));
      BandsValue.push("less than " + Steps[Steps.length - 1]);
      var newBands = [];
      var minlatbb = Infinity,
          maxlatbb = -Infinity;
      var minlongbb = Infinity,
          maxlongbb = -Infinity;
      var chache = [];

      for (var _i = 0; _i < Bands.length; _i++) {
        newBands.push([]);

        for (var j = 0; j < Bands[_i].length; j++) {
          newBands[_i].push([]);

          for (var k = 0; k < Bands[_i][j].length; k++) {
            if (k > 0 && k < Bands[_i][j].length - 1) {
              if (Bands[_i][j][k][0] === Bands[_i][j][k + 1][0] && Bands[_i][j][k][0] === Bands[_i][j][k - 1][0] || Bands[_i][j][k][1] === Bands[_i][j][k + 1][1] && Bands[_i][j][k][1] === Bands[_i][j][k - 1][1]) {
                if (Bands[_i][j][k][0] < minlatbb) minlatbb = Bands[_i][j][k][0];
                if (Bands[_i][j][k][0] > maxlatbb) maxlatbb = Bands[_i][j][k][0];
                if (Bands[_i][j][k][1] < minlongbb) minlongbb = Bands[_i][j][k][1];
                if (Bands[_i][j][k][1] > maxlongbb) maxlongbb = Bands[_i][j][k][1];
                continue;
              }
            }

            newBands[_i][j].push([Bands[_i][j][k][1] * DeltaLong + Grid_Min_Long, Bands[_i][j][k][0] * DeltaLat + Grid_Min_Lat]);
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

      return {
        GeoJson: GeoJson,
        chache: chache
      };
    }

    function DrawIsobandsWithExtrs(Dots, Step, Detalization, bbox) {
      var Grid = DrawGridWithExtrs(Dots, bbox, Detalization);
      return drawIsobands(Grid.Grid, Step, Grid.DeltaLat, Grid.DeltaLong, Grid.Grid_Min_Lat, Grid.Grid_Min_Long, Grid.Dot_Max_Z, Grid.Dot_Min_Z);
    }

    function DrawGridWithoutExtrs(Dots, Detalization, Percent_size) {
      var Dot_Min_Lat = Math.min.apply(Math, _toConsumableArray(Dots.map(function (Dot) {
        return Dot[0];
      })));
      var Dot_Max_Lat = Math.max.apply(null, Dots.map(function (Dot) {
        return Dot[0];
      }));
      var Dot_Min_Long = Math.min.apply(null, Dots.map(function (Dot) {
        return Dot[1];
      }));
      var Dot_Max_Long = Math.max.apply(null, Dots.map(function (Dot) {
        return Dot[1];
      }));
      var Dot_Min_Z = Math.min.apply(null, Dots.map(function (Dot) {
        return Dot[2];
      }));
      var Dot_Max_Z = Math.max.apply(null, Dots.map(function (Dot) {
        return Dot[2];
      })); // расстояние между крайними точками в координатах

      var Dot_Long = Dot_Max_Long - Dot_Min_Long;
      var Dot_Lat = Dot_Max_Lat - Dot_Min_Lat; // расстояние между границами сетки в координатах

      var Grid_Long = Dot_Long * (100 + Percent_size) / 100;
      var Grid_Lat = Dot_Lat * (100 + Percent_size) / 100; // вершины сетки

      var Grid_Min_Long = Dot_Min_Long - (Grid_Long - Dot_Long) / 2;
      var Grid_Min_Lat = Dot_Min_Lat - (Grid_Lat - Dot_Lat) / 2;
      var Grid_Max_Long = Dot_Max_Long + (Grid_Long - Dot_Long) / 2;
      var Grid_Max_Lat = Dot_Max_Lat + (Grid_Lat - Dot_Lat) / 2; // шаг

      var DeltaLong = getDelta([Grid_Min_Lat, Grid_Min_Long], [Grid_Min_Lat, Grid_Max_Long], Detalization, "Long");
      var DeltaLat = getDelta([Grid_Min_Lat, Grid_Min_Long], [Grid_Max_Lat, Grid_Min_Long], Detalization, "Lat"); // колличество ячеек сетки

      var Grid_Long_Length = Math.ceil(Grid_Long / DeltaLong);
      var Grid_Lat_Length = Math.ceil(Grid_Lat / DeltaLat);
      var Grid = DrawGrid(Dots, Grid_Lat_Length, Grid_Long_Length, DeltaLat, DeltaLong, Grid_Min_Lat, Grid_Min_Long);
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

    function DrawIsobandsWithoutExtrs(Dots, Step, Detalization, Percent_size) {
      var Grid = DrawGridWithoutExtrs(Dots, Detalization, Percent_size);
      var Bands = drawIsobands(Grid.Grid, Step, Grid.DeltaLat, Grid.DeltaLong, Grid.Grid_Min_Lat, Grid.Grid_Min_Long, Grid.Dot_Max_Z, Grid.Dot_Min_Z);
      return Bands;
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

    function drawIsolines(Grid, Step, DeltaLat, DeltaLong, Grid_Min_Lat, Grid_Min_Long, Dot_Max_Z, Dot_Min_Z) {
      var Isolines = [];
      var IsolinesValue = [];
      var GeoJson = {
        "type": "FeatureCollection",
        "features": []
      };
      var Steps = stepOption(Step, Dot_Max_Z, Dot_Min_Z);
      var h;

      for (var i = 0; i < Steps.length; i++) {
        h = Steps[i];
        Isolines.push(getIsolines(computeIsolines(Grid, h)));
        IsolinesValue.push(h);
      }

      var thrid;

      for (var _i = 0; _i < Isolines.length; _i++) {
        for (var j = 0; j < Isolines[_i].length; j++) {
          for (var k = 0; k < Isolines[_i][j].length; k++) {
            // переводим координаты точек в градусы
            thrid = Isolines[_i][j][k][0] * DeltaLat + Grid_Min_Lat;
            Isolines[_i][j][k][0] = Isolines[_i][j][k][1] * DeltaLong + Grid_Min_Long;
            Isolines[_i][j][k][1] = thrid;
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

    function DrawIsolinesWithExtrs(Dots, Step, Detalization, bbox) {
      var Grid = DrawGridWithExtrs(Dots, bbox, Detalization);
      return drawIsolines(Grid.Grid, Step, Grid.DeltaLat, Grid.DeltaLong, Grid.Grid_Min_Lat, Grid.Grid_Min_Long, Grid.Dot_Max_Z, Grid.Dot_Min_Z);
    }

    function DrawIsolinesWithoutExtrs(Dots, Step, Detalization, Percent_size) {
      var Grid = DrawGridWithoutExtrs(Dots, Detalization, Percent_size);
      return drawIsolines(Grid.Grid, Step, Grid.DeltaLat, Grid.DeltaLong, Grid.Grid_Min_Lat, Grid.Grid_Min_Long, Grid.Dot_Max_Z, Grid.Dot_Min_Z);
    }

    function DrawIsolinesWitchCustomGrid(Grid, Step, DeltaLat, DeltaLong, minLat, minLong, minZ, maxZ) {
      return drawIsolines(Grid, Step, DeltaLat, DeltaLong, minLat, minLong, maxZ, minZ);
    }

    function DrawIsobandsWithCustomGrid(Grid, Step, DeltaLat, DeltaLong, minLat, minLong, minZ, maxZ) {
      return drawIsobands(Grid, Step, DeltaLat, DeltaLong, minLat, minLong, maxZ, minZ);
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

    function IDW(points, cellSize) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      var _optionsParser = optionsParser(options, points),
          bbox = _optionsParser.bbox,
          units = _optionsParser.units,
          exponent = _optionsParser.exponent,
          barriers = _optionsParser.barriers;

      var _cellSizes = cellSizes(bbox, cellSize, units[0]),
          latSize = _cellSizes.latSize,
          longSize = _cellSizes.longSize,
          degreeLatCellSize = _cellSizes.degreeLatCellSize,
          degreeLongCellSize = _cellSizes.degreeLongCellSize;

      var grid;

      if (units[1] === 'degrees') {
        grid = calcInDegrees();
      } else if (units[1] === 'meters') {
        grid = calcInMeters();
      } else {
        throw new Error('как такое вообще возможно?');
      }

      return {
        grid: grid,
        latSize: latSize,
        longSize: longSize,
        degreeLatCellSize: degreeLatCellSize,
        degreeLongCellSize: degreeLongCellSize,
        bbox: bbox
      };

      function calcInDegrees() {
        var _points = points.map(function (point) {
          return [Math.abs(bbox[1] - point[0]) / degreeLatCellSize, Math.abs(bbox[0] - point[1]) / degreeLongCellSize, point[2]];
        });

        var Grid = [];

        if (barriers) {
          barriers.forEach(function (barrier) {
            for (var i = 0; i < barrier.coordinates.length; i++) {
              var tmp = Math.abs(bbox[1] - barrier.coordinates[i][1]) / degreeLatCellSize;
              barrier.coordinates[i][1] = Math.abs(bbox[0] - barrier.coordinates[i][0]) / degreeLongCellSize;
              barrier.coordinates[i][0] = tmp;
            }
          });

          for (var i = 0; i < latSize; i++) {
            Grid[i] = [];

            var _loop = function _loop(j) {
              var cellCenter = [i + 0.5, j + 0.5];
              var top = 0,
                  bot = 0;

              _points.forEach(function (point) {
                var weight = 0;
                barriers.forEach(function (barrier) {
                  var tmpW = intersection(barrier, [point, cellCenter]);

                  if (tmpW) {
                    weight += tmpW;
                  }
                });
                var d = Math.pow(Math.pow(cellCenter[0] - point[0], 2) + Math.pow(cellCenter[1] - point[1], 2), 2);
                top += point[2] / Math.pow(d, exponent + weight);
                bot += 1 / Math.pow(d, exponent + weight);
              });

              Grid[i][j] = top / bot;
            };

            for (var j = 0; j < longSize; j++) {
              _loop(j);
            }
          }
        } else {
          for (var _i = 0; _i < latSize; _i++) {
            Grid[_i] = [];

            var _loop2 = function _loop2(_j) {
              var cellCenter = [_i + 0.5, _j + 0.5];
              var top = 0,
                  bot = 0;

              _points.forEach(function (point) {
                var d = Math.pow(Math.pow(cellCenter[0] - point[0], 2) + Math.pow(cellCenter[1] - point[1], 2), 2);
                top += point[2] / Math.pow(d, exponent);
                bot += 1 / Math.pow(d, exponent);
              });

              Grid[_i][_j] = top / bot;
            };

            for (var _j = 0; _j < longSize; _j++) {
              _loop2(_j);
            }
          }
        }

        return Grid;
      }

      function calcInMeters() {
        var Grid = [];

        for (var i = 0; i < latSize; i++) {
          Grid[i] = [];

          var _loop3 = function _loop3(j) {
            var cellCenter = [bbox[1] + (i + 0.5) * degreeLatCellSize, bbox[0] + (j + 0.5) * degreeLongCellSize];
            var top = 0,
                bot = 0;
            points.forEach(function (point) {
              var d = distance(point, cellCenter);
              top += point[2] / Math.pow(d, exponent);
              bot += 1 / Math.pow(d, exponent);
            });
            Grid[i][j] = top / bot;
          };

          for (var j = 0; j < longSize; j++) {
            _loop3(j);
          }
        }

        return Grid;
      }
    }

    function optionsParser(options, points) {
      var bbox = options.bbox,
          units = options.units,
          exponent = options.exponent,
          barriers = options.barriers;

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

      if (barriers) {
        barriers = barriers.features.map(function (barrier) {
          return {
            coordinates: barrier.geometry.coordinates,
            left: barrier.properties.left,
            right: barrier.properties.right
          };
        });
      }

      return {
        bbox: bbox,
        units: units,
        exponent: exponent,
        barriers: barriers
      };
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

    function intersection(barrier, segment) {
      var getVector = function getVector(p1, p2) {
        return [p2[0] - p1[0], p2[1] - p1[1]];
      };

      var obliqueProduct = function obliqueProduct(v1, v2) {
        return v1[0] * v2[1] - v2[0] * v1[1];
      };

      var ans = [];

      for (var i = 0; i < barrier.coordinates.length - 1; i++) {
        var tmp = check([barrier.coordinates[i], barrier.coordinates[i + 1]], segment);

        if (tmp) {
          ans.push(tmp);
        }
      }

      if (ans.length % 2) {
        return ans[0];
      } else {
        return false;
      }

      function check(a, b) {
        var one = false;
        var two = false;
        var segment = getVector(b[0], b[1]);
        var vec1 = getVector(b[0], a[0]);
        var vec2 = getVector(b[0], a[1]);
        var fst = obliqueProduct(segment, vec1);
        var sec = obliqueProduct(segment, vec2);

        if (fst * sec < 0) {
          one = true;
        }

        segment = getVector(a[0], a[1]);
        vec1 = getVector(a[0], b[0]);
        vec2 = getVector(a[0], b[1]);
        fst = obliqueProduct(segment, vec1);
        sec = obliqueProduct(segment, vec2);

        if (fst * sec < 0) {
          two = true;
        }

        if (one && two) {
          if (sec < 0) {
            return barrier.left;
          } else {
            return barrier.left;
          }
        }

        return false;
      }
    }

    function bezier(geometry) {
      var out = [];
      var newLine = [];
      var closed = true;

      if (geometry[0][0] !== geometry[geometry.length - 1][0] || geometry[0][1] !== geometry[geometry.length - 1][1]) {
        closed = false;
      }

      for (var i = 0; i < geometry.length; i++) {
        var next = void 0,
            prev = void 0;

        if (i === 0) {
          if (closed) {
            next = geometry[i + 1];
            prev = geometry[geometry.length - 2];
          } else {
            next = geometry[i + 1];
            prev = geometry[i];
          }
        } else if (i === geometry.length - 1) {
          if (closed) {
            out.push([out[0][0], out[0][1]]);
            break;
          } else {
            next = geometry[i];
            prev = geometry[i - 1];
          }
        } else {
          next = geometry[i + 1];
          prev = geometry[i - 1];
        }

        var vector = [(next[0] - prev[0]) / 2, (next[1] - prev[1]) / 2];
        var refP1 = [geometry[i][0] - vector[0] / 3, geometry[i][1] - vector[1] / 3];
        var refP2 = [geometry[i][0] + vector[0] / 3, geometry[i][1] + vector[1] / 3];
        out.push([refP1, refP2]);
      }

      var deb = [];

      for (var _i = 0; _i < geometry.length - 1; _i++) {
        deb.push([geometry[_i], out[_i][1], out[_i + 1][0], geometry[_i + 1]]);

        for (var t = 0; t < 1; t += .1) {
          var _long = Math.pow(1 - t, 3) * geometry[_i][0] + 3 * Math.pow(1 - t, 2) * t * out[_i][1][0] + 3 * (1 - t) * Math.pow(t, 2) * out[_i + 1][0][0] + Math.pow(t, 3) * geometry[_i + 1][0];

          var lat = Math.pow(1 - t, 3) * geometry[_i][1] + 3 * Math.pow(1 - t, 2) * t * out[_i][1][1] + 3 * (1 - t) * Math.pow(t, 2) * out[_i + 1][0][1] + Math.pow(t, 3) * geometry[_i + 1][1];

          newLine.push([_long, lat]);
        }
      }

      return newLine;
    }

    exports.DrawGridWithExtrs = DrawGridWithExtrs;
    exports.DrawIsobandsWithCustomGrid = DrawIsobandsWithCustomGrid;
    exports.DrawIsobandsWithExtrs = DrawIsobandsWithExtrs;
    exports.DrawIsobandsWithoutExtrs = DrawIsobandsWithoutExtrs;
    exports.DrawIsolinesWitchCustomGrid = DrawIsolinesWitchCustomGrid;
    exports.DrawIsolinesWithExtrs = DrawIsolinesWithExtrs;
    exports.DrawIsolinesWithoutExtrs = DrawIsolinesWithoutExtrs;
    exports.IDW = IDW;
    exports.bezier = bezier;
    exports.cellSizes = cellSizes;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
