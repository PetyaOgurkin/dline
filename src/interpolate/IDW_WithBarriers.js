const getVector = (p1, p2) => [p2[0] - p1[0], p2[1] - p1[1]];
const obliqueProduct = (v1, v2) => v1[0] * v2[1] - v2[0] * v1[1];
const scalarProduct = (v1, v2) => v1[0] * v2[0] + v1[1] * v2[1];

const line = [[3, 4], [5, 2], [8, 2], [10, 5], [10, 8], [5, 9]];


const A = [7, 5];
const B = [12, 5];
const C = [11, 2];
const D = [2, 2];
const E = [5, 11];
const F = [5, 1];
const G = [10, 10];
const H = [10, 3];
const J = [6, 2];

const d3 = [10, 5]



for (let i = 0; i < line.length - 1; i++) {

    console.log('=====' + i + '====');

    if (intersection([line[i], line[i + 1]], [H, G])) {
        console.log(i, i + 1);

    }


    /* if (affiliation(line[i], [H, G])) {
        console.log(i);
    } */
}
/* 
if (affiliation(line[line.length - 1], [H, G])) {
    console.log(line.length - 1);
} */




function intersection(a, b) {
    let one = false;
    let two = false;

    let segment = getVector(a[0], a[1]);
    let vec1 = getVector(a[0], b[0]);
    let vec2 = getVector(a[0], b[1]);

    let fst = obliqueProduct(segment, vec1)
    let sec = obliqueProduct(segment, vec2)

    console.log(fst * sec);


    if (fst * sec < 0) {
        one = true
    } else if (fst * sec === 0) {
        if (scalarProduct(vec1, vec2) <= 0) {
            one = true
        }
    }

    segment = getVector(b[0], b[1]);
    vec1 = getVector(b[0], a[0]);
    vec2 = getVector(b[0], a[1]);

    fst = obliqueProduct(segment, vec1)
    sec = obliqueProduct(segment, vec2)
    console.log(fst * sec);

    if (fst * sec < 0) {
        two = true
    } else if (fst * sec === 0) {

        console.log(scalarProduct(vec1, vec2));
        

        if (scalarProduct(vec1, vec2) <= 0) {
            two = true
        }
    }

    if (one && two) {
        return true
    }

    return false
}



function affiliation(A, b) {

    let segment = getVector(...b);
    let segment2 = getVector(b[0], A);

    let vec1 = getVector(A, b[0]);
    let vec2 = getVector(A, b[1]);

    let fst = obliqueProduct(segment, segment2)
    if (fst === 0) {
        let sec = scalarProduct(vec1, vec2)
        if (sec <= 0) {
            return true
        }
    }
    return false

}


// console.log(intersection([[9, 5], [8, 5]], [A, B]));