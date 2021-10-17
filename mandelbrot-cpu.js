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

    // Initialize variables abd mappings
    let vertices = [];
    let colors = [];
    
    let image_dimensions = [canvas.width, canvas.height];
    
    let complex_mapping_st = [-2, -2];
    let complex_mapping_end = [2, 2];

    let grid_mapping_st = [-1, -1];
    let grid_mapping_end = [1, 1];

    let escape_limit = 2;
    
    for(let x = 0; x <= image_dimensions[0]; x++)
    {
        for(let y = 0; y <= image_dimensions[1]; y++)
        {
            // Map pixel coordinates to WebGL's coordinates' range
            let v_x = map_point(0, image_dimensions[0], grid_mapping_st[0], grid_mapping_end[0], x);
            let v_y = map_point(0, image_dimensions[1], grid_mapping_st[1], grid_mapping_end[1], y);
            vertices.push([v_x, v_y]);

            // Set each vertex's color to blue
            colors.push(vec4(0, 0, 1, 1));
            
            // Convert vertex coordinate to complex number
            let c_x = map_point(0, image_dimensions[0], complex_mapping_st[0], complex_mapping_end[0], x);
            let c_y = map_point(0, image_dimensions[1], complex_mapping_st[1], complex_mapping_end[1], y);

            let current_num = math.complex(c_x, c_y);
            let mag = 0;

            // Find pixel's escape time
            for(let n = 1; n <= n_t; n++)
            {
                // Calculate magnitude of complex number
                mag = math.sqrt( Math.pow(current_num.re,2) + Math.pow(current_num.im,2) );
                
                if (mag > escape_limit)
                {
                    // Assign red color if escape time is 1
                    if (n == 1)
                        colors[colors.length - 1] = vec4(1, 0, 0, 1);

                    // Else assign interpolated value
                    else
                    {
                        if (n < (n_t/7))
                        {
                            let red = map_point(1, n_t, 1, 0, n);
                            let green = map_point(1, n_t, 0, 1, n);

                            colors[colors.length - 1] = vec4(red, green, 0, 1);
                        }
                        else
                        {
                            let green = map_point(1, n_t, 1, 0, n);
                            let blue = map_point(1, n_t, 0, 1, n);

                            colors[colors.length - 1] = vec4(0, green, blue, 1);
                        }
                    }
                    break;
                }

                // Increment complex number accordingly
                current_num = math.add(math.square(current_num), math.complex(c_x, c_y));
            }
        }
    }


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
