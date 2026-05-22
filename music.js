class MusicManager {
	constructor() {
		this.musicNoise = 0;

		this.music = [];
		this.song1 = null;
		this.song2 = null;
		this.song3 = null;
		this.song4 = null;
		this.currentSong = 0;
		this.isStopped = true; // Sets initial state so it doesn't autoplay

		// Coordinates for musicstate buttons
		this.x1 = 10;
		this.y1 = 10;
		this.x2 = 50;
		this.y2 = 25;
		this.y3 = 40;
		this.x3 = 30;

		// Music state display
		this.showControls = false; // Sets initial state of our controls to invisible
		this.controlsButton = null; // It's a button

		// Menu Colors
		this.goldC = null;
		this.brownC = null;
		this.textC = null;
		this.boxP = null;
		this.textP = null;
	}

	preload() {
		this.song1 = createAudio("./Assets/Music/ICan_tExplain.mp3");
		this.song2 = createAudio("./Assets/Music/135.mp3");
		this.song3 = createAudio("./Assets/Music/Chicago.mp3");
		this.song4 = createAudio("./Assets/Music/EmotionlessThoughts.mp3");

		// We store the music in an array so it is easier to call later
		this.music = [this.song1, this.song2, this.song3, this.song4];

		// this controls so next songs play automatically when the current one ends.
		for (let i = 0; i < this.music.length; i++) {
			this.music[i].elt.onended = () => this.nextSong();
			// bit of html, elt is basically an element in this case our <audio> from html
			// and oneded is when the audio finishes
		}
	}

	setup() {
		// Controlmenu colors and position
		this.goldC = color(118, 93, 26);
		this.brownC = color(40, 25, 20);
		this.textC = color(255);
		this.boxP = [150, 150, 250, 75];
		this.textP = [160, 160];
		// Quick note. Array is used because if we use () the , reads everything but only returns the last value.

		// Button
		this.controlsButton = createControlsButton(100, 10, "Controls", controlMenu);
	}

	getMusicNoise() {
		return this.musicNoise;
	}

	toggleControls() {
		this.showControls = !this.showControls; // Toggle visibility
	}

	drawControlsMenu() {
		if (this.showControls) {
			push();
			strokeWeight(4);
			stroke(this.goldC);
			fill(this.brownC);
			rect(...this.boxP); // Box still needs to be drawn manually.. Also we use the ... to load the entire array for some godforsaken reason.

			noStroke();
			fill(this.textC);
			textAlign(LEFT, TOP);
			textSize(12);
			text("X: Starts/pauses the song\nC: Skips the current song", ...this.textP); // Manual input for text coordinates
			// also the \n makes a new line and the next line starts at the n otherwise there will be a space
			// It's a bit odd but it works so who gives
			pop();
		}
	}

	handleKeyPressed(keyCode) {
		// Play and pause, 88 is KC for X
		if (keyCode === 88) {
			if (this.isStopped) {
				this.music[this.currentSong].play();
				this.isStopped = false; // This defines our music state which we use to control the statedisplay
				this.musicNoise = 50; // we define our values here and then in draw we make the sum math.
			} else {
				this.music[this.currentSong].pause();
				this.isStopped = true;
				this.musicNoise = 0;
			}
		}

		// This should be pretty straightforward
		// 67 is KC C
		if (keyCode === 67) {
			this.music[this.currentSong].stop();
			this.currentSong++;
			if (this.currentSong >= this.music.length) {
				this.currentSong = 0;
			}

			this.music[this.currentSong].play();
			this.isStopped = false;
		}

		return this.musicNoise;
	}

	nextSong() {
		this.currentSong++;

		if (this.currentSong >= this.music.length) {
			this.currentSong = 0; // loop back to start
		}

		this.music[this.currentSong].play();
		this.isStopped = false;
	}

	// We just use this to display the current state our music to the player
	drawStateDisplay() {
		fill(0);

		if (this.isStopped) {
			triangle(this.x1, this.y1, this.x2, this.y2, this.x1, this.y3);
		} else {
			rect(this.x1, this.y1, this.x1, this.y2);
			rect(this.x3, this.y1, this.x1, this.y2);
		}
	}
}
