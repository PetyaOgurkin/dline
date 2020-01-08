
/* разбиение полигона на линии по границам сетки */
function divideBands(band, bbox) {

    const segments = [];
    let flag = true;
    for (let i = 0; i < band.length; i++) {

        const long = band[i][0];
        const lat = band[i][1];

        if (long === bbox[0] || long === bbox[2] || lat === bbox[1] || lat === bbox[3]) {
            segments.push([[band[i][0], band[i][1]]]);
            flag = true;
            continue;
        }

        if (flag) {
            segments.push([[band[i][0], band[i][1]]])
            flag = false;
        } else {
            segments[segments.length - 1].push([band[i][0], band[i][1]])
        }
    }






    if (segments[0].length > 1 && segments[segments.length - 1].length > 1 && segments.length > 1) {

        const dep = deepCopy(segments[0]);
        dep.splice(0, 1)

        segments.splice(0, 1);

        segments[segments.length - 1].push(...dep);
        segments[segments.length - 1].push(...segments[0]);

    }


    if (segments.length > 1) {
        for (let i = 0; i < segments.length; i++) {

            if (segments[i].length > 1 && i > 0) {
                segments[i].unshift(...segments[i - 1]);
                segments[i - 1] = [];
            }

            if (segments[i].length > 1 && i < segments.length - 1) {
                segments[i].push(...segments[i + 1]);
                segments[i + 1] = [];
            }
        }
    }

    const rseg = segments.filter(e => e.length > 0)

    return rseg;
}


export { divideBands }



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