export default function computeIsolines(grid, h) {

    const interpolate = (p1, p2) => p1 > h ? (h - p2) / (p1 - p2) : (h - p1) / (p2 - p1)

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

    const A = (x, y) => grid[x + 1][y];
    const B = (x, y) => grid[x + 1][y + 1];
    const C = (x, y) => grid[x][y + 1];
    const D = (x, y) => grid[x][y];

    const M = (x, y, c) => [x + 1, y + Math.abs(c - interpolate(A(x, y), B(x, y)))]
    const N = (x, y, c) => [x + Math.abs(c - interpolate(B(x, y), C(x, y))), y + 1]
    const P = (x, y, c) => [x, y + Math.abs(c - interpolate(C(x, y), D(x, y)))]
    const Q = (x, y, c) => [x + Math.abs(c - interpolate(D(x, y), A(x, y))), y]

    const center = (x, y) => ((A(x, y) + B(x, y) + C(x, y) + D(x, y)) / 4) <= h ? 0 : 1;

    const getBinaryCode = (a, b, c, d) => {
        const check = v => v <= h ? "0" : "1";
        return parseInt(check(a) + check(b) + check(c) + check(d), 2);
    }

    function edges(way, x, y) {
        switch (way) {
            case "a-": return [...M(x, y, 0), ...Q(x, y, 1)];
            case "b-": return [...N(x, y, 1), ...M(x, y, 1)];
            case "c-": return [...P(x, y, 1), ...N(x, y, 0)];
            case "d-": return [...Q(x, y, 0), ...P(x, y, 0)];

            case "a+": return [...M(x, y, 1), ...Q(x, y, 0)];
            case "b+": return [...N(x, y, 0), ...M(x, y, 0)];
            case "c+": return [...P(x, y, 0), ...N(x, y, 1)];
            case "d+": return [...Q(x, y, 1), ...P(x, y, 1)];

            case "l>r": return [...M(x, y, 1), ...P(x, y, 1)];
            case "r>l": return [...M(x, y, 0), ...P(x, y, 0)];

            case "t>b": return [...N(x, y, 0), ...Q(x, y, 0)];
            case "b>t": return [...N(x, y, 1), ...Q(x, y, 1)];

            default:
                console.error('wtf?');
                break;
        }
    }

    const isolines = [];

    for (let i = 0, len = grid.length - 1; i < len; i++) {
        for (let j = 0, len1 = grid[i].length - 1; j < len1; j++) {
            contouring(getBinaryCode(A(i, j), B(i, j), C(i, j), D(i, j)), i, j);
        }
    }

    function contouring(val, x, y) {
        if (val === 0 || val === 15) return;

        let o;
        switch (val) {
            case 14: isolines.push(edges("d-", x, y, h)); break;    //  1110
            case 1: isolines.push(edges("d+", x, y, h)); break;     //  0001
            case 13: isolines.push(edges("c-", x, y, h)); break;    //  1101
            case 2: isolines.push(edges("c+", x, y, h)); break;     //  0010
            case 11: isolines.push(edges("b-", x, y, h)); break;    //  1011
            case 4: isolines.push(edges("b+", x, y, h)); break;     //  0100
            case 7: isolines.push(edges("a-", x, y, h)); break;     //  0111
            case 8: isolines.push(edges("a+", x, y, h)); break;     //  1000

            case 12: isolines.push(edges("t>b", x, y, h)); break;   //  1100
            case 3: isolines.push(edges("b>t", x, y, h)); break;    //  0011
            case 9: isolines.push(edges("l>r", x, y, h)); break;    //  1001
            case 6: isolines.push(edges("r>l", x, y, h)); break;    //  0110

            case 10:    //  1010
                o = center(x, y);
                if (o === 0) isolines.push(edges("a+", x, y, h), edges("c+", x, y, h));
                else if (o === 1) isolines.push(edges("b-", x, y, h), edges("d-", x, y, h));
                break;

            case 5:     //  0101
                o = center(x, y);
                if (o === 0) isolines.push(edges("b+", x, y, h), edges("d+", x, y, h));
                else if (o === 1) isolines.push(edges("a-", x, y, h), edges("c-", x, y, h));
                break;

            default:
                break;
        }
    }

    return isolines;
}
