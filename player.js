class Player {
  constructor(x, y) {
    // Position and Speed
    this.x = x;
    this.y = y;
    this.walkSpeed = 0; 
    this.runSpeed = 0;
    this.motorSpeed = 0;

    // State (True/False switches)
    this.isMoving = false;
    this.isRunning = false;
    this.isBiking = false;
    this.isFacingLeft = false;
    this.motorToggleDown = false;

    // Animation Containers
    this.walkFrames = [];
    this.runFrames = [];
    this.bikeFrames = [];
  }

  // Run this in the global preload()
  loadAssets() {
    this.walkFrames = loadAnimation("./Assets/GurlineWalkAnimation/Gurline-walk", 25);
    this.runFrames = loadAnimation("./Assets/GurlineRunAnimation/Gurline-run", 25);
    this.bikeFrames = loadAnimation("./Assets/GurlineMotorbikeAnimation/Gurline-wrooom_gurli", 25);
  }

  update() { //Sidenote when using the run or bike animation walkNoise will be 10 also
    // 1. Reset movement state every frame
    this.isMoving = false;

    // 2. Check for Running (Shift Key)
    let speed = this.walkSpeed;
    if (keyIsDown(77) && !this.motorToggleDown) { //77 is keycode for 'm'
      this.isBiking = !this.isBiking;
      this.motorToggleDown = true;
    } else if (!keyIsDown(77)) {
      this.motorToggleDown = false;
    }

    if (this.isBiking) {
      speed = this.motorSpeed;
      this.isRunning = false;
      motorNoise = 150;
    } else if (keyIsDown(SHIFT)) {
      this.isRunning = true;
      speed = this.runSpeed;
      this.isBiking = false;
      runNoise = 60;
    } else {
      this.isRunning = false;
      this.isBiking = false;
      runNoise = 0;
      motorNoise = 0;
    }
    

    // 3. Move Left or Right
    if(keyIsDown(LEFT_ARROW) && keyIsDown(RIGHT_ARROW))
    {
        //haha
    }
    else if (keyIsDown(LEFT_ARROW)) {
      this.x = this.x - speed;
      this.isFacingLeft = true;
      this.isMoving = true;
      walkNoise = 10;
      
    if (this.isBiking) {
      playerX -= 15;
    } else {
      playerX -= 2;
    }
    if (this.isRunning) {
      playerX -= 10;
    } else {
      playerX -= 2;
    }

    }
    else if (keyIsDown(RIGHT_ARROW)) {
      this.x = this.x + speed;
      this.isFacingLeft = false;
      this.isMoving = true;
      walkNoise = 10;
    if (this.isBiking) {
      playerX += 15;
    } else {
      playerX += 2;
    }

    if (this.isRunning) {
      playerX += 10;
    } else {
      playerX += 2;
    }
    
    } else {
      walkNoise = 0;
    }
  }

  display() {
    // --- Step 1: Pick the right set of images ---
    let currentAnimation;
    if (this.isBiking) {
      currentAnimation = this.bikeFrames;
    } else if (this.isRunning && this.isMoving) {
      currentAnimation = this.runFrames;
    } else {
      currentAnimation = this.walkFrames;
    }

    // --- Step 2: Calculate which frame to show ---
    let frameIndex = 0; // Default to first frame (idle)

    if (this.isMoving) {
      // How many frames of the game pass before we change the image?
      // A smaller number here makes the animation faster.
      let animationDelay = 4; 
      if (this.isRunning) {
        animationDelay = 3; 
      }
      if (this.isBiking){
        animationDelay = 3;
      }

      // The Math: Divide the total game frames by our delay, 
      // then use % (modulo) to keep it within the folder's image count.
      let timePassed = floor(frameCount / animationDelay);
      frameIndex = timePassed % currentAnimation.length;
    }

    // --- Step 3: Draw it to the screen ---
    push();
    translate(this.x, this.y);
    imageMode(CENTER);

    // Flip the image if facing left (bike sprites are mirrored)
    const shouldFlip = this.isBiking ? !this.isFacingLeft : this.isFacingLeft;
    if (shouldFlip) {
      scale(-1, 1);
    }

    let imgToShow = currentAnimation[frameIndex];
    image(imgToShow, 0, 0, 300, 200);
    pop();
  }

}