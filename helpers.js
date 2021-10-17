// Maps a point on one range to another (X on P-Q to A-B)

function map_point(P, Q, A, B, X)
{
    let alpha;

    if( typeof(P) == 'number' && typeof(Q) == 'number' && typeof(X) == 'number' )
        alpha = (X - P) / (Q - P);

    else if ( P.length != Q.length || Q.length != X.length )
        throw "vector dimension mismatch";
    
    else
        alpha = (X[0] - P[0]) / (Q[0] - P[0]);

    return mix(A, B, alpha);
}