/// <reference path="TSDef/p5.global-mode.d.ts" />

// NETWORKING - based on Paolo's mouses code - https://github.com/molleindustria/mouses

//create a socket connection
var socket;
var pointer;
//I send updates at the same rate as the server update
var UPDATE_TIME = 1000 / 3;

/* sketch.js and associated src/ files based on this project - https://editor.p5js.org/kaganatalay/sketches/vFlDyAsEC */

let environment;

//var cube_test;

let background_image;
let colliders_image;
let noise_image;
let wall_vent_image;
let wall_vent_backImg;

let click_to_start = true;

let audioEnabled = false;
let sound = {
  ambience: null,
  darkness: null
};


let testSpriteObject;
let genericCollider;
let testSprite;

function preload() {
  //background art goes here...
  background_image = loadImage(
    "https://cdn.glitch.com/100f4346-1bb2-4f86-be35-969fbb47b625%2Foffice%20test.jpg?v=1601588987850"
  );
  colliders_image = loadImage(
    "https://cdn.glitch.com/100f4346-1bb2-4f86-be35-969fbb47b625%2Fmap.jpg?v=1601589011387"
  );
  noise_image = loadImage(
    "https://cdn.glitch.com/100f4346-1bb2-4f86-be35-969fbb47b625%2Fnoise%20large.png?v=1602789515463"
  );
  wall_vent_image = loadImage(
    "https://cdn.glitch.com/100f4346-1bb2-4f86-be35-969fbb47b625%2Fwall%20vent.png?v=1603315668441"
  );
  wall_vent_backImg = loadImage(
    "https://cdn.glitch.com/100f4346-1bb2-4f86-be35-969fbb47b625%2Fwall%20vent%20backImg.png?v=1603402916286"
  );
  //sounds
  sound.ambience = loadSound(
    "https://cdn.glitch.com/100f4346-1bb2-4f86-be35-969fbb47b625%2FSoft-ambient-background-music.mp3?v=1602182479229"
  );
  sound.darkness = loadSound(
    "https://cdn.glitch.com/100f4346-1bb2-4f86-be35-969fbb47b625%2FHor%20Hor.mp3?v=1602180799277"
  );
  // charSprite = loadImage("https://cdn.sstatic.net/Sites/stackoverflow/img/404.svg");
  charSprite = loadImage(
    "https://cdn.glitch.com/100f4346-1bb2-4f86-be35-969fbb47b625%2FofficePhone.png?v=1603294555306"
  );
  cube0 = loadImage(
    "https://cdn.glitch.com/100f4346-1bb2-4f86-be35-969fbb47b625%2Fcube1_0000.png?v=1603414943758"
  );
  cube1 = loadImage(
    "https://cdn.glitch.com/100f4346-1bb2-4f86-be35-969fbb47b625%2Fcube1_0007.png?v=1603414943832"
    );

    testSprite = loadSpriteSheet("Assets/SpriteAnims/cube/spritesheet.png", 350, 350, 12); //I'm gonna test the cubes
    testSpriteAnim = loadAnimation(testSprite);
    //testSpriteObject = new Sprite(testSpriteAnim, 600, 527, 7);

    genericCollider = loadImage("Assets/Mesh_GenericCollider.png"); //50 X 50
}

function setup() {
  // ----- Networking Setup -----
  //I create socket but I wait to assign all the functions before opening a connection
  socket = io({
    autoConnect: false
  });

  //detects a server connection
  socket.on("connect", onConnect);
  //handles the messages from the server, the parameter is a string
  socket.on("message", onMessage);
  //handles the user action broadcast by the server, the parameter is an object
  socket.on("state", updateState);

  socket.open();

  //every x time I update the server on my position
  setInterval(function() {
    socket.emit("clientUpdate", {
      x: environment.player.position.x,
      y: environment.player.position.y
    });
  }, UPDATE_TIME);

  // ----- Canvas setup -----
  //let c = createCanvas(displayWidth, displayHeight);
  let c = createCanvas(windowWidth, windowHeight);
  c.position(0, 0);
  environment = new Environment(
    background_image,
    colliders_image,
    socket,
    charSprite,
    wall_vent_image,
    wall_vent_backImg
  );
  //var cube_animation = loadAnimation(cube0,cube1);
  //cube_test = createSprite(0,0, 300,300);
  

  
  // Audio to start before you press any key
  getAudioContext().suspend();


}

