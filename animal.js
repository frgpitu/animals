class AnimalSpawner {
  constructor(filepath, count, speed, padding = 3, startAt = 0, useUnderscore = true) {
    this.filepath = filepath;
    this.animSpeed = speed;
    this.frameCount = count;
    
    // New flexibility settings
    this.padding = padding;
    this.startAt = startAt;
    this.useUnderscore = useUnderscore;

    this.frames = [];
  }

  loadAssets() {
    // Pass the settings into the helper
    this.frames = loadAnimation(
      this.filepath, 
      this.frameCount, 
      this.padding, 
      this.startAt, 
      this.useUnderscore
    );
  }

  draw(x, y, isFacingLeft, w, h) {
    if (this.frames.length === 0) return;

    let timePassed = floor(frameCount / this.animSpeed);
    let frameIndex = timePassed % this.frames.length;
    
    push();
    translate(x, y);
    imageMode(CENTER);
    if (isFacingLeft) scale(-1, 1);
    
    image(this.frames[frameIndex], 0, 0, w, h);
    pop();
  }
}