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
    let colors = [];
    
    let image_dimensions = [100, 100];
    let n_t = 100;
    
    let complex_mapping_st = [-2, -2];
    let complex_mapping_end = [2, 2];

    let grid_mapping_st = [-1, -1];
    let grid_mapping_end = [1, 1];

    let escape_time = 2;
    
    for(let x = 0; x <= image_dimensions[0]; x++)
    {
        for(let y = 0; y <= image_dimensions[1]; y++)
        {
            vertices.push(map_point([0, 0], image_dimensions, grid_mapping_st, grid_mapping_end, [x, y]));
            colors.push(vec4(0, 0, 1, 1));
            
            if (x == 0 && y == 100)
            {
                console.log(x, y);
                console.log(map_point([0, 0], [100, 100], [-1, -1], [1, 1], [100, 0]));
            }

            let c = map_point([0, 0], image_dimensions, complex_mapping_st, complex_mapping_end, [x, y]);
            let current_num = math.complex(c[0], c[1]);
            let mag = 0;

            for(let n = 1; n <= n_t; n++)
            {
                mag = math.sqrt( (current_num.re)^2 + (current_num.im)^2 );
                if (mag > escape_time)
                {
                    if (n == 1)
                    {
                        colors.pop();
                        vertices.pop();
                    }
                    else
                        colors[colors.length - 1] = vec4(1, 0, 0, 1);
                    
                    break;
                }
                current_num = math.add(current_num, math.complex(c[0], c[1]))
            }
        }
    }
    // console.log(vertices);



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
    

    render( image_dimensions[0] * image_dimensions[1] );
}

function render( vertices_to_render ) {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.POINTS, 0, vertices_to_render );
}
