function intersection(barrier, segment) {
    const getVector = (p1, p2) => [p2[0] - p1[0], p2[1] - p1[1]];
    const obliqueProduct = (v1, v2) => v1[0] * v2[1] - v2[0] * v1[1];

    const ans = [];
    for (let i = 0; i < barrier.length - 1; i++) {
        const tmp = check([barrier[i], barrier[i + 1]], segment);
        if (tmp) {
            ans.push(tmp)
        }
    }

    if (ans.length % 2) {
        return ans[0];
    } else {
        return false;
    }

    function check(a, b) {
        let one = false;
        let two = false;

        let segment = getVector(b[0], b[1]);
        let vec1 = getVector(b[0], a[0]);
        let vec2 = getVector(b[0], a[1]);

        let fst = obliqueProduct(segment, vec1)
        let sec = obliqueProduct(segment, vec2)

        if (fst * sec < 0) {
            one = true
        }

        segment = getVector(a[0], a[1]);
        vec1 = getVector(a[0], b[0]);
        vec2 = getVector(a[0], b[1]);

        fst = obliqueProduct(segment, vec1)
        sec = obliqueProduct(segment, vec2)


        if (fst * sec < 0) {
            two = true
        }

        if (one && two) {
            if (sec < 0) {
                return 'left';
            } else {
                return 'right';
            }
        }

        return false
    }
}


const barriers = [
    [
        [1, 2], [3, 4], [5, 6]
    ],
    [
        [12, 13], [14, 15], [16, 17]
    ]]

barriers.forEach(barrier => {
    for (let i = 0; i < barrier.length; i++) {
        barrier[i][1] = Math.abs(100 - barrier[i][1]);
        barrier[i][0] = Math.abs(100 - barrier[i][0]);
    }
})

console.log(barriers);
