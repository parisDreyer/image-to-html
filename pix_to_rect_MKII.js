
function possibleRects(data, canvas, ctx){

    let avgColor = getAverageRGB(data.data);
    let allColors = getAllColors(data.data);
    console.log(allColors);
    // return getRects(canvas, ctx, avgColor);
    let colorRegions = {};

    for(let i = 0; i < allColors.length; ++i){
        let currColor = hexToRgb(allColors[i]);
        colorRegions[i] = {
          hex: allColors[i],
          regions: allRegionsForColor(
              cloneCanvasContext(canvas), 
                currColor, canvas.height, canvas.width, avgColor
            )
        }
    }
    return colorRegions;
}


function cloneCanvasContext(oldCanvas) {

    // get rid of old canvas if present
    let old_temp = document.getElementById('temp-canvas');
    if(old_temp) old_temp.parentNode.removeChild(old_temp);

    //create a new canvas
    let newCanvas = document.createElement('canvas');
    newCanvas.setAttribute("id", "temp-canvas"); // set this to remove later
    let context = newCanvas.getContext('2d');

    //set dimensions
    newCanvas.width = oldCanvas.width;
    newCanvas.height = oldCanvas.height;

    //apply the old canvas to the new one
    context.drawImage(oldCanvas, 0, 0);

    //return the new canvas
    // return newCanvas;
    return newCanvas.getContext('2d');
}



function allRegionsForColor(ctx, targetColor, height, width, nullColor){
    console.log(targetColor);

    let foundRegions = [];
    while(true){
        let x = 0; y = 0;
        let cannotend = true;
        while(x < width && cannotend){
            while(y < height && cannotend){
                if(colorMatch(rgbaAtImgCoordinate(ctx, x,y), targetColor)){
                    cannotend = false;
                    let res = floodSearch(ctx, targetColor, x,y, nullColor);
                    ctx = res.context;
                    let Xs = res.xs, Ys = res.ys;
                    let resX = Xs.sort(), resY = Ys.sort();
                    let xmin = resX[0], ymin = resY[0];
                    let xmax = resX[resX.length - 1], ymax= resY[resY.length - 1];
                    if(xmin < xmax || ymin < ymax)
                    foundRegions.push({ start: [xmin, ymin], end: [xmax,ymax] });
                    
                }
                y++;
            }
            x++;
        }
        if (x >= width && y >= height) break;
    }
    return foundRegions;
}



// addapted from pseudocode at
// https://stackoverflow.com/questions/21865922/non-recursive-implementation-of-flood-fill-algorithm
function floodSearch(ctx, target_color, x, y, nullColor) {
    let Xs = [], Ys = [];

    let stack = []; // stack is dfs, queue is bfs
    stack.push([x,y]);
    while(stack.length > 0){
        let coord = stack.pop();
        if (colorMatch(rgbaAtImgCoordinate(ctx, coord[0], coord[1]), target_color)) {
            colorCTX(ctx, coord[0], coord[1], nullColor);
            Xs = Xs.sort();
            Xs.length > 2 ? Xs[1] = coord[0] : Xs.push(coord[0]);
            Ys.length > 3 ? Ys[-1] = coord[1] : Ys.push(coord[1]);
            let lstX = Xs[Xs.length - 1];
            let lstY = Ys[Ys.length - 1]; // the bottom right y
            if (!pointInRect(Xs[0], Ys[0], lstX, Ys[0], Xs[0], lstY, lstX, lstY, coord[0] - 1, coord[1]))
                stack.push([coord[0]-1, coord[1]]);
            if (!pointInRect(Xs[0], Ys[0], lstX, Ys[0], Xs[0], lstY, lstX, lstY, coord[0] + 1, coord[1]))
                stack.push([coord[0]+1, coord[1]]);
            if (!pointInRect(Xs[0], Ys[0], lstX, Ys[0], Xs[0], lstY, lstX, lstY, coord[0], coord[1] - 1))
                stack.push([coord[0], coord[1]-1]);
            if (!pointInRect(Xs[0], Ys[0], lstX, Ys[0], Xs[0], lstY, lstX, lstY, coord[0], coord[1] + 1))
                stack.push([coord[0], coord[1]+1]);
        }

    }
    return { xs: Xs, ys: Ys, context: ctx };
}


