/* из пар точек делает последовательность */

export default function toLine(couples) {
    
    const tmp = [];
    let endFlag = true;
    while (couples.length > 0) {
        if (endFlag === true) {
            tmp.push([]);
            tmp[tmp.length - 1].push([couples[0][0], couples[0][1]], [couples[0][2], couples[0][3]]);
            couples.splice(0, 1);
        }
        endFlag = true;

        for (let i = 0, len = couples.length; i < len; i++) {

            if (tmp[tmp.length - 1][tmp[tmp.length - 1].length - 1][0] === couples[i][0] && tmp[tmp.length - 1][tmp[tmp.length - 1].length - 1][1] === couples[i][1]) {
                tmp[tmp.length - 1].push([couples[i][2], couples[i][3]]);
                couples.splice(i, 1);
                endFlag = false;
                break;
            }
            else if (tmp[tmp.length - 1][tmp[tmp.length - 1].length - 1][0] === couples[i][2] && tmp[tmp.length - 1][tmp[tmp.length - 1].length - 1][1] === couples[i][3]) {
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
            }
            else if (tmp[tmp.length - 1][0][0] === couples[i][2] && tmp[tmp.length - 1][0][1] === couples[i][3]) {
                tmp[tmp.length - 1].unshift([couples[i][0], couples[i][1]]);
                couples.splice(i, 1);
                endFlag = false;
                break;
            }
        }
    }

    return tmp;
}
