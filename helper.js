function loadAnimation(path, count, padding = 3, startAt = 0, useUnderscore = true) {
  let imgList = [];
  
  for (let i = 0; i < count; i++) {
    // 1. Calculate the current file number (e.g., start at 0 or 1)
    let fileNum = i + startAt;
    
    // 2. Format the number with padding (e.g., 2 digits "01" or 3 digits "001")
    let numStr = nf(fileNum, padding); 
    
    // 3. Construct the path
    // If useUnderscore is true: path_001.png
    // If useUnderscore is false: path/01.png (assuming path ends in /)
    let separator = useUnderscore ? "_" : "";
    let fullPath = path + separator + numStr + ".png";
    
    imgList.push(loadImage(fullPath));
  }
  return imgList;
}