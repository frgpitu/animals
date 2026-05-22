//Clean up all the comments when time is avaiable and translate to english.
//you have to click once to start audio because google...

/////////////////////////////////////////
/// All variables
////////////////////////////////////////

//Character / Camera
let player;
let playerX = 1000; //Startlokation, så man ikke kan se den dårlige del af parallaxen
let playerY = 500; //niveauet af banen
let cameraX = 0;

// Noise
let noiseLevel; //Collective noise
let musicNoise; // 28
let walkNoise; // 8
let runNoise; // 18
let motorNoise; //45

// Spawn Controls
let lastSpawnTime = 0;     // time when birds last spawned
let spawnCooldown = 6000;  // 6 seconds for testing
let spawnDistance = 100;
//Thresholds
let birdThreshold = 10;
let owlThreshold = 18;
let deerThreshold = 22;
let foxThreshold = 30;

//Spawn Points for animals
//We use arrays to store the locations so it is easier to manage, and we use lastspawnTime, to manually adjust it, for some fucking reason
let birdSpawns = [
  { x: 200, y: 400, lastSpawnTime: 0},
  { x: 600, y: 400, lastSpawnTime: 0},
  { x: 1300, y: 400, lastSpawnTime: 0}
];

let owlSpawns = [
  { x: 200, y: 400, lastSpawnTime: 0}
];
let deerSpawns = [
  { x: 400, y: 500, lastSpawnTime: 0},
  { x: 1000, y: 500, lastSpawnTime: 0},
  { x: 1600, y: 500, lastSpawnTime: 0}
];

let foxSpawns = [
  { x: 400, y: 500, lastSpawnTime: 0},
  { x: 1000, y: 500, lastSpawnTime: 0},
  { x: 1600, y: 500, lastSpawnTime: 0}
];

//Speed of animal movement on each axis, defined later per spawned object so it's only one variable
let vx = 0; 
let vy = 0;

//Note, when drawing the use true and false to flip the picture

let fox;
let foxesRight = [];
let foxesLeft = [];

let owl;
let owls = [];

let bird;
let birdsRight = []; 
let birdsLeft = [];

let deer;
let deersRight = [];
let deersLeft = [];

//Music variables
let music = [];
let song1, song2, song3, song4;
let currentSong = 0;
let isStopped = true; //Sets initial state so it doesn't autoplay
let audioUnlocked = false;

//Coordinates for musicstate buttons
let x1 = 10;
let y1 = 10;
let x2 = 50;
let y2 = 25;
let y3 = 40;
let x3 = 30;

//Music state display
let showControls = false;  //Sets initial state of our controls to invisible
let controlsButton; //It's a button

//Menu Colors
let goldC;
let brownC;
let textC;
let boxP; 
let textP;



function preload() {

  //Animals and Character
  player = new Player(playerX, playerY);
  player.loadAssets();

  deer = new AnimalSpawner("./Assets/DeerAnimation/", 16, 4, 2, 1, false);
  deer.loadAssets();

  fox = new AnimalSpawner("./Assets/FoxAnimation/", 16, 4, 2, 1, false);
  fox.loadAssets();

  owl = new AnimalSpawner("./Assets/OwlAnimation/", 7, 4, 2, 1, false);
  owl.loadAssets();

  bird = new AnimalSpawner("./Assets/BirdAnimation/", 6, 4, 2, 1, false);
  bird.loadAssets();
  
  //Music
  song1 = createAudio("./Assets/Music/ICan_tExplain.mp3");
  song2 = createAudio("./Assets/Music/135.mp3");
  song3 = createAudio("./Assets/Music/Chicago.mp3");
  song4 = createAudio("./Assets/Music/EmotionlessThoughts.mp3");

  //Background
  bg1 = loadImage('./Assets/Background/bg1.png');
  bg2 = loadImage('./Assets/Background/bg2.png');
  bg3 = loadImage('./Assets/Background/bg3.png');

  //We store the music in an array so it is easier to call later
  music = [song1, song2, song3, song4];

  // this controls so next songs play automatically when the current one ends.
  for (let i = 0; i < music.length; i++) {
    music[i].elt.onended = nextSong; 
    //bit of html, elt is basically an element in this case our <audio> from html 
    // and oneded is when the audio finishes
  }

  // SOUND Effects
  // In future make all audiofiles loadSound, so much easier to manage, and possibilities
  ambience = loadSound("./Assets/sfx/ambience.mp3");
  deerRun = loadSound("./Assets/sfx/Deer_run.mp3");
  birdsStartled = loadSound("./Assets/sfx/startled_birds.mp3");
  foxStartled = loadSound("./Assets/sfx/bushRustling.mp3");
  owlStartled = loadSound("./Assets/sfx/owl.mp3");
  walking = loadSound("./Assets/sfx/walkingGrass.mp3");
  running = loadSound("./Assets/sfx/runningGrass.mp3");
  motorbiking = loadSound("./Assets/sfx/motorbike.mp3");
  
};

