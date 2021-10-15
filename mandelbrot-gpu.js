"use strict";

let gl;  // WebGL "context"

window.onload = function init()
{
    // alert("Hello World!");
    
    let canvas = document.getElementById( "gl-canvas" );
    gl = canvas.getContext('webgl2');
    if (!gl) alert( "WebGL 2.0 isn't available" );

    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    let program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Compute data.
    let vertices = [];
    let image_dimensions = vec2(512, 512);
    
    let n_t = 100;
    
    let complex_mapping_st = vec2(-2, -2);
    let complex_mapping_end = vec2(2, 2);

    let grid_mapping_st = vec2(-1, -1);
    let grid_mapping_end = vec2(1, 1);

    let escape_time = 2;

    for(let x = 0; x <= image_dimensions[0]; x++)
    {
        for(let y = 0; y <= image_dimensions[1]; y++)
        {
            let v_x = map_point(0, image_dimensions[0], grid_mapping_st[0], grid_mapping_end[0], x);
            let v_y = map_point(0, image_dimensions[1], grid_mapping_st[1], grid_mapping_end[1], y);
            vertices.push(vec2(v_x, v_y));
        }
    }
    
    // Load the vertex data into the GPU and bind to shader variables.
    gl.bindBuffer( gl.ARRAY_BUFFER, gl.createBuffer() );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    let vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    let image_dimensions_loc = gl.getUniformLocation( program, "image_dimensions" );
    gl.uniform2fv( image_dimensions_loc, image_dimensions );
    
    let complex_mapping_st_loc = gl.getUniformLocation( program, "complex_mapping_st" );
    gl.uniform2fv( complex_mapping_st_loc, complex_mapping_st );

    let complex_mapping_end_loc = gl.getUniformLocation( program, "complex_mapping_end" );
    gl.uniform2fv( complex_mapping_end_loc, complex_mapping_end );
    
    let n_t_loc = gl.getUniformLocation( program, "n_t" );
    gl.uniform1i( n_t_loc, n_t );

    let escape_time_loc = gl.getUniformLocation( program, "escape_time" );
    gl.uniform1f( escape_time_loc, escape_time );
    
    
    // console.log(vertices);


    render( image_dimensions[0] * image_dimensions[1] );
}

function render( vertices_to_render ) {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.POINTS, 0, vertices_to_render );
}
