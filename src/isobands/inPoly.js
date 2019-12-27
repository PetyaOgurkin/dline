function inPoly(x, y, pol) {
    const npol = pol.length;
    let j = npol - 1,
        c = false;
    for (let i = 0; i < npol; i++) {
        if ((((pol[i][0] <= y) && (y < pol[j][0])) || ((pol[j][0] <= y) && (y < pol[i][0]))) &&
            (x > (pol[j][1] - pol[i][1]) * (y - pol[i][0]) / (pol[j][0] - pol[i][0]) + pol[i][1])) {
            c = !c
        }
        j = i;
    }
    return c;
}


export { inPoly }