// Called when a key is pressed so things should get started
function pressedToStart() {
  click_to_start = false;

  // ----- Play audio -----
  //   reference - https://p5js.org/reference/#/p5/userStartAudio
  userStartAudio(null, function() {
    // Error occuring here sometimes, seems to be resolved in a future relaase of p5 sound
    //   https://github.com/processing/p5.js-sound/issues/506
    masterVolume(0.7);
    sound.ambience.setLoop(true);
    sound.ambience.setVolume(1);
    sound.darkness.setLoop(true);
    sound.darkness.setVolume(0);
    audioEnabled = true;
    try {
      sound.ambience.play();
      sound.darkness.play();
    } catch (err) {
      console.log("Caught error while trying to play audio:");
      console.log(err);
    }
  });
}

function loadTheSpritesInRow(sprite, spaceBetween) //loads the sprites backward
{
  for (var i = 0; i < numbOfSprites, i++; )
  {
    var spriteInstance = sprite;
    spriteInstance.position = (x, y-spaceBetween*numbOfSprites);
    spriteInstance.start();
  }
}
// Called every frame to draw to the screen
function draw() {
  background(100);
  if (click_to_start) {
    drawStartScreen();
  } else {
    environment.start();
    animation(testSpriteAnim,350,350);
    //loadTheSpritesInRow(testSprite,200);
    // Dom's custom color stuff
    drawColorWaves();
    //get player pixel position
    // createRectangleAtPixel();
    
    //cube_test.animation.play();
  }
}


// Key input functions
function keyPressed(event) {
  if (click_to_start) pressedToStart();
  if (!environment?.player?.controls) return;
  for (let i = 0; i < environment.player.controls.length; i++) {
    if (
      key == environment.player.controls[i] ||
      keyCode == environment.player.altControls[i]
    ) {
      environment.player.movement[i] = true;
    }
  }
}

function keyReleased() {
  if (!environment?.player?.controls) return;
  for (let i = 0; i < environment.player.controls.length; i++) {
    if (
      key == environment.player.controls[i] ||
      keyCode == environment.player.altControls[i]
    ) {
      environment.player.movement[i] = false;
    }
  }
}

function mousePressed() {
  if (click_to_start) pressedToStart();
}

// Draw the "press any key to start" screen
function drawStartScreen() {
  push();
  translate(width / 2, height / 2);
  textSize(64);
  textAlign(CENTER, CENTER);
  text("Press any key to start", 0, 0);
  pop();
}

// Dom's custom color stuff
let cycleTimer = 0;

const SHAPE_INSTANCES = 20;
const PETALS = 1;

const PERIOD = 19; // in seconds
const PERIOD_MS = PERIOD * 1000;

const MIN_DIST_SQRD = 50 * 50;
const MAX_DIST_SQRD = 800 * 800;

