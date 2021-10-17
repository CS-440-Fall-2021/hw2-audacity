"use strict";

let gl; // WebGL "context"
let vBuffer; // vertex buffer
let cBuffer; // color buffer
let triangles = []; // array containing vertices of all triangles
let tColors = []; // array containing color for all vertices of triangles
let score = 0; // current score
let clicked = false; // clicked on shape
let missedAttempts = 0; // no of missed attemps

// function to calculate area of triangle
function area(x1, y1, x2, y2, x3, y3) {
  return Math.abs((x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2.0);
}

// function to detect if click is inside triangle
function isInside(x1, y1, x2, y2, x3, y3, x, y) {
  // Calculate area of triangle ABC
  let A = area(x1, y1, x2, y2, x3, y3);

  // Calculate area of triangle PBC
  let A1 = area(x, y, x2, y2, x3, y3);

  // Calculate area of triangle PAC
  let A2 = area(x1, y1, x, y, x3, y3);

  // Calculate area of triangle PAB
  let A3 = area(x1, y1, x2, y2, x, y);

  // Check if sum of A1, A2 and A3 is same as A (upto 2 decimal places)
  return parseFloat(A).toFixed(2) == parseFloat(A1 + A2 + A3).toFixed(2);
}

// funtion called after every 3 seconds
function intervalFunction() {
  if (!clicked && missedAttempts < 4) {
    missedAttempts += 1; // increment missed attepts
    if (missedAttempts == 3) {
      missedAttempts = 0;
      score -= 1; // decrement score
    }
    generateRandomShape(); // generate next shape
    render();
  } else if (clicked && missedAttempts < 3) {
    clicked = false;
    triangles = [];
    tColors = [];
    missedAttempts = 1;
    generateRandomShape();
    render();
  } else {
    render();
  }
}

// set interval for every 3 seconds
let interval = setInterval(intervalFunction, 3000);

// generate a random triangle
function generateRandomShape() {
  if (triangles.length == 0) {
    let x1 = vec3(Math.random() * 2 - 1, Math.random() * 2 - 1, 0.0);
    let x2 = vec3(Math.random() * 2 - 1, Math.random() * 2 - 1, 0.0);
    let x3 = vec3(Math.random() * 2 - 1, Math.random() * 2 - 1, 0.0);
    triangles.push(x1); // A
    triangles.push(x2); // B
    triangles.push(x3); // C
    // add colors for each vertex
    for (let i = 0; i < 9; i += 3) {
      let color = vec3(Math.random(), Math.random(), Math.random());
      tColors.push(color);
      tColors.push(color);
      tColors.push(color);
    }
  }
  // if triangle on screen, clear that and generate next
  else {
    triangles = [];
    tColors = [];
    generateRandomShape();
  }
}

// function to scale canvas coordinates within the WebGL limits (-1, 1)
function scaleVertices(x, y) {
  // second quadrant of canvas
  if (x < 257 && y < 257) {
    x = -(257 - x);
    y = 257 - y;
  }
  // third quadrant of canvas
  else if (x < 257 && y > 257) {
    x = -(257 - x);
    y = 257 - y;
  }
  // first quadrant of canvas
  else if (x > 257 && y < 257) {
    x = x - 257;
    y = 257 - y;
  }
  // fourth quadrant of canvas
  else if (x > 257 && y > 257) {
    x = x - 257;
    y = -(y - 257);
  }
  return [x / 257, y / 257];
}

window.onload = function init() {
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

  generateRandomShape(); // generate first shape

  // setting up vertex buffer
  vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(triangles), gl.STATIC_DRAW);
  let positionLoc = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(positionLoc);

  // setting up color buffer
  cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(tColors), gl.STATIC_DRAW);
  let colorLoc = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(colorLoc);

  // function called when click event takes place on canvas
  function getCursorPosition(canvas, event) {
    clicked = true;
    const rect = canvas.getBoundingClientRect(); // get canvas bounds
    let x = event.clientX - rect.left; // get click x
    let y = event.clientY - rect.top; // get click y
    let scaledVertices = scaleVertices(x, y); // scale vertices to WebGL limits
    x = scaledVertices[0];
    y = scaledVertices[1];
    // if clicked position lies within the drawn triangle
    if (
      isInside(
        triangles[0][0],
        triangles[0][1],
        triangles[1][0],
        triangles[1][1],
        triangles[2][0],
        triangles[2][1],
        x,
        y
      )
    ) {
      score += 1; // increment score
      generateRandomShape(); // draw next shape
    } else {
      score -= 1; // decrement score
      generateRandomShape(); // draw next shape
    }

    // restart interval
    clearInterval(interval);
    interval = setInterval(intervalFunction, 3000);

    render();
  }

  // add event listener for click inside canvas
  canvas.addEventListener("mousedown", function (e) {
    getCursorPosition(canvas, e);
  });

  render();
};

function render() {
  //update score in HTML
  let scoreElement = document.getElementById("score");
  scoreElement.innerHTML = "Score: " + (score < 0 ? -1 + " Game Over!" : score);

  gl.clear(gl.COLOR_BUFFER_BIT);

  if (missedAttempts < 3 && score >= 0) {
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(triangles), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(tColors), gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, triangles.length);
  } else {
    clearInterval(interval);
  }
}