function setup() {
  createCanvas(displayWidth, displayHeight);

  //Controlmenu colors and position
  goldC = color(118, 93, 26);
  brownC = color(40, 25, 20);
  textC = color (255);
  boxP = [150, 150, 250, 75];
  textP = [160, 160];
  //Quick note. Array is used because if we use () the , reads everything but only returns the last value.

  //Button
  controlsButton = createControlsButton(100, 10, "Controls", controlMenu);
};

function draw() {
  background(220);

  //Background
  image(bg3, -cameraX * 0.2, 0); // furthest back, slowest
  image(bg2, -cameraX * 0.5, 0); // middle
  image(bg1, -cameraX * 1.0, 0); // front, fastest

  musicStateDisplay();
  
  //Camera movement
  cameraX = playerX - displayWidth / 2; 

  //Calculates the noise we use for our spawning logic
  //Problems with music noise being NAN so we use ?? on them so that if our left value
  //musicNoise is NAN then it will use the right operator being 0 here
  //Also if it is defined then it uses the left operator
  noiseLevel =
  (musicNoise ?? 0) +
  (walkNoise ?? 0) +
  (runNoise ?? 0) +
  (motorNoise ?? 0);

  //Console log for noise amounts, need to fix the walknoise always being active when moving even if using other running, but not to important 
  if (frameCount % 30 === 0) {
  console.log(
    "music:", musicNoise,
    "walk:", walkNoise,
    "run:", runNoise,
    "motor:", motorNoise,
    "TOTAL:", noiseLevel
  );
}

  player.update();
  player.display();



  // Controls what happens when we toggle the controls to be visible
  if (showControls) {
    push();
    strokeWeight(4);
    stroke(goldC);
    fill(brownC);
    rect(...boxP); //Box still needs to be drawn manually.. Also we use the ... to load the entire array for some godforsaken reason.
  
    noStroke();
    fill(textC);
    textAlign(LEFT, TOP);
    textSize(12);
    text("X: Starts/pauses the song\nC: Skips the current song", ...textP); //Manual input for text coordinates
    // also the \n makes a new line and the next line starts at the n otherwise there will be a space
    // It's a bit odd but it works so who gives
    pop();
  };

  //////////////////////////////////////////////////////////
  /// All the animal Logic.... beware it can be overwhelming
  //////////////////////////////////////////////////////////

  //Here we use the noiseLevel from draw to determine whether we can render the animation.
  //Furthermore i've added && millis, which we use here to make sure the they aren't rendered an infinite amount of times basically
  // millis() - lastSpawnTime >= spawnCooldown, millis is a built in function which counts in milliseconds, and it is set for 6 seconds atm
    
  // Bit overwhelming at first glance, but just think of - as left and + as right 
  //This functions as a constrainer so it only when all of these variables are true, the spawning is allowed to happen.

  //// Bird Spawning
  for (let i = 0; i < birdSpawns.length; i++) {
    let spawn = birdSpawns[i];
 
   if (
      noiseLevel >= birdThreshold &&
      millis() - spawn.lastSpawnTime >= spawnCooldown &&
      playerX > spawn.x - spawnDistance &&
      playerX < spawn.x + spawnDistance) {
      spawnBirdsRight(spawn.x, spawn.y);
      spawnBirdsLeft(spawn.x, spawn.y);
      spawn.lastSpawnTime = millis();
    };
  };
  

  // Birds RIGHT
  for (let i = 0; i < birdsRight.length; i++) {
    let b1 = birdsRight[i];
    b1.x += b1.vx;
    b1.y += b1.vy;
    bird.draw(b1.x - cameraX, b1.y, false, 60, 60);

    if (frameCount % 6 == 0) {
      b1.frame++;
      if (b1.frame >= bird.frames.length) b1.frame = 0;
    }
  }

  // Birds LEFT
  for (let i = 0; i < birdsLeft.length; i++) {
    let b1 = birdsLeft[i];
    b1.x += b1.vx;
    b1.y += b1.vy;
    bird.draw(b1.x - cameraX, b1.y, true, 60, 60);

    if (frameCount % 6 == 0) {
      b1.frame++;
      if (b1.frame >= bird.frames.length) b1.frame = 0;
    }
  }

  //// Owl Spawning
  for (let i = 0; i < owlSpawns.length; i++) {
    let spawn = owlSpawns[i];
 
   if (
      noiseLevel >= owlThreshold &&
      millis() - spawn.lastSpawnTime >= spawnCooldown &&
      playerX > spawn.x - spawnDistance &&
      playerX < spawn.x + spawnDistance) {
      spawnOwl(spawn.x, spawn.y);
      spawn.lastSpawnTime = millis();
    };
  };

  // Owl 
  for (let i = 0; i < owls.length; i++) {
    let o1 = owls[i];
    o1.x += o1.vx;
    o1.y += o1.vy;
    owl.draw(o1.x - cameraX, o1.y, o1.flip, 80, 80);

    if (frameCount % 6 == 0) {
      o1.frame++;
      if (o1.frame >= owl.frames.length) o1.frame = 0;
    }
  }
  //// Deer Spawning
  for (let i = 0; i < deerSpawns.length; i++) {
    let spawn = deerSpawns[i];
 
   if (
    noiseLevel >= deerThreshold &&
    millis() - spawn.lastSpawnTime >= spawnCooldown &&
    playerX > spawn.x - spawnDistance &&
    playerX < spawn.x + spawnDistance) {

    if (previousPlayerX < spawn.x) {
      spawnDeerRight(spawn.x, spawn.y);

    } else if (previousPlayerX > spawn.x) {
      spawnDeerLeft(spawn.x, spawn.y);
    }

    spawn.lastSpawnTime = millis();
    };
  };

  // Deer RIGHT
  for (let i = 0; i < deersRight.length; i++) {
    let d1 = deersRight[i];
    d1.x += d1.vx;
    deer.draw(d1.x - cameraX, d1.y, false, 250, 250);

    if (frameCount % 6 == 0) {
      d1.frame++;
      if (d1.frame >= deer.frames.length) d1.frame = 0;
    }
  }

  // Deer LEFT
  for (let i = 0; i < deersLeft.length; i++) {
    let d1 = deersLeft[i];
    d1.x += d1.vx;
    deer.draw(d1.x - cameraX, d1.y, true, 250, 250);

    if (frameCount % 6 == 0) {
      d1.frame++;
      if (d1.frame >= deer.frames.length) d1.frame = 0;
    }
  }

  //// Foxes Spawning
  for (let i = 0; i < foxSpawns.length; i++) {
    let spawn = foxSpawns[i];
 
   if (
    noiseLevel >= foxThreshold &&
    millis() - spawn.lastSpawnTime >= spawnCooldown &&
    playerX > spawn.x - spawnDistance &&
    playerX < spawn.x + spawnDistance) {

    if (previousPlayerX < spawn.x) {
      spawnFoxesRight(spawn.x, spawn.y);

    } else if (previousPlayerX > spawn.x) {
      spawnFoxesLeft(spawn.x, spawn.y);
    }

    spawn.lastSpawnTime = millis();
    };
  };

  // Fox RIGHT
  for (let i = 0; i < foxesRight.length; i++) {
    let f1 = foxesRight[i];
    f1.x += f1.vx;
    fox.draw(f1.x - cameraX, f1.y, false, 120, 120);

    if (frameCount % 6 == 0) {
      f1.frame++;
      if (f1.frame >= fox.frames.length) f1.frame = 0;
    }
  }

  // Fox LEFT
  for (let i = 0; i < foxesLeft.length; i++) {
    let f1 = foxesLeft[i];
    f1.x += f1.vx;
    fox.draw(f1.x - cameraX, f1.y, true, 120, 120);

    if (frameCount % 6 == 0) {
      f1.frame++;
      if (f1.frame >= fox.frames.length) f1.frame = 0;
    }
  }
previousPlayerX = playerX;
};


