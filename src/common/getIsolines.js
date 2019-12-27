/* из пар точек делает последовательность */

function getIsolines(RawIsolines) {
    const TempIsolines = [];
    let End_Isoline = true;
    while (RawIsolines.length > 0) {
        if (End_Isoline === true) {
            TempIsolines.push([]);
            TempIsolines[TempIsolines.length - 1].push([RawIsolines[0][0], RawIsolines[0][1]], [RawIsolines[0][2], RawIsolines[0][3]]);
            RawIsolines.splice(0, 1);
        }
        End_Isoline = true;

        for (let i = 0, len = RawIsolines.length; i < len; i++) {

            if (TempIsolines[TempIsolines.length - 1][TempIsolines[TempIsolines.length - 1].length - 1][0] === RawIsolines[i][0] && TempIsolines[TempIsolines.length - 1][TempIsolines[TempIsolines.length - 1].length - 1][1] === RawIsolines[i][1]) {
                TempIsolines[TempIsolines.length - 1].push([RawIsolines[i][2], RawIsolines[i][3]]);
                RawIsolines.splice(i, 1);
                End_Isoline = false;
                break;
            }
            else if (TempIsolines[TempIsolines.length - 1][TempIsolines[TempIsolines.length - 1].length - 1][0] === RawIsolines[i][2] && TempIsolines[TempIsolines.length - 1][TempIsolines[TempIsolines.length - 1].length - 1][1] === RawIsolines[i][3]) {
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
            }
            else if (TempIsolines[TempIsolines.length - 1][0][0] === RawIsolines[i][2] && TempIsolines[TempIsolines.length - 1][0][1] === RawIsolines[i][3]) {
                TempIsolines[TempIsolines.length - 1].unshift([RawIsolines[i][0], RawIsolines[i][1]]);
                RawIsolines.splice(i, 1);
                End_Isoline = false;
                break;
            }
        }
    }
    return TempIsolines;
}

export { getIsolines }