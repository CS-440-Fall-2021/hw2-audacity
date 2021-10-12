// MVES6 = import('./MVES6.js');
import { mix } from "./MVES6"
// MVES6 = require('./MVES6.js');

function map_point(P, Q, A, B, X)
{
    let alpha;

    if( typeof(P) == 'number' && typeof(Q) == 'number' && typeof(X) == 'number' )
        alpha = (X - P) / (Q - P);

    else if ( P.length != Q.length || Q.length != X.length )
        throw "vector dimension mismatch";
    
    else
        alpha = (X[0] - P[0]) / (Q[0] - P[0]);

    // return MVES6.mix(A, B, alpha);
    let a = MVES6.mix(A, B, alpha)
}

P = [0,0];
Q = [5,5];
X = [2,2];

A = [0,0];
B = [6,0];

// console.log("ASDASDSD");
console.log(map_point(P, Q, A, B, X));