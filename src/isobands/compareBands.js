import { inPoly } from './inPoly';

function compareBands(bnds) {
    const bands = [...bnds]
    bands.sort((a, b) => a.length - b.length).reverse();

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

export { compareBands }