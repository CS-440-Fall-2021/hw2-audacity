"use strict";

let gl; // WebGL "context"
let vertices = []; // initial vertices
let colors = []; // initial colors
let degrees; // angle of rotation
let nVertices = []; // vertices when level is changed
let nColors = []; // colors when level is changed
let angleUniformLoc; // angle location
let axisUniformLoc; // axis location
let cBuffer; // color buffer
let vBuffer; // vertices buffer
let axis; // axis of rotation

// calculate mid point of a line between two points.
function getMid(p1, p2) {
  return vec3(
    (p1[0] + p2[0]) * 0.5,
    (p1[1] + p2[1]) * 0.5,
    (p1[2] + p2[2]) * 0.5
  );
}

// push points for triangle
function pushTrianglePoints(a, b, c, colorIndex) {
  nVertices.push(a);
  nVertices.push(b);
  nVertices.push(c);
  nColors.push(colors[colorIndex]);
  nColors.push(colors[colorIndex]);
  nColors.push(colors[colorIndex]);
}

// push tetrahedron points
function pushTetraPoints(a, b, c, d) {
  pushTrianglePoints(a, b, c, 0);
  pushTrianglePoints(a, b, d, 1);
  pushTrianglePoints(a, c, d, 2);
  pushTrianglePoints(b, c, d, 3);
}

// recursive funtion to draw triangles
function sierpinski_level(a, b, c, d, level) {
  if (level == 0) {
    // only one triangle
    pushTetraPoints(a, b, c, d);
  } else {
    // get mid points on the edges of the tetrahedron
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

  // initial vertices
  vertices = [
    vec3(0.0, 1.0, 0),
    vec3(-1.0, -1.0, -1.0),
    vec3(1.0, -1.0, -1.0),
    vec3(0, -1.0, 1.0),
  ];
  // initial colors
  colors = [
    vec3(1.0, 0.0, 0.0),
    vec3(0.0, 1.0, 0.0),
    vec3(0.0, 0.0, 1.0),
    vec3(1.0, 0, 1.0),
  ];

  // add points for level 0
  sierpinski_level(vertices[0], vertices[1], vertices[2], vertices[3], 0);

  // setting up vertex buffer
  vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(nVertices), gl.STATIC_DRAW);
  let positionLoc = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(positionLoc);

  // setting up color buffer
  cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(nColors), gl.STATIC_DRAW);
  let colorLoc = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(colorLoc);

  // Associate out shader variables with our data buffer
  angleUniformLoc = gl.getUniformLocation(program, "angle");
  axisUniformLoc = gl.getUniformLocation(program, "axis");

  degrees = 0; // initial angle
  axis = 0; // default axis of rotation set to x

  //get values from slider and calculate tetra points
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

  // get axis of rotation
  document.getElementById("axis").oninput = function () {
    axis = this.value;
  };

  render();
};

function render(timestamp) {
  // reset buffers
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(nVertices), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(nColors), gl.STATIC_DRAW);

  gl.clear(gl.COLOR_BUFFER_BIT);

  var speed = 0.001; // change of angle speed

  gl.uniform1f(angleUniformLoc, timestamp * speed);
  gl.uniform1f(axisUniformLoc, axis);
  gl.drawArrays(gl.TRIANGLES, 0, nVertices.length);

  requestAnimationFrame(render); // animate and change angle
}
