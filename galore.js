"use strict";

let gl; // WebGL "context"
let vBuffer;
let cBuffer;
let total = 0;
let shapeMode = false;
let points = [];
let pColors = [];
let triangles = [];
let tColors = [];
let squares = [];
let sColors = [];

function scaleVertices(x, y) {
  if (x < 257 && y < 257) {
    x = -(257 - x);
    y = 257 - y;
  } else if (x < 257 && y > 257) {
    x = -(257 - x);
    y = 257 - y;
  } else if (x > 257 && y < 257) {
    x = x - 257;
    y = 257 - y;
  } else if (x > 257 && y > 257) {
    x = x - 257;
    y = -(y - 257);
  }
  return [x / 257, y / 257];
}

function prepareSquare(d, c, b, a, color) {
  squares.push(a);
  squares.push(b);
  squares.push(c);
  squares.push(b);
  squares.push(c);
  squares.push(d);
  squares.push(c);
  squares.push(d);
  squares.push(a);
  for (let i = 0; i < 9; i++) {
    sColors.push(color);
  }
  pColors = [];
}

window.onload = function init() {
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

  // Associate out shader variables with our data buffer
  vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, 0, gl.STATIC_DRAW);
  // Load the data into the GPU and bind to shader variables.
  let positionLoc = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(positionLoc);

  cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, 0, gl.STATIC_DRAW);
  let colorLoc = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(colorLoc);

  function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    let scaledVertices = scaleVertices(x, y);
    x = scaledVertices[0];
    y = scaledVertices[1];

    if (points.length < 3 && !shapeMode) points.push(vec3(x, y, 0.0));
    else if (points.length < 4 && shapeMode) points.push(vec3(x, y, 0.0));
    pColors.push(vec3(1.0, 1.0, 1.0));

    let shapeColor = vec3(Math.random(), Math.random(), Math.random());
    if (!shapeMode && points.length == 3) {
      for (let i = 0; i < 3; i++) {
        triangles.push(points.pop());
        tColors.push(shapeColor);
      }
      pColors = [];
    } else if (shapeMode && points.length == 4) {
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

  // const canvas = document.querySelector("canvas");
  canvas.addEventListener("mousedown", function (e) {
    getCursorPosition(canvas, e);
  });

  document.addEventListener("keydown", logKey);

  function logKey(e) {
    if (e.code == "KeyR") {
      points = [];
      squares = [];
      triangles = [];
      shapeMode = false;
      mode.innerHTML = "Current Mode: " + (!shapeMode ? "Triangle" : "Square");
      render();
    } else if (e.code == "KeyT") {
      shapeMode = !shapeMode;
      mode.innerHTML = "Current Mode: " + (!shapeMode ? "Triangle" : "Square");
    }
  }

  render();
};

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  if (points.length > 0) {
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pColors), gl.STATIC_DRAW);
    gl.drawArrays(gl.POINTS, 0, points.length);
  }
  if (triangles.length > 0) {
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(triangles), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(tColors), gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, triangles.length);
  }

  if (squares.length > 0) {
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(squares), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(sColors), gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, squares.length);
  }
}
