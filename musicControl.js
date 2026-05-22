
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


function controlMenu() {
  console.log("clicked");
  musicManager.toggleControls(); // Toggle visibility
}