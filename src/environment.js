/// <reference path="TSDef/p5.global-mode.d.ts" />

var MIN_VISIBLE_PLAYER_DIST = 140;

var frame_factor;

class Environment {
  constructor(img, backimg, socket, charSprite, doorImg, doorBackImg, collider, decorAnim1, decorAnim2) {
    this.player = new Player(0, 0, charSprite);
    this.saved_state;
    this.socket = socket;

    this.players_lerped = {};
    this.visible_players = 0;

    //---- Map Variables ---
    this.backimg = backimg;
    this.image = img;
    this.scale = 1;

    //---- Doors ----
    this.initDoors(doorImg, doorBackImg);

    //---- DecorAnim1 ----
    this.decorAnim1 = decorAnim1;
    this.collider = collider;
    this.decorAnim1Sprites = [];
    this.decorAnim1Count = 9;
        
  }
  
  makeSpritesLegacy()
  {
    for(var i = 0; i < this.decorAnim1Count; i++)    
    { //this is a fucking stupid way of doing things but I can't imagine a better way
      //do you? 
      // ----- Right Side ----- 
      var LeftOffset = 146;
      var RightTop = new SpriteObject((187*i)+LeftOffset,-940,this.decorAnim1,this.collider);
      var RightMiddle1 = new SpriteObject((187*i)+LeftOffset,-475,this.decorAnim1,this.collider);
      var RightMiddle2 = new SpriteObject((187*i)+LeftOffset,-40,this.decorAnim1,this.collider);
      var RightBottom = new SpriteObject((187*i)+LeftOffset,420,this.decorAnim1,this.collider);

      this.decorAnim1Sprites.push(RightTop);
      this.decorAnim1Sprites.push(RightMiddle1);
      this.decorAnim1Sprites.push(RightMiddle2);
      this.decorAnim1Sprites.push(RightBottom);

      // ---- Left Side ---- 
      var LeftOffset = -190;
      var BottomTop = new SpriteObject(-(187*i)+LeftOffset,-940,this.decorAnim1,this.collider);
      var BottomMiddle1 = new SpriteObject(-(187*i)+LeftOffset,-475,this.decorAnim1,this.collider);
      var BottomMiddle2 = new SpriteObject(-(187*i)+LeftOffset,-40,this.decorAnim1,this.collider);
      var BottomBottom = new SpriteObject(-(187*i)+LeftOffset,420,this.decorAnim1,this.collider);

      this.decorAnim1Sprites.push(BottomTop);
      this.decorAnim1Sprites.push(BottomMiddle1);
      this.decorAnim1Sprites.push(BottomMiddle2);
      this.decorAnim1Sprites.push(BottomBottom);
    }
  }


  makeSprites(x,y,sprites, rows, rowGap, colGap, gaps)
  {
    let origX = x;
    //let origY = y;
    for (var row = 0; row < rows; row++)
    {
      origX = x;
      for (var spriteCount = 0; spriteCount < sprites; spriteCount++)
      {
        if (spriteCount % gaps == 0)
        {
          origX+=colGap;
        }
        else {
          var Cubical = new SpriteObject(origX, y,this.decorAnim1,this.collider);
          this.decorAnim1Sprites.push(Cubical);
          origX+=colGap;
        }
      }
      y+=rowGap;
    }
  }

  drawSpriteColliders(w,h) //This will have to go before drawSprite()... it's O(n^2) time complexity... Too Bad!
  {
    for(var i = 0; i < this.decorAnim1Sprites.length; i ++)
    {
      image(
        this.collider,
        this.decorAnim1Sprites[i].position.x,
        this.decorAnim1Sprites[i].position.y,
        w,
        h,
      );
    }

  }

  drawSprites()
  {
    for(var i = 0; i < this.decorAnim1Sprites.length; i ++)
    {
      this.decorAnim1Sprites[i].start();
    }
  }

  collidersLogic() {
    let regX = floor(width / 2);
    let regY = floor(height / 2);

    //offsets need to be tweaked a little bit
    let rightX = regX + this.player.radius + 1;
    let leftX = regX - this.player.radius - 1;
    let topY = regY - this.player.radius - 1;
    let botY = regY + this.player.radius + 1;

    //Let's choose the blue in RGBA for testing purposes...
    let RBGA_Index = 0;

    let interested = 254;

    // Load the pixels array and then check the ones you need, rather than calling get() 4 times
    loadPixels();
    let d = pixelDensity();

    let i_right = 4 * ( (regY * width * d) + (rightX * d) );
    let i_left  = 4 * ( (regY * width * d) + (leftX * d) );
    let i_top   = 4 * ( (topY * width * d) + (regX * d) );
    let i_bot   = 4 * ( (botY * width * d) + (regX * d) );

    let rightColor = pixels[i_right + RBGA_Index];
    let leftColor = pixels[i_left + RBGA_Index];
    let topColor = pixels[i_top + RBGA_Index];
    let botColor = pixels[i_bot + RBGA_Index];
    // let rightColor = get(rightX, regY)[RBGA_Index];
    // let leftColor = get(leftX, regY)[RBGA_Index];
    // let topColor = get(regX, topY)[RBGA_Index];
    // let botColor = get(regX, botY)[RBGA_Index];

    //Stop player upon impacting interested color.
    this.player.possibleMoveDir[0] = topColor != interested;
    this.player.possibleMoveDir[1] = leftColor != interested;
    this.player.possibleMoveDir[2] = botColor != interested;
    this.player.possibleMoveDir[3] = rightColor != interested;
  }

