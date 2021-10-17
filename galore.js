"use strict";

let gl; // WebGL "context"
let vBuffer; // vertex buffer
let cBuffer; // color buffer
let shapeMode = false; // false represents Triangle, true represents square
let points = []; // array to store points
let pColors = []; // array to store point colors
let triangles = []; // array to store triangle points
let tColors = []; // array to store color for each triangle vertex
let squares = []; // array to store square points
let sColors = []; // array to store color for each square vertex

// function to scale canvas coordinates within the WebGL limits (-1, 1)
function scaleVertices(x, y) {
  if (x < 257 && y < 257) {
    // second quadrant of canvas
    x = -(257 - x);
    y = 257 - y;
  } else if (x < 257 && y > 257) {
    // third quadrant of canvas
    x = -(257 - x);
    y = 257 - y;
  } else if (x > 257 && y < 257) {
    // first quadrant of canvas
    x = x - 257;
    y = 257 - y;
  } else if (x > 257 && y > 257) {
    // fourth quadrant of canvas
    x = x - 257;
    y = -(y - 257);
  }
  return [x / 257, y / 257];
}

// function to add vertices of square (4 triangles)
function prepareSquare(d, c, b, a, color) {
  // triangle ABC
  squares.push(a);
  squares.push(b);
  squares.push(c);
  // triangle BCD
  squares.push(b);
  squares.push(c);
  squares.push(d);
  // triangle CDA
  squares.push(c);
  squares.push(d);
  squares.push(a);
  // push same color for each vertex
  for (let i = 0; i < 9; i++) {
    sColors.push(color);
  }
  pColors = []; // reset point colors
}

window.onload = function init() {
  // find mode HTML element and add text to it
  let mode = document.getElementById("mode");
  mode.innerHTML = "Current Mode: " + (!shapeMode ? "Triangle" : "Square");

  let canvas = document.getElementById("gl-canvas");
  gl = canvas.getContext("webgl2");
  if (!gl) alert("WebGL 2.0 isn't available");

  //  Configure WebGL
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  //  Load shaders and initialize attribute buffers
  let program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // setting up vertex buffer
  vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, 0, gl.STATIC_DRAW);
  let positionLoc = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(positionLoc);

  // setting up color buffer
  cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, 0, gl.STATIC_DRAW);
  let colorLoc = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(colorLoc);

  // function called when click event takes place on canvas
  function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect(); // get canvas bounds
    let x = event.clientX - rect.left; // get click x
    let y = event.clientY - rect.top; // get click y
    let scaledVertices = scaleVertices(x, y); // scale vertices to WebGL limits
    x = scaledVertices[0];
    y = scaledVertices[1];

    // add points and point colors to points and point color arrays
    if (points.length < 3 && !shapeMode) points.push(vec3(x, y, 0.0));
    else if (points.length < 4 && shapeMode) points.push(vec3(x, y, 0.0));
    pColors.push(vec3(1.0, 1.0, 1.0));

    // add points to triangle array
    let shapeColor = vec3(Math.random(), Math.random(), Math.random()); // shape color
    // if shapeMode = Triangle and 3 points
    if (!shapeMode && points.length == 3) {
      // add points and colors
      for (let i = 0; i < 3; i++) {
        triangles.push(points.pop());
        tColors.push(shapeColor);
      }
      pColors = []; // reset point colors
      // if shapeMode is Square and 4 points
    } else if (shapeMode && points.length == 4) {
      // add points and colors
      prepareSquare(
        points.pop(),
        points.pop(),
        points.pop(),
        points.pop(),
        shapeColor
      );
    }

    render();
  }

  // add event listener for click inside canvas
  canvas.addEventListener("mousedown", function (e) {
    getCursorPosition(canvas, e);
  });

  document.addEventListener("keydown", logKey); // event listener for keypress

  function logKey(e) {
    // if "r" or "R" pressed
    if (e.code == "KeyR") {
      //reset everything
      points = [];
      squares = [];
      triangles = [];
      shapeMode = false;
      mode.innerHTML = "Current Mode: " + (!shapeMode ? "Triangle" : "Square");
      render();
    }
    // if "t" or "T" pressed
    else if (e.code == "KeyT") {
      shapeMode = !shapeMode; // toggle shape
      mode.innerHTML = "Current Mode: " + (!shapeMode ? "Triangle" : "Square");
    }
  }

  render();
};

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  // render points
  if (points.length > 0) {
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pColors), gl.STATIC_DRAW);
    gl.drawArrays(gl.POINTS, 0, points.length);
  }
  // render triangles
  if (triangles.length > 0) {
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(triangles), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(tColors), gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, triangles.length);
  }
  // render squares
  if (squares.length > 0) {
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(squares), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(sColors), gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, squares.length);
  }
}
