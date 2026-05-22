const GAME_STATES = Object.freeze({
  START: "START",
  IN_GAME: "IN_GAME",
  END_SCREEN: "END_SCREEN"
});

class GameStateManager {
  constructor() {
    this.state = GAME_STATES.START;
  }

  isStart() {
    return this.state === GAME_STATES.START;
  }

  isInGame() {
    return this.state === GAME_STATES.IN_GAME;
  }

  isEndScreen() {
    return this.state === GAME_STATES.END_SCREEN;
  }

  startGame() {
    this.state = GAME_STATES.IN_GAME;
  }

  endGame() {
    this.state = GAME_STATES.END_SCREEN;
  }

  handleStartInput(keyCode) {
    if (!this.isStart()) return;

    if (keyCode === ENTER || keyCode === 32) {
      this.startGame();
    }
  }

  handleEndInput(keyCode) {
    if (!this.isEndScreen()) return;

    if (keyCode === 82) {
      return true;
    }

    return false;
  }

  drawStartOverlay() {
    push();
    fill(0, 0, 0, 150);
    rect(0, 0, displayWidth, displayHeight);

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(26);
    text("Start", displayWidth / 2, displayHeight * 0.2);

    textSize(16);
    text(
      "Controls: Left/Right arrow. Shift: run. M: motorbike.\n" +
        "X: play/pause music. C: skip song.\n" +
        "Goal: Reach the end of the forest without making too much noise.\n" +
        "Press Enter or Space to start.",
      displayWidth / 2,
      displayHeight * 0.45
    );
    pop();
  }

  drawEndOverlay(animalsDisturbed) {
    push();
    fill(0, 0, 0, 160);
    rect(0, 0, displayWidth, displayHeight);

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(24);
    text("End", displayWidth / 2, displayHeight * 0.25);

    textSize(18);
    text(
      "You disturbed " +
        animalsDisturbed +
        " animals in the forest with your noise",
      displayWidth / 2,
      displayHeight * 0.5
    );

    textSize(14);
    text("Press R to try again", displayWidth / 2, displayHeight * 0.62);
    pop();
  }
}