////////////////////
/// Functions
///////////////////

function spawnBirdsLeft(x, y) {
  // random number of birds (1–10) 
  let amount = random(1, 4);
    
  birdsStartled.play(); //Plays sound once only
    //Controls position and speed of our birds
    for (let i = 0; i < amount; i++) {
      birdsLeft.push({ //Change to new array
      x: x, 
      y: y,
      vx: random(-4, -2), //Need to change this later so we have intervals like
      vy: random(-3, -0.5), // -3 - -2 and 1 - 3 so there is more consistency in the flight speed and they don't crawl of the screen
      frame: 0
     })
    };
};

function spawnBirdsRight(x, y) {
  // random number of birds (1–10) 
  let amount = random(1, 4);
    
  birdsStartled.play();
    //Controls position and speed of our birds
    for (let i = 0; i < amount; i++) {
      birdsRight.push({ 
      x: x, 
      y: y,
      vx: random(2, 4), 
      vy: random(-3, -0.5),
      frame: 0
     })
    };
};

function spawnOwl(x, y) {
  // random number of birds (1–10) 
  let amount = random(1, 2);
    
  owlStartled.play();
    //Controls position and speed of our birds
    for (let i = 0; i < amount; i++) {
      let vx = random ([
        random(-4, -2),
        random(2, 4)
      ]);
      
      owls.push({ 
      x: x, 
      y: y,
      vx: vx, 
      vy: random(-3, -0.5),
      flip: vx < 0,
      frame: 0
     })
    };
};

