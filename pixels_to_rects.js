

function possibleRects(imageInfo, height, width){


    let xVects = colorLinesOnXAxis(imageInfo, height, width);
    let yVects = colorLinesOnYAxis(imageInfo, height, width);
    let mainXVects = filterColorLines(xVects, 0, width / 2, width)
    let mainYVects = filterColorLines(yVects, 1, height / 2, height);

    let mainXMatches = matchingColorLines(mainXVects, 0);
    let mainYMatches = matchingColorLines(mainYVects, 1);

    return { xPlanes: mainXMatches, yPlanes: mainYMatches }
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
             matches.push({ line1: line, line2: line2});
        }
    }

    return matches;
}



function doLinesMatch(line1, line2, axis_idx) {                                   // determines if line1 and line2 could be part of same rect
    return  coordInRange(line1.start[axis_idx], line2.start[axis_idx], 0,2) &&  // start matches up
        coordInRange(line1.end[axis_idx], line2.end[axis_idx], 0, 2) &&         // end matches up
        coordInRange(abs_range(line1.start[axis_idx], line1.end[axis_idx]),     // lengths match up
            abs_range(line2.start[axis_idx], line2.end[axis_idx]),
            0, 2)
}


function filterColorLines(color_lines, axis_idx, minPx, maxPx){
    let keys = Object.keys(color_lines);
    let new_lines = {};
    for(let i = 0; i < keys.length; ++i){                  // the x or y axis position that the line is on
        let sub_keys = Object.keys(color_lines[keys[i]]);  // the array of color_lines that are sub-lines of the x or y line axis in R2
        let idx = keys[i];                                 // the x or y axis
        for (let s = 0; s < sub_keys.length; ++s){
            let sub = sub_keys[s]                          // the subset of the x or y axis
            let color = color_lines[idx][sub]
            if (coordInRange(color.start[axis_idx], color.end[axis_idx], minPx, maxPx)) {
                new_lines[idx] = color;
            }
        }
    }
    return new_lines;
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

function colorLinesOnYAxis(imageInfo, height, width, y_offset = 0) {
    let contiguousYLines = {}
    for (let x = 0; x < width; ++x) { contiguousYLines[x] = topToBottom(imageInfo, x, height, y_offset) }
    return contiguousYLines;
}

function leftToRight(imageInfo, y, width, x_offset = 0) { // search by one px from 0 to width on x axis for a given y axis
    let contiguousRegions = {};
    regionKey = 0;
    let prevColorMatch = false;
    for(let x = x_offset; x < width - 1; ++x) {
        let currColor = rgbaAtImgCoordinate(imageInfo.context, x, y);
        let nxtColor = rgbaAtImgCoordinate(imageInfo.context, x + 1, y);

        contiguousRegions[regionKey] = addOrUpdateContiguousLine(contiguousRegions[regionKey], currColor.rgba_string, x, y);
        if(nxtColor && colorMatch(currColor, nxtColor, 2)) prevColorMatch = true; 
        else if (nxtColor && !prevColorMatch) regionKey += 1; // increment region key for new color range, because we have reached the end of a color-range-line
        
        if (nxtColor) contiguousRegions[regionKey] = addOrUpdateContiguousLine(contiguousRegions[regionKey], nxtColor.rgba_string, x + 1, y);
        x += 1
    }
    return contiguousRegions;
}


// search by one px from 0 to width on y axis for a given x axis
function topToBottom(imageInfo, x, height, y_offset = 0){
    let contiguousRegions = {};
    regionKey = 0;
    let prevColorMatch = false;
    for (let y = y_offset; y < height - 1; ++y) {
        let currColor = rgbaAtImgCoordinate(imageInfo.context, x, y);
        let nxtColor = rgbaAtImgCoordinate(imageInfo.context, x, y + 1);

        contiguousRegions[regionKey] = addOrUpdateContiguousLine(contiguousRegions[regionKey], currColor, x, y);
        if (nxtColor && colorMatch(currColor, nxtColor, 2)) prevColorMatch = true;
        else if (nxtColor && !prevColorMatch) regionKey += 1; // increment region key for new color range, because we have reached the end of a color-range-line

        if (nxtColor) contiguousRegions[regionKey] = addOrUpdateContiguousLine(contiguousRegions[regionKey], nxtColor, x, y + 1);
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