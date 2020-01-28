export default function compareBands(bands) {

    const accessoriesList = {};

    for (let i = 0; i < bands.length; i++) {
        const own = [];
        for (let j = 0; j < bands.length; j++) {
            if (i !== j) {
                if (inPoly(bands[i][0][1], bands[i][0][0], bands[j])) {
                    own.push(j);
                }
            }
        }
        accessoriesList[[i]] = own;
    }

    const totalBands = [];

    for (let i = 0; i < bands.length; i++) {
        const tmpChild = [];
        for (const band in accessoriesList) {
            if (accessoriesList[band][accessoriesList[band].length - 1] === i && (accessoriesList[band].length - 1) % 2 === 0) {
                tmpChild.push(bands[band])
            }
        }

        if ((accessoriesList[[i]].length - 1) % 2 !== 0)
            totalBands.push([bands[i], ...tmpChild]);
    }

    return totalBands
}

/*  принадлежность точки к полигону */
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