function spawnDeerLeft(x, y) {
  let amount = random(1, 3);

  deerRun.play();
    for (let i = 0; i < amount; i++) {
      deersLeft.push({
      x: x, //Okay så det her er lidt spøjst men vi siger i vores function at vi skal passe x, y for spawnpoints
      y: y, //Og de værdier får oppe i vores for loop, så vi skal bare passe x: x for at det fungerer fordi at spawns.x = deerSpawns[i] som er vores array
        vx: random(-5, -3), //får muligvis animation til at køre for hurtigt
        frame: 0 //Makes it so each deer tracks it's own animation
      });
    };
};

function spawnDeerRight(x, y) {
  let amount = random(1, 3);

  deerRun.play();
    for (let i = 0; i < amount; i++) {
      deersRight.push({
      x: x, //Okay så det her er lidt spøjst men vi siger i vores function at vi skal passe x, y for spawnpoints
      y: y, //Og de værdier får oppe i vores for loop, så vi skal bare passe x: x for at det fungerer fordi at spawns.x = deerSpawns[i] som er vores array
        vx: random(3, 5), //får muligvis animation til at køre for hurtigt
        frame: 0 //Makes it so each deer tracks it's own animation
      });
    };
};

function spawnFoxesRight(x, y) {
  let amount = 1;

  foxStartled.play();
    for (let i = 0; i < amount; i++) {
      foxesRight.push({
      x: x, //Okay så det her er lidt spøjst men vi siger i vores function at vi skal passe x, y for spawnpoints
      y: y, //Og de værdier får oppe i vores for loop, så vi skal bare passe x: x for at det fungerer fordi at spawns.x = deerSpawns[i] som er vores array
        vx: random(2, 4), //får muligvis animation til at køre for hurtigt
        frame: 0 //Makes it so each deer tracks it's own animation
      });
    };
};

