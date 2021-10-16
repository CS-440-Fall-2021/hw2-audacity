"use strict";

let gl; // WebGL "context"
let vertices = [];
let colors = [];
let degrees;
let nVertices = [];
let nColors = [];
let angleUniformLoc;
let axisUniformLoc;
let colorBuffer;
let vBuffer;
let axis;

function getMid(p1, p2) {
  // calculate mid point of a line between two points.
  return vec3(
    (p1[0] + p2[0]) * 0.5,
    (p1[1] + p2[1]) * 0.5,
    (p1[2] + p2[2]) * 0.5
  );
}

function pushTrianglePoints(a, b, c, colorIndex) {
  nVertices.push(a);
  nVertices.push(b);
  nVertices.push(c);
  nColors.push(colors[colorIndex]);
  nColors.push(colors[colorIndex]);
  nColors.push(colors[colorIndex]);
}

function pushTetraPoints(a, b, c, d) {
  pushTrianglePoints(a, b, c, 0);
  pushTrianglePoints(a, b, d, 1);
  pushTrianglePoints(a, c, d, 2);
  pushTrianglePoints(b, c, d, 3);
}

function sierpinski_level(a, b, c, d, level) {
  // recursive funtion to draw triangles
  if (level == 0) {
    // only one triangle
    pushTetraPoints(a, b, c, d);
  } else {
    // get mid points on the edges of the triangle
    let m1 = getMid(a, b);
    let m2 = getMid(a, c);
    let m3 = getMid(a, d);
    let m4 = getMid(b, c);
    let m5 = getMid(b, d);
    let m6 = getMid(c, d);

    // draw triangles using mid points
    sierpinski_level(a, m1, m2, m3, level - 1);
    sierpinski_level(m1, b, m4, m5, level - 1);
    sierpinski_level(m2, m4, c, m6, level - 1);
    sierpinski_level(m3, m5, m6, d, level - 1);
  }
}

window.onload = function init() {
  let canvas = document.getElementById("gl-canvas");
  gl = canvas.getContext("webgl2");
  if (!gl) alert("WebGL 2.0 isn't available");

  //  Configure WebGL
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  //  Load shaders and initialize attribute buffers
  let program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  vertices = [
    vec3(0.0, 1.0, 0),
    vec3(-1.0, -1.0, -1.0),
    vec3(1.0, -1.0, -1.0),
    vec3(0, -1.0, 1.0),
  ];
  colors = [
    vec3(1.0, 0.0, 0.0),
    vec3(0.0, 1.0, 0.0),
    vec3(0.0, 0.0, 1.0),
    vec3(1.0, 0, 1.0),
  ];

  sierpinski_level(vertices[0], vertices[1], vertices[2], vertices[3], 0);

  // Associate out shader variables with our data buffer
  vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(nVertices), gl.STATIC_DRAW);
  // Load the data into the GPU and bind to shader variables.
  let positionLoc = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(positionLoc);

  colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(nColors), gl.STATIC_DRAW);
  let colorLoc = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(colorLoc);

  // Associate out shader variables with our data buffer
  angleUniformLoc = gl.getUniformLocation(program, "angle");
  axisUniformLoc = gl.getUniformLocation(program, "axis");

  degrees = 0;
  axis = 0;
  document.getElementById("myRange").oninput = function () {
    nVertices = [];
    nColors = [];
    degrees = this.value;
    sierpinski_level(
      vertices[0],
      vertices[1],
      vertices[2],
      vertices[3],
      degrees
    );
  };

  document.getElementById("axis").oninput = function () {
    axis = this.value;
  };

  render();
};

function render(timestamp) {
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(nVertices), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(nColors), gl.STATIC_DRAW);

  gl.clear(gl.COLOR_BUFFER_BIT);
  var speed = 0.001;
  gl.uniform1f(angleUniformLoc, timestamp * speed);
  gl.uniform1f(axisUniformLoc, axis);
  gl.drawArrays(gl.TRIANGLES, 0, nVertices.length);

  requestAnimationFrame(render);
}
