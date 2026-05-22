class AnimalDrawer {
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

  draw(x, y, isFacingLeft, scaleFactor = 1) {
    if (this.frames.length === 0) return;

    let timePassed = floor(frameCount / this.animSpeed);
    let frameIndex = timePassed % this.frames.length;
    
    push();
    translate(x, y);
    imageMode(CENTER);
    if (isFacingLeft) scale(-1, 1);
    if (scaleFactor !== 1) scale(scaleFactor, scaleFactor);
    
    image(this.frames[frameIndex], 0, 0, 50, 50);
    pop();
  }
}

class Animal {
  constructor({ x, y, vx = 0, vy = 0, isFacingLeft = false, scale = 1 }) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.isFacingLeft = isFacingLeft;
    this.scale = scale;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
  }
}

class AnimalSpawner {
  constructor({
    drawer,
    spawnPoints,
    spawnArea,
    spawnDistance,
    velocityRange,
    directionForSpawn,
    scaleRange = [1, 1],
    spawnDirectionBias = 0.7,
    spawnPositionBias = 0.6,
    noiseRate,
    rateJitterRange = [0.85, 1.15],
  }) {
    this.drawer = drawer;
    this.spawnArea = spawnArea;
    this.spawnPoints = spawnPoints || this.buildSpawnPoints(0);
    this.spawnDistance = spawnDistance;
    this.velocityRange = velocityRange;
    this.directionForSpawn = directionForSpawn;
    this.scaleRange = scaleRange;
    this.spawnDirectionBias = spawnDirectionBias;
    this.spawnPositionBias = spawnPositionBias;
    this.noiseRate = noiseRate;
    this.rateJitterRange = rateJitterRange;
    this.animals = [];
    this.spawnAccumulator = 0;
  }

  buildSpawnPoints(spawnCount) {
    const count = spawnCount || 0;
    const points = [];

    for (let i = 0; i < count; i++) {
      points.push({
        x: 0,
        y: 0
      });

      this.randomizeSpawnPoint(points[i]);
    }

    return points;
  }

  randomizeSpawnPoint(
    spawn,
    {
      cameraX = 0,
      viewportWidth = 0,
      viewportHeight = 0,
      playerX,
      moveDirection
    } = {}
  ) {
    if (!this.spawnArea) return;

    const area = typeof this.spawnArea === "function"
      ? this.spawnArea({ cameraX, viewportWidth, viewportHeight })
      : this.spawnArea;

    const xOffset = area.followCamera ? cameraX : 0;
    const minX = area.xMin + xOffset;
    const maxX = area.xMax + xOffset;
    const unbiasedX = random(minX, maxX);
    const biasedX = this.pickBiasedX({ minX, maxX, playerX, moveDirection });

    spawn.x = lerp(unbiasedX, biasedX, this.spawnPositionBias);
    spawn.y = random(area.yMin, area.yMax);
  }

  pickBiasedX({ minX, maxX, playerX, moveDirection }) {
    if (!Number.isFinite(playerX) || !moveDirection) {
      return random(minX, maxX);
    }

    if (moveDirection > 0) {
      return random(Math.max(playerX, minX), maxX);
    }

    return random(minX, Math.min(playerX, maxX));
  }

  getNoiseAdjustedRate(noiseLevel) {
    if (!this.noiseRate) {
      return 0;
    }

    const minNoise = this.noiseRate.minNoise;
    const maxNoise = this.noiseRate.maxNoise;
    if (!Number.isFinite(minNoise) || !Number.isFinite(maxNoise) || maxNoise <= minNoise) {
      return 0;
    }

    if (noiseLevel < minNoise) {
      return 0;
    }

    const ratio = constrain(
      (noiseLevel - minNoise) / (maxNoise - minNoise),
      0,
      1
    );

    const minRate = Number.isFinite(this.noiseRate.minRate) ? this.noiseRate.minRate : 0;
    const maxRate = Number.isFinite(this.noiseRate.maxRate) ? this.noiseRate.maxRate : 0;

    return lerp(minRate, maxRate, ratio);
  }

  trySpawn({ noiseLevel, playerX, cameraX, viewportWidth, viewportHeight, moveDirection }) {
    if (!Number.isFinite(noiseLevel)) return;

    const rate = this.getNoiseAdjustedRate(noiseLevel);
    if (!Number.isFinite(rate) || rate <= 0) return;

    const jitterRange = this.rateJitterRange || [1, 1];
    const jitterMin = Number.isFinite(jitterRange[0]) ? jitterRange[0] : 1;
    const jitterMax = Number.isFinite(jitterRange[1]) ? jitterRange[1] : 1;
    const jitter = random(Math.min(jitterMin, jitterMax), Math.max(jitterMin, jitterMax));

    this.spawnAccumulator += (rate / 1000) * deltaTime * jitter;

    while (this.spawnAccumulator >= 1) {
      this.spawnOne({
        playerX,
        cameraX,
        viewportWidth,
        viewportHeight,
        moveDirection
      });
      this.spawnAccumulator -= 1;
    }
  }

  spawnOne({ playerX, cameraX, viewportWidth, viewportHeight, moveDirection }) {
    const velocity = this.velocityRange;
    if (!velocity) return;

    const spawn = this.spawnPoints.length > 0
      ? random(this.spawnPoints)
      : { x: 0, y: 0 };

    this.randomizeSpawnPoint(spawn, {
      cameraX,
      viewportWidth,
      viewportHeight,
      playerX,
      moveDirection
    });

    const directions = this.directionForSpawn
      ? this.directionForSpawn({
        playerX,
        spawnX: spawn.x,
        spawnDistance: this.spawnDistance
      })
      : ["random"];

    if (!directions || directions.length === 0) return;

    const direction = random(directions);
    const isLeft = this.pickDirection(direction, moveDirection);

    const minVx = Math.abs(velocity.vx[0]);
    const maxVx = Math.abs(velocity.vx[1]);
    const vx = random(minVx, maxVx) * (isLeft ? -1 : 1);
    const vy = random(velocity.vy[0], velocity.vy[1]);
    const scale = random(this.scaleRange[0], this.scaleRange[1]);

    this.animals.push(
      new Animal({
        x: spawn.x,
        y: spawn.y,
        vx,
        vy,
        isFacingLeft: isLeft,
        scale
      })
    );
  }

  pickDirection(direction, moveDirection) {
    if (direction === "left") return true;
    if (direction === "right") return false;

    if (moveDirection < 0) {
      return random() < this.spawnDirectionBias;
    }

    if (moveDirection > 0) {
      return random() >= this.spawnDirectionBias;
    }

    return random([true, false]);
  }

  update({ noiseLevel, playerX, cameraX, viewportWidth, viewportHeight, moveDirection }) {
    this.trySpawn({
      noiseLevel,
      playerX,
      cameraX,
      viewportWidth,
      viewportHeight,
      moveDirection
    });

    for (let i = 0; i < this.animals.length; i++) {
      this.animals[i].update();
    }
  }

  draw(cameraX) {
    for (let i = 0; i < this.animals.length; i++) {
      const animal = this.animals[i];
      this.drawer.draw(animal.x - cameraX, animal.y, animal.isFacingLeft, animal.scale);
    }
  }
}