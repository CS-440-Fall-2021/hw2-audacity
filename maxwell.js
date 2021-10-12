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
    let vertices = [vec2(-1, -1), vec2(0, 1), vec2(1, -1)];
    let colors = [vec4(0, 0, 1, 1), vec4(1, 0, 0, 1), vec4(0, 1, 0, 1)]

    // Load the vertex data into the GPU and bind to shader variables.
    gl.bindBuffer( gl.ARRAY_BUFFER, gl.createBuffer() );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    let vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // Load the vertex color data into the GPU and bind to shader variables.
    gl.bindBuffer( gl.ARRAY_BUFFER, gl.createBuffer() );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    let vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
    

    render();
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, 3 );
}