function drawColorWaves() {
  cycleTimer += deltaTime;

  push(); // Start a new drawing state
  // strokeWeight(1);
  noStroke();
  // fill('#0061c266');
  fill(20, 20, 20, 100);
  // translate(50, 0);

  // Determine how close the closest player is, for alpha_scale purposes
  let closest_dist_sqrd = 2 * MAX_DIST_SQRD; // Very large number
  let alpha_scale = 0;
  if (environment.saved_state) {
    for (let playerId in environment.saved_state.players) {
      if (environment.saved_state.players.hasOwnProperty(playerId)) {
        //in this case I don't have to draw the pointer at my own position
        if (playerId != environment.socket.id) {
          let playerState = environment.saved_state.players[playerId];

          //draw a pointer image for each player except for myself
          // image(pointer, playerState.x + i * 5, playerState.y + i * 3);
          // temp player drawing
          let dist_x = environment.player.position.x - playerState.x;
          let dist_y = environment.player.position.y - playerState.y;
          let dist_sqrd = dist_x * dist_x + dist_y * dist_y;
          closest_dist_sqrd = min(dist_sqrd, closest_dist_sqrd);
        }
      }
    }
    if (closest_dist_sqrd < MAX_DIST_SQRD) {
      alpha_scale =
        (MAX_DIST_SQRD - closest_dist_sqrd) / (MAX_DIST_SQRD - MIN_DIST_SQRD);
    }
  }

  // Update sounds
  if (audioEnabled) {
    sound.ambience.setVolume(alpha_scale);
    sound.darkness.setVolume(1 - alpha_scale);
    try {
      if (!sound.ambience.isPlaying()) sound.ambience.play();
      if (!sound.darkness.isPlaying()) sound.darkness.play();
    } catch (err) {
      console.log("Caught error while trying to play audio:");
      console.log(err);
    }
  }

  // Draw flowers
  for (let i = 0; i < SHAPE_INSTANCES; i++) {
    let t = cycleTimer - (i * PERIOD_MS) / SHAPE_INSTANCES;
    let cycleRad = ((t % PERIOD_MS) / PERIOD_MS) * 2 * Math.PI;
    let sin = Math.sin(cycleRad);
    let cos = Math.cos(cycleRad);
    fill(20, 20, 20, 70 * sin * cos);
    // flower
    push();
    translate(width / 2 + (cos * width) / 2, height / 2 + (sin * height) / 2);
    for (let i = 0; i < PETALS; i++) {
      rotate((PI * 2) / PETALS + random());
      fill(
        random() * 255,
        random() * 255,
        random() * 255,
        alpha_scale * sin * cos * 255
      );
      ellipse(0, 0, 20, 80);
      // ellipse(0, 30, 20, 80);
    }
    pop();
  }

  pop(); // Restore original state

  // Visual noise
  push();
  imageMode(CENTER);
  tint(255, (1 - alpha_scale) * 25);
  let x = width / 2 + ((random() * 2 - 1) * width) / 3;
  let y = height / 2 + ((random() * 2 - 1) * width) / 3;
  image(noise_image, x, y, noise_image.width * 12, noise_image.height * 12);
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function printCoords() {
  print("player position: " + environment.player.position);
  print("player pixel position: " + getPlayerPixelPos());
}

// ----- Pixel Collisions -----

function getPlayerPixelPos() {
  //take plater pos, add half width, half height (position relative to top left)/scale = pixel position x,y
  var pixelX =
    environment.player.position.x / environment.scale +
    environment.resolution * 0.5;
  var pixelY =
    environment.player.position.y / environment.scale +
    environment.resolution * 0.5;
  pixelX = floor(pixelX);
  pixelY = floor(pixelY);
  var coords = [pixelX, pixelY];
  return coords;
}

function createRectangleAtPixel() {
  var X = floor(width / 2 + environment.player.radius + 20);
  var Y = floor(height / 2);
  var color = get(X, Y);
  fill(color);

  rect(X, Y, 50, 50);
}

// ----- NETWORKING LISTENERS -----

//connected to the server
function onConnect() {
  if (socket.id) {
    console.log("Connected to the server");
    socket.emit("newPlayer", {
      x: environment.player.position.x,
      y: environment.player.position.y
    });
  }
}

//a message from the server
function onMessage(msg) {
  if (socket.id) {
    console.log("Message from server: " + msg);
  }
}

//called by the server every 30 fps
function updateState(state) {
  // console.log("state message received! (my socket.id: " + socket.id + ")");
  // console.log(state);
  environment.saved_state = state;
}
