// the background color is the color that this algorithm will avoid making rectangles from
function possibleRects(data, canvas, ctx, pivot_size, color_variability, backgroundColor = { red: 255, blue: 255, green: 255 }){
    // let avgColor = getAverageRGB(data.data);
    // let topLeftColor = rgbaAtImgCoordinate(ctx, 0, 0);
    let allColors = getAllColors(data.data);
    console.log(allColors);

    let colorRegions = {};
    for(let i = 0; i < allColors.length; ++i){
        let currColor = hexToRgb(allColors[i]);
        colorRegions[i] = {
          hex: allColors[i],
          regions: allRegionsForColor(
              cloneCanvasContext(canvas), 
                currColor, canvas.height, canvas.width, backgroundColor, pivot_size, color_variability
            )
        }
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



function allRegionsForColor(ctx, targetColor, height, width, nullColor, sweep_size, color_variability){

    // console.log(targetColor);
    let res;
    let foundRegions = [];
    let p = 0;
    let midW = width / 2
    let midH = height / 2
    let searchOptions = {
        ctx: ctx,
        targetColor: targetColor,
        x: p,
        y: p,
        nullColor: nullColor,
        width: width,
        height: height,
        sweep_size: sweep_size,
        color_variability: color_variability
    };
    while (p <= midW && p <= midH) {
        // search converging sections of the image from each corner
        if(colorMatch(rgbaAtImgCoordinate(ctx, p,p), targetColor, color_variability)){ // top left

            res = searchPointByRegion(searchOptions);
            if(res.start && res.end) foundRegions.push({start: res.start, end: res.end});
            searchOptions.ctx = res.context;
        } if (colorMatch(rgbaAtImgCoordinate(ctx, width - p, p), targetColor, color_variability)) { // top right

            searchOptions.x = width - p; searchOptions.y = p;
            res = searchPointByRegion(searchOptions);
            if (res.start && res.end) foundRegions.push({ start: res.start, end: res.end });
            searchOptions.ctx = res.context;
        } if (colorMatch(rgbaAtImgCoordinate(ctx, p, height - p), targetColor, color_variability)){ // bottom left

            searchOptions.x = p; searchOptions.y = (height - p);
            res = searchPointByRegion(searchOptions);
            if (res.start && res.end) foundRegions.push({ start: res.start, end: res.end });
            searchOptions.ctx = res.context;
        } if (colorMatch(rgbaAtImgCoordinate(ctx, width - p, height - p), targetColor, color_variability)) { // bottom right

            searchOptions.x = width - p; searchOptions.y = (height - p);
            res = searchPointByRegion(searchOptions);
            if (res.start && res.end) foundRegions.push({ start: res.start, end: res.end });
            searchOptions.ctx = res.context;
        }
        // from the middle of each edge to the center of the image
        if (colorMatch(rgbaAtImgCoordinate(ctx, midW, p), targetColor, color_variability)) { // mid top

            searchOptions.x = midW; searchOptions.y = p;
            res = searchPointByRegion(searchOptions);
            if (res.start && res.end) foundRegions.push({ start: res.start, end: res.end });
            searchOptions.ctx = res.context;
        } if (colorMatch(rgbaAtImgCoordinate(ctx, midW, height - p), targetColor, color_variability)) { // mid bottom

            searchOptions.x = midW; searchOptions.y = (height - p);
            res = searchPointByRegion(searchOptions);
            if (res.start && res.end) foundRegions.push({ start: res.start, end: res.end });
            searchOptions.ctx = res.context;
        } if (colorMatch(rgbaAtImgCoordinate(ctx, p, midH), targetColor, color_variability)) { // left mid

            searchOptions.x = p; searchOptions.y = midH;
            res = searchPointByRegion(searchOptions);
            if (res.start && res.end) foundRegions.push({ start: res.start, end: res.end });
            searchOptions.ctx = res.context;
        } if (colorMatch(rgbaAtImgCoordinate(ctx, width - p, midH), targetColor, color_variability)) { // right mid

            searchOptions.x = (width - p); searchOptions.y = midH;
            res = searchPointByRegion(searchOptions);
            if (res.start && res.end) foundRegions.push({ start: res.start, end: res.end });
            searchOptions.ctx = res.context;
        }
        p += sweep_size;//++;
    }
    return foundRegions;
}

function searchPointByRegion(options){
    console.log(options);
    let ctx = options.ctx;
    let targetColor = options.targetColor;
    let x = options.x;
    let y = options.y
    let nullColor = options.nullColor;
    let width = options.width;
    let height = options.height;
    let sweep_size = options.sweep_size;
    let color_variability = options.color_variability;


    let res = floodSearch(ctx, targetColor, x, y, nullColor, width, height, sweep_size, color_variability);

    ctx = res.context;
    
    let xmin = res.xs[0], ymin = res.ys[0];
    let xmax = res.xs[1], ymax = res.ys[1];

    if (xmin != xmax && ymin != ymax) return { start: [xmin, ymin], end: [xmax, ymax], context: ctx };
    else return { start: false, end: false, context: ctx };
}




// addapted from pseudocode at
// https://stackoverflow.com/questions/21865922/non-recursive-implementation-of-flood-fill-algorithm
function floodSearch(ctx, target_color, x, y, nullColor, width, height, sweep_size, color_variability) {

    // {
    //     ctx, 
    //     target_color, 
    //     x, y, 
    //     nullColor, 
    //     width, 
    //     height, 
    //     sweep_size, 
    //     color_variability
    // }



    let Xs = [], Ys = []; // the best fit return values

    let stack = []; // stack is dfs, queue is bfs
    stack.push([x,y]);
    let alreadySeen = [[x,y]];
    while(stack.length > 0){
        let coord = stack.pop();
        let nxtColor = rgbaAtImgCoordinate(ctx, coord[0], coord[1]);

        //if (nxtColor && colorMatch(nxtColor, target_color, color_variability)) {
        if (scanForSimilarFromPoint(ctx, coord, target_color, sweep_size, color_variability)) {
            ctx = colorCTX(ctx, coord[0], coord[1], nullColor);
            if(Xs.length < 2) {
                Xs.push(coord[0]);
                if(Xs.length == 2){
                    if(Xs[0] > Xs[1]) {
                        let min = Xs[1];
                        let max = Xs[0];
                        Xs[0] = min;
                        Xs[1] = max;
                    }
                }
            } else{
                if (Xs[0] > coord[0]) Xs[0] = coord[0];
                else if (Xs[1] < coord[0]) Xs[1] = coord[0];
            }

            if (Ys.length < 2) {
                Ys.push(coord[1]);
                if (Ys.length == 2) {
                    if (Ys[0] > Ys[1]) {
                        let min = Ys[1];
                        let max = Ys[0];
                        Ys[0] = min;
                        Ys[1] = max;
                    }
                }
            } else {
                if (Ys[0] > coord[1]) Ys[0] = coord[1];
                else if (Ys[1] < coord[1]) Ys[1] = coord[1];
            }
            


            let minX = Xs[0];
            let minY = Ys[0];
            let lstX = Xs[1];
            let lstY = Ys[1];

            // grow search area from currently described rect in 8 Directions

            // upper left left
             if (minX > sweep_size && !arrHasCoord(alreadySeen, [minX - sweep_size, minY])) {
                stack.push([minX-sweep_size, minY]);
                alreadySeen.push([minX-sweep_size, minY]);
            }
            // upper right right
             if (lstX < width - sweep_size && !arrHasCoord(alreadySeen, [lstX + sweep_size, minY])) {
                stack.push([lstX+sweep_size, minY]);
                alreadySeen.push([lstX + sweep_size, minY]);
            }
            // upper right up
             if (minY > sweep_size && !arrHasCoord(alreadySeen, [lstX, minY - sweep_size])) {
                stack.push([lstX, minY - sweep_size]);
                alreadySeen.push([lstX, minY - sweep_size]);
            }
            // upper left up
             if (minY > sweep_size && !arrHasCoord(alreadySeen, [minX, minY - sweep_size])) {
                stack.push([minX, minY - sweep_size]);
                alreadySeen.push([minX, minY - sweep_size]);
            }
            // lower right lower
             if (lstY < height - sweep_size && !arrHasCoord(alreadySeen, [lstX, lstY + sweep_size])) {
                stack.push([lstX, lstY + sweep_size]);
                alreadySeen.push([lstX, lstY + sweep_size]);
            }
            // lower right right
             if (lstX < width - sweep_size && lstY < height - sweep_size && !arrHasCoord(alreadySeen, [lstX + sweep_size, lstY])) {
                stack.push([lstX + sweep_size, lstY]);
                alreadySeen.push([lstX, lstY + sweep_size]);
            }
            // lower left left
             if (minX > sweep_size && lstY < height && !arrHasCoord(alreadySeen, [minX - sweep_size, lstY])) {
                stack.push([minX - sweep_size, lstY]);
                alreadySeen.push([minX - sweep_size, lstY]);
            }
            // lower left lower
             if (minX > 0 && lstY < height - sweep_size && !arrHasCoord(alreadySeen, [minX, lstY + sweep_size])) {
                stack.push([minX, lstY + sweep_size]);
                alreadySeen.push([minX, lstY + sweep_size]);
            }
   
            // if (lstX >= width && lstY >= height) return { xs: [minX, lstX], ys: [minY, lstY], context: ctx}; // don't need
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

// searches by average color in area
// returns coordinate of similar pixel or false within pivot range of an [x,y] point
function scanForSimilarFromPoint(ctx, point, rgb, pivot, color_variability){

    let ul = [point[0] - pivot, point[1] - pivot];                          // upper left
    let br = [point[0] + pivot, point[1] + pivot];                          // bottom right
    let count = colorOccurrenceInArea(ctx, rgb, ul, br, color_variability); // check if average color is similar to target color
    let thrd_area = Math.floor(((pivot) * (pivot)) / 3);
    console.log(thrd_area);
    return count >= thrd_area;

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

function colorOccurrenceInArea(ctx, color, upperLeftCoord, lowerRightCoord, color_variability){
    let count = 0;
    for (let x = upperLeftCoord[0]; x < lowerRightCoord[0]; x += rndM(2, 5)) {
        for (let y = upperLeftCoord[1]; y < lowerRightCoord[1]; y += rndM(2, 5)) {
            let nxtRgba = rgbaAtImgCoordinate(ctx, x, y);
            if(colorMatch(color, nxtRgba, color_variability)) count += 1; 
        }
    }
    return count
}


// rnd between min incls and max excls
function rndM(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
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


