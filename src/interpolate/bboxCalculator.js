export default function bboxCalculator(percents, points) {

    if (!Array.isArray(percents)) {
        throw new Error('percents is not array')
    }

    const minLat = Math.min(...points.map(point => point[0]))
    const minLong = Math.min(...points.map(point => point[1]))
    const maxLat = Math.max(...points.map(point => point[0]))
    const maxLong = Math.max(...points.map(point => point[1]))

    // расстояние между крайними точками в координатах
    const long = maxLong - minLong;
    const lat = maxLat - minLat;

    // расстояние между границами сетки в координатах
    const newLong = long * (100 + percents[0]) / 100;
    const newLat = lat * (100 + percents[1]) / 100;

    // вершины сетки
    const swLong = minLong - (newLong - long) / 2;
    const swLat = minLat - (newLat - lat) / 2;
    const neLong = maxLong + (newLong - long) / 2;
    const neLat = maxLat + (newLat - lat) / 2;

    return [swLong, swLat, neLong, neLat]
}