  start() {
    frame_factor = deltaTime / 1000 * 60;
    // original environment start() code
    push();
    // ----- PLAYER TRANSLATE -----
    translate(
      width / 2 - this.player.position.x,
      height / 2 - this.player.position.y
    );

    // draw wall image
    imageMode(CENTER);

    // image(
    //   this.backimg,
    //   0,
    //   0,
    //   this.backimg.width * this.scale,
    //   this.backimg.height * this.scale
    // );
    this.drawSpriteColliders(185,300);
    // Draw door backImages
    this.drawDoors(true);

    // Call player collider logic here
    this.collidersLogic();
    //draw map background
    if (true) //for debug purposes 
    {
      image(
        this.image,
        0,
        0,
        //this.image.width * this.scale,
        //this.image.height * this.scale
        3464,
        2474
      );
    }
    

    this.player.start();
    this.drawSprites();
    this.drawOtherPlayers();
    
    // Update doors then draw door images
    this.updateDoors();
    this.drawDoors(false);

    pop();
  }

  optimize() {}

  gameLoop() {}

  spawn(pos) {}

  // Draws only players who are very close
  drawOtherPlayers() {
    if (!this.socket) return;
    if (!this.saved_state) return;

    this.visible_players = 0;

    //iterate through the players
    for (let playerID in this.saved_state.players) {
      if (playerID == this.socket.id) continue;
      if (!this.saved_state.players.hasOwnProperty(playerID)) continue;

      // Update their lerped position
      if (!this.players_lerped[playerID]) {
        this.players_lerped[playerID] = this.saved_state.players[playerID];
      }

      let playerState = this.saved_state.players[playerID];
      let lPlayerState = this.players_lerped[playerID];
      let disp_x = playerState.x - lPlayerState.x; // Displacement x
      let disp_y = playerState.y - lPlayerState.y; // Displacement y
      let dist = sqrt(disp_x * disp_x + disp_y * disp_y); // Distance

      let speed = this.player.velocity.mag() * frame_factor;
      if (dist <= speed) {
        this.players_lerped[playerID] = playerState;
      } else {
        lPlayerState.x += (disp_x / dist) * speed;
        lPlayerState.y += (disp_y / dist) * speed;
        this.players_lerped[playerID] = lPlayerState;
      }

      // Now actually draw them
      // check if they're too far to be seen
      let dist_x = this.player.position.x - lPlayerState.x;
      let dist_y = this.player.position.y - lPlayerState.y;
      let dist_sqrd = dist_x * dist_x + dist_y * dist_y;

      // Any player that's quite far from you should just snap to their true position
      if (dist_sqrd > MIN_VISIBLE_PLAYER_DIST * MIN_VISIBLE_PLAYER_DIST * 9) {
        this.players_lerped[playerID] = playerState;
      }

      if (dist_sqrd > MIN_VISIBLE_PLAYER_DIST * MIN_VISIBLE_PLAYER_DIST)
        continue;
      this.visible_players++;

      //draw a pointer image for each player except for myself
      // image(pointer, lPlayerState.x + i * 5, lPlayerState.y + i * 3);
      // temp player drawing
      push();
      translate(lPlayerState.x, lPlayerState.y);
      // translate(
      //   width / 2 + (cos * width) / 2,
      //   height / 2 + (sin * height) / 2
      // );

      for (let i = 0; i < PETALS; i++) {
        rotate((PI * 2) / PETALS + random());
        fill(random() * 255, random() * 255, random() * 255, 255);
        ellipse(0, 0, 20, 80);
        // ellipse(0, 30, 20, 80);
      }
      pop();
    }
  }

  // ----- Doors -----
  initDoors(doorImg, doorBackImg) {
    this.doors = [
      new Door(doorImg, doorBackImg, 0, -600, 200, 0)
    ];
  }

  // Check if each door should move towards or away from its original position
  updateDoors() {
    if (!this.doors) return;
    for (let door of this.doors) {
      door.open = false;
      // Has to be at least 1 other player nearby
      if (this.visible_players > 0) {
        // Just set all doors open when a player is nearby
        door.open = true;
        // PREVIOUSLY: Now check if you're actually near this door
//         let dist_x = this.player.position.x - door.position.x;
//         let dist_y = this.player.position.y - door.position.y;
//         let dist_sqrd = dist_x * dist_x + dist_y * dist_y;

//         if (dist_sqrd < MIN_VISIBLE_PLAYER_DIST * MIN_VISIBLE_PLAYER_DIST * 9) {
//           door.open = true;
//         }
      }
      
      let speed = 0.08;
      if (door.open) {
        door.position.x += (door.open_pos.x - door.position.x) * speed * frame_factor;
        door.position.y += (door.open_pos.y - door.position.y) * speed * frame_factor;
        // door.position = door.open_pos;
      } else {
        door.position.x += (door.closed_pos.x - door.position.x) * speed * frame_factor;
        door.position.y += (door.closed_pos.y - door.position.y) * speed * frame_factor;
        // door.position = door.closed_pos;
      }
    }
  }
  
  // Draw doors. If backImgPass == true, draw backImage instead of image
  drawDoors(backImgPass) {
    for (let door of this.doors) {
      let img = (backImgPass) ? door.backImage : door.image;
      image(img, door.position.x, door.position.y, img.width * door.scale, img.height * door.scale);
    }
  }
}

class Door {
  constructor(img, backImg, x, y, offset_x, offset_y) {
    this.image = img;
    this.backImage = backImg;
    this.position = createVector(x, y);
    this.closed_pos = createVector(x, y);
    this.open_pos = createVector(x + offset_x, y + offset_y);
    this.open = false;
    this.scale = 0.4;
  }
}

// ----- GLITCH EFFECT -----

// Source - https://code.sololearn.com/WeKRgDG08m1p/#js

// TODO - maybe
