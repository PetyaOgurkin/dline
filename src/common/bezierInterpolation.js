function bezier(geometry) {

    const out = []
    const newLine = [];
    let closed = true;

    if (geometry[0][0] !== geometry[geometry.length - 1][0] || geometry[0][1] !== geometry[geometry.length - 1][1]) {
        closed = false;
    }


    for (let i = 0; i < geometry.length; i++) {

        let next, prev;
        if (i === 0) {
            if (closed) {
                next = geometry[i + 1];
                prev = geometry[geometry.length - 2];
            } else {
                next = geometry[i + 1];
                prev = geometry[i];
            }
        } else if (i === geometry.length - 1) {
            if (closed) {
                out.push([out[0][0], out[0][1]]);
                break;
            } else {
                next = geometry[i];
                prev = geometry[i - 1];
            }
        } else {
            next = geometry[i + 1];
            prev = geometry[i - 1];
        }


        const vector = [(next[0] - prev[0]) / 2, (next[1] - prev[1]) / 2];

        const refP1 = [geometry[i][0] - vector[0] / 3, geometry[i][1] - vector[1] / 3];
        const refP2 = [geometry[i][0] + vector[0] / 3, geometry[i][1] + vector[1] / 3];

        
        out.push([refP1, refP2]);
    }

    const deb = [];
    for (let i = 0; i < geometry.length - 1; i++) {

        deb.push([geometry[i], out[i][1], out[i + 1][0], geometry[i + 1]])

        for (let t = 0; t < 1; t += .1) {
            const long = (1 - t) ** 3 * geometry[i][0] + 3 * (1 - t) ** 2 * t * out[i][1][0] + 3 * (1 - t) * t ** 2 * out[i + 1][0][0] + t ** 3 * geometry[i + 1][0];
            const lat = (1 - t) ** 3 * geometry[i][1] + 3 * (1 - t) ** 2 * t * out[i][1][1] + 3 * (1 - t) * t ** 2 * out[i + 1][0][1] + t ** 3 * geometry[i + 1][1];
            newLine.push([long, lat]);
        }

    }
    return newLine
}


export { bezier };