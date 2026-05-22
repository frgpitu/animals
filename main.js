/////////////////////////////////////////
/// All variables
////////////////////////////////////////

//Character / Camera
let player;
let playerX = 1000; //Startlokation, så man ikke kan se den dårlige del af parallaxen
let playerY = 500; //niveauet af banen
let cameraX = 0;

// Game state + world bounds
let gameState;
let worldStartX;
let worldEndX;
let endMargin = 200;
let animalsDisturbed = 0;

// Noise
let noiseLevel = 0; //Collective noise
let walkNoise = 0; // 10
let runNoise = 0; // 20
let motorNoise = 0; //50 atm

// Spawn Controls
let spawnDistance = 100;

const WALK_NOISE = 10;
const RUN_NOISE = 60;
const BIKE_WALK_NOISE = 150;
const BIKE_WALK_MUSIC_NOISE = 220;

//Note, when drawing the use true and false to flip the picture

let birdDrawer;
let deerDrawer;
let foxDrawer;
let owlDrawer;
let birdSpawner;
let deerSpawner;
let foxSpawner;
let owlSpawner;

// Music manager
let musicManager;



function preload() {

  musicManager = new MusicManager();
  musicManager.preload();

  //Animals and Character
  player = new Player(playerX, playerY);
  player.loadAssets();

  //Background
  bg1 = loadImage('./Assets/Background/bg1.png');
  bg2 = loadImage('./Assets/Background/bg2.png');
  bg3 = loadImage('./Assets/Background/bg3.png');

  deerDrawer = new AnimalDrawer("./Assets/DeerAnimation/", 16, 4, 2, 1, false);
  deerDrawer.loadAssets();

  foxDrawer = new AnimalDrawer("./Assets/FoxAnimation/", 16, 4, 2, 1, false);
  foxDrawer.loadAssets();

  owlDrawer = new AnimalDrawer("./Assets/OwlAnimation/", 7, 4, 2, 1, false);
  owlDrawer.loadAssets();
 
  birdDrawer = new AnimalDrawer("./Assets/BirdAnimation/", 6, 4, 2, 1, false);
  birdDrawer.loadAssets();

  const viewWidth = displayWidth;
  const viewHeight = displayHeight;

  birdSpawner = new AnimalSpawner({
    drawer: birdDrawer,
    spawnArea: { xMin: 0, xMax: viewWidth, yMin: viewHeight * 0.3, yMax: viewHeight * 0.5, followCamera: true },
    spawnDistance,
    velocityRange: { vx: [2, 5], vy: [-4, -1] },
    scaleRange: [0.8, 1.2],
    noiseRate: {
      minNoise: 0,
      maxNoise: BIKE_WALK_MUSIC_NOISE,
      minRate: 0.3,
      maxRate: 5
    },
    spawnDirectionBias: 0.7,
    spawnPositionBias: 0.65
  });

  deerSpawner = new AnimalSpawner({
    drawer: deerDrawer,
    spawnArea: { xMin: 0, xMax: viewWidth, yMin: viewHeight * 0.5, yMax: viewHeight * 0.6, followCamera: true },
    spawnDistance,
    velocityRange: { vx: [9, 14], vy: [0, 0] },
    scaleRange: [3, 5],
    noiseRate: {
      minNoise: WALK_NOISE,
      maxNoise: BIKE_WALK_NOISE,
      minRate: 0.06,
      maxRate: 1.5
    },
    spawnDirectionBias: 0.75,
    spawnPositionBias: 0.7
  });

  foxSpawner = new AnimalSpawner({
    drawer: foxDrawer,
    spawnArea: { xMin: 0, xMax: viewWidth, yMin: viewHeight * 0.52, yMax: viewHeight * 0.6, followCamera: true },
    spawnDistance,
    velocityRange: { vx: [5, 9], vy: [0, 0] },
    scaleRange: [2, 3],
    noiseRate: {
      minNoise: WALK_NOISE,
      maxNoise: BIKE_WALK_MUSIC_NOISE,
      minRate: 0.05,
      maxRate: 1
    },
    spawnDirectionBias: 0.7,
    spawnPositionBias: 0.75
  });

  owlSpawner = new AnimalSpawner({
    drawer: owlDrawer,
    spawnArea: { xMin: 0, xMax: viewWidth, yMin: viewHeight * 0.2, yMax: viewHeight * 0.35, followCamera: true },
    spawnDistance,
    velocityRange: { vx: [4, 7], vy: [-3, -0.5] },
    scaleRange: [2,2.5],
    noiseRate: {
      minNoise: WALK_NOISE,
      maxNoise: BIKE_WALK_MUSIC_NOISE + 30,
      minRate: 0.03,
      maxRate: 0.75
    },
    spawnDirectionBias: 0.65,
    spawnPositionBias: 0.6
  });
};

