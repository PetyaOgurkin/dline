function stepOption(options, Dot_Max_Z, Dot_Min_Z) {
    switch (options.type) {
        case "CustomValues": return options.values;
        case "Range": return stepParse(options.max, options.min, options.step);
        case "FullRange": return stepParse(Dot_Max_Z, Dot_Min_Z, options.step);

        default:
            break;
    }

    function stepParse(max, min, d) {
        const fixLen = (d.toString().includes('.')) ? (d.toString().split('.').pop().length) : (0);
        const steps = [];
        let h = max;
        while (h >= min) {
            steps.push(h);
            h -= d;
            h = parseFloat(h.toFixed(fixLen));
        }
        return steps;
    }
}

export { stepOption }