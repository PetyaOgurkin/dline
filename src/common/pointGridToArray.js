import toAsc from './toAsc';

function pointGridToArray(geoJson, z = 'value') {
    const bbox = [geoJson.features[0].geometry.coordinates[0], geoJson.features[0].geometry.coordinates[1]];

    if (geoJson.features[1].geometry.coordinates[0] === bbox[0]) {
        const latCellSize = geoJson.features[1].geometry.coordinates[1] - bbox[1];
        let longCellSize;
        let rows;

        for (let i = 1; i < geoJson.features.length; i++) {
            if (geoJson.features[i].geometry.coordinates[1] === bbox[1]) {
                longCellSize = geoJson.features[i].geometry.coordinates[0] - bbox[0];
                rows = i;
                break;
            }
        }
        const cols = geoJson.features.length / rows;
        bbox.push(bbox[0] + cols * longCellSize, bbox[1] + rows * latCellSize)

        const grid = [];
        geoJson.features.forEach((p, idx) => {
            const i = Math.floor(idx / rows);
            const j = idx - i * rows;
            if (!grid[j]) {
                grid[j] = [];
            }
            grid[j][i] = p.properties[[z]];
        });
        return { grid, latCellSize, longCellSize, bbox, toAsc };

    } else {
        const longCellSize = geoJson.features[1].geometry.coordinates[0] - bbox[0];
        let latCellSize;
        let cols;

        for (let i = 1; i < geoJson.features.length; i++) {
            if (geoJson.features[i].geometry.coordinates[0] === bbox[0]) {
                latCellSize = geoJson.features[i].geometry.coordinates[1] - bbox[1];
                cols = i;
                break;
            }
        }
        const rows = geoJson.features.length / cols;
        bbox.push(bbox[0] + cols * longCellSize, bbox[1] + rows * latCellSize)

        const grid = [];
        geoJson.features.forEach((p, idx) => {
            const i = Math.floor(idx / cols);
            const j = idx - i * cols;
            if (!grid[i]) {
                grid[i] = [];
            }
            grid[i][j] = p.properties[[z]];
        });
        return { grid, latCellSize, longCellSize, bbox, toAsc };
    }
}

export { pointGridToArray }