function spawnFoxesLeft(x, y) {
  let amount = 1;

  foxStartled.play();
    for (let i = 0; i < amount; i++) {
      foxesLeft.push({
      x: x, //Okay så det her er lidt spøjst men vi siger i vores function at vi skal passe x, y for spawnpoints
      y: y, //Og de værdier får oppe i vores for loop, så vi skal bare passe x: x for at det fungerer fordi at spawns.x = deerSpawns[i] som er vores array
        vx: random(-4, -2), //får muligvis animation til at køre for hurtigt
        frame: 0 //Makes it so each deer tracks it's own animation
      });
    };
};


function keyPressed() {

     // Play and pause, 88 is KC for X
    if (keyCode === 88) {
        if (isStopped) {
            music[currentSong].volume (0.4);
            music[currentSong].play();
            isStopped = false; // This defines our music state which we use to control the statedisplay 
            musicNoise = 28; //we define our values here and then in draw we make the sum math.
            noiseLevel = musicNoise; //we do this here also, so that when we press X it instantly updates the value

        } else {
            music[currentSong].pause();
            isStopped = true;
            musicNoise = 0;
        }
    }

    //This should be pretty straightforward
    // 67 is KC C
      if (keyCode === 67) {
        music[currentSong].stop();
        currentSong++;
        if (currentSong >= music.length) {
        currentSong = 0;
      }

      music[currentSong].play();
      isStopped = false;
    }
};

function nextSong() {
  currentSong++;

  if (currentSong >= music.length) {
    currentSong = 0; // loop back to start
  }

  music[currentSong].play();
  isStopped = false;
};

// We just use this to display the current state our music to the player
function musicStateDisplay() {
    fill (0);

    if (isStopped) { 
        triangle (x1, y1, x2, y2, x1, y3);
    } else {
        rect (x1, y1, x1, y2);
        rect (x3, y1, x1, y2);
    }
};

function controlMenu() {
  console.log("clicked");
  showControls = !showControls; //Toggle visibility, and for some reason we need to use !, which basically makes the reverse true if that makes sense
}

function createControlsButton(x, y, text, onClickFunction) {
let controlsButton = createButton(text) 
  

  controlsButton.position(x, y);

  //minimum size of button
  controlsButton.style('min-width', '100px');
  controlsButton.style('min-height', '50px');

  //Control for text so it doesn't touch borders (padding) and 15px top and bottom, and 25px left and right
  controlsButton.style('padding', '15px 25px');
  

  //Background and border
  controlsButton.style('background-color', '#52342B');
  controlsButton.style('border', '8px solid #765D1A');

  //Text style
  controlsButton.style('color', '#ffffff'); // White text

  // Set margin and cursor style
  controlsButton.style('margin', '10px');
  controlsButton.style('cursor', 'pointer');

  controlsButton.style('white-space', 'normal');   // allows wrapping
  controlsButton.style('text-align', 'center');
  controlsButton.style('word-wrap', 'break-word');
  controlsButton.style('max-width', '250px'); //Prevents text from becoming to long

  if (onClickFunction) {
    controlsButton.mousePressed(onClickFunction);
  }

  return controlsButton;
};

function mousePressed() {
  if (!audioUnlocked) {
    userStartAudio();

    ambience.setVolume(0.4);
    ambience.loop();

    audioUnlocked = true;
  //This is added because google.... They require interaction before audio/visuals can play... ffs
  }
};
