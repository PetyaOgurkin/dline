import * as martinez from 'martinez-polygon-clipping';
import turf from '@turf'
import { pointsToGeoJson } from './pointsToGeoJson';

export const voronoi = (points, bbox, cutMask) => {

    const geoPoints = pointsToGeoJson(points);
    return {
        type: 'FeatureCollection',
        features: turf.voronoi(geoPoints, { bbox }).features.filter(v => {
            v.properties.value = turf.pointsWithinPolygon(geoPoints, v).features[0].properties.value

            const geom = martinez.intersection(cutMask.geometry.coordinates, v.geometry.coordinates)

            if (geom) {
                v.geometry.type = 'MultiPolygon'
                v.geometry.coordinates = geom
                v.properties.area = turf.area(v)
                return true
            }
            return false
        })
    }
}