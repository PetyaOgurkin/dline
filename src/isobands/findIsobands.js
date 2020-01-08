function findIsobands(Grid, low, up, LongFinish, LatFinish) {
    const bands = [];
    const interpolate = (f1, f2, c) => {



        return (c - f2) / (f1 - f2)

        Math.abs(f2 - c) / (Math.abs(f2 - c) + Math.abs(c - f1))
    };

    function wall(y, x) {
        if (y !== 0 && x !== 0 && x !== Grid[y].length - LongFinish - 3 && y !== Grid.length - LatFinish - 3) return 0;
        else if (y === 0 && x !== 0 && x !== Grid[y].length - LongFinish - 3) return "c";
        else if (y !== 0 && x === Grid[y].length - LongFinish - 3 && y !== Grid.length - LatFinish - 3) return "b";
        else if (y === Grid.length - LatFinish - 3 && x !== 0 && x !== Grid[y].length - LongFinish - 3) return "a";
        else if (y !== 0 && x === 0 && y !== Grid.length - LatFinish - 3) return "d";
        else if (y === 0 && x === Grid[y].length - LongFinish - 3) return "bc";
        else if (y === Grid.length - LatFinish - 3 && x === Grid[y].length - LongFinish - 3) return "ab";
        else if (y === Grid.length - LatFinish - 3 && x === 0) return "ad";
        else if (y === 0 && x === 0) return "cd";
    }

    function cells(y, x, c, val) {
        switch (val) {
            case "a":
                return [
                    y + 1 + interpolate(Grid[y + 2][x], Grid[y][x], c),
                    x + 0.5,
                    y + 2.5,
                    x + 1 + interpolate(Grid[y + 2][x + 2], Grid[y + 2][x], c)
                ];
            case "b":
                return [
                    y + 2.5,
                    x + 1 + interpolate(Grid[y + 2][x + 2], Grid[y + 2][x], c),
                    y + 1 + interpolate(Grid[y + 2][x + 2], Grid[y][x + 2], c),
                    x + 2.5
                ];
            case "c":
                return [
                    y + 1 + interpolate(Grid[y + 2][x + 2], Grid[y][x + 2], c),
                    x + 2.5,
                    y + 0.5,
                    x + 1 + interpolate(Grid[y][x + 2], Grid[y][x], c)
                ];
            case "d":
                return [
                    y + 1 + interpolate(Grid[y + 2][x], Grid[y][x], c),
                    x + 0.5,
                    y + 0.5,
                    x + 1 + interpolate(Grid[y][x + 2], Grid[y][x], c)
                ];
            case "v":
                return [
                    y + 2.5,
                    x + 1 + interpolate(Grid[y + 2][x + 2], Grid[y + 2][x], c),
                    y + 0.5,
                    x + 1 + interpolate(Grid[y][x + 2], Grid[y][x], c)
                ];
            case "h":
                return [
                    y + 1 + interpolate(Grid[y + 2][x], Grid[y][x], c),
                    x + 0.5,
                    y + 1 + interpolate(Grid[y + 2][x + 2], Grid[y][x + 2], c),
                    x + 2.5
                ];
        }
    }

    function sides(y, x, c, val) {
        switch (val) {
            case "t_l":
                return [
                    y + 2.5,
                    x + 0.5,
                    y + 2.5,
                    x + 1 + interpolate(Grid[y + 2][x + 2], Grid[y + 2][x], c)
                ];
            case "t_r":
                return [
                    y + 2.5,
                    x + 2.5,
                    y + 2.5,
                    x + 1 + interpolate(Grid[y + 2][x + 2], Grid[y + 2][x], c)
                ];
            case "r_t":
                return [
                    y + 2.5,
                    x + 2.5,
                    y + 1 + interpolate(Grid[y + 2][x + 2], Grid[y][x + 2], c),
                    x + 2.5
                ];
            case "r_b":
                return [
                    y + 0.5,
                    x + 2.5,
                    y + 1 + interpolate(Grid[y + 2][x + 2], Grid[y][x + 2], c),
                    x + 2.5
                ];
            case "b_l":
                return [
                    y + 0.5,
                    x + 0.5,
                    y + 0.5,
                    x + 1 + interpolate(Grid[y][x + 2], Grid[y][x], c),
                ];
            case "b_r":
                return [
                    y + 0.5,
                    x + 2.5,
                    y + 0.5,
                    x + 1 + interpolate(Grid[y][x + 2], Grid[y][x], c),
                ];
            case "l_t":
                return [
                    y + 2.5,
                    x + 0.5,
                    y + 1 + interpolate(Grid[y + 2][x], Grid[y][x], c),
                    x + 0.5
                ];
            case "l_b":
                return [
                    y + 0.5,
                    x + 0.5,
                    y + 1 + interpolate(Grid[y + 2][x], Grid[y][x], c),
                    x + 0.5
                ];
        }
    }

    function center_sides_horiz(y, x, c_l, c_r, val) {
        if (val === "t_c") {
            return [
                y + 2.5,
                x + 1 + interpolate(Grid[y + 2][x + 2], Grid[y + 2][x], c_l),
                y + 2.5,
                x + 1 + interpolate(Grid[y + 2][x + 2], Grid[y + 2][x], c_r)
            ];
        }
        else if (val === "b_c") {
            return [
                y + 0.5,
                x + 1 + interpolate(Grid[y][x + 2], Grid[y][x], c_l),
                y + 0.5,
                x + 1 + interpolate(Grid[y][x + 2], Grid[y][x], c_r)
            ];
        }
    }

    function center_sides_vert(y, x, c_t, c_b, val) {
        if (val === "r_c") {
            return [
                y + 1 + interpolate(Grid[y + 2][x + 2], Grid[y][x + 2], c_t),
                x + 2.5,
                y + 1 + interpolate(Grid[y + 2][x + 2], Grid[y + 2][x], c_b),
                x + 2.5
            ];
        }
        else if (val === "l_c") {
            return [
                y + 1 + interpolate(Grid[y][x + 2], Grid[y][x + 2], c_t),
                x + 0.5,
                y + 1 + interpolate(Grid[y][x + 2], Grid[y][x], c_b),
                x + 0.5
            ];
        }
    }

    let a, b, c, d, e;
    let wall_tmp;

    for (let i = 0, len = Grid.length - LatFinish - 2; i < len; i += 2) {
        for (let j = 0, len1 = Grid[i].length - LongFinish - 2; j < len1; j += 2) {

            a = (Grid[i + 2][j] < low) ? "0" : (Grid[i + 2][j] >= low && Grid[i + 2][j] < up) ? "1" : (Grid[i + 2][j] >= up) ? "2" : NaN;
            b = (Grid[i + 2][j + 2] < low) ? "0" : (Grid[i + 2][j + 2] >= low && Grid[i + 2][j + 2] < up) ? "1" : (Grid[i + 2][j + 2] >= up) ? "2" : NaN;
            c = (Grid[i][j + 2] < low) ? "0" : (Grid[i][j + 2] >= low && Grid[i][j + 2] < up) ? "1" : (Grid[i][j + 2] >= up) ? "2" : NaN;
            d = (Grid[i][j] < low) ? "0" : (Grid[i][j] >= low && Grid[i][j] < up) ? "1" : (Grid[i][j] >= up) ? "2" : NaN;
            e = (Grid[i + 1][j + 1] < low) ? 0 : (Grid[i + 1][j + 1] >= low && Grid[i + 1][j + 1] < up) ? 1 : (Grid[i + 1][j + 1] >= up) ? 2 : NaN;

            cells_main(a + b + c + d, i, j);

            wall_tmp = wall(i, j);

            if (wall_tmp !== 0) {
                switch (wall_tmp) {
                    case "a": side_a(a + b, i, j); break;
                    case "b": side_b(b + c, i, j); break;
                    case "c": side_c(c + d, i, j); break;
                    case "d": side_d(d + a, i, j); break;
                    case "ab": side_a(a + b, i, j); side_b(b + c, i, j); break;
                    case "bc": side_b(b + c, i, j); side_c(c + d, i, j); break;
                    case "cd": side_c(c + d, i, j); side_d(d + a, i, j); break;
                    case "ad": side_a(a + b, i, j); side_d(d + a, i, j); break;

                    default:
                        break;
                }
            }
        }
    }

    function cells_main(val, y, x) {
        if (val === "0000" || val === "1111" || val === "2222") return;

        switch (val) {

            // single angle
            case "2221": case "1112": bands.push(cells(y, x, up, "d")); break;
            case "0001": case "1110": bands.push(cells(y, x, low, "d")); break;
            case "2212": case "1121": bands.push(cells(y, x, up, "c")); break;
            case "0010": case "1101": bands.push(cells(y, x, low, "c")); break;
            case "2122": case "1211": bands.push(cells(y, x, up, "b")); break;
            case "0100": case "1011": bands.push(cells(y, x, low, "b")); break;
            case "1222": case "2111": bands.push(cells(y, x, up, "a")); break;
            case "1000": case "0111": bands.push(cells(y, x, low, "a")); break;

            // single rectangle
            case "0011": case "1100": bands.push(cells(y, x, low, "h")); break;
            case "2211": case "1122": bands.push(cells(y, x, up, "h")); break;
            case "0110": case "1001": bands.push(cells(y, x, low, "v")); break;
            case "2112": case "1221": bands.push(cells(y, x, up, "v")); break;
            case "2200": case "0022": bands.push(cells(y, x, up, "h"), cells(y, x, low, "h")); break;
            case "2002": case "0220": bands.push(cells(y, x, up, "v"), cells(y, x, low, "v")); break;

            // single trapezoid
            case "2220": case "0002": bands.push(cells(y, x, up, "d"), cells(y, x, low, "d")); break;
            case "2202": case "0020": bands.push(cells(y, x, up, "c"), cells(y, x, low, "c")); break;
            case "2022": case "0200": bands.push(cells(y, x, up, "b"), cells(y, x, low, "b")); break;
            case "0222": case "2000": bands.push(cells(y, x, up, "a"), cells(y, x, low, "a")); break;

            // single pentagon
            case "1200": bands.push(cells(y, x, up, "b"), cells(y, x, low, "h")); break;
            case "0120": bands.push(cells(y, x, up, "c"), cells(y, x, low, "v")); break;
            case "0012": bands.push(cells(y, x, up, "d"), cells(y, x, low, "h")); break;
            case "2001": bands.push(cells(y, x, up, "a"), cells(y, x, low, "v")); break;

            case "1022": bands.push(cells(y, x, low, "b"), cells(y, x, up, "h")); break;
            case "2102": bands.push(cells(y, x, low, "c"), cells(y, x, up, "v")); break;
            case "2210": bands.push(cells(y, x, low, "d"), cells(y, x, up, "h")); break;
            case "0221": bands.push(cells(y, x, low, "a"), cells(y, x, up, "v")); break;

            case "1002": bands.push(cells(y, x, up, "d"), cells(y, x, low, "v")); break;
            case "2100": bands.push(cells(y, x, up, "a"), cells(y, x, low, "h")); break;
            case "0210": bands.push(cells(y, x, up, "b"), cells(y, x, low, "v")); break;
            case "0021": bands.push(cells(y, x, up, "c"), cells(y, x, low, "h")); break;

            case "1220": bands.push(cells(y, x, low, "d"), cells(y, x, up, "v")); break;
            case "0122": bands.push(cells(y, x, low, "a"), cells(y, x, up, "h")); break;
            case "2012": bands.push(cells(y, x, low, "b"), cells(y, x, up, "v")); break;
            case "2201": bands.push(cells(y, x, low, "c"), cells(y, x, up, "h")); break;

            //single hexagon
            case "0211": bands.push(cells(y, x, low, "a"), cells(y, x, up, "b")); break;
            case "2110": bands.push(cells(y, x, up, "a"), cells(y, x, low, "d")); break;
            case "1102": bands.push(cells(y, x, low, "c"), cells(y, x, up, "d")); break;
            case "1021": bands.push(cells(y, x, low, "b"), cells(y, x, up, "c")); break;

            case "2011": bands.push(cells(y, x, up, "a"), cells(y, x, low, "b")); break;
            case "0112": bands.push(cells(y, x, low, "a"), cells(y, x, up, "d")); break;
            case "1120": bands.push(cells(y, x, up, "c"), cells(y, x, low, "d")); break;
            case "1201": bands.push(cells(y, x, up, "b"), cells(y, x, low, "c")); break;

            case "2101": bands.push(cells(y, x, up, "a"), cells(y, x, low, "c")); break;
            case "0121": bands.push(cells(y, x, low, "a"), cells(y, x, up, "c")); break;
            case "1012": bands.push(cells(y, x, low, "b"), cells(y, x, up, "d")); break;
            case "1210": bands.push(cells(y, x, up, "b"), cells(y, x, low, "d")); break;

            // center
            case "2020":
                if (e === 0) bands.push(cells(y, x, up, "a"), cells(y, x, low, "a"), cells(y, x, up, "c"), cells(y, x, low, "c"));
                else if (e === 1) bands.push(cells(y, x, up, "a"), cells(y, x, low, "b"), cells(y, x, up, "c"), cells(y, x, low, "d"));
                else if (e === 2) bands.push(cells(y, x, up, "b"), cells(y, x, low, "b"), cells(y, x, up, "d"), cells(y, x, low, "d"));
                break;

            case "0202":
                if (e === 0) bands.push(cells(y, x, up, "b"), cells(y, x, low, "b"), cells(y, x, up, "d"), cells(y, x, low, "d"));
                else if (e === 1) bands.push(cells(y, x, low, "a"), cells(y, x, up, "b"), cells(y, x, low, "c"), cells(y, x, up, "d"));
                else if (e === 2) bands.push(cells(y, x, up, "a"), cells(y, x, low, "a"), cells(y, x, up, "c"), cells(y, x, low, "c"));
                break;

            case "0101":
                if (e === 0) bands.push(cells(y, x, low, "b"), cells(y, x, low, "d"));
                else if (e === 1) bands.push(cells(y, x, low, "a"), cells(y, x, low, "c"));
                break;

            case "1010":
                if (e === 0) bands.push(cells(y, x, low, "a"), cells(y, x, low, "c"));
                else if (e === 1) bands.push(cells(y, x, low, "b"), cells(y, x, low, "d"));
                break;

            case "2121":
                if (e === 1) bands.push(cells(y, x, up, "a"), cells(y, x, up, "c"));
                else if (e === 2) bands.push(cells(y, x, up, "b"), cells(y, x, up, "d"));
                break;

            case "1212":
                if (e === 1) bands.push(cells(y, x, up, "b"), cells(y, x, up, "d"));
                else if (e === 2) bands.push(cells(y, x, up, "a"), cells(y, x, up, "c"));
                break;

            case "2120":
                if (e === 1) bands.push(cells(y, x, up, "a"), cells(y, x, up, "c"), cells(y, x, low, "d"));
                else if (e === 2) bands.push(cells(y, x, up, "b"), cells(y, x, up, "d"), cells(y, x, low, "d"));
                break;

            case "2021":
                if (e === 1) bands.push(cells(y, x, up, "a"), cells(y, x, low, "b"), cells(y, x, up, "c"));
                else if (e === 2) bands.push(cells(y, x, up, "b"), cells(y, x, low, "b"), cells(y, x, up, "d"));
                break;

            case "1202":
                if (e === 1) bands.push(cells(y, x, up, "b"), cells(y, x, low, "c"), cells(y, x, up, "d"));
                else if (e === 2) bands.push(cells(y, x, up, "a"), cells(y, x, up, "c"), cells(y, x, low, "c"));
                break;

            case "0212":
                if (e === 1) bands.push(cells(y, x, low, "a"), cells(y, x, up, "b"), cells(y, x, up, "d"));
                else if (e === 2) bands.push(cells(y, x, up, "a"), cells(y, x, low, "a"), cells(y, x, up, "c"));
                break;

            case "0102":
                if (e === 0) bands.push(cells(y, x, low, "b"), cells(y, x, up, "d"), cells(y, x, low, "d"));
                else if (e === 1) bands.push(cells(y, x, low, "a"), cells(y, x, low, "c"), cells(y, x, up, "d"));
                break;

            case "0201":
                if (e === 0) bands.push(cells(y, x, up, "b"), cells(y, x, low, "b"), cells(y, x, low, "d"));
                else if (e === 1) bands.push(cells(y, x, low, "a"), cells(y, x, up, "b"), cells(y, x, low, "c"));
                break;

            case "1020":
                if (e === 0) bands.push(cells(y, x, low, "a"), cells(y, x, up, "c"), cells(y, x, low, "c"));
                else if (e === 1) bands.push(cells(y, x, low, "b"), cells(y, x, up, "c"), cells(y, x, low, "d"));
                break;

            case "2010":
                if (e === 0) bands.push(cells(y, x, up, "a"), cells(y, x, low, "a"), cells(y, x, low, "c"));
                else if (e === 1) bands.push(cells(y, x, up, "a"), cells(y, x, low, "c"), cells(y, x, low, "d"));
                break;

            default:
                break;
        }
    }

    function side_a(val, y, x) {
        switch (val) {
            case "01": bands.push(sides(y, x, low, "t_r")); break;
            case "02": bands.push(center_sides_horiz(y, x, low, up, "t_c")); break;
            case "10": bands.push(sides(y, x, low, "t_l")); break;
            case "11": bands.push([y + 2.5, x + 0.5, y + 2.5, x + 2.5]); break;
            case "12": bands.push(sides(y, x, up, "t_l")); break;
            case "20": bands.push(center_sides_horiz(y, x, up, low, "t_c")); break;
            case "21": bands.push(sides(y, x, up, "t_r")); break;

            default:
                break;
        }
    }

    function side_b(val, y, x) {
        switch (val) {
            case "01": bands.push(sides(y, x, low, "r_b")); break;
            case "02": bands.push(center_sides_vert(y, x, low, up, "r_c")); break;
            case "10": bands.push(sides(y, x, low, "r_t")); break;
            case "11": bands.push([y + 0.5, x + 2.5, y + 2.5, x + 2.5]); break;
            case "12": bands.push(sides(y, x, up, "r_t")); break;
            case "20": bands.push(center_sides_vert(y, x, up, low, "r_c")); break;;
            case "21": bands.push(sides(y, x, up, "r_b")); break;

            default:
                break;
        }
    }

    function side_c(val, y, x) {
        switch (val) {
            case "01": bands.push(sides(y, x, low, "b_l")); break;
            case "02": bands.push(center_sides_horiz(y, x, low, up, "b_c")); break;
            case "10": bands.push(sides(y, x, low, "b_r")); break;
            case "11": bands.push([y + 0.5, x + 0.5, y + 0.5, x + 2.5]); break;
            case "12": bands.push(sides(y, x, up, "b_r")); break;
            case "20": bands.push(center_sides_horiz(y, x, up, low, "b_c")); break;;
            case "21": bands.push(sides(y, x, up, "b_l")); break;

            default:
                break;
        }
    }

    function side_d(val, y, x) {
        switch (val) {
            case "01": bands.push(sides(y, x, low, "l_t")); break;
            case "02": bands.push(center_sides_vert(y, x, low, up, "l_c")); break;
            case "10": bands.push(sides(y, x, low, "l_b")); break;
            case "11": bands.push([y + 0.5, x + 0.5, y + 2.5, x + 0.5]); break;
            case "12": bands.push(sides(y, x, up, "l_b")); break;
            case "20": bands.push(center_sides_vert(y, x, up, low, "l_c")); break;;
            case "21": bands.push(sides(y, x, up, "l_t")); break;

            default:
                break;
        }
    }

    return bands;
}

export { findIsobands }