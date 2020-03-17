export default function computeIsobands(grid, low, up) {

    const interpolate = (p1, p2, c) => p1 > c ? (c - p2) / (p1 - p2) : (c - p1) / (p2 - p1);


    /* values of vertexes */
    const A = (x, y) => grid[x + 1][y];
    const B = (x, y) => grid[x + 1][y + 1];
    const C = (x, y) => grid[x][y + 1];
    const D = (x, y) => grid[x][y];

    /* coordinates of points on edges */
    const M = (x, y, c, h) => [x + 1, y + Math.abs(c - interpolate(A(x, y), B(x, y), h))];
    const N = (x, y, c, h) => [x + Math.abs(c - interpolate(B(x, y), C(x, y), h)), y + 1];
    const P = (x, y, c, h) => [x, y + Math.abs(c - interpolate(C(x, y), D(x, y), h))];
    const Q = (x, y, c, h) => [x + Math.abs(c - interpolate(D(x, y), A(x, y), h)), y];

    const getTernaryCode = (a, b, c, d) => {
        const check = v => v <= low || Number.isNaN(v) ? '0' : (v > low && v <= up) ? '1' : '2';
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
        const O = ((A(x, y) + B(x, y) + C(x, y) + D(x, y)) / 4);
        return O <= low ? 0 : O > low && O <= up ? 1 : 2
    }

    function insideContouring(code, x, y) {

        let o;
        switch (code) {

            /* single triangle */
            case "2221": isobands.push(edges("d-", x, y, up)); break;
            case "1112": isobands.push(edges("d+", x, y, up)); break;
            case "0001": isobands.push(edges("d+", x, y, low)); break;
            case "1110": isobands.push(edges("d-", x, y, low)); break;
            case "2212": isobands.push(edges("c-", x, y, up)); break;
            case "1121": isobands.push(edges("c+", x, y, up)); break;
            case "0010": isobands.push(edges("c+", x, y, low)); break;
            case "1101": isobands.push(edges("c-", x, y, low)); break;
            case "2122": isobands.push(edges("b-", x, y, up)); break;
            case "1211": isobands.push(edges("b+", x, y, up)); break;
            case "0100": isobands.push(edges("b+", x, y, low)); break;
            case "1011": isobands.push(edges("b-", x, y, low)); break;
            case "1222": isobands.push(edges("a-", x, y, up)); break;
            case "2111": isobands.push(edges("a+", x, y, up)); break;
            case "1000": isobands.push(edges("a+", x, y, low)); break;
            case "0111": isobands.push(edges("a-", x, y, low)); break;

            /* single rectangle */
            case "0011": isobands.push(edges("b>t", x, y, low)); break;
            case "1100": isobands.push(edges("t>b", x, y, low)); break;
            case "2211": isobands.push(edges("t>b", x, y, up)); break;
            case "1122": isobands.push(edges("b>t", x, y, up)); break;
            case "0110": isobands.push(edges("r>l", x, y, low)); break;
            case "1001": isobands.push(edges("l>r", x, y, low)); break;
            case "2112": isobands.push(edges("l>r", x, y, up)); break;
            case "1221": isobands.push(edges("r>l", x, y, up)); break;
            case "2200": isobands.push(edges("t>b", x, y, up), edges("t>b", x, y, low)); break;
            case "0022": isobands.push(edges("b>t", x, y, up), edges("b>t", x, y, low)); break;
            case "2002": isobands.push(edges("l>r", x, y, up), edges("l>r", x, y, low)); break;
            case "0220": isobands.push(edges("r>l", x, y, up), edges("r>l", x, y, low)); break;

            /* single trapezoid */
            case "2220": isobands.push(edges("d-", x, y, up), edges("d-", x, y, low)); break;
            case "0002": isobands.push(edges("d+", x, y, low), edges("d+", x, y, up)); break;
            case "2202": isobands.push(edges("c-", x, y, up), edges("c-", x, y, low)); break;
            case "0020": isobands.push(edges("c+", x, y, low), edges("c+", x, y, up)); break;
            case "2022": isobands.push(edges("b-", x, y, up), edges("b-", x, y, low)); break;
            case "0200": isobands.push(edges("b+", x, y, low), edges("b+", x, y, up)); break;
            case "0222": isobands.push(edges("a-", x, y, up), edges("a-", x, y, low)); break;
            case "2000": isobands.push(edges("a+", x, y, low), edges("a+", x, y, up)); break;

            /*  single pentagon */
            case "1200": isobands.push(edges("b+", x, y, up), edges("t>b", x, y, low)); break;
            case "0120": isobands.push(edges("c+", x, y, up), edges("r>l", x, y, low)); break;
            case "0012": isobands.push(edges("d+", x, y, up), edges("b>t", x, y, low)); break;
            case "2001": isobands.push(edges("a+", x, y, up), edges("l>r", x, y, low)); break;

            case "1022": isobands.push(edges("b-", x, y, low), edges("b>t", x, y, up)); break;
            case "2102": isobands.push(edges("c-", x, y, low), edges("l>r", x, y, up)); break;
            case "2210": isobands.push(edges("d-", x, y, low), edges("t>b", x, y, up)); break;
            case "0221": isobands.push(edges("a-", x, y, low), edges("r>l", x, y, up)); break;

            case "1002": isobands.push(edges("d+", x, y, up), edges("l>r", x, y, low)); break;
            case "2100": isobands.push(edges("a+", x, y, up), edges("t>b", x, y, low)); break;
            case "0210": isobands.push(edges("b+", x, y, up), edges("r>l", x, y, low)); break;
            case "0021": isobands.push(edges("c+", x, y, up), edges("b>t", x, y, low)); break;

            case "1220": isobands.push(edges("d-", x, y, low), edges("r>l", x, y, up)); break;
            case "0122": isobands.push(edges("a-", x, y, low), edges("b>t", x, y, up)); break;
            case "2012": isobands.push(edges("b-", x, y, low), edges("l>r", x, y, up)); break;
            case "2201": isobands.push(edges("c-", x, y, low), edges("t>b", x, y, up)); break;

            /* single hexagon */
            case "0211": isobands.push(edges("a-", x, y, low), edges("b+", x, y, up)); break;
            case "2110": isobands.push(edges("a+", x, y, up), edges("d-", x, y, low)); break;
            case "1102": isobands.push(edges("c-", x, y, low), edges("d+", x, y, up)); break;
            case "1021": isobands.push(edges("b-", x, y, low), edges("c+", x, y, up)); break;

            case "2011": isobands.push(edges("a+", x, y, up), edges("b-", x, y, low)); break;
            case "0112": isobands.push(edges("a-", x, y, low), edges("d+", x, y, up)); break;
            case "1120": isobands.push(edges("c+", x, y, up), edges("d-", x, y, low)); break;
            case "1201": isobands.push(edges("b+", x, y, up), edges("c-", x, y, low)); break;

            case "2101": isobands.push(edges("a+", x, y, up), edges("c-", x, y, low)); break;
            case "0121": isobands.push(edges("a-", x, y, low), edges("c+", x, y, up)); break;
            case "1012": isobands.push(edges("b-", x, y, low), edges("d+", x, y, up)); break;
            case "1210": isobands.push(edges("b+", x, y, up), edges("d-", x, y, low)); break;


            /* center */
            case "2020":
                o = getCenterOfCell(x, y);
                if (o === 0) isobands.push(edges("a+", x, y, up), edges("a+", x, y, low), edges("c+", x, y, up), edges("c+", x, y, low));
                else if (o === 1) isobands.push(edges("a+", x, y, up), edges("b-", x, y, low), edges("c+", x, y, up), edges("d-", x, y, low));
                else if (o === 2) isobands.push(edges("b-", x, y, up), edges("b-", x, y, low), edges("d-", x, y, up), edges("d-", x, y, low));
                break;

            case "0202":
                o = getCenterOfCell(x, y);
                if (o === 0) isobands.push(edges("b+", x, y, up), edges("b+", x, y, low), edges("d+", x, y, up), edges("d+", x, y, low));
                else if (o === 1) isobands.push(edges("a-", x, y, low), edges("b+", x, y, up), edges("c-", x, y, low), edges("d+", x, y, up));
                else if (o === 2) isobands.push(edges("a-", x, y, up), edges("a-", x, y, low), edges("c-", x, y, up), edges("c-", x, y, low));
                break;

            case "0101":
                o = getCenterOfCell(x, y);
                if (o === 0) isobands.push(edges("b+", x, y, low), edges("d+", x, y, low));
                else if (o === 1) isobands.push(edges("a-", x, y, low), edges("c-", x, y, low));
                break;

            case "1010":
                o = getCenterOfCell(x, y);
                if (o === 0) isobands.push(edges("a+", x, y, low), edges("c+", x, y, low));
                else if (o === 1) isobands.push(edges("b-", x, y, low), edges("d-", x, y, low));
                break;

            case "2121":
                o = getCenterOfCell(x, y);
                if (o === 1) isobands.push(edges("a+", x, y, up), edges("c+", x, y, up));
                else if (o === 2) isobands.push(edges("b-", x, y, up), edges("d-", x, y, up));
                break;

            case "1212":
                o = getCenterOfCell(x, y);
                if (o === 1) isobands.push(edges("b+", x, y, up), edges("d+", x, y, up));
                else if (o === 2) isobands.push(edges("a-", x, y, up), edges("c-", x, y, up));
                break;

            case "2120":
                o = getCenterOfCell(x, y);
                if (o === 0 || o === 1) isobands.push(edges("a+", x, y, up), edges("c+", x, y, up), edges("d-", x, y, low));
                else if (o === 2) isobands.push(edges("b-", x, y, up), edges("d-", x, y, up), edges("d-", x, y, low));
                break;

            case "2021":
                o = getCenterOfCell(x, y);
                if (o === 0 || o === 1) isobands.push(edges("a+", x, y, up), edges("b-", x, y, low), edges("c+", x, y, up));
                else if (o === 2) isobands.push(edges("b-", x, y, up), edges("b-", x, y, low), edges("d-", x, y, up));
                break;

            case "1202":
                o = getCenterOfCell(x, y);
                if (o === 0 || o === 1) isobands.push(edges("b+", x, y, up), edges("c-", x, y, low), edges("d+", x, y, up));
                else if (o === 2) isobands.push(edges("a-", x, y, up), edges("c-", x, y, up), edges("c-", x, y, low));
                break;

            case "0212":
                o = getCenterOfCell(x, y);
                if (o === 0 || o === 1) isobands.push(edges("a-", x, y, low), edges("b+", x, y, up), edges("d+", x, y, up));
                else if (o === 2) isobands.push(edges("a-", x, y, up), edges("a-", x, y, low), edges("c-", x, y, up));
                break;

            case "0102":
                o = getCenterOfCell(x, y);
                if (o === 0) isobands.push(edges("b+", x, y, low), edges("d+", x, y, up), edges("d+", x, y, low));
                else if (o === 1 || o === 2) isobands.push(edges("a-", x, y, low), edges("c-", x, y, low), edges("d+", x, y, up));
                break;

            case "0201":
                o = getCenterOfCell(x, y);
                if (o === 0) isobands.push(edges("b+", x, y, up), edges("b+", x, y, low), edges("d+", x, y, low));
                else if (o === 1 || o === 2) isobands.push(edges("a-", x, y, low), edges("b+", x, y, up), edges("c-", x, y, low));
                break;

            case "1020":
                o = getCenterOfCell(x, y);
                if (o === 0) isobands.push(edges("a+", x, y, low), edges("c+", x, y, up), edges("c+", x, y, low));
                else if (o === 1 || o === 2) isobands.push(edges("b-", x, y, low), edges("c+", x, y, up), edges("d-", x, y, low));
                break;

            case "2010":
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

            if (ternaryCode === '0000' || ternaryCode === '2222') {
                continue;
            }

            if (ternaryCode !== '1111') {
                insideContouring(ternaryCode, i, j);
            }

            const border = borderCheck(i, j);
            if (border) {
                outsideContouring(ternaryCode, i, j, border);
            }
        }
    }

    return isobands;
}
