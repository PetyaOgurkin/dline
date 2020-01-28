import bboxCalculator from './bboxCalculator';

export default function optionsParser(options, points) {
    let { bbox, units, exponent, mask, weightUp, weightDown } = options

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

    if (mask) {
        if (!weightUp) {
            weightUp = [0, 0]
        }

        if (!weightDown) {
            weightDown = [0, 0]
        }
    }

    return { bbox, units, exponent, mask, weightUp, weightDown }
}