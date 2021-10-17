"use strict";

let gl;  // WebGL "context"

let n_t = 100; // Number of iterations to check for escape time

window.onload = function init()
{
    let canvas = document.getElementById( "gl-canvas" );
    gl = canvas.getContext('webgl2');
    if (!gl) alert( "WebGL 2.0 isn't available" );

    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    let program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Initialize variables
    let vertices = [];
    let image_dimensions = vec2(canvas.width, canvas.height);

    let escape_limit = 2;

    for(let x = 0; x <= image_dimensions[0]; x++)
    {
        for(let y = 0; y <= image_dimensions[1]; y++)
            vertices.push(vec2(x, y));
    }
    
    // Load the vertex data into the GPU and bind to shader variables.
    gl.bindBuffer( gl.ARRAY_BUFFER, gl.createBuffer() );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    let vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // Load relevant data as uniform variables for GPU
    let image_dimensions_loc = gl.getUniformLocation( program, "image_dimensions" );
    gl.uniform2fv( image_dimensions_loc, image_dimensions );
    
    let n_t_loc = gl.getUniformLocation( program, "n_t" );
    gl.uniform1i( n_t_loc, n_t );

    let escape_limit_loc = gl.getUniformLocation( program, "escape_limit" );
    gl.uniform1f( escape_limit_loc, escape_limit );
    

    render( image_dimensions[0] * image_dimensions[1] );
}

function render( vertices_to_render ) {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.POINTS, 0, vertices_to_render );
}
