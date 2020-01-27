export default function distance(D1, D2) {

    const EARTH_RADIUS = 6372795;
    const toRadians = point => point.map(c => c * Math.PI / 180);

    const A = toRadians(D1);
    const B = toRadians(D2);
    return EARTH_RADIUS * Math.acos(Math.sin(A[0]) * Math.sin(B[0]) + Math.cos(A[0]) * Math.cos(B[0]) * Math.cos(A[1] - B[1]));
}
