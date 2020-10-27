class Sprite{ //Sprite information data structure 
  constructor(spriteSheetAnim, spriteWidth, spriteHeight, spriteJSON, frameNum) {
    // ---- Movement/Direction Logic
    this.collider = collider;
    this.spriteWidth = spriteWidth;
    this.spriteHeight = spriteHeight;
    //this.spriteSheetWidth = charSpriteSheet.width;
    //this.spriteSheetHeight = charSpriteSheet.height;
    //this.spriteJSON = spriteSheetAnim;
    this.animation = charSpriteSheet
    }

    start() {

    }

}

class SpriteObject {
  constructor(x, y, sprite, collider) {
    // ---- Movement/Direction Logic
    this.position = createVector(x, y);
    this.collider = collider;
      this.sprite = sprite;
  }

  start() {
    charSpriteSheet.loadPixels();
    collider.loadPixels();
    this.render();
    this.update();
  }

  render() {
    push();
    //upscale the red collider
    this.collider.resize(this.spriteWidth,this.spriteHeight);
    //move the collider scale goes here
    image(this.collider,x,y);
    //spritesheet anim goeshere
    animation(sprite.animation, x, y);
    pop();
  }

  update() {
    //any runtime logic can go here
  }

  reset() {}
}
