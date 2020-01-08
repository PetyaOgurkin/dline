/* из пар точек делает последовательность */

function deepCopy(arr) {
    const newArr = []
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] instanceof Array) {
            newArr.push(deepCopy(arr[i]));
        } else {
            newArr.push(arr[i])
        }
    }
    return newArr
}

function getCentroid(d1, d2) {
    const x = (d1[0] + d2[0]) / 2;
    const y = (d1[1] + d2[1]) / 2;
    return [x, y]
}

function getIsolines(RawIsolines, longMax, latMax) {

    const TempIsolines = [];
    const dualInterpolate = [];
    let End_Isoline = true;
    while (RawIsolines.length > 0) {
        if (End_Isoline === true) {
            TempIsolines.push([]);
            dualInterpolate.push([]);

            TempIsolines[TempIsolines.length - 1].push([RawIsolines[0][0], RawIsolines[0][1]], [RawIsolines[0][2], RawIsolines[0][3]]);

            if (RawIsolines[0][0] === 0.5 || RawIsolines[0][1] === 0.5 || RawIsolines[0][2] === 0.5 || RawIsolines[0][3] === 0.5 ||
                RawIsolines[0][0] === latMax || RawIsolines[0][1] === longMax || RawIsolines[0][2] === latMax || RawIsolines[0][3] === longMax) {
                dualInterpolate[dualInterpolate.length - 1].push([RawIsolines[0][0], RawIsolines[0][1]], [RawIsolines[0][2], RawIsolines[0][3]]);
            } else {
                dualInterpolate[dualInterpolate.length - 1].push(getCentroid([RawIsolines[0][0], RawIsolines[0][1]], [RawIsolines[0][2], RawIsolines[0][3]]))
            }


            RawIsolines.splice(0, 1);
        }
        End_Isoline = true;

        for (let i = 0, len = RawIsolines.length; i < len; i++) {

            if (TempIsolines[TempIsolines.length - 1][TempIsolines[TempIsolines.length - 1].length - 1][0] === RawIsolines[i][0] && TempIsolines[TempIsolines.length - 1][TempIsolines[TempIsolines.length - 1].length - 1][1] === RawIsolines[i][1]) {
                TempIsolines[TempIsolines.length - 1].push([RawIsolines[i][2], RawIsolines[i][3]]);

                if (RawIsolines[i][0] === 0.5 || RawIsolines[i][1] === 0.5 || RawIsolines[i][2] === 0.5 || RawIsolines[i][3] === 0.5 ||
                    RawIsolines[i][0] === latMax || RawIsolines[i][1] === longMax || RawIsolines[i][2] === latMax || RawIsolines[i][3] === longMax) {
                    dualInterpolate[dualInterpolate.length - 1].push([RawIsolines[i][2], RawIsolines[i][3]])
                } else {
                    dualInterpolate[dualInterpolate.length - 1].push(getCentroid([RawIsolines[i][0], RawIsolines[i][1]], [RawIsolines[i][2], RawIsolines[i][3]]))
                }


                RawIsolines.splice(i, 1);
                End_Isoline = false;
                break;
            }
            else if (TempIsolines[TempIsolines.length - 1][TempIsolines[TempIsolines.length - 1].length - 1][0] === RawIsolines[i][2] && TempIsolines[TempIsolines.length - 1][TempIsolines[TempIsolines.length - 1].length - 1][1] === RawIsolines[i][3]) {
                TempIsolines[TempIsolines.length - 1].push([RawIsolines[i][0], RawIsolines[i][1]]);

                if (RawIsolines[i][0] === 0.5 || RawIsolines[i][1] === 0.5 || RawIsolines[i][2] === 0.5 || RawIsolines[i][3] === 0.5 ||
                    RawIsolines[i][0] === latMax || RawIsolines[i][1] === longMax || RawIsolines[i][2] === latMax || RawIsolines[i][3] === longMax) {
                    dualInterpolate[dualInterpolate.length - 1].push([RawIsolines[i][0], RawIsolines[i][1]])
                } else {
                    dualInterpolate[dualInterpolate.length - 1].push(getCentroid([RawIsolines[i][0], RawIsolines[i][1]], [RawIsolines[i][2], RawIsolines[i][3]]))
                }

                RawIsolines.splice(i, 1);
                End_Isoline = false;
                break;
            }
            if (TempIsolines[TempIsolines.length - 1][0][0] === RawIsolines[i][0] && TempIsolines[TempIsolines.length - 1][0][1] === RawIsolines[i][1]) {
                TempIsolines[TempIsolines.length - 1].unshift([RawIsolines[i][2], RawIsolines[i][3]]);

                if (RawIsolines[i][0] === 0.5 || RawIsolines[i][1] === 0.5 || RawIsolines[i][2] === 0.5 || RawIsolines[i][3] === 0.5 ||
                    RawIsolines[i][0] === latMax || RawIsolines[i][1] === longMax || RawIsolines[i][2] === latMax || RawIsolines[i][3] === longMax) {
                    dualInterpolate[dualInterpolate.length - 1].unshift([RawIsolines[i][2], RawIsolines[i][3]])
                } else {
                    dualInterpolate[dualInterpolate.length - 1].unshift(getCentroid([RawIsolines[i][0], RawIsolines[i][1]], [RawIsolines[i][2], RawIsolines[i][3]]))
                }

                RawIsolines.splice(i, 1);
                End_Isoline = false;
                break;
            }
            else if (TempIsolines[TempIsolines.length - 1][0][0] === RawIsolines[i][2] && TempIsolines[TempIsolines.length - 1][0][1] === RawIsolines[i][3]) {
                TempIsolines[TempIsolines.length - 1].unshift([RawIsolines[i][0], RawIsolines[i][1]]);

                if (RawIsolines[i][0] === 0.5 || RawIsolines[i][1] === 0.5 || RawIsolines[i][2] === 0.5 || RawIsolines[i][3] === 0.5 ||
                    RawIsolines[i][0] === latMax || RawIsolines[i][1] === longMax || RawIsolines[i][2] === latMax || RawIsolines[i][3] === longMax) {
                    dualInterpolate[dualInterpolate.length - 1].unshift([RawIsolines[i][0], RawIsolines[i][1]])
                } else {
                    dualInterpolate[dualInterpolate.length - 1].unshift(getCentroid([RawIsolines[i][0], RawIsolines[i][1]], [RawIsolines[i][2], RawIsolines[i][3]]))
                }

                RawIsolines.splice(i, 1);
                End_Isoline = false;
                break;
            }
        }

        if (End_Isoline) {
            if (TempIsolines[TempIsolines.length - 1][0][0] === TempIsolines[TempIsolines.length - 1][TempIsolines[TempIsolines.length - 1].length - 1][0] &&
                TempIsolines[TempIsolines.length - 1][0][1] === TempIsolines[TempIsolines.length - 1][TempIsolines[TempIsolines.length - 1].length - 1][1]) {
                dualInterpolate[dualInterpolate.length - 1].push([dualInterpolate[dualInterpolate.length - 1][0][0], dualInterpolate[dualInterpolate.length - 1][0][1]])
            }
        }
    }

    if (TempIsolines[TempIsolines.length - 1][0][0] === TempIsolines[TempIsolines.length - 1][TempIsolines[TempIsolines.length - 1].length - 1][0] &&
        TempIsolines[TempIsolines.length - 1][0][1] === TempIsolines[TempIsolines.length - 1][TempIsolines[TempIsolines.length - 1].length - 1][1]) {
        dualInterpolate[dualInterpolate.length - 1].push([dualInterpolate[dualInterpolate.length - 1][0][0], dualInterpolate[dualInterpolate.length - 1][0][1]])
    }

    return dualInterpolate;
}

export { getIsolines }