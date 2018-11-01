
function possibleRects(data, canvas, ctx){

    let avgColor = getAverageRGB(data.data);
    let topLeftColor = rgbaAtImgCoordinate(ctx, 0, 0);
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
                currColor, canvas.height, canvas.width, topLeftColor
            )
        }
        console.log(colorRegions[i].regions.length);
    }
    return Object.values(colorRegions).filter(obj => obj.regions.length > 0);
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
    // console.log(targetColor);

    let foundRegions = [];
        let p = 0;
        let cannotend = true;
        while(cannotend){
            if(colorMatch(rgbaAtImgCoordinate(ctx, p,p), targetColor)){
                cannotend = false;

                // search converging sections of the image from each corner
                // top left
                let res = searchPointByRegion(ctx, targetColor, p, p, nullColor, width, height);
                if(res.start && res.end) foundRegions.push({start: res.start, end: res.end})
                ctx = res.context;
                // top right
                res = searchPointByRegion(ctx, targetColor, width - p, p, nullColor, width, height);
                if (res.start && res.end) foundRegions.push({ start: res.start, end: res.end })
                ctx = res.context;
                // bottom left
                res = searchPointByRegion(ctx, targetColor, p, height - p, nullColor, width, height);
                if (res.start && res.end) foundRegions.push({ start: res.start, end: res.end })
                ctx = res.context;
                // bottom right
                res = searchPointByRegion(ctx, targetColor, width - p, height - p, nullColor, width, height);
                if (res.start && res.end) foundRegions.push({ start: res.start, end: res.end })
                ctx = res.context;
            }
            p+=10;//++;
            if (p >= width || p >= height) break;
        }
        return foundRegions;
}

function searchPointByRegion(ctx, targetColor, p, nullColor, width, height){
    let res = floodSearch(ctx, targetColor, p, p, nullColor, width, height);
    ctx = res.context;
    let Xs = res.xs, Ys = res.ys;
    let resX = Xs.sort(), resY = Ys.sort();
    let xmin = resX[0], ymin = resY[0];
    let xmax = resX[resX.length - 1], ymax = resY[resY.length - 1];

    if (xmin != xmax && ymin != ymax) return { start: [xmin, ymin], end: [xmax, ymax], context: ctx };
    else return { start: false, end: false, context: ctx };
}




// addapted from pseudocode at
// https://stackoverflow.com/questions/21865922/non-recursive-implementation-of-flood-fill-algorithm
function floodSearch(ctx, target_color, x, y, nullColor, width, height) {
    let Xs = [], Ys = [];

    let stack = []; // stack is dfs, queue is bfs
    stack.push([x,y]);
    let alreadySeen = [[x,y]];
    while(stack.length > 0){
        let coord = stack.pop();
        let nxtColor = rgbaAtImgCoordinate(ctx, coord[0], coord[1]);

        if (nxtColor && colorMatch(nxtColor, target_color), 6) {
            colorCTX(ctx, coord[0], coord[1], nullColor);
            Xs = Xs.sort();
            Ys = Ys.sort();
            Xs.length > 2 ? Xs[1] = coord[0] : Xs.push(coord[0]);
            Ys.length > 3 ? Ys[-1] = coord[1] : Ys.push(coord[1]);
            let minX = comprsn(Xs[0], Xs.length > 1 ? Xs[1] : Xs[0], false);
            let minY = comprsn(Ys[0], Ys.length > 1 ? Ys[1] : Ys[0], false);
            let lstX = comprsn(Xs[-1], Xs[Xs.length - 1]) || Xs[0];
            let lstY = comprsn(Ys[-1], Ys[Ys.length - 1]) || Ys[0]; // the bottom right y

            if (!arrHasCoord(alreadySeen, [minX - 3, minY]) && minX > 3) {
                
                stack.push([minX-3, minY]);
                alreadySeen.push([minX-3, minY]);
            }
            if (!arrHasCoord(alreadySeen, [lstX + 3, minY]) && lstX < width - 3) {
                
                stack.push([lstX+3, minY]);
                alreadySeen.push([lstX + 3, minY]);
            }
            if (!arrHasCoord(alreadySeen, [minX, minY - 3]) && minY > 3) {
                
                stack.push([minX, minY - 3]);
                alreadySeen.push([minX, minY - 3]);
            }
            if (!arrHasCoord(alreadySeen, [lstX, lstY + 3]) && lstY < height - 3) {
                
                stack.push([lstX, lstY + 3]);
                alreadySeen.push([lstX, lstY + 3]);
            }
   
            if (lstX >= width && lstY >= height) return { xs: [minX, lstX], ys: [minY, lstY], context: ctx};
            console.log(minX, lstX);
        }

        
    }
    return { xs: Xs, ys: Ys, context: ctx };
}

function arrHasCoord(arr, coord){
    for (let i = 0; i < arr.length; ++i) {
        let crd = arr[i];
        if (crd[0] === coord[0] && crd[1] === coord[1]) return true;
    } return false;
}


function comprsn(num1, num2, greatest = true){
    if (greatest)
        return num1 > num2 ? num1 : num2;
    else
        return num1 > num2 ? num2 : num1;
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



// https://www.geeksforgeeks.org/check-whether-given-point-lies-inside-rectangle-not/
    // A utility function to calculate area 
    // of triangle formed by (x1, y1),   
    // (x2, y2) and (x3, y3) 
//     function area( x1,  y1,  x2,  y2,  x3,  y3) { 
//         return Math.abs((x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2.0); 
//     } 

//     // A function to check whether point P(x, y)  
//     // lies inside the rectangle formed by A(x1, y1),  
//     // B(x2, y2), C(x3, y3) and D(x4, y4)  
// function pointInRect(x1, y1, x2, y2, x3, y3, x4, y4, x, y) {          
//         // Calculate area of rectangle ABCD  
//         let A = area(x1, y1, x2, y2, x3, y3) + area(x1, y1, x4, y4, x3, y3); 
//         // Calculate area of triangle PAB  
//         let A1 = area(x, y, x1, y1, x2, y2); 
//         // Calculate area of triangle PBC  
//         let A2 = area(x, y, x2, y2, x3, y3); 
//         // Calculate area of triangle PCD  
//         let A3 = area(x, y, x3, y3, x4, y4);  
//         // Calculate area of triangle PAD 
//         let A4 = area(x, y, x1, y1, x4, y4); 
//         // Check if sum of A1, A2, A3   
//         // and A4is same as A  
//         return (A == A1 + A2 + A3 + A4); 
//     } 