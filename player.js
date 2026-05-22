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

    // Animation Containers
    this.walkFrames = [];
    this.runFrames = [];
    this.bikeFrames = [];

    this.wasMoving = false;
    this.wasRunning = false;
    this.wasBiking = false;
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
    if(keyIsDown(77)){ //77 is keycode for 'm'
        this.isBiking = true;
        speed = this.motorSpeed;
        this.isRunning = false;
        motorNoise = 45;
        
    }
    else if (keyIsDown(SHIFT)) {
      this.isRunning = true;
      speed = this.runSpeed;
      this.isBiking = false;
      runNoise = 18;
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
      this.isFacingLeft = true;
      this.isMoving = true;
      walkNoise = 8;
      
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
    if (keyIsDown(RIGHT_ARROW && SHIFT)) {
      walkNoise = 0;
    }


    // Walking
if (this.isMoving && !this.isRunning && !this.isBiking) {
  if (!this.wasMoving || this.wasRunning || this.wasBiking) {
    running.stop();
    motorbiking.stop();

    if (!walking.isPlaying()) {
      walking.setVolume(0.2);
      walking.loop();
    }
  }
}

// Running
else if (this.isMoving && this.isRunning) {
  if (!this.wasRunning) {
    walking.stop();
    motorbiking.stop();

    if (!running.isPlaying()) {
      running.setVolume(0.9);
      running.loop();
    }
  }
}

// Biking
else if (this.isMoving && this.isBiking) {
  if (!this.wasBiking) {
    walking.stop();
    running.stop();

    if (!motorbiking.isPlaying()) {
      motorbiking.setVolume(0.5);
      motorbiking.loop();
    }
  }
}

// Idle
else {
  walking.stop();
  running.stop();
  motorbiking.stop();
}

// Save previous state
this.wasMoving = this.isMoving;
this.wasRunning = this.isRunning;
this.wasBiking = this.isBiking;
  }

  display() {
    // --- Step 1: Pick the right set of images ---
    let currentAnimation;
    if(this.isBiking && this.isMoving){
        currentAnimation = this.bikeFrames;
    }
    else if (this.isRunning && this.isMoving) {
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

    if(this.isBiking && this.isMoving)
    {
        this.isFacingLeft = !this.isFacingLeft;
    }

    // Flip the image if facing left
    if (this.isFacingLeft) {
      scale(-1, 1);
    }

    let imgToShow = currentAnimation[frameIndex];
    image(imgToShow, 0, 0, 300, 200);
    pop();
  }

}