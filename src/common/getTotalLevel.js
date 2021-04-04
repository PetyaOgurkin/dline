export const getTotalLevel = (geoJson) => {
    let up = 0;
    let down = 0;

    geoJson.features.forEach(p => {
        up += p.properties.area * p.properties.value;
        down += p.properties.area;
    })

    return up / down;
}