function setup() {
  createCanvas(displayWidth, displayHeight);

  musicManager.setup();

  gameState = new GameStateManager();
  worldStartX = playerX;
  worldEndX = max(bg2.width - endMargin, worldStartX + displayWidth);
};

function draw() {
  background(220);

  if (gameState.isInGame()) {
    player.update();
    clampPlayerToBounds();

    if (playerX >= worldEndX) {
      playerX = worldEndX;
      gameState.endGame();
    }
  }

  //Camera movement
  cameraX = playerX - displayWidth / 2;

  image(bg3, -cameraX * 0.2, 0); // furthest back, slowest
  image(bg2, -cameraX * 0.5, 0); // middle

  musicManager.drawStateDisplay();

  //Calculates the noise we use for our spawning logic
  noiseLevel = musicManager.getMusicNoise() + walkNoise + runNoise + motorNoise; 

  let moveDirection = 0;
  if (keyIsDown(LEFT_ARROW) && !keyIsDown(RIGHT_ARROW)) {
    moveDirection = -1;
  } else if (keyIsDown(RIGHT_ARROW) && !keyIsDown(LEFT_ARROW)) {
    moveDirection = 1;
  }

  if (frameCount % 30 === 0) {
    console.log(
      "music:", musicManager.getMusicNoise(),
      "walk:", walkNoise,
      "run:", runNoise,
      "motor:", motorNoise,
      "TOTAL:", noiseLevel
    );
  }

  if (gameState.isInGame()) {
    birdSpawner.update({
      noiseLevel,
      playerX,
      cameraX,
      viewportWidth: displayWidth,
      viewportHeight: displayHeight,
      moveDirection
    });
    birdSpawner.draw(cameraX);

    deerSpawner.update({
      noiseLevel,
      playerX,
      cameraX,
      viewportWidth: displayWidth,
      viewportHeight: displayHeight,
      moveDirection
    });
    deerSpawner.draw(cameraX);

    foxSpawner.update({
      noiseLevel,
      playerX,
      cameraX,
      viewportWidth: displayWidth,
      viewportHeight: displayHeight,
      moveDirection
    });
    foxSpawner.draw(cameraX);

    owlSpawner.update({
      noiseLevel,
      playerX,
      cameraX,
      viewportWidth: displayWidth,
      viewportHeight: displayHeight,
      moveDirection
    });
    owlSpawner.draw(cameraX);

    animalsDisturbed =
      birdSpawner.animals.length +
      deerSpawner.animals.length +
      foxSpawner.animals.length +
      owlSpawner.animals.length;
  }

  image(bg1, -cameraX * 1.0, 0); // front, fastest
  image(bg1, -cameraX * 1.0 + bg1.width, 0); // front, fastest, shifted right


  player.display();

  // Controls what happens when we toggle the controls to be visible
  musicManager.drawControlsMenu();

  if (gameState.isStart()) {
    gameState.drawStartOverlay();
  }

  if (gameState.isEndScreen()) {
    gameState.drawEndOverlay(animalsDisturbed);
  }
};




////////////////////
/// Functions
///////////////////

function clampPlayerToBounds() {
  if (playerX < worldStartX) {
    playerX = worldStartX;
  }
}

function resetSpawner(spawner) {
  if (!spawner) return;
  spawner.animals = [];
  spawner.spawnAccumulator = 0;

  if (!spawner.spawnPoints) return;
}

function resetGame() {
  animalsDisturbed = 0;
  walkNoise = 0;
  runNoise = 0;
  motorNoise = 0;
  noiseLevel = 0;

  resetSpawner(birdSpawner);
  resetSpawner(deerSpawner);
  resetSpawner(foxSpawner);
  resetSpawner(owlSpawner);

  playerX = worldStartX;
  player.x = playerX;
}

function keyPressed() {
  musicManager.handleKeyPressed(keyCode);
  noiseLevel = musicManager.getMusicNoise(); // Instantly updates the value on key press

  if (gameState) {
    gameState.handleStartInput(keyCode);
    if (gameState.handleEndInput(keyCode)) {
      resetGame();
      gameState.startGame();
    }
  }
};



