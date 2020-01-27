import bboxCalculator from './bboxCalculator';

export default function optionsParser(options, points) {
    let { bbox, units, exponent, mask, weightUp, weightDown } = options

    switch (typeof (bbox)) {
        case "undefined":
            bbox = bboxCalculator([0, 0], points);
            break;

        case "object":
            if (!Array.isArray(bbox)) throw new Error('bbox не является массивом');

            if (bbox.length === 0) {
                bbox = bboxCalculator([0, 0], points);

            } else if (bbox.length === 2) {
                bbox.forEach(e => {
                    if (typeof (e) !== "number" || e < 0) throw new Error('Неккоректные значения bbox')
                })
                bbox = bboxCalculator(bbox, points);

            } else if (bbox.length === 4) {
                bbox.forEach(e => {
                    if (typeof (e) !== "number") throw new Error('Неккоректные значения bbox')
                })

            } else throw new Error('Некорректное кол-во элементов массива bbox');
            break;

        default: throw new Error('bbox не является массивом');
    }

    switch (typeof (units)) {
        case 'string': case "undefined":
            if (units === 'meters' || units === undefined) {
                units = ['meters', 'meters']
            } else if (units === 'degrees') {
                units = ['degrees', 'degrees']
            } else throw new Error('Некорректные значения units')
            break;

        case 'object':
            if (!Array.isArray(units)) throw new Error('units не является массивом');

            if (units.length === 2) {
                units.forEach(e => {
                    if (e !== 'meters' && e !== 'degrees') throw new Error('Некорректные значения units');
                })
            } else throw new Error('Некорректное кол-во элементов массива units')
            break;

        default: throw new Error('Некорректные значения units')
    }

    if (exponent === undefined) {
        exponent = 2;
    } else if (typeof (exponent) !== "number" || exponent <= 0) {
        throw new Error('Неккоректное значение exponent')
    }

    return { bbox, units, exponent, mask, weightUp, weightDown }
}