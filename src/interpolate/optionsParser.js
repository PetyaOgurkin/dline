import bboxCalculator from './bboxCalculator';

export default function optionsParser(options, points) {
    let { bbox, units, exponent, mask, boundaries } = options

    switch (typeof (bbox)) {
        case "undefined":
            bbox = bboxCalculator([0, 0], points);
            break;

        case "object":
            if (!Array.isArray(bbox)) throw new Error('bbox is not array');

            if (bbox.length === 0) {
                bbox = bboxCalculator([0, 0], points);

            } else if (bbox.length === 2) {
                bbox.forEach(e => {
                    if (typeof (e) !== "number" || e < 0) throw new Error('invalid bbox values')
                })
                bbox = bboxCalculator(bbox, points);

            } else if (bbox.length === 4) {
                bbox.forEach(e => {
                    if (typeof (e) !== "number") throw new Error('invalid bbox values')
                })

            } else throw new Error('invalid bbox length');
            break;

        default: throw new Error('bbox is not array');
    }

    switch (typeof (units)) {
        case 'string': case "undefined":
            if (units === 'meters' || units === undefined) {
                units = ['meters', 'meters']
            } else if (units === 'degrees') {
                units = ['degrees', 'degrees']
            } else throw new Error('invalid units values')
            break;

        case 'object':
            if (!Array.isArray(units)) throw new Error('units is not array');

            if (units.length === 2) {
                units.forEach(e => {
                    if (e !== 'meters' && e !== 'degrees') throw new Error('invalid units values');
                })
            } else throw new Error('invalid units length')
            break;

        default: throw new Error('invalid units values')
    }

    if (!exponent) {
        exponent = 2;
    }

    let lowerIntervals, upperIntervals;
    if (mask) {
        if (boundaries) {
            function getHigherIntervals(w) {
                const tmp = w.filter(e => e[0] > 0).sort((a, b) => b[0] - a[0]);
                tmp.unshift([Infinity]);
                return tmp.length ? tmp : false;
            };

            function getLowerIntervals(w) {
                const tmp = w.filter(e => e[0] < 0).sort((a, b) => b[0] - a[0]);
                tmp.push([-Infinity])
                return tmp.length ? tmp : false;
            };

            lowerIntervals = getLowerIntervals(boundaries)
            upperIntervals = getHigherIntervals(boundaries)
        } else throw new Error('boundaries is undefined')
    }

    return { bbox, units, exponent, mask, lowerIntervals, upperIntervals }
}