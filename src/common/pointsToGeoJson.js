export const pointsToGeoJson = (points, z = 'value') => {

    const features = points.map(p => {
        return {
            type: 'Feature',
            properties: {
                [z]: p[2]
            },
            geometry: {
                type: 'Point',
                coordinates: [p[1], p[0]]
            }
        }
    })

    const geoJson = {
        type: 'FeatureCollection',
        features
    }

    return geoJson
}