// https://www.geeksforgeeks.org/check-whether-given-point-lies-inside-rectangle-not/
    // A utility function to calculate area 
    // of triangle formed by (x1, y1),  
    // (x2, y2) and (x3, y3) 
    function area( x1,  y1,  x2,  y2,  x3,  y3) { 
        return Math.abs((x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2.0); 
    } 
          
    // A function to check whether point P(x, y)  
    // lies inside the rectangle formed by A(x1, y1),  
    // B(x2, y2), C(x3, y3) and D(x4, y4)  
function pointInRect(x1, y1, x2, y2, x3, y3, x4, y4, x, y) {          
        // Calculate area of rectangle ABCD  
        let A = area(x1, y1, x2, y2, x3, y3) + area(x1, y1, x4, y4, x3, y3); 
        // Calculate area of triangle PAB  
        let A1 = area(x, y, x1, y1, x2, y2); 
        // Calculate area of triangle PBC  
        let A2 = area(x, y, x2, y2, x3, y3); 
        // Calculate area of triangle PCD  
        let A3 = area(x, y, x3, y3, x4, y4);  
        // Calculate area of triangle PAD 
        let A4 = area(x, y, x1, y1, x4, y4); 
        // Check if sum of A1, A2, A3   
        // and A4is same as A  
        return (A == A1 + A2 + A3 + A4); 
    } 



function colorCTX(ctx, x,y, rgb){
    ctx.fillStyle = "rgba(" + rgb.red + "," + rgb.green + "," + rgb.blue + "," + 
    rgb.alpha ? (rgb.alpha / 255) : 1 + ")" ;
    ctx.fillRect(x, y, 1, 1);
    return ctx
}

function getAllColors(imgData, blockSize = 5) { 
    
    let colors = {};
    let length = imgData.length;
    let i = 0;
    while ((i += blockSize * 4) < length) {
        let rgb = { red: 0, green: 0, blue: 0 };
        rgb.red = imgData[i]
        rgb.green = imgData[i + 1];
        rgb.blue = imgData[i + 2];
        colors[colorToHex(rgb)] = true;
    }
    return Object.keys(colors);
}


// https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}
function colorToHex(c) {
  return "#" + componentToHex(c.red) + componentToHex(c.green) + componentToHex(c.blue);
}

function hexToRgb(hex) { // https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        red: parseInt(result[1], 16),
        green: parseInt(result[2], 16),
        blue: parseInt(result[3], 16)
      }
    : null;
}


// visit every 5 pixels
function getAverageRGB(imgData, blockSize = 5) {
    let rgb = { r: 0, g: 0, b: 0 };
    let count = 0;
    let length = imgData.length;
    let i = 0;
    while((i += blockSize * 4) < length) {
        ++count;
        rgb.r += imgData[i]
        rgb.g += imgData[i +1];
        rgb.b += imgData[i + 2];
    } // ~~ used to floor values
    rgb.r = ~~(rgb.r / count);
    rgb.g = ~~(rgb.g / count);
    rgb.b = ~~(rgb.b / count);
    return rgb;
}


// gets the rgba color value for an x,y coordinate
// this returns an object with the value for each red,green,blue,alpha, as well as a css string
function rgbaAtImgCoordinate(ctx, x, y) {
    const pixel = ctx.getImageData(x, y, 1, 1);
    const data = pixel.data;
    const rgba = 'rgba(' + data[0] + ', ' + data[1] +
    ', ' + data[2] + ', ' + (data[3] / 255) + ')';
    return {
        rgba_string: rgba,
        red: data[0],
        green: data[1],
        blue: data[2],
        alpha: (data[3] / 255)
    };
}


// returns true if two rgba values are within the rgbaAllowedDelta (e.g. integer 2 (represents px)) of each other
function colorMatch(rgba1, rgba2, rgbaAllowedDelta = 5) {
    if (!rgba1 || !rgba2) return false;
    return (
        Math.abs(rgba1.red - rgba2.red) <= rgbaAllowedDelta &&
        Math.abs(rgba1.green - rgba2.green) <= rgbaAllowedDelta &&
        Math.abs(rgba1.blue - rgba2.blue) <= rgbaAllowedDelta //&&
        // Math.abs(rgba1.alpha - rgba2.alpha) <= rgbaAllowedDelta
        );
}
