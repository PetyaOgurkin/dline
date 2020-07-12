export default function computeIsobands(grid, low, up) {

    const interpolate = (p1, p2, c) => p1 > c ? (c - p2) / (p1 - p2) : (c - p1) / (p2 - p1);


    /* values of vertexes */

    const A = (x, y) => grid[x + 1][y] || low;
    const B = (x, y) => grid[x + 1][y + 1] || low;
    const C = (x, y) => grid[x][y + 1] || low;
    const D = (x, y) => grid[x][y] || low;


    /* coordinates of points on edges */
    const M = (x, y, c, h) => [x + 1, y + Math.abs(c - interpolate(A(x, y), B(x, y), h))];
    const N = (x, y, c, h) => [x + Math.abs(c - interpolate(B(x, y), C(x, y), h)), y + 1];
    const P = (x, y, c, h) => [x, y + Math.abs(c - interpolate(C(x, y), D(x, y), h))];
    const Q = (x, y, c, h) => [x + Math.abs(c - interpolate(D(x, y), A(x, y), h)), y];

    const getTernaryCode = (a, b, c, d) => {
        const check = v => v <= low ? '0' : (v > low && v <= up) ? '1' : '2';
        return check(a) + check(b) + check(c) + check(d);
    }


    /* returns cells to be connected */
    function edges(way, x, y, h) {
        switch (way) {
            case "a-": return [...M(x, y, 0, h), ...Q(x, y, 1, h)];
            case "b-": return [...N(x, y, 1, h), ...M(x, y, 1, h)];
            case "c-": return [...P(x, y, 1, h), ...N(x, y, 0, h)];
            case "d-": return [...Q(x, y, 0, h), ...P(x, y, 0, h)];

            case "a+": return [...M(x, y, 1, h), ...Q(x, y, 0, h)];
            case "b+": return [...N(x, y, 0, h), ...M(x, y, 0, h)];
            case "c+": return [...P(x, y, 0, h), ...N(x, y, 1, h)];
            case "d+": return [...Q(x, y, 1, h), ...P(x, y, 1, h)];

            case "l>r": return [...M(x, y, 1, h), ...P(x, y, 1, h)];
            case "r>l": return [...M(x, y, 0, h), ...P(x, y, 0, h)];

            case "t>b": return [...N(x, y, 0, h), ...Q(x, y, 0, h)];
            case "b>t": return [...N(x, y, 1, h), ...Q(x, y, 1, h)];

            default: throw new Error('imposible')
        }
    }

    function borderCheck(x, y) {

        if (x !== 0 && y !== 0 && x !== grid.length - 2 && y !== grid[x].length - 2) return 0;

        else if (x === grid.length - 2 && y !== 0 && y !== grid[x].length - 2) return "top";
        else if (x !== grid.length - 2 && x !== 0 && y === grid[x].length - 2) return "right";
        else if (x === 0 && y !== grid[x].length - 2 && y !== 0) return "bot";
        else if (x !== grid.length - 2 && y === 0 && x !== 0) return "left";

        else if (x === grid.length - 2 && y === 0) return "A";
        else if (x === grid.length - 2 && y === grid[x].length - 2) return "B";
        else if (x === 0 && y === grid[x].length - 2) return "C";
        else if (x === 0 && y === 0) return "D";

        else throw new Error('invalid x or y');
    }

    function getCenterOfCell(x, y) {
        const o = ((A(x, y) + B(x, y) + C(x, y) + D(x, y)) / 4);
        return o <= low ? 0 : o > low && o <= up ? 1 : 2
    }

    function insideContouring(code, x, y) {

        let o;
        switch (code) {

            /* single triangle */
            case 79: isobands.push(edges("d-", x, y, up)); break;                           // 2221
            case 41: isobands.push(edges("d+", x, y, up)); break;                           // 1112
            case 1: isobands.push(edges("d+", x, y, low)); break;                           // 0001
            case 39: isobands.push(edges("d-", x, y, low)); break;                          // 1110
            case 77: isobands.push(edges("c-", x, y, up)); break;                           // 2212
            case 43: isobands.push(edges("c+", x, y, up)); break;                           // 1121
            case 3: isobands.push(edges("c+", x, y, low)); break;                           // 0010
            case 37: isobands.push(edges("c-", x, y, low)); break;                          // 1101
            case 71: isobands.push(edges("b-", x, y, up)); break;                           // 2122
            case 49: isobands.push(edges("b+", x, y, up)); break;                           // 1211
            case 9: isobands.push(edges("b+", x, y, low)); break;                           // 0100
            case 31: isobands.push(edges("b-", x, y, low)); break;                          // 1011
            case 53: isobands.push(edges("a-", x, y, up)); break;                           // 1222
            case 67: isobands.push(edges("a+", x, y, up)); break;                           // 2111
            case 27: isobands.push(edges("a+", x, y, low)); break;                          // 1000
            case 13: isobands.push(edges("a-", x, y, low)); break;                          // 0111

            /* single rectangle */
            case 4: isobands.push(edges("b>t", x, y, low)); break;                          //  0011
            case 36: isobands.push(edges("t>b", x, y, low)); break;                         //  1100
            case 76: isobands.push(edges("t>b", x, y, up)); break;                          //  2211
            case 44: isobands.push(edges("b>t", x, y, up)); break;                          //  1122
            case 12: isobands.push(edges("r>l", x, y, low)); break;                         //  0110
            case 28: isobands.push(edges("l>r", x, y, low)); break;                         //  1001
            case 68: isobands.push(edges("l>r", x, y, up)); break;                          //  2112
            case 52: isobands.push(edges("r>l", x, y, up)); break;                          //  1221
            case 72: isobands.push(edges("t>b", x, y, up), edges("t>b", x, y, low)); break; //  2200
            case 8: isobands.push(edges("b>t", x, y, up), edges("b>t", x, y, low)); break;  //  0022
            case 56: isobands.push(edges("l>r", x, y, up), edges("l>r", x, y, low)); break; //  2002
            case 24: isobands.push(edges("r>l", x, y, up), edges("r>l", x, y, low)); break; //  0220

            /* single trapezoid */
            case 78: isobands.push(edges("d-", x, y, up), edges("d-", x, y, low)); break;   //  2220
            case 2: isobands.push(edges("d+", x, y, low), edges("d+", x, y, up)); break;    //  0002
            case 74: isobands.push(edges("c-", x, y, up), edges("c-", x, y, low)); break;   //  2202
            case 6: isobands.push(edges("c+", x, y, low), edges("c+", x, y, up)); break;    //  0020
            case 62: isobands.push(edges("b-", x, y, up), edges("b-", x, y, low)); break;   //  2022
            case 18: isobands.push(edges("b+", x, y, low), edges("b+", x, y, up)); break;   //  0200
            case 26: isobands.push(edges("a-", x, y, up), edges("a-", x, y, low)); break;   //  0222
            case 54: isobands.push(edges("a+", x, y, low), edges("a+", x, y, up)); break;   //  2000

            /*  single pentagon */
            case 45: isobands.push(edges("b+", x, y, up), edges("t>b", x, y, low)); break;  //  1200
            case 15: isobands.push(edges("c+", x, y, up), edges("r>l", x, y, low)); break;  //  0120
            case 5: isobands.push(edges("d+", x, y, up), edges("b>t", x, y, low)); break;   //  0012
            case 55: isobands.push(edges("a+", x, y, up), edges("l>r", x, y, low)); break;  //  2001

            case 35: isobands.push(edges("b-", x, y, low), edges("b>t", x, y, up)); break;  //  1022
            case 65: isobands.push(edges("c-", x, y, low), edges("l>r", x, y, up)); break;  //  2102
            case 75: isobands.push(edges("d-", x, y, low), edges("t>b", x, y, up)); break;  //  2210
            case 25: isobands.push(edges("a-", x, y, low), edges("r>l", x, y, up)); break;  //  0221

            case 29: isobands.push(edges("d+", x, y, up), edges("l>r", x, y, low)); break;  //  1002
            case 63: isobands.push(edges("a+", x, y, up), edges("t>b", x, y, low)); break;  //  2100
            case 21: isobands.push(edges("b+", x, y, up), edges("r>l", x, y, low)); break;  //  0210
            case 7: isobands.push(edges("c+", x, y, up), edges("b>t", x, y, low)); break;   //  0021

            case 51: isobands.push(edges("d-", x, y, low), edges("r>l", x, y, up)); break;  //  1220
            case 17: isobands.push(edges("a-", x, y, low), edges("b>t", x, y, up)); break;  //  0122
            case 59: isobands.push(edges("b-", x, y, low), edges("l>r", x, y, up)); break;  //  2012
            case 73: isobands.push(edges("c-", x, y, low), edges("t>b", x, y, up)); break;  //  2201

            /* single hexagon */
            case 22: isobands.push(edges("a-", x, y, low), edges("b+", x, y, up)); break;   //  0211
            case 66: isobands.push(edges("a+", x, y, up), edges("d-", x, y, low)); break;   //  2110
            case 38: isobands.push(edges("c-", x, y, low), edges("d+", x, y, up)); break;   //  1102
            case 34: isobands.push(edges("b-", x, y, low), edges("c+", x, y, up)); break;   //  1021

            case 58: isobands.push(edges("a+", x, y, up), edges("b-", x, y, low)); break;   //  2011
            case 14: isobands.push(edges("a-", x, y, low), edges("d+", x, y, up)); break;   //  0112
            case 42: isobands.push(edges("c+", x, y, up), edges("d-", x, y, low)); break;   //  1120
            case 46: isobands.push(edges("b+", x, y, up), edges("c-", x, y, low)); break;   //  1201

            case 64: isobands.push(edges("a+", x, y, up), edges("c-", x, y, low)); break;   //  2101
            case 16: isobands.push(edges("a-", x, y, low), edges("c+", x, y, up)); break;   //  0121
            case 32: isobands.push(edges("b-", x, y, low), edges("d+", x, y, up)); break;   //  1012
            case 48: isobands.push(edges("b+", x, y, up), edges("d-", x, y, low)); break;   //  1210


            /* center */
            case 60:    //  2020
                o = getCenterOfCell(x, y);
                if (o === 0) isobands.push(edges("a+", x, y, up), edges("a+", x, y, low), edges("c+", x, y, up), edges("c+", x, y, low));
                else if (o === 1) isobands.push(edges("a+", x, y, up), edges("b-", x, y, low), edges("c+", x, y, up), edges("d-", x, y, low));
                else if (o === 2) isobands.push(edges("b-", x, y, up), edges("b-", x, y, low), edges("d-", x, y, up), edges("d-", x, y, low));
                break;

            case 20:    //  0202
                o = getCenterOfCell(x, y);
                if (o === 0) isobands.push(edges("b+", x, y, up), edges("b+", x, y, low), edges("d+", x, y, up), edges("d+", x, y, low));
                else if (o === 1) isobands.push(edges("a-", x, y, low), edges("b+", x, y, up), edges("c-", x, y, low), edges("d+", x, y, up));
                else if (o === 2) isobands.push(edges("a-", x, y, up), edges("a-", x, y, low), edges("c-", x, y, up), edges("c-", x, y, low));
                break;

            case 10:    //  0101
                o = getCenterOfCell(x, y);
                if (o === 0) isobands.push(edges("b+", x, y, low), edges("d+", x, y, low));
                else if (o === 1) isobands.push(edges("a-", x, y, low), edges("c-", x, y, low));
                break;

            case 30:    //  1010
                o = getCenterOfCell(x, y);
                if (o === 0) isobands.push(edges("a+", x, y, low), edges("c+", x, y, low));
                else if (o === 1) isobands.push(edges("b-", x, y, low), edges("d-", x, y, low));
                break;

            case 70:    //  2121
                o = getCenterOfCell(x, y);
                if (o === 1) isobands.push(edges("a+", x, y, up), edges("c+", x, y, up));
                else if (o === 2) isobands.push(edges("b-", x, y, up), edges("d-", x, y, up));
                break;

            case 50:    //  1212
                o = getCenterOfCell(x, y);
                if (o === 1) isobands.push(edges("b+", x, y, up), edges("d+", x, y, up));
                else if (o === 2) isobands.push(edges("a-", x, y, up), edges("c-", x, y, up));
                break;

            case 69:    //  2120
                o = getCenterOfCell(x, y);
                if (o === 0 || o === 1) isobands.push(edges("a+", x, y, up), edges("c+", x, y, up), edges("d-", x, y, low));
                else if (o === 2) isobands.push(edges("b-", x, y, up), edges("d-", x, y, up), edges("d-", x, y, low));
                break;

            case 61:    //  2021
                o = getCenterOfCell(x, y);
                if (o === 0 || o === 1) isobands.push(edges("a+", x, y, up), edges("b-", x, y, low), edges("c+", x, y, up));
                else if (o === 2) isobands.push(edges("b-", x, y, up), edges("b-", x, y, low), edges("d-", x, y, up));
                break;

            case 47:    //  1202
                o = getCenterOfCell(x, y);
                if (o === 0 || o === 1) isobands.push(edges("b+", x, y, up), edges("c-", x, y, low), edges("d+", x, y, up));
                else if (o === 2) isobands.push(edges("a-", x, y, up), edges("c-", x, y, up), edges("c-", x, y, low));
                break;

            case 23:    //  0212
                o = getCenterOfCell(x, y);
                if (o === 0 || o === 1) isobands.push(edges("a-", x, y, low), edges("b+", x, y, up), edges("d+", x, y, up));
                else if (o === 2) isobands.push(edges("a-", x, y, up), edges("a-", x, y, low), edges("c-", x, y, up));
                break;

            case 11:    //  0102
                o = getCenterOfCell(x, y);
                if (o === 0) isobands.push(edges("b+", x, y, low), edges("d+", x, y, up), edges("d+", x, y, low));
                else if (o === 1 || o === 2) isobands.push(edges("a-", x, y, low), edges("c-", x, y, low), edges("d+", x, y, up));
                break;

            case 19:    //  0201
                o = getCenterOfCell(x, y);
                if (o === 0) isobands.push(edges("b+", x, y, up), edges("b+", x, y, low), edges("d+", x, y, low));
                else if (o === 1 || o === 2) isobands.push(edges("a-", x, y, low), edges("b+", x, y, up), edges("c-", x, y, low));
                break;

            case 33:    //  1020
                o = getCenterOfCell(x, y);
                if (o === 0) isobands.push(edges("a+", x, y, low), edges("c+", x, y, up), edges("c+", x, y, low));
                else if (o === 1 || o === 2) isobands.push(edges("b-", x, y, low), edges("c+", x, y, up), edges("d-", x, y, low));
                break;

            case 57:    //  2010
                o = getCenterOfCell(x, y);
                if (o === 0) isobands.push(edges("a+", x, y, up), edges("a+", x, y, low), edges("c+", x, y, low));
                else if (o === 1 || o === 2) isobands.push(edges("a+", x, y, up), edges("b-", x, y, low), edges("d-", x, y, low));
                break;

            default:
                break;
        }
    }

    function outsideContouring(code, x, y, side) {

        let tmp;
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
                break

            case "D":
                tmp = bot(code[2] + code[3]);
                if (tmp) isobands.push(tmp);
                tmp = left(code[3] + code[0]);
                if (tmp) isobands.push(tmp);
                break

            default:
                break;
        }

        function top(code) {

            switch (code) {
                case '01': return [...M(x, y, 0, low), x + 1, y + 1]
                case '02': return [...M(x, y, 0, low), ...M(x, y, 0, up)]
                case '10': return [...M(x, y, 1, low), x + 1, y]
                case '11': return [x + 1, y, x + 1, y + 1]
                case '12': return [...M(x, y, 0, up), x + 1, y]
                case '20': return [...M(x, y, 1, low), ...M(x, y, 1, up)]
                case '21': return [...M(x, y, 1, up), x + 1, y + 1]

                default: return false
            }
        }

        function right(code) {
            switch (code) {
                case '01': return [...N(x, y, 1, low), x, y + 1]
                case '02': return [...N(x, y, 1, low), ...N(x, y, 1, up)]
                case '10': return [...N(x, y, 0, low), x + 1, y + 1]
                case '11': return [x + 1, y + 1, x, y + 1]
                case '12': return [...N(x, y, 1, up), x + 1, y + 1]
                case '20': return [...N(x, y, 0, low), ...N(x, y, 0, up)]
                case '21': return [...N(x, y, 0, up), x, y + 1]

                default: return false
            }
        }

        function bot(code) {

            switch (code) {
                case '01': return [...P(x, y, 1, low), x, y]
                case '02': return [...P(x, y, 1, low), ...P(x, y, 1, up)]
                case '10': return [...P(x, y, 0, low), x, y + 1]
                case '11': return [x, y + 1, x, y]
                case '12': return [...P(x, y, 1, up), x, y + 1]
                case '20': return [...P(x, y, 0, low), ...P(x, y, 0, up)]
                case '21': return [...P(x, y, 0, up), x, y]

                default: return false
            }
        }

        function left(code) {
            switch (code) {
                case '01': return [...Q(x, y, 0, low), x + 1, y]
                case '02': return [...Q(x, y, 0, low), ...Q(x, y, 0, up)]
                case '10': return [...Q(x, y, 1, low), x, y]
                case '11': return [x, y, x + 1, y]
                case '12': return [...Q(x, y, 0, up), x, y]
                case '20': return [...Q(x, y, 1, low), ...Q(x, y, 1, up)]
                case '21': return [...Q(x, y, 1, up), x + 1, y]

                default: return false
            }
        }
    }

    const isobands = [];

    /* walk on the grid and computing contour */
    for (let i = 0, len = grid.length - 1; i < len; i++) {
        for (let j = 0, len1 = grid[i].length - 1; j < len1; j++) {

            const ternaryCode = getTernaryCode(A(i, j), B(i, j), C(i, j), D(i, j));
            const decimalCode = parseInt(ternaryCode, 3);

            if (decimalCode === 0 || decimalCode === 80) {
                continue;
            }

            if (decimalCode !== 40) {
                insideContouring(decimalCode, i, j);
            }

            const border = borderCheck(i, j);
            if (border) {
                outsideContouring(ternaryCode, i, j, border);
            }
        }
    }

    return isobands;
}
