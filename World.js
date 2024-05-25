// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor; // Use color
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0); // Use UV debug color
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV); // use texture0
    } else if (u_whichTexture == -3) {
      gl_FragColor = texture2D(u_Sampler1, v_UV); // use texture1
    }
    else {
      gl_FragColor = vec4(1.0, 0.2, 0.2, 1.0); // error, put redish
    }
  }`

// Global Variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_whichTexture;
let texture;
let groundTexture;
let u_Sampler1;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');
  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log("Failed to get the storage location of u_ModelMatrix");
    return;
  }
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return;
  }
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return;
  }
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return;
  }
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Consants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals related UI elements
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_globalAngle = 0;
let g_yellowAngle = 0;
let g_redAngle = 0;
let g_magentaAngle = 0;
let g_yellowAnimation = false;
let g_upAndDown = 0;

let x = 0;
let y = 0;
let x_rot = 0;
let y_rot = 0;

let g_leftArm = 0;
let g_leftHand = 0;
let g_rightArm = 0;
let g_rightHand = 0;

let g_leftLeg = 0;
let g_leftFoot = 0;
let g_rightLeg = 0;
let g_rightFoot = 0;

let g_shiftClick = 0;
let g_shiftAnimation = 0;

let g_camera;

// Set up actions for the HTML UI elements
function addActionsForHtmlUI() {
  // Not needed at the moment
  // document.getElementById('animationYellowOnButton').onclick = function () { g_yellowAnimation = true; }
  // document.getElementById('animationYellowOffButton').onclick = function () { g_yellowAnimation = false; }
  document.getElementById('clear').onclick = function () {
    g_globalAngle = 0,
      g_upAndDown = 0,
      document.getElementById('angleSlide1').value = 0,
      document.getElementById('angleSlide2').value = 0;
    x = 0;
    y = 0;
    x_rot = 0;
    y_rot = 0,
      g_leftArm = 0,
      g_leftHand = 0,
      g_rightArm = 0,
      g_rightHand = 0;
    g_leftLeg = 0,
      g_leftFoot = 0,
      g_rightLeg = 0,
      g_rightFoot = 0;
    g_shiftClick = 0;
    g_shiftAnimation = 0,
      g_yellowAngle = 0;
  }

  // Not needed at the moment
  // document.getElementById('angleSlide1').addEventListener('mousemove', function () { g_globalAngle = this.value; renderAllShapes(); });
  // document.getElementById('angleSlide2').addEventListener('mousemove', function () { g_upAndDown = this.value; renderAllShapes(); });

  // Not needed at the moment
  // For shift clicking:
  // document.addEventListener("click", logKey);
  // function logKey(e) {
  //   if (e.shiftKey) {
  //     g_shiftClick = 1;
  //   }
  // }

}

function initTextures() {
  // Sky
  var image = new Image();
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }
  image.onload = function () { sendImageToTEXTURE0(image); }
  image.src = './resources/images/sky.jpg';

  // Ground
  var image2 = new Image();
  if (!image2) {
    console.log('Failed to create the image object');
    return false;
  }
  image2.onload = function () { sendImageToTEXTURE1(image2); }
  image2.src = './resources/images/ground.jpg';
  return true;
}

function sendImageToTEXTURE0(image) {
  texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler0, 0);
  console.log('finished loadTexture');
}

function sendImageToTEXTURE1(image) {
  groundTexture = gl.createTexture();
  if (!groundTexture) {
    console.log('Failed to create the groundTexture object');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, groundTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler1, 1);
  console.log('finished loadTexture');
}

// There is probably a better way to do this but this works for now
var w_move = 0;
var a_move = 0;
var s_move = 0;
var d_move = 0;
var q_move = 0;
var e_move = 0;

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  document.addEventListener('keydown', (ev) => {
    if (ev.keyCode == 68) { // Right
      d_move = 1;
    }
    else if (ev.keyCode == 65) { // Left
     a_move = 1;
    }
    else if (ev.keyCode == 87) { // Forward
      w_move = 1;
    }
    else if (ev.keyCode == 83) { // Back
      s_move = 1;
    }
    else if (ev.keyCode == 81) { // Rotate Left
      q_move = 1;
    }
    else if (ev.keyCode == 69) { // Rotate Right
      e_move = 1;
    }
  });

  document.addEventListener('keyup', (ev) => {
    if (ev.keyCode == 68) { // Right
      d_move = 0;
    }
    else if (ev.keyCode == 65) { // Left
     a_move = 0;
    }
    else if (ev.keyCode == 87) { // Forward
      w_move = 0;
    }
    else if (ev.keyCode == 83) { // Back
      s_move = 0;
    }
    else if (ev.keyCode == 81) { // Rotate Left
      q_move = 0;
    }
    else if (ev.keyCode == 69) { // Rotate Right
      e_move = 0;
    }
  });

  // https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API
  // Rohan helped me find the documentation on how to do this.
  canvas.addEventListener("click", async () => {
    await canvas.requestPointerLock();
  });

  initTextures();
  
  // Register function (event handler) to be called as the cursor moves across the screen
  canvas.onmousemove = click;

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  requestAnimationFrame(tick);
}

function movementScript() {

  // Got some help from ChatGPT for this forward function.
  // I implemented the rest myself
  // I know this would be a lot cleaner to implement in my Camera functiomn
  // For now, I just focused on getting this working and will eventually hopefully
  // clean into it's own seperate camera class.
  let forward = new Vector3([
    g_camera.at.elements[0] - g_camera.eye.elements[0],
    g_camera.at.elements[1] - g_camera.eye.elements[1],
    g_camera.at.elements[2] - g_camera.eye.elements[2]
  ]);
  forward.normalize();

  let leftward = new Vector3([
    -forward.elements[2],
    0,
    forward.elements[0]
  ]);
  leftward.normalize();

  let rightward = new Vector3([
    forward.elements[2],
    0,
    -forward.elements[0]
  ]);
  rightward.normalize();

  let backwards = new Vector3([
    g_camera.at.elements[0] - g_camera.eye.elements[0],
    g_camera.at.elements[1] - g_camera.eye.elements[1],
    g_camera.at.elements[2] - g_camera.eye.elements[2]
  ]);
  backwards.normalize();

  if (d_move == 1) { // Right
    g_camera.eye.elements[0] += leftward.elements[0] * 0.2;
    g_camera.eye.elements[2] += leftward.elements[2] * 0.2;
  }
  if (a_move == 1) { // Left
    g_camera.eye.elements[0] += rightward.elements[0] * 0.2;
    g_camera.eye.elements[2] += rightward.elements[2] * 0.2;
  }
  if (w_move == 1) { // Forward
    g_camera.eye.elements[0] += forward.elements[0] * 0.2;
    g_camera.eye.elements[1] += forward.elements[1] * 0.2;
    g_camera.eye.elements[2] += forward.elements[2] * 0.2;
  }
  if (s_move == 1) { // Back
    // g_camera.eye.elements[2] += 0.2;
    g_camera.eye.elements[0] -= backwards.elements[0] * 0.2;
    g_camera.eye.elements[1] -= backwards.elements[1] * 0.2;
    g_camera.eye.elements[2] -= backwards.elements[2] * 0.2;
  }
  if (q_move == 1) { // Back
    rotateY(g_camera.at, .04);  
  }
  if (e_move == 1) { // Back
    rotateY(g_camera.at, -.04);
  }
}

// Source:
// https://stackoverflow.com/questions/14607640/rotating-a-vector-in-3d-space

function rotateX(vector, theta) {
  // These are copies, not references
  x = vector.elements[0];
  y = vector.elements[1];
  z = vector.elements[2];
  //Math.min(89, x) Math.max(-89...)
  vector.elements[0] = x;
  vector.elements[1] = Math.max(-89, Math.min(89, (y * Math.cos(theta)) - (z * Math.sin(theta))));
  vector.elements[2] = (y * Math.sin(theta)) + (z * Math.cos(theta));

}

function rotateY(vector, theta) {
  x = vector.elements[0];
  y = vector.elements[1];
  z = vector.elements[2];

  vector.elements[0] = (x * Math.cos(theta)) + (z * Math.sin(theta));
  vector.elements[1] = y
  vector.elements[2] = (-x * Math.sin(theta)) + (z * Math.cos(theta));
}

function rotateZ(vector, theta) {
  x = vector.elements[0];
  y = vector.elements[1];
  z = vector.elements[2];

  vector.elements[0] = (x * Math.cos(theta)) - (y * Math.sin(theta));
  vector.elements[1] = (x * Math.sin(theta)) + (y * Math.cos(theta));
  vector.elements[2] = z;
}

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

// Called by browser repeatedly whenever its time
function tick() {
  // Save the current time
  g_seconds = performance.now() / 1000.0 - g_startTime;
  // console.log(g_seconds);
  // // Print some debug information so we know we are running
  // console.log(performance.now());
  movementScript();
  updateAnimationAngles();
  // Draw everything
  renderAllShapes();
  // Tell the browser to update again when it has time
  requestAnimationFrame(tick);
}

var g_shapesList = [];

function click(ev) {
  // Extract the event click and return it in WebGL coordinates
  // let = [x, y] = convertCoordinatesEventToGL(ev);
  
  // x_rot += ev.movementX;
  // y_rot += ev.movementY;
  

  // g_camera.at.elements[0] += ev.movementX;
  // g_camera.at.elements[1] += ev.movementY;
  // g_camera.at.elements[2] += ev.movementX;


  rotateY(g_camera.at, -ev.movementX/100); 
  
  // console.log(g_camera.at.elements[1]);
  // if (!(g_camera.at.elements[1] >= 88 && ev.movementY < 0)) {
  //   rotateX(g_camera.at, -ev.movementY / 100); 
  // }

  // if ((!(g_camera.at.elements[1] <= -89 && ev.movementY >= 0)) &&
  //     (!(g_camera.at.elements[1] >= 89 && ev.movementY < 0))) {
  //   console.log("Log", g_camera.at.elements[1], ev.movementY);
  //   rotateX(g_camera.at, -ev.movementY / 100); 
  // }

  // rotateX(g_camera.at, -ev.movementY / 100); 



  // rotateY(g_camera.at, -ev.movementX / 100);

  // console.log(g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2]);
  
  // if (g_camera.at.elements[1] >= 98) {
  //   rotateX(g_camera.at, -.1);
  // }
  // else if (g_camera.at.elements[1] <= -98) {
  //   rotateX(g_camera.at, .1);
  // }
  // else {
  //   rotateX(g_camera.at, -ev.movementY / 100);
  // }

  renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return ([x, y]);
}

function updateAnimationAngles() {
  if (g_yellowAnimation) {
    g_yellowAngle = (45 * Math.sin(g_seconds));
    g_redAngle = (45 * Math.cos(g_seconds));
  }
  if (g_shiftClick == 1) {
    g_shiftAnimation = (45 * Math.sin(g_seconds));
  }
}


g_camera = new Camera();
var g_map = [
  [1, 0, 1, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 1],
]
var g_map2 = [
  [0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0],
]

function drawMap() {
  var body = new Cube();
  for (x = 0; x < 8; x++) {
    for (y = 0; y < 8; y++) {
      if (g_map[x][y] == 1) {
        body.matrix.setTranslate(0, -1, 0);
        body.color = [1.0, 1.0, 1.0, 1.0];
        body.matrix.translate(x-4, -0.75, y-4);
        body.render();
      }
      else if (g_map2[x][y] == 1) {
        body.matrix.setTranslate(0, -1, 0);
        body.color = [0.0, 0.0, 0.0, 1.0];
        body.matrix.translate(x-4, -0.75, y-4);
        body.render();
      }
    }
  }
}

// Template to use as reference:
// g_camera = new Camera();
// var g_map = [
//   [1, 1, 1, 1, 1, 1, 1, 1],
//   [1, 0, 0, 0, 0, 0, 0, 1],
//   [1, 0, 0, 0, 0, 0, 0, 1],
//   [1, 0, 0, 1, 1, 0, 0, 1],
//   [1, 0, 0, 0, 0, 0, 0, 1],
//   [1, 0, 0, 0, 0, 0, 0, 1],
//   [1, 0, 0, 0, 1, 0, 0, 1],
//   [1, 0, 0, 0, 0, 0, 0, 1],
// ]

// function drawMap() {
//   var body = new Cube();
//   for (x = 0; x < 8; x++) {
//     for (y = 0; y < 8; y++) {
//       if (g_map[x][y] == 1) {
//         body.matrix.setTranslate(0, -1, 0);
//         body.color = [1.0, 1.0, 1.0, 1.0];
//         body.matrix.translate(x-4, -0.75, y-4);
//         body.render();
//       }
//     }
//   }
// }


  // var body = new Cube();
  // body.textureNum = -3; // setting texture
  // for (i = 0; i < 2; i++) {
  //   for (x = 0; x < 32; x++) {
  //     for (y = 0; y < 32; y++)  {
  //       body.color = [0.8, 1.0, 1.0, 1.0];
  //       body.textureNum = -3;
  //       body.matrix.setTranslate(0, -0.75, 0);
  //       body.matrix.scale(1, 1, 1);
  //       body.matrix.translate(x-16, 0, y-16);
  //       body.renderfaster();
  //     }
  //   }
  // }



function renderAllShapes() {

  var scale = 0.35;

  var startTime = performance.now();

  var projMat = new Matrix4();
  projMat.setPerspective(50, 1*canvas.width/canvas.height, 1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  var viewMat = new Matrix4();

  viewMat.setLookAt(
    g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
    g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2],
    g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2],
  );
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  // var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0).rotate(g_upAndDown, 1, 0, 0).scale(scale, scale, scale).rotate(-x_rot, 0, 1, 0).rotate(y_rot, 1, 0, 0).rotate(180, 0, 1, 0);
  var globalRotMat = new Matrix4().scale(scale, scale, scale).rotate(-x_rot, 0, 1, 0).rotate(y_rot, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  drawMap();

  // Draw the floor
  var body = new Cube();
  body.color = [1.0, 0.0, 0.0, 1.0];
  body.textureNum = -3;
  body.matrix.translate(0, -2.1, 0.0);
  body.matrix.scale(50, 0, 50);
  body.matrix.translate(-0.5, 0, -0.5);
  body.render();

  // Draw the sky
  var sky = new Cube();
  sky.color = [1.0, 0.0, 0.0, 1.0];
  sky.textureNum = 0;
  sky.matrix.scale(50, 50, 50);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.render();


  // // Main body
  // var bmo1 = new Cube();
  // bmo1.color = [112 / 255, 170 / 255, 153 / 255, 1.0];
  // bmo1.textureNum = 0;
  // bmo1.matrix.scale(2, 2.4, 1.4);
  // bmo1.matrix.translate(-0.5, -0.5, -0.5);
  // bmo1.render();

  // var bodyCoord = new Matrix4(bmo1.matrix);

  // // Face-Screen
  // var bmo2 = new Cube();
  // bmo2.matrix = bodyCoord;
  // bmo2.color = [215 / 255, 254 / 255, 221 / 255, 1.0];
  // bmo2.textureNum = 0;
  // bmo2.matrix.scale(.9, .5, .1);
  // bmo2.matrix.translate(.05, .9, -0.01);
  // bmo2.render();

  // // We do this every time between blocks to make sure a copy is being made.
  // // Probably not super efficient

  // // Speaker on left side of BMO
  // var bmo3 = new Cube();
  // bmo3.matrix = new Matrix4(bmo1.matrix);
  // bmo3.color = [0, 0, 0, 1];
  // bmo3.matrix.scale(.1, .02, .04);
  // bmo3.matrix.translate(9.05, 45, 10);
  // bmo3.render();
  // var bmo4 = new Cube();
  // bmo4.matrix = new Matrix4(bmo1.matrix);
  // bmo4.color = [0, 0, 0, 1];
  // bmo4.matrix.scale(.1, .02, .04);
  // bmo4.matrix.translate(9.05, 45, 15);
  // bmo4.render();
  // var bmo5 = new Cube();
  // bmo5.matrix = new Matrix4(bmo1.matrix);
  // bmo5.color = [0, 0, 0, 1];
  // bmo5.matrix.scale(.1, .02, .04);
  // bmo5.matrix.translate(9.05, 40, 8);
  // bmo5.render();
  // var bmo6 = new Cube();
  // bmo6.matrix = new Matrix4(bmo1.matrix);
  // bmo6.color = [0, 0, 0, 1];
  // bmo6.matrix.scale(.1, .02, .04);
  // bmo6.matrix.translate(9.05, 40, 12.5);
  // bmo6.render();
  // var bmo7 = new Cube();
  // bmo7.matrix = new Matrix4(bmo1.matrix);
  // bmo7.color = [0, 0, 0, 1];
  // bmo7.matrix.scale(.1, .02, .04);
  // bmo7.matrix.translate(9.05, 40, 17);
  // bmo7.render();
  // var bmo8 = new Cube();
  // bmo8.matrix = new Matrix4(bmo1.matrix);
  // bmo8.color = [0, 0, 0, 1];
  // bmo8.matrix.scale(.1, .02, .04);
  // bmo8.matrix.translate(9.05, 35, 10);
  // bmo8.render();
  // var bmo9 = new Cube();
  // bmo9.matrix = new Matrix4(bmo1.matrix);
  // bmo9.color = [0, 0, 0, 1];
  // bmo9.matrix.scale(.1, .02, .04);
  // bmo9.matrix.translate(9.05, 35, 15);
  // bmo9.render();


  // // Speaker on right side of BMO
  // var bmo10 = new Cube();
  // bmo10.matrix = new Matrix4(bmo1.matrix);
  // bmo10.color = [0, 0, 0, 1];
  // bmo10.matrix.scale(.1, .02, .04);
  // bmo10.matrix.translate(-0.05, 45, 10);
  // bmo10.render();
  // var bmo11 = new Cube();
  // bmo11.matrix = new Matrix4(bmo1.matrix);
  // bmo11.color = [0, 0, 0, 1];
  // bmo11.matrix.scale(.1, .02, .04);
  // bmo11.matrix.translate(-0.05, 45, 15);
  // bmo11.render();
  // var bmo12 = new Cube();
  // bmo12.matrix = new Matrix4(bmo1.matrix);
  // bmo12.color = [0, 0, 0, 1];
  // bmo12.matrix.scale(.1, .02, .04);
  // bmo12.matrix.translate(-0.05, 40, 8);
  // bmo12.render();
  // var bmo13 = new Cube();
  // bmo13.matrix = new Matrix4(bmo1.matrix);
  // bmo13.color = [0, 0, 0, 1];
  // bmo13.matrix.scale(.1, .02, .04);
  // bmo13.matrix.translate(-0.05, 40, 12.5);
  // bmo13.render();
  // var bmo14 = new Cube();
  // bmo14.matrix = new Matrix4(bmo1.matrix);
  // bmo14.color = [0, 0, 0, 1];
  // bmo14.matrix.scale(.1, .02, .04);
  // bmo14.matrix.translate(-0.05, 40, 17);
  // bmo14.render();
  // var bmo15 = new Cube();
  // bmo15.matrix = new Matrix4(bmo1.matrix);
  // bmo15.color = [0, 0, 0, 1];
  // bmo15.matrix.scale(.1, .02, .04);
  // bmo15.matrix.translate(-0.05, 35, 10);
  // bmo15.render();
  // var bmo16 = new Cube();
  // bmo16.matrix = new Matrix4(bmo1.matrix);
  // bmo16.color = [0, 0, 0, 1];
  // bmo16.matrix.scale(.1, .02, .04);
  // bmo16.matrix.translate(-0.05, 35, 15);
  // bmo16.render();


  // // Game-Slot
  // var bmo17 = new Cube();
  // bmo17.matrix = new Matrix4(bmo1.matrix);
  // bmo17.color = [21 / 255, 46 / 255, 38 / 255, 1];
  // bmo17.matrix.scale(.5, .06, .1);
  // bmo17.matrix.translate(0.1, 6, -0.05);
  // bmo17.render();

  // // Yellow Buttons
  // var bmo18 = new Cube();
  // bmo18.matrix = new Matrix4(bmo1.matrix);
  // bmo18.color = [247 / 255, 218 / 255, 80 / 255, 1];
  // bmo18.matrix.scale(.06, .15, .1);
  // bmo18.matrix.translate(3, 1, -.4);
  // bmo18.matrix.translate(0, 0, g_shiftAnimation / 200);
  // bmo18.render();
  // var bmo19 = new Cube();
  // bmo19.matrix = new Matrix4(bmo1.matrix);
  // bmo19.color = [247 / 255, 218 / 255, 80 / 255, 1];
  // bmo19.matrix.scale(.2, .06, .1);
  // bmo19.matrix.translate(0.555, 3.3, -.4);
  // bmo19.matrix.translate(0, 0, g_shiftAnimation / 200);
  // bmo19.render();


  // // Long Blue Buttons
  // var bmo20 = new Cube();
  // bmo20.matrix = new Matrix4(bmo1.matrix);
  // bmo20.color = [5 / 255, 14 / 255, 113 / 255, 1];
  // bmo20.matrix.scale(.15, .03, .1);
  // bmo20.matrix.translate(0.3, 2, -0.15);
  // bmo20.matrix.translate(0, 0, g_shiftAnimation / 350);
  // bmo20.render();
  // var bmo21 = new Cube();
  // bmo21.matrix = new Matrix4(bmo1.matrix);
  // bmo21.color = [5 / 255, 14 / 255, 113 / 255, 1];
  // bmo21.matrix.scale(.15, .03, .1);
  // bmo21.matrix.translate(1.6, 2, -0.15);
  // bmo21.matrix.translate(0, 0, g_shiftAnimation / 350);
  // bmo21.render();


  // // Red Circle Button
  // var bmo22 = new Cone();
  // bmo22.matrix = new Matrix4(bmo1.matrix);
  // bmo22.color = [1.0, 0.0, 0.0, 1.0];
  // bmo22.matrix.scale(.8, .7, 0.5);
  // bmo22.matrix.scale(.5, .5, 0.5);
  // bmo22.matrix.translate(1.1, 0.9, -.2);
  // bmo22.matrix.rotate(90, 1, 0, 0);
  // bmo22.matrix.translate(0, g_shiftAnimation / 350, 0);
  // bmo22.render();


  // // Blue triangle button
  // var bmo23 = new TrianglePrism();
  // bmo23.matrix = new Matrix4(bmo1.matrix);
  // bmo23.color = [102 / 255, 212 / 255, 236 / 255, 1.0];
  // bmo23.matrix.scale(.2, .18, .4);
  // bmo23.matrix.scale(.5, .5, .2);
  // bmo23.matrix.translate(4.5, 2.5, -.5);
  // bmo23.matrix.translate(0, 0, g_shiftAnimation / 200);
  // bmo23.render();

  // // Green Circle Button
  // var bmo24 = new Cone();
  // bmo24.matrix = new Matrix4(bmo1.matrix);
  // bmo24.color = [115 / 255, 243 / 255, 77 / 255, 1];
  // bmo24.matrix.scale(.8, .7, 0.5);
  // bmo24.matrix.scale(.3, .3, 0.5);
  // bmo24.matrix.translate(2.9, 1.6, -.2);
  // bmo24.matrix.rotate(90, 1, 0, 0);
  // bmo24.matrix.translate(0, g_shiftAnimation / 350, 0);
  // bmo24.render();

  // // Blue Circle Button
  // var bmo25 = new Cone();
  // bmo25.matrix = new Matrix4(bmo1.matrix);
  // bmo25.color = [5 / 255, 14 / 255, 113 / 255, 1];
  // bmo25.matrix.scale(.8, .7, 0.5);
  // bmo25.matrix.scale(.15, .15, 0.5);
  // bmo25.matrix.translate(6.5, 4.2, -.2);
  // bmo25.matrix.rotate(90, 1, 0, 0);
  // bmo25.matrix.translate(0, g_shiftAnimation / 350, 0);
  // bmo25.render();

  // // Right leg
  // var bmo26 = new Cube();
  // bmo26.matrix = new Matrix4(bmo1.matrix);
  // bmo26.color = [84 / 255, 120 / 255, 123 / 255, 1];
  // bmo26.matrix.rotate(g_redAngle / 10, 0, 1, 0);
  // bmo26.matrix.rotate(g_rightLeg, 1, 0, 0);
  // bmo26.matrix.scale(.1, .15, .1);
  // bmo26.matrix.translate(2.5, -1, 4);
  // bmo26.render();
  // var bmo27 = new Cube();
  // bmo27.matrix = new Matrix4(bmo26.matrix);
  // bmo27.color = [84 / 255, 120 / 255, 123 / 255, 1];
  // bmo27.matrix.translate(0, -1, 0);
  // bmo27.render();
  // // Right foot
  // var bmo28 = new Cube();
  // bmo28.matrix = new Matrix4(bmo27.matrix);
  // bmo28.color = [71 / 255, 96 / 255, 98 / 255, 1];
  // bmo28.matrix.rotate(g_rightFoot, 1, 0, 0);
  // bmo28.matrix.scale(1, .4, 2.5);
  // bmo28.matrix.translate(0, -1, -.6);
  // bmo28.render();


  // // Left leg
  // var bmo29 = new Cube();
  // bmo29.matrix = new Matrix4(bmo1.matrix);
  // bmo29.color = [84 / 255, 120 / 255, 123 / 255, 1];
  // bmo29.matrix.rotate(-g_redAngle / 10, 0, 1, 0);
  // bmo29.matrix.rotate(g_leftLeg, 1, 0, 0);
  // bmo29.matrix.scale(.1, .15, .1);
  // bmo29.matrix.translate(6, -1, 4);
  // bmo29.render();
  // var bmo30 = new Cube();
  // bmo30.matrix = new Matrix4(bmo29.matrix);
  // bmo30.color = [84 / 255, 120 / 255, 123 / 255, 1];
  // bmo30.matrix.translate(0, -1, 0);
  // bmo30.render();
  // // Left foot
  // var bmo31 = new Cube();
  // bmo31.matrix = new Matrix4(bmo30.matrix);
  // bmo31.color = [71 / 255, 96 / 255, 98 / 255, 1];
  // bmo31.matrix.rotate(g_leftFoot, 1, 0, 0);
  // bmo31.matrix.scale(1, .4, 2.5);
  // bmo31.matrix.translate(0, -1, -.6);
  // bmo31.render();

  // // BMO Name Left Side
  // var bmo32 = new Cube();
  // bmo32.matrix = new Matrix4(bmo1.matrix);
  // bmo32.color = [9 / 255, 30 / 255, 64 / 255, 1];
  // bmo32.matrix.scale(.1, .075, .4);
  // bmo32.matrix.translate(9.05, 7.5, .8);
  // bmo32.render();
  // var bmo33 = new Cube();
  // bmo33.matrix = new Matrix4(bmo1.matrix);
  // bmo33.color = [9 / 255, 30 / 255, 64 / 255, 1];
  // bmo33.matrix.scale(.1, .15, .1);
  // bmo33.matrix.translate(9.05, 3, 2.9);
  // bmo33.render();
  // var bmo34 = new Cube();
  // bmo34.matrix = new Matrix4(bmo1.matrix);
  // bmo34.color = [9 / 255, 30 / 255, 64 / 255, 1];
  // bmo34.matrix.scale(.1, .15, .1);
  // bmo34.matrix.translate(9.05, 3, 4.9);
  // bmo34.render();
  // var bmo35 = new Cube();
  // bmo35.matrix = new Matrix4(bmo1.matrix);
  // bmo35.color = [9 / 255, 30 / 255, 64 / 255, 1];
  // bmo35.matrix.scale(.1, .15, .1);
  // bmo35.matrix.translate(9.05, 3, 6.6);
  // bmo35.render();
  // var bmo36 = new Cube();
  // bmo36.matrix = new Matrix4(bmo1.matrix);
  // bmo36.color = [9 / 255, 30 / 255, 64 / 255, 1];
  // bmo36.matrix.scale(.1, .05, .1);
  // bmo36.matrix.translate(9.05, 8.5, 5.9);
  // bmo36.render();
  // var bmo37 = new Cube();
  // bmo37.matrix = new Matrix4(bmo1.matrix);
  // bmo37.color = [9 / 255, 30 / 255, 64 / 255, 1];
  // bmo37.matrix.scale(.1, .05, .1);
  // bmo37.matrix.translate(9.05, 8.5, 3.9);
  // bmo37.render();
  // var bmo38 = new Cube();
  // bmo38.matrix = new Matrix4(bmo1.matrix);
  // bmo38.color = [9 / 255, 30 / 255, 64 / 255, 1];
  // bmo38.matrix.scale(.1, .05, .4);
  // bmo38.matrix.translate(9.05, 7, 0.8);
  // bmo38.render();
  // var bmo39 = new Cube();
  // bmo39.matrix = new Matrix4(bmo1.matrix);
  // bmo39.color = [9 / 255, 30 / 255, 64 / 255, 1];
  // bmo39.matrix.setTranslate(0, 0, 0);
  // bmo39.matrix.rotate(170, 1, 0, 0);
  // bmo39.matrix.scale(.2, .1, .4);
  // bmo39.matrix.translate(4.05, 3.8, -0.6);
  // bmo39.render();
  // var bmo40 = new Cube();
  // bmo40.matrix = new Matrix4(bmo1.matrix);
  // bmo40.color = [9 / 255, 30 / 255, 64 / 255, 1];
  // bmo40.matrix.setTranslate(0, 0, 0);
  // bmo40.matrix.rotate(10, 1, 0, 0);
  // bmo40.matrix.scale(.2, .1, .4);
  // bmo40.matrix.translate(4.05, -5.5, 0);
  // bmo40.render();
  // var bmo41 = new Cube();
  // bmo41.matrix = new Matrix4(bmo1.matrix);
  // bmo41.color = [9 / 255, 30 / 255, 64 / 255, 1];
  // bmo41.matrix.scale(.1, .05, .4);
  // bmo41.matrix.translate(9.05, 4, 0.8);
  // bmo41.render();
  // var bmo42 = new Cone();
  // bmo42.matrix = new Matrix4(bmo1.matrix);
  // bmo42.color = [9 / 255, 30 / 255, 64 / 255, 1];
  // bmo42.matrix.scale(0.4, 0.4, .7);
  // bmo42.matrix.rotate(90, 0, 0, 1);
  // bmo42.matrix.translate(-0.2, -2.6, 0.25);
  // bmo42.render();




  // // BMO Name Right Side
  // var bmo43 = new Cube();
  // bmo43.matrix = new Matrix4(bmo1.matrix);
  // bmo43.color = [9 / 255, 30 / 255, 64 / 255, 1];
  // bmo43.matrix.scale(.1, .075, .4);
  // bmo43.matrix.translate(-0.05, 7.5, .8);
  // bmo43.render();
  // var bmo44 = new Cube();
  // bmo44.matrix = new Matrix4(bmo1.matrix);
  // bmo44.color = [9 / 255, 30 / 255, 64 / 255, 1];
  // bmo44.matrix.scale(.1, .15, .1);
  // bmo44.matrix.translate(-0.05, 3, 2.9);
  // bmo44.render();
  // var bmo45 = new Cube();
  // bmo45.matrix = new Matrix4(bmo1.matrix);
  // bmo45.color = [9 / 255, 30 / 255, 64 / 255, 1];
  // bmo45.matrix.scale(.1, .15, .1);
  // bmo45.matrix.translate(-0.05, 3, 4.9);
  // bmo45.render();
  // var bmo46 = new Cube();
  // bmo46.matrix = new Matrix4(bmo1.matrix);
  // bmo46.color = [9 / 255, 30 / 255, 64 / 255, 1];
  // bmo46.matrix.scale(.1, .15, .1);
  // bmo46.matrix.translate(-0.05, 3, 6.6);
  // bmo46.render();
  // var bmo47 = new Cube();
  // bmo47.matrix = new Matrix4(bmo1.matrix);
  // bmo47.color = [9 / 255, 30 / 255, 64 / 255, 1];
  // bmo47.matrix.scale(.1, .05, .1);
  // bmo47.matrix.translate(-0.05, 8.5, 5.9);
  // bmo47.render();
  // var bmo48 = new Cube();
  // bmo48.matrix = new Matrix4(bmo1.matrix);
  // bmo48.color = [9 / 255, 30 / 255, 64 / 255, 1];
  // bmo48.matrix.scale(.1, .05, .1);
  // bmo48.matrix.translate(-0.05, 8.5, 3.9);
  // bmo48.render();
  // var bmo49 = new Cube();
  // bmo49.matrix = new Matrix4(bmo1.matrix);
  // bmo49.color = [9 / 255, 30 / 255, 64 / 255, 1];
  // bmo49.matrix.scale(.1, .05, .4);
  // bmo49.matrix.translate(-0.05, 7, 0.8);
  // bmo49.render();
  // var bmo50 = new Cube();
  // bmo50.matrix = new Matrix4(bmo1.matrix);
  // bmo50.color = [9 / 255, 30 / 255, 64 / 255, 1];
  // bmo50.matrix.setTranslate(0, 0, 0);
  // bmo50.matrix.rotate(170, 1, 0, 0);
  // bmo50.matrix.scale(.2, .1, .4);
  // bmo50.matrix.translate(-5.05, 4.5, -0.1);
  // bmo50.render();
  // var bmo51 = new Cube();
  // bmo51.matrix = new Matrix4(bmo1.matrix);
  // bmo51.color = [9 / 255, 30 / 255, 64 / 255, 1];
  // bmo51.matrix.setTranslate(0, 0, 0);
  // bmo51.matrix.rotate(10, 1, 0, 0);
  // bmo51.matrix.scale(.2, .1, .4);
  // bmo51.matrix.translate(-5.05, -4.7, -0.5);
  // bmo51.render();
  // var bmo52 = new Cube();
  // bmo52.matrix = new Matrix4(bmo1.matrix);
  // bmo52.color = [9 / 255, 30 / 255, 64 / 255, 1];
  // bmo52.matrix.scale(.1, .05, .4);
  // bmo52.matrix.translate(-0.05, 4.2, 0.8);
  // bmo52.render();
  // var bmo53 = new Cone();
  // bmo53.matrix = new Matrix4(bmo1.matrix);
  // bmo53.color = [9 / 255, 30 / 255, 64 / 255, 1];
  // bmo53.matrix.scale(0.4, 0.4, .7);
  // bmo53.matrix.rotate(270, 0, 0, 1);
  // bmo53.matrix.translate(-0.78, -0.1, 0.25);
  // bmo53.render();

  // // Right Arm
  // var bmo54 = new Cube();
  // bmo54.matrix = new Matrix4(bmo1.matrix);
  // bmo54.color = [84 / 255, 120 / 255, 123 / 255, 1];
  // bmo54.matrix.rotate(g_rightArm, 0, 0, 1);
  // bmo54.matrix.scale(.3, .08, .1)
  // bmo54.matrix.translate(-1, 1, 4.75);
  // bmo54.matrix.translate(0, g_yellowAngle / 200, 0);
  // bmo54.render();
  // var bmo55 = new Cube();
  // bmo55.matrix = new Matrix4(bmo54.matrix);
  // bmo55.color = [84 / 255, 120 / 255, 123 / 255, 1];
  // bmo55.matrix.rotate(g_rightHand, 0, 0, 1);
  // bmo55.matrix.translate(0, 0, 0);
  // bmo55.matrix.rotate(30, 1, 0, 0);
  // bmo55.matrix.scale(.4, 4, 1)
  // bmo55.matrix.translate(0, -0.8, -.2);
  // bmo55.render();

  // // left Arm
  // var bmo55 = new Cube();
  // bmo55.matrix = new Matrix4(bmo1.matrix);
  // bmo55.color = [84 / 255, 120 / 255, 123 / 255, 1];
  // bmo55.matrix.rotate(g_leftArm, 0, 0, 1);
  // bmo55.matrix.scale(.3, .08, .1)
  // bmo55.matrix.translate(3.4, 1, 4.75);
  // bmo55.matrix.translate(0, g_yellowAngle / 200, 0);
  // bmo55.render();
  // var bmo56 = new Cube();
  // bmo56.matrix = new Matrix4(bmo55.matrix);
  // bmo56.color = [84 / 255, 120 / 255, 123 / 255, 1];
  // bmo56.matrix.rotate(g_leftHand, 0, 0, 1);
  // bmo56.matrix.translate(0, 0, 0);
  // bmo56.matrix.rotate(30, 1, 0, 0);
  // bmo56.matrix.scale(.4, 4, 1)
  // bmo56.matrix.translate(1.5, -0.8, -.2);
  // bmo56.render();

  // // Face

  // // Left Eye
  // var bmo57 = new Cube();
  // bmo57.matrix = new Matrix4(bmo1.matrix);
  // bmo57.color = [21 / 255, 46 / 255, 38 / 255, 1];
  // bmo57.matrix.scale(.05, .1, .1);
  // bmo57.matrix.translate(4, 7, -0.05);
  // bmo57.render();
  // var bmo58 = new Cube();
  // bmo58.matrix = new Matrix4(bmo1.matrix);
  // bmo58.color = [21 / 255, 46 / 255, 38 / 255, 1];
  // bmo58.matrix.scale(.05, .1, .1);
  // bmo58.matrix.translate(5, 7.3, -0.05);
  // bmo58.matrix.translate(0, g_shiftAnimation / 200, 0);
  // bmo58.render();
  // var bmo59 = new Cube();
  // bmo59.matrix = new Matrix4(bmo1.matrix);
  // bmo59.color = [21 / 255, 46 / 255, 38 / 255, 1];
  // bmo59.matrix.scale(.05, .1, .1);
  // bmo59.matrix.translate(6, 7, -0.05);
  // bmo59.render();

  // // Right Eye
  // var bmo60 = new Cube();
  // bmo60.matrix = new Matrix4(bmo1.matrix);
  // bmo60.color = [21 / 255, 46 / 255, 38 / 255, 1];
  // bmo60.matrix.scale(.05, .1, .1);
  // bmo60.matrix.translate(12, 7, -0.05);
  // bmo60.render();
  // var bmo61 = new Cube();
  // bmo61.matrix = new Matrix4(bmo1.matrix);
  // bmo61.color = [21 / 255, 46 / 255, 38 / 255, 1];
  // bmo61.matrix.scale(.05, .1, .1);
  // bmo61.matrix.translate(13, 7.3, -0.05);
  // bmo61.matrix.translate(0, g_shiftAnimation / 200, 0);
  // bmo61.render();
  // var bmo62 = new Cube();
  // bmo62.matrix = new Matrix4(bmo1.matrix);
  // bmo62.color = [21 / 255, 46 / 255, 38 / 255, 1];
  // bmo62.matrix.scale(.05, .1, .1);
  // bmo62.matrix.translate(14, 7, -0.05);
  // bmo62.render();

  // // Mouth
  // var bmo63 = new Cube();
  // bmo63.matrix = new Matrix4(bmo1.matrix);
  // bmo63.color = [71 / 255, 135 / 255, 67 / 255, 1];
  // bmo63.matrix.scale(.2, .08, .1);
  // bmo63.matrix.translate(1.9, 6.5, -0.05);
  // bmo63.render();
  // var bmo64 = new Cube();
  // bmo64.matrix = new Matrix4(bmo1.matrix);
  // bmo64.color = [71 / 255, 135 / 255, 67 / 255, 1];
  // bmo64.matrix.scale(.06, .08, .1);
  // bmo64.matrix.translate(5.5, 7, -0.05);
  // bmo64.render();
  // var bmo65 = new Cube();
  // bmo65.matrix = new Matrix4(bmo1.matrix);
  // bmo65.color = [71 / 255, 135 / 255, 67 / 255, 1];
  // bmo65.matrix.scale(.06, .08, .1);
  // bmo65.matrix.translate(9.5, 7, -0.05);
  // bmo65.render();
  // var bmo66 = new Cube();
  // bmo66.matrix = new Matrix4(bmo1.matrix);
  // bmo66.color = [119 / 255, 193 / 255, 125 / 255, 1];
  // bmo66.matrix.scale(.12, .04, .1);
  // bmo66.matrix.translate(3.5, 13, -0.06);
  // bmo66.render();





  // Left Arm
  // var bmo56 = new Cube();
  // bmo56.matrix = new Matrix4(bmo1.matrix);
  // bmo56.color = [84 / 255, 120 / 255, 123 / 255, 1];
  // bmo56.matrix.scale(.3, .08, .1)
  // bmo56.matrix.translate(14, 1, 4.75);
  // bmo56.render();
  // var bmo57 = new Cube();
  // bmo57.matrix = new Matrix4(bmo1.matrix);
  // bmo57.matrix.rotate(20, 0, 0, 1);
  // bmo57.matrix.rotate(-40, 0, 1, 0);
  // bmo57.color = [84 / 255, 120 / 255, 123 / 255, 1];
  // bmo57.matrix.scale(.3, .08, .1)
  // bmo57.matrix.translate(-.5, 2.1, 5);




  // var body = new Cube();
  // body.color = [1.0, 0.0, 0.0, 1.0];
  // body.matrix.translate(-0.25, -0.75, 0.0);
  // body.matrix.rotate(-5, 1, 0, 0);
  // body.matrix.scale(0.5, 0.3, 0.5);
  // body.render();

  // // Draw a left arm
  // var leftArm = new Cube();
  // leftArm.color = [1, 1, 0, 1];
  // leftArm.matrix.setTranslate(0, -0.5, 0.0);
  // leftArm.matrix.rotate(-5, 1, 0, 0);
  // leftArm.matrix.rotate(-g_yellowAngle, 0, 0, 1);


  // var yellowCoordinatesMat = new Matrix4(leftArm.matrix);
  // leftArm.matrix.scale(0.25, 0.7, 0.5);
  // leftArm.matrix.translate(-0.5, 0, 0);
  // leftArm.render();

  // var box = new Cube();
  // box.color = [1, 0, 1, 1];
  // box.matrix = yellowCoordinatesMat;
  // box.matrix.translate(0, 0.65, 0);
  // box.matrix.rotate(g_magentaAngle, 0, 0, 1);
  // box.matrix.scale(0.3, 0.3, 0.3);
  // box.matrix.translate(-0.5, 0, -0.001);
  // // box.matrix.scale(0.2, 0.4, 0.2);
  // box.render();


  // Check the time at the end of the function, and show on web page
  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(1000 / duration) / 10, "numdot");

}

// Set the text of a HTML element
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}