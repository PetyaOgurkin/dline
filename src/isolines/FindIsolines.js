function FindIsolines(Grid, h, LongFinish, LatFinish) {
    const TempIsolines = [];
    const interpolate = (f1, f2, c) => (c - f2) / (f1 - f2);

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

    let a, b, c, d, e;

    for (let i = 0, len = Grid.length - LatFinish - 2; i < len; i += 2) {
        for (let j = 0, len1 = Grid[i].length - LongFinish - 2; j < len1; j += 2) {

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

            case "1110": case "0001": TempIsolines.push(cells(y, x, h, "d")); break;
            case "1101": case "0010": TempIsolines.push(cells(y, x, h, "c")); break;
            case "1011": case "0100": TempIsolines.push(cells(y, x, h, "b")); break;
            case "0111": case "1000": TempIsolines.push(cells(y, x, h, "a")); break;

            case "1100": case "0011": TempIsolines.push(cells(y, x, h, "h")); break;
            case "1001": case "0110": TempIsolines.push(cells(y, x, h, "v")); break;

            case "1010":
                if (e === 0) TempIsolines.push(cells(y, x, h, "a"), cells(y, x, h, "c"));
                else if (e === 1) TempIsolines.push(cells(y, x, h, "b"), cells(y, x, h, "d"));
                break;

            case "0101":
                if (e === 0) TempIsolines.push(cells(y, x, h, "b"), cells(y, x, h, "d"));
                else if (e === 1) TempIsolines.push(cells(y, x, h, "a"), cells(y, x, h, "c"));
                break;

            default:
                break;
        }
    }

    return TempIsolines;
}


export { FindIsolines }