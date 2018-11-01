

function possibleRects(imageInfo, height, width){


    let xVects = colorLinesOnXAxis(imageInfo, height, width);
    let mainXVects = filterColorLines(xVects, 0, width / 2, width);

    let mainXMatches = matchingColorLines(mainXVects, 0);

    return { xPlanes: mainXMatches }
}


// function floodFill(imageInfo, width, height){
    
//     let exploredRegions = [];
//     let contiguousColors = {};

//     let y = 0;
//     for(let x = 0; x < width; ++x){
//         let colors = [ rgbaAtImgCoordinate(imageInfo.context, x, y),
//             rgbaAtImgCoordinate(imageInfo.context, x + 1, y),
//             rgbaAtImgCoordinate(imageInfo.context, x, y + 1),
//             rgbaAtImgCoordinate(imageInfo.context, x + 1, y + 1) ];
        
        
//         colorMatch(, 5)
//     }
// }





// finds individual lines in a 1px by n px line
function filterColorLines(color_lines, axis_idx, minPx, maxPx) {
    let keys = Object.keys(color_lines);
    let new_lines = {};
    for (let i = 0; i < keys.length; ++i) {                  // the x or y axis position that the line is on
        let sub_keys = Object.keys(color_lines[keys[i]]);  // the array of color_lines that are sub-lines of the x or y line axis in R2
        let idx = keys[i];                                 // the x or y axis
        for (let s = 0; s < sub_keys.length; ++s) {
            let sub = sub_keys[s]                          // the subset of the x or y axis
            let color = color_lines[idx][sub]
            if (coordInRange(color.start[axis_idx], color.end[axis_idx], minPx, maxPx)) {
                new_lines[idx] = color;
            }
        }
    }
    return new_lines;
}



// axis_idx is either 0 or 1 --- 0 for x axis, 1 for y axis
// colorLines is an array of hashes that hold start and end indices for a given line that has a given rgba value
function matchingColorLines(colorLines, axis_idx){
    let keys = Object.keys(colorLines)
    let allMatches = [];
    for(let k = 0; k < keys.length; ++k){

        let mainKey = keys[k];
        let matches = matchesForLine(colorLines, axis_idx, mainKey, keys.slice(k + 1)) // only check keys not checked
        if (matches.length > 0) {                                                    // an array of matching lines
            for(let m = 0; m < matches.length; ++m){ allMatches.push(matches[m]); }
        }
    } return allMatches;
}

// helper method for
// returns all of the matching colorlines for a given colorline
function matchesForLine(colorLines, axis_idx, mainKey, remainingKeys){
    let matches = [];
    let line = colorLines[mainKey];

    for(let k = 0; k < remainingKeys.length; ++k){
        let line2 = colorLines[remainingKeys[k]];
        if (doLinesMatch(line, line2, axis_idx)) { // check if the lines are withing 2 px of each other's length
            let noOverlaps = true;
            let rect = { line1: line, line2: line2 };
            for (let i = 0; i < matches.length; ++i){
                if (rectOverlaps(rect, matches[i])) {
                    noOverlaps = false;
                    break;
                }
            }
            if (noOverlaps) {
                let len = matches.length;
                let newRect = false;
                if(len > 0) newRect = joinAdjacents(matches[len-1], rect); // check adjacents for relationship
                newRect ? matches[len] = newRect : matches.push(rect);     // revise previous rect or add new rect
            }
        }
    }

    return matches;
}

// returns a newRect or false
// merges rect2 with rect1 if rect2 is touching rect1 and the colors are the same
// assumes rect2 is below rect1
function joinAdjacents(rect1,rect2){
    let newRect = false;
    if (colorMatch(rect1.line1.rgba, rect2.line1.rgba, 2) || 
        colorMatch(rect1.line2.rgba, rect2.line2.rgba, 2) &&
        coordInRange(rect1.line2.end[1], rect2.line1.start[1])){
                newRect = rect1;             // starts at top of first rect
                newRect.line2 = rect2.line2; // ends at bottom of second rect
    }
    return newRect;
}

function rectOverlaps(rect, otherRect){
    r1 = [ rect.line1.start[0], rect.line1.start[1], rect.line2.end[0], rect.line2.end[1]]
    r2 = [ otherRect.line1.start[0], otherRect.line1.start[1], otherRect.line2.end[0], otherRect.line2.end[1]]
    return !(
        r1[2] <= r2[0] ||   // left
        r1[3] <= r2[1] ||   // bottom
        r1[0] >= r2[2] ||   // right
        r1[1] >= r2[3]      // top
    );
}





function doLinesMatch(line1, line2, axis_idx) {                                   // determines if line1 and line2 could be part of same rect
    let in_range = coordInRange(line1.start[axis_idx], line2.start[axis_idx], 0,2) &&  // start matches up
        coordInRange(line1.end[axis_idx], line2.end[axis_idx], 0, 2) &&         // end matches up
        coordInRange(abs_range(line1.start[axis_idx], line1.end[axis_idx]),     // lengths match up
            abs_range(line2.start[axis_idx], line2.end[axis_idx]),
            0, 2);
    let colors_match = colorMatch(line1.rgba, line2.rgba, 2);                   // colors withing 2px of each other
    return colors_match && in_range; 
}


function abs_range(num1, num2){                                   // saves a couple lines of code
    return Math.abs(num1 - num2);
}

function coordInRange(num1, num2, min, max){                     // checks if a coord is >= min and <= max
    let the_rng = abs_range(num1, num2);
    return the_rng >= min && the_rng <= max;
}

function colorLinesOnXAxis(imageInfo, height, width, x_offset = 0) { // gets an array of colors on a given line of the x axis for a given y value
    let contiguousXLines = {}
    for(let y = 0; y < height; ++y){ contiguousXLines[y] = leftToRight(imageInfo, y, width, x_offset) }
    return contiguousXLines;
}


function leftToRight(imageInfo, y, width, x_offset = 0) { // search by one px from 0 to width on x axis for a given y axis
    let contiguousRegions = {};
    regionKey = 0;
    let prevColorMatch = false;
    for(let x = x_offset; x < width - 1; ++x) {
        let currColor = rgbaAtImgCoordinate(imageInfo.context, x, y);
        let nxtColor = rgbaAtImgCoordinate(imageInfo.context, x + 1, y);

        contiguousRegions[regionKey] = addOrUpdateContiguousLine(contiguousRegions[regionKey], currColor, x, y); // removed currColor.rgba_string
        if(nxtColor && colorMatch(currColor, nxtColor, 2)) prevColorMatch = true; 
        else if (nxtColor && !prevColorMatch) regionKey += 1; // increment region key for new color range, because we have reached the end of a color-range-line
        
        if (nxtColor) contiguousRegions[regionKey] = addOrUpdateContiguousLine(contiguousRegions[regionKey], nxtColor.rgba_string, x + 1, y);
        x += 1
    }
    return contiguousRegions;
}


function addOrUpdateContiguousLine(regionHash, color, x, y){
    if (!regionHash) regionHash = { rgba: color, start: [x, y], end: [x,y] };
    else regionHash.end = [x,y];
    return regionHash;
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
function colorMatch(rgba1, rgba2, rgbaAllowedDelta){
    return (
        Math.abs(rgba1.red - rgba2.red) <= rgbaAllowedDelta &&
        Math.abs(rgba1.green - rgba2.green) <= rgbaAllowedDelta &&
        Math.abs(rgba1.blue - rgba2.blue) <= rgbaAllowedDelta &&
        Math.abs(rgba1.alpha - rgba2.alpha) <= rgbaAllowedDelta
    );
}