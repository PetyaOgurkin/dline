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

    /* из пар точек делает последовательность */

    function getCentroid(d1, d2) {
      var x = (d1[0] + d2[0]) / 2;
      var y = (d1[1] + d2[1]) / 2;
      return [x, y];
    }

    function getIsolines(RawIsolines, longMax, latMax) {
      var TempIsolines = [];
      var dualInterpolate = [];
      var End_Isoline = true;

      while (RawIsolines.length > 0) {
        if (End_Isoline === true) {
          TempIsolines.push([]);
          dualInterpolate.push([]);
          TempIsolines[TempIsolines.length - 1].push([RawIsolines[0][0], RawIsolines[0][1]], [RawIsolines[0][2], RawIsolines[0][3]]);

          if (RawIsolines[0][0] === 0.5 || RawIsolines[0][1] === 0.5 || RawIsolines[0][2] === 0.5 || RawIsolines[0][3] === 0.5 || RawIsolines[0][0] === latMax || RawIsolines[0][1] === longMax || RawIsolines[0][2] === latMax || RawIsolines[0][3] === longMax) {
            dualInterpolate[dualInterpolate.length - 1].push([RawIsolines[0][0], RawIsolines[0][1]], [RawIsolines[0][2], RawIsolines[0][3]]);
          } else {
            dualInterpolate[dualInterpolate.length - 1].push(getCentroid([RawIsolines[0][0], RawIsolines[0][1]], [RawIsolines[0][2], RawIsolines[0][3]]));
          }

          RawIsolines.splice(0, 1);
        }

        End_Isoline = true;

        for (var i = 0, len = RawIsolines.length; i < len; i++) {
          if (TempIsolines[TempIsolines.length - 1][TempIsolines[TempIsolines.length - 1].length - 1][0] === RawIsolines[i][0] && TempIsolines[TempIsolines.length - 1][TempIsolines[TempIsolines.length - 1].length - 1][1] === RawIsolines[i][1]) {
            TempIsolines[TempIsolines.length - 1].push([RawIsolines[i][2], RawIsolines[i][3]]);

            if (RawIsolines[i][0] === 0.5 || RawIsolines[i][1] === 0.5 || RawIsolines[i][2] === 0.5 || RawIsolines[i][3] === 0.5 || RawIsolines[i][0] === latMax || RawIsolines[i][1] === longMax || RawIsolines[i][2] === latMax || RawIsolines[i][3] === longMax) {
              dualInterpolate[dualInterpolate.length - 1].push([RawIsolines[i][2], RawIsolines[i][3]]);
            } else {
              dualInterpolate[dualInterpolate.length - 1].push(getCentroid([RawIsolines[i][0], RawIsolines[i][1]], [RawIsolines[i][2], RawIsolines[i][3]]));
            }

            RawIsolines.splice(i, 1);
            End_Isoline = false;
            break;
          } else if (TempIsolines[TempIsolines.length - 1][TempIsolines[TempIsolines.length - 1].length - 1][0] === RawIsolines[i][2] && TempIsolines[TempIsolines.length - 1][TempIsolines[TempIsolines.length - 1].length - 1][1] === RawIsolines[i][3]) {
            TempIsolines[TempIsolines.length - 1].push([RawIsolines[i][0], RawIsolines[i][1]]);

            if (RawIsolines[i][0] === 0.5 || RawIsolines[i][1] === 0.5 || RawIsolines[i][2] === 0.5 || RawIsolines[i][3] === 0.5 || RawIsolines[i][0] === latMax || RawIsolines[i][1] === longMax || RawIsolines[i][2] === latMax || RawIsolines[i][3] === longMax) {
              dualInterpolate[dualInterpolate.length - 1].push([RawIsolines[i][0], RawIsolines[i][1]]);
            } else {
              dualInterpolate[dualInterpolate.length - 1].push(getCentroid([RawIsolines[i][0], RawIsolines[i][1]], [RawIsolines[i][2], RawIsolines[i][3]]));
            }

            RawIsolines.splice(i, 1);
            End_Isoline = false;
            break;
          }

          if (TempIsolines[TempIsolines.length - 1][0][0] === RawIsolines[i][0] && TempIsolines[TempIsolines.length - 1][0][1] === RawIsolines[i][1]) {
            TempIsolines[TempIsolines.length - 1].unshift([RawIsolines[i][2], RawIsolines[i][3]]);

            if (RawIsolines[i][0] === 0.5 || RawIsolines[i][1] === 0.5 || RawIsolines[i][2] === 0.5 || RawIsolines[i][3] === 0.5 || RawIsolines[i][0] === latMax || RawIsolines[i][1] === longMax || RawIsolines[i][2] === latMax || RawIsolines[i][3] === longMax) {
              dualInterpolate[dualInterpolate.length - 1].unshift([RawIsolines[i][2], RawIsolines[i][3]]);
            } else {
              dualInterpolate[dualInterpolate.length - 1].unshift(getCentroid([RawIsolines[i][0], RawIsolines[i][1]], [RawIsolines[i][2], RawIsolines[i][3]]));
            }

            RawIsolines.splice(i, 1);
            End_Isoline = false;
            break;
          } else if (TempIsolines[TempIsolines.length - 1][0][0] === RawIsolines[i][2] && TempIsolines[TempIsolines.length - 1][0][1] === RawIsolines[i][3]) {
            TempIsolines[TempIsolines.length - 1].unshift([RawIsolines[i][0], RawIsolines[i][1]]);

            if (RawIsolines[i][0] === 0.5 || RawIsolines[i][1] === 0.5 || RawIsolines[i][2] === 0.5 || RawIsolines[i][3] === 0.5 || RawIsolines[i][0] === latMax || RawIsolines[i][1] === longMax || RawIsolines[i][2] === latMax || RawIsolines[i][3] === longMax) {
              dualInterpolate[dualInterpolate.length - 1].unshift([RawIsolines[i][0], RawIsolines[i][1]]);
            } else {
              dualInterpolate[dualInterpolate.length - 1].unshift(getCentroid([RawIsolines[i][0], RawIsolines[i][1]], [RawIsolines[i][2], RawIsolines[i][3]]));
            }

            RawIsolines.splice(i, 1);
            End_Isoline = false;
            break;
          }
        }

        if (End_Isoline) {
          if (TempIsolines[TempIsolines.length - 1][0][0] === TempIsolines[TempIsolines.length - 1][TempIsolines[TempIsolines.length - 1].length - 1][0] && TempIsolines[TempIsolines.length - 1][0][1] === TempIsolines[TempIsolines.length - 1][TempIsolines[TempIsolines.length - 1].length - 1][1]) {
            dualInterpolate[dualInterpolate.length - 1].push([dualInterpolate[dualInterpolate.length - 1][0][0], dualInterpolate[dualInterpolate.length - 1][0][1]]);
          }
        }
      }

      if (TempIsolines[TempIsolines.length - 1][0][0] === TempIsolines[TempIsolines.length - 1][TempIsolines[TempIsolines.length - 1].length - 1][0] && TempIsolines[TempIsolines.length - 1][0][1] === TempIsolines[TempIsolines.length - 1][TempIsolines[TempIsolines.length - 1].length - 1][1]) {
        dualInterpolate[dualInterpolate.length - 1].push([dualInterpolate[dualInterpolate.length - 1][0][0], dualInterpolate[dualInterpolate.length - 1][0][1]]);
      }

      return dualInterpolate;
    }

    function findIsobands(Grid, low, up, LongFinish, LatFinish) {
      var bands = [];

      var interpolate = function interpolate(f1, f2, c) {
        return (c - f2) / (f1 - f2);
      };

      function wall(y, x) {
        if (y !== 0 && x !== 0 && x !== Grid[y].length - LongFinish - 3 && y !== Grid.length - LatFinish - 3) return 0;else if (y === 0 && x !== 0 && x !== Grid[y].length - LongFinish - 3) return "c";else if (y !== 0 && x === Grid[y].length - LongFinish - 3 && y !== Grid.length - LatFinish - 3) return "b";else if (y === Grid.length - LatFinish - 3 && x !== 0 && x !== Grid[y].length - LongFinish - 3) return "a";else if (y !== 0 && x === 0 && y !== Grid.length - LatFinish - 3) return "d";else if (y === 0 && x === Grid[y].length - LongFinish - 3) return "bc";else if (y === Grid.length - LatFinish - 3 && x === Grid[y].length - LongFinish - 3) return "ab";else if (y === Grid.length - LatFinish - 3 && x === 0) return "ad";else if (y === 0 && x === 0) return "cd";
      }

      function cells(y, x, c, val) {
        switch (val) {
          case "a":
            return [y + 1 + interpolate(Grid[y + 2][x], Grid[y][x], c), x + 0.5, y + 2.5, x + 1 + interpolate(Grid[y + 2][x + 2], Grid[y + 2][x], c)];

          case "b":
            return [y + 2.5, x + 1 + interpolate(Grid[y + 2][x + 2], Grid[y + 2][x], c), y + 1 + interpolate(Grid[y + 2][x + 2], Grid[y][x + 2], c), x + 2.5];

          case "c":
            return [y + 1 + interpolate(Grid[y + 2][x + 2], Grid[y][x + 2], c), x + 2.5, y + 0.5, x + 1 + interpolate(Grid[y][x + 2], Grid[y][x], c)];

          case "d":
            return [y + 1 + interpolate(Grid[y + 2][x], Grid[y][x], c), x + 0.5, y + 0.5, x + 1 + interpolate(Grid[y][x + 2], Grid[y][x], c)];

          case "v":
            return [y + 2.5, x + 1 + interpolate(Grid[y + 2][x + 2], Grid[y + 2][x], c), y + 0.5, x + 1 + interpolate(Grid[y][x + 2], Grid[y][x], c)];

          case "h":
            return [y + 1 + interpolate(Grid[y + 2][x], Grid[y][x], c), x + 0.5, y + 1 + interpolate(Grid[y + 2][x + 2], Grid[y][x + 2], c), x + 2.5];
        }
      }

      function sides(y, x, c, val) {
        switch (val) {
          case "t_l":
            return [y + 2.5, x + 0.5, y + 2.5, x + 1 + interpolate(Grid[y + 2][x + 2], Grid[y + 2][x], c)];

          case "t_r":
            return [y + 2.5, x + 2.5, y + 2.5, x + 1 + interpolate(Grid[y + 2][x + 2], Grid[y + 2][x], c)];

          case "r_t":
            return [y + 2.5, x + 2.5, y + 1 + interpolate(Grid[y + 2][x + 2], Grid[y][x + 2], c), x + 2.5];

          case "r_b":
            return [y + 0.5, x + 2.5, y + 1 + interpolate(Grid[y + 2][x + 2], Grid[y][x + 2], c), x + 2.5];

          case "b_l":
            return [y + 0.5, x + 0.5, y + 0.5, x + 1 + interpolate(Grid[y][x + 2], Grid[y][x], c)];

          case "b_r":
            return [y + 0.5, x + 2.5, y + 0.5, x + 1 + interpolate(Grid[y][x + 2], Grid[y][x], c)];

          case "l_t":
            return [y + 2.5, x + 0.5, y + 1 + interpolate(Grid[y + 2][x], Grid[y][x], c), x + 0.5];

          case "l_b":
            return [y + 0.5, x + 0.5, y + 1 + interpolate(Grid[y + 2][x], Grid[y][x], c), x + 0.5];
        }
      }

      function center_sides_horiz(y, x, c_l, c_r, val) {
        if (val === "t_c") {
          return [y + 2.5, x + 1 + interpolate(Grid[y + 2][x + 2], Grid[y + 2][x], c_l), y + 2.5, x + 1 + interpolate(Grid[y + 2][x + 2], Grid[y + 2][x], c_r)];
        } else if (val === "b_c") {
          return [y + 0.5, x + 1 + interpolate(Grid[y][x + 2], Grid[y][x], c_l), y + 0.5, x + 1 + interpolate(Grid[y][x + 2], Grid[y][x], c_r)];
        }
      }

      function center_sides_vert(y, x, c_t, c_b, val) {
        if (val === "r_c") {
          return [y + 1 + interpolate(Grid[y + 2][x + 2], Grid[y][x + 2], c_t), x + 2.5, y + 1 + interpolate(Grid[y + 2][x + 2], Grid[y + 2][x], c_b), x + 2.5];
        } else if (val === "l_c") {
          return [y + 1 + interpolate(Grid[y][x + 2], Grid[y][x + 2], c_t), x + 0.5, y + 1 + interpolate(Grid[y][x + 2], Grid[y][x], c_b), x + 0.5];
        }
      }

      var a, b, c, d, e;
      var wall_tmp;

      for (var i = 0, len = Grid.length - LatFinish - 2; i < len; i += 2) {
        for (var j = 0, len1 = Grid[i].length - LongFinish - 2; j < len1; j += 2) {
          a = Grid[i + 2][j] < low ? "0" : Grid[i + 2][j] >= low && Grid[i + 2][j] < up ? "1" : Grid[i + 2][j] >= up ? "2" : NaN;
          b = Grid[i + 2][j + 2] < low ? "0" : Grid[i + 2][j + 2] >= low && Grid[i + 2][j + 2] < up ? "1" : Grid[i + 2][j + 2] >= up ? "2" : NaN;
          c = Grid[i][j + 2] < low ? "0" : Grid[i][j + 2] >= low && Grid[i][j + 2] < up ? "1" : Grid[i][j + 2] >= up ? "2" : NaN;
          d = Grid[i][j] < low ? "0" : Grid[i][j] >= low && Grid[i][j] < up ? "1" : Grid[i][j] >= up ? "2" : NaN;
          e = Grid[i + 1][j + 1] < low ? 0 : Grid[i + 1][j + 1] >= low && Grid[i + 1][j + 1] < up ? 1 : Grid[i + 1][j + 1] >= up ? 2 : NaN;
          cells_main(a + b + c + d, i, j);
          wall_tmp = wall(i, j);

          if (wall_tmp !== 0) {
            switch (wall_tmp) {
              case "a":
                side_a(a + b, i, j);
                break;

              case "b":
                side_b(b + c, i, j);
                break;

              case "c":
                side_c(c + d, i, j);
                break;

              case "d":
                side_d(d + a, i, j);
                break;

              case "ab":
                side_a(a + b, i, j);
                side_b(b + c, i, j);
                break;

              case "bc":
                side_b(b + c, i, j);
                side_c(c + d, i, j);
                break;

              case "cd":
                side_c(c + d, i, j);
                side_d(d + a, i, j);
                break;

              case "ad":
                side_a(a + b, i, j);
                side_d(d + a, i, j);
                break;
            }
          }
        }
      }

      function cells_main(val, y, x) {
        if (val === "0000" || val === "1111" || val === "2222") return;

        switch (val) {
          // single angle
          case "2221":
          case "1112":
            bands.push(cells(y, x, up, "d"));
            break;

          case "0001":
          case "1110":
            bands.push(cells(y, x, low, "d"));
            break;

          case "2212":
          case "1121":
            bands.push(cells(y, x, up, "c"));
            break;

          case "0010":
          case "1101":
            bands.push(cells(y, x, low, "c"));
            break;

          case "2122":
          case "1211":
            bands.push(cells(y, x, up, "b"));
            break;

          case "0100":
          case "1011":
            bands.push(cells(y, x, low, "b"));
            break;

          case "1222":
          case "2111":
            bands.push(cells(y, x, up, "a"));
            break;

          case "1000":
          case "0111":
            bands.push(cells(y, x, low, "a"));
            break;
          // single rectangle

          case "0011":
          case "1100":
            bands.push(cells(y, x, low, "h"));
            break;

          case "2211":
          case "1122":
            bands.push(cells(y, x, up, "h"));
            break;

          case "0110":
          case "1001":
            bands.push(cells(y, x, low, "v"));
            break;

          case "2112":
          case "1221":
            bands.push(cells(y, x, up, "v"));
            break;

          case "2200":
          case "0022":
            bands.push(cells(y, x, up, "h"), cells(y, x, low, "h"));
            break;

          case "2002":
          case "0220":
            bands.push(cells(y, x, up, "v"), cells(y, x, low, "v"));
            break;
          // single trapezoid

          case "2220":
          case "0002":
            bands.push(cells(y, x, up, "d"), cells(y, x, low, "d"));
            break;

          case "2202":
          case "0020":
            bands.push(cells(y, x, up, "c"), cells(y, x, low, "c"));
            break;

          case "2022":
          case "0200":
            bands.push(cells(y, x, up, "b"), cells(y, x, low, "b"));
            break;

          case "0222":
          case "2000":
            bands.push(cells(y, x, up, "a"), cells(y, x, low, "a"));
            break;
          // single pentagon

          case "1200":
            bands.push(cells(y, x, up, "b"), cells(y, x, low, "h"));
            break;

          case "0120":
            bands.push(cells(y, x, up, "c"), cells(y, x, low, "v"));
            break;

          case "0012":
            bands.push(cells(y, x, up, "d"), cells(y, x, low, "h"));
            break;

          case "2001":
            bands.push(cells(y, x, up, "a"), cells(y, x, low, "v"));
            break;

          case "1022":
            bands.push(cells(y, x, low, "b"), cells(y, x, up, "h"));
            break;

          case "2102":
            bands.push(cells(y, x, low, "c"), cells(y, x, up, "v"));
            break;

          case "2210":
            bands.push(cells(y, x, low, "d"), cells(y, x, up, "h"));
            break;

          case "0221":
            bands.push(cells(y, x, low, "a"), cells(y, x, up, "v"));
            break;

          case "1002":
            bands.push(cells(y, x, up, "d"), cells(y, x, low, "v"));
            break;

          case "2100":
            bands.push(cells(y, x, up, "a"), cells(y, x, low, "h"));
            break;

          case "0210":
            bands.push(cells(y, x, up, "b"), cells(y, x, low, "v"));
            break;

          case "0021":
            bands.push(cells(y, x, up, "c"), cells(y, x, low, "h"));
            break;

          case "1220":
            bands.push(cells(y, x, low, "d"), cells(y, x, up, "v"));
            break;

          case "0122":
            bands.push(cells(y, x, low, "a"), cells(y, x, up, "h"));
            break;

          case "2012":
            bands.push(cells(y, x, low, "b"), cells(y, x, up, "v"));
            break;

          case "2201":
            bands.push(cells(y, x, low, "c"), cells(y, x, up, "h"));
            break;
          //single hexagon

          case "0211":
            bands.push(cells(y, x, low, "a"), cells(y, x, up, "b"));
            break;

          case "2110":
            bands.push(cells(y, x, up, "a"), cells(y, x, low, "d"));
            break;

          case "1102":
            bands.push(cells(y, x, low, "c"), cells(y, x, up, "d"));
            break;

          case "1021":
            bands.push(cells(y, x, low, "b"), cells(y, x, up, "c"));
            break;

          case "2011":
            bands.push(cells(y, x, up, "a"), cells(y, x, low, "b"));
            break;

          case "0112":
            bands.push(cells(y, x, low, "a"), cells(y, x, up, "d"));
            break;

          case "1120":
            bands.push(cells(y, x, up, "c"), cells(y, x, low, "d"));
            break;

          case "1201":
            bands.push(cells(y, x, up, "b"), cells(y, x, low, "c"));
            break;

          case "2101":
            bands.push(cells(y, x, up, "a"), cells(y, x, low, "c"));
            break;

          case "0121":
            bands.push(cells(y, x, low, "a"), cells(y, x, up, "c"));
            break;

          case "1012":
            bands.push(cells(y, x, low, "b"), cells(y, x, up, "d"));
            break;

          case "1210":
            bands.push(cells(y, x, up, "b"), cells(y, x, low, "d"));
            break;
          // center

          case "2020":
            if (e === 0) bands.push(cells(y, x, up, "a"), cells(y, x, low, "a"), cells(y, x, up, "c"), cells(y, x, low, "c"));else if (e === 1) bands.push(cells(y, x, up, "a"), cells(y, x, low, "b"), cells(y, x, up, "c"), cells(y, x, low, "d"));else if (e === 2) bands.push(cells(y, x, up, "b"), cells(y, x, low, "b"), cells(y, x, up, "d"), cells(y, x, low, "d"));
            break;

          case "0202":
            if (e === 0) bands.push(cells(y, x, up, "b"), cells(y, x, low, "b"), cells(y, x, up, "d"), cells(y, x, low, "d"));else if (e === 1) bands.push(cells(y, x, low, "a"), cells(y, x, up, "b"), cells(y, x, low, "c"), cells(y, x, up, "d"));else if (e === 2) bands.push(cells(y, x, up, "a"), cells(y, x, low, "a"), cells(y, x, up, "c"), cells(y, x, low, "c"));
            break;

          case "0101":
            if (e === 0) bands.push(cells(y, x, low, "b"), cells(y, x, low, "d"));else if (e === 1) bands.push(cells(y, x, low, "a"), cells(y, x, low, "c"));
            break;

          case "1010":
            if (e === 0) bands.push(cells(y, x, low, "a"), cells(y, x, low, "c"));else if (e === 1) bands.push(cells(y, x, low, "b"), cells(y, x, low, "d"));
            break;

          case "2121":
            if (e === 1) bands.push(cells(y, x, up, "a"), cells(y, x, up, "c"));else if (e === 2) bands.push(cells(y, x, up, "b"), cells(y, x, up, "d"));
            break;

          case "1212":
            if (e === 1) bands.push(cells(y, x, up, "b"), cells(y, x, up, "d"));else if (e === 2) bands.push(cells(y, x, up, "a"), cells(y, x, up, "c"));
            break;

          case "2120":
            if (e === 1) bands.push(cells(y, x, up, "a"), cells(y, x, up, "c"), cells(y, x, low, "d"));else if (e === 2) bands.push(cells(y, x, up, "b"), cells(y, x, up, "d"), cells(y, x, low, "d"));
            break;

          case "2021":
            if (e === 1) bands.push(cells(y, x, up, "a"), cells(y, x, low, "b"), cells(y, x, up, "c"));else if (e === 2) bands.push(cells(y, x, up, "b"), cells(y, x, low, "b"), cells(y, x, up, "d"));
            break;

          case "1202":
            if (e === 1) bands.push(cells(y, x, up, "b"), cells(y, x, low, "c"), cells(y, x, up, "d"));else if (e === 2) bands.push(cells(y, x, up, "a"), cells(y, x, up, "c"), cells(y, x, low, "c"));
            break;

          case "0212":
            if (e === 1) bands.push(cells(y, x, low, "a"), cells(y, x, up, "b"), cells(y, x, up, "d"));else if (e === 2) bands.push(cells(y, x, up, "a"), cells(y, x, low, "a"), cells(y, x, up, "c"));
            break;

          case "0102":
            if (e === 0) bands.push(cells(y, x, low, "b"), cells(y, x, up, "d"), cells(y, x, low, "d"));else if (e === 1) bands.push(cells(y, x, low, "a"), cells(y, x, low, "c"), cells(y, x, up, "d"));
            break;

          case "0201":
            if (e === 0) bands.push(cells(y, x, up, "b"), cells(y, x, low, "b"), cells(y, x, low, "d"));else if (e === 1) bands.push(cells(y, x, low, "a"), cells(y, x, up, "b"), cells(y, x, low, "c"));
            break;

          case "1020":
            if (e === 0) bands.push(cells(y, x, low, "a"), cells(y, x, up, "c"), cells(y, x, low, "c"));else if (e === 1) bands.push(cells(y, x, low, "b"), cells(y, x, up, "c"), cells(y, x, low, "d"));
            break;

          case "2010":
            if (e === 0) bands.push(cells(y, x, up, "a"), cells(y, x, low, "a"), cells(y, x, low, "c"));else if (e === 1) bands.push(cells(y, x, up, "a"), cells(y, x, low, "c"), cells(y, x, low, "d"));
            break;
        }
      }

      function side_a(val, y, x) {
        switch (val) {
          case "01":
            bands.push(sides(y, x, low, "t_r"));
            break;

          case "02":
            bands.push(center_sides_horiz(y, x, low, up, "t_c"));
            break;

          case "10":
            bands.push(sides(y, x, low, "t_l"));
            break;

          case "11":
            bands.push([y + 2.5, x + 0.5, y + 2.5, x + 2.5]);
            break;

          case "12":
            bands.push(sides(y, x, up, "t_l"));
            break;

          case "20":
            bands.push(center_sides_horiz(y, x, up, low, "t_c"));
            break;

          case "21":
            bands.push(sides(y, x, up, "t_r"));
            break;
        }
      }

      function side_b(val, y, x) {
        switch (val) {
          case "01":
            bands.push(sides(y, x, low, "r_b"));
            break;

          case "02":
            bands.push(center_sides_vert(y, x, low, up, "r_c"));
            break;

          case "10":
            bands.push(sides(y, x, low, "r_t"));
            break;

          case "11":
            bands.push([y + 0.5, x + 2.5, y + 2.5, x + 2.5]);
            break;

          case "12":
            bands.push(sides(y, x, up, "r_t"));
            break;

          case "20":
            bands.push(center_sides_vert(y, x, up, low, "r_c"));
            break;

          case "21":
            bands.push(sides(y, x, up, "r_b"));
            break;
        }
      }

      function side_c(val, y, x) {
        switch (val) {
          case "01":
            bands.push(sides(y, x, low, "b_l"));
            break;

          case "02":
            bands.push(center_sides_horiz(y, x, low, up, "b_c"));
            break;

          case "10":
            bands.push(sides(y, x, low, "b_r"));
            break;

          case "11":
            bands.push([y + 0.5, x + 0.5, y + 0.5, x + 2.5]);
            break;

          case "12":
            bands.push(sides(y, x, up, "b_r"));
            break;

          case "20":
            bands.push(center_sides_horiz(y, x, up, low, "b_c"));
            break;

          case "21":
            bands.push(sides(y, x, up, "b_l"));
            break;
        }
      }

      function side_d(val, y, x) {
        switch (val) {
          case "01":
            bands.push(sides(y, x, low, "l_t"));
            break;

          case "02":
            bands.push(center_sides_vert(y, x, low, up, "l_c"));
            break;

          case "10":
            bands.push(sides(y, x, low, "l_b"));
            break;

          case "11":
            bands.push([y + 0.5, x + 0.5, y + 2.5, x + 0.5]);
            break;

          case "12":
            bands.push(sides(y, x, up, "l_b"));
            break;

          case "20":
            bands.push(center_sides_vert(y, x, up, low, "l_c"));
            break;

          case "21":
            bands.push(sides(y, x, up, "l_t"));
            break;
        }
      }

      return bands;
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

    function drawIsobands(Grid, Step, DeltaLat, DeltaLong, Grid_Min_Lat, Grid_Min_Long, Dot_Max_Z, Dot_Min_Z) {
      // четность/нечетность маски (чтобы не вылететь за пределы)
      var LongFinish = Grid[0].length % 2 === 0 ? 1 : 0,
          LatFinish = Grid.length % 2 === 0 ? 1 : 0;
      var GeoJson = {
        "type": "FeatureCollection",
        "features": []
      };
      var Bands = [],
          BandsValue = [];
      var Steps = stepOption(Step, Dot_Max_Z, Dot_Min_Z);
      var lower_h = Steps[0],
          upper_h = Infinity;
      Bands.push(getIsolines(findIsobands(Grid, lower_h, upper_h, LongFinish, LatFinish), Grid[0].length - 0.5, Grid.length - 0.5));
      BandsValue.push("more than " + Steps[0]);

      for (var i = 0; i < Steps.length - 1; i++) {
        lower_h = Steps[i + 1], upper_h = Steps[i];
        Bands.push(getIsolines(findIsobands(Grid, lower_h, upper_h, LongFinish, LatFinish), Grid[0].length - 0.5, Grid.length - 0.5));
        BandsValue.push(upper_h);
      }

      lower_h = -Infinity, upper_h = Steps[Steps.length - 1];
      Bands.push(getIsolines(findIsobands(Grid, lower_h, upper_h, LongFinish, LatFinish), Grid[0].length - 0.5, Grid.length - 0.5));
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
        chache.push([]);
      }

      for (var _i3 = 0; _i3 < newBands.length; _i3++) {
        /* for (let j = 0; j < newBands[i].length; j++) {
              const dividedBands = divideBands(newBands[i][j], bbox);
              if (i > 0) {
                if (chache[i - 1].length > 0) {
                    chacheCheck(dividedBands, chache[i - 1])
                }
            }
              dividedBands.forEach((line, idx) => {
                if (line.length > 1) {
                    if (line[line.length - 1] === 'from chache') {
                        line.splice(line.length - 1, 1);
                    } else {
                        dividedBands[idx] = [...bezier(simplify(line, (DeltaLong) / 50000))]
                        chache[i].push([...dividedBands[idx]])
                    }
                }
            })
              newBands[i][j] = []
            dividedBands.forEach(line => {
                newBands[i][j].push(...line);
            })
        } */
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

    function FindIsolines(Grid, h, LongFinish, LatFinish) {
      var TempIsolines = [];

      var interpolate = function interpolate(f1, f2, c) {
        return Math.abs(f2 - c) / (Math.abs(f2 - c) + Math.abs(c - f1));
      };

      function cells(y, x, c, val) {
        switch (val) {
          case "a":
            return [y + 1 + interpolate(Grid[y + 2][x], Grid[y][x], c), x + 0.5, y + 2.5, x + 1 + interpolate(Grid[y + 2][x + 2], Grid[y + 2][x], c)];

          case "b":
            return [y + 2.5, x + 1 + interpolate(Grid[y + 2][x + 2], Grid[y + 2][x], c), y + 1 + interpolate(Grid[y + 2][x + 2], Grid[y][x + 2], c), x + 2.5];

          case "c":
            return [y + 1 + interpolate(Grid[y + 2][x + 2], Grid[y][x + 2], c), x + 2.5, y + 0.5, x + 1 + interpolate(Grid[y][x + 2], Grid[y][x], c)];

          case "d":
            return [y + 1 + interpolate(Grid[y + 2][x], Grid[y][x], c), x + 0.5, y + 0.5, x + 1 + interpolate(Grid[y][x + 2], Grid[y][x], c)];

          case "v":
            return [y + 2.5, x + 1 + interpolate(Grid[y + 2][x + 2], Grid[y + 2][x], c), y + 0.5, x + 1 + interpolate(Grid[y][x + 2], Grid[y][x], c)];

          case "h":
            return [y + 1 + interpolate(Grid[y + 2][x], Grid[y][x], c), x + 0.5, y + 1 + interpolate(Grid[y + 2][x + 2], Grid[y][x + 2], c), x + 2.5];
        }
      }

      var a, b, c, d, e;

      for (var i = 0, len = Grid.length - LatFinish - 2; i < len; i += 2) {
        for (var j = 0, len1 = Grid[i].length - LongFinish - 2; j < len1; j += 2) {
          a = Grid[i + 2][j] <= h ? "0" : "1";
          b = Grid[i + 2][j + 2] <= h ? "0" : "1";
          c = Grid[i][j + 2] <= h ? "0" : "1";
          d = Grid[i][j] <= h ? "0" : "1";
          e = Grid[i + 1][j + 1] <= h ? 0 : 1;
          cells_calculate(a + b + c + d, i, j);
        }
      }

      function cells_calculate(val, y, x) {
        if (val === "0000" || val === "1111") return;

        switch (val) {
          case "1110":
          case "0001":
            TempIsolines.push(cells(y, x, h, "d"));
            break;

          case "1101":
          case "0010":
            TempIsolines.push(cells(y, x, h, "c"));
            break;

          case "1011":
          case "0100":
            TempIsolines.push(cells(y, x, h, "b"));
            break;

          case "0111":
          case "1000":
            TempIsolines.push(cells(y, x, h, "a"));
            break;

          case "1100":
          case "0011":
            TempIsolines.push(cells(y, x, h, "h"));
            break;

          case "1001":
          case "0110":
            TempIsolines.push(cells(y, x, h, "v"));
            break;

          case "1010":
            if (e === 0) TempIsolines.push(cells(y, x, h, "a"), cells(y, x, h, "c"));else if (e === 1) TempIsolines.push(cells(y, x, h, "b"), cells(y, x, h, "d"));
            break;

          case "0101":
            if (e === 0) TempIsolines.push(cells(y, x, h, "b"), cells(y, x, h, "d"));else if (e === 1) TempIsolines.push(cells(y, x, h, "a"), cells(y, x, h, "c"));
            break;
        }
      }

      return TempIsolines;
    }

    function drawIsolines(Grid, Step, DeltaLat, DeltaLong, Grid_Min_Lat, Grid_Min_Long, Dot_Max_Z, Dot_Min_Z) {
      var Isolines = [];
      var IsolinesValue = []; // четность/нечетность маски (чтобы не вылететь за пределы)

      var LongFinish = Grid[0].length % 2 === 0 ? 1 : 0,
          LatFinish = Grid.length % 2 === 0 ? 1 : 0;
      var GeoJson = {
        "type": "FeatureCollection",
        "features": []
      };
      var Steps = stepOption(Step, Dot_Max_Z, Dot_Min_Z);
      var h;

      for (var i = 0; i < Steps.length; i++) {
        h = Steps[i];
        console.log('----' + h + '----');
        Isolines.push(getIsolines(FindIsolines(Grid, h, LongFinish, LatFinish)));
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
          exponent = _optionsParser.exponent;

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

        for (var i = 0; i < latSize; i++) {
          Grid[i] = [];

          var _loop = function _loop(j) {
            var cellCenter = [i + 0.5, j + 0.5];
            var top = 0,
                bot = 0;

            _points.forEach(function (point) {
              var d = Math.pow(Math.pow(cellCenter[0] - point[0], 2) + Math.pow(cellCenter[1] - point[1], 2), 2);
              top += point[2] / Math.pow(d, exponent);
              bot += 1 / Math.pow(d, exponent);
            });

            Grid[i][j] = top / bot;
          };

          for (var j = 0; j < longSize; j++) {
            _loop(j);
          }
        }

        return Grid;
      }

      function calcInMeters() {
        var Grid = [];
        var start;

        for (var i = 0; i < latSize; i++) {
          Grid[i] = [];
          start = i % 2 === 0 ? 0 : 1;

          var _loop2 = function _loop2(j) {
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

          for (var j = start; j < longSize; j += 2) {
            _loop2(j);
          }
        }

        return Grid;
      }
    }

    function optionsParser(options, points) {
      var bbox = options.bbox,
          units = options.units,
          exponent = options.exponent;

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
        exponent: exponent
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
