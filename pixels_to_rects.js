

function drawRects(imageInfo, height, width){


    let xVects = colorLinesOnXAxis(imageInfo, height, width);
    let yVects = colorLinesOnYAxis(imageInfo, height, width);

    let planeIntersects = {};


    console.log("x", xVects);
    console.log("y", yVects);
}

function filterColorLines(color_lines, axis_idx, minPx = 3, maxPx = null){
    let keys = Object.keys(color_lines);
    let new_lines = {};
    for(let i = 0; i < keys.length; ++i){
        let color = color_lines[keys[i]]
        if (coordInRange(color.start[axis_idx], color.end[axis_idx], minPx, maxPx || color.end[axis_idx])) {
          new_lines[keys[i]] = color;
        }
    }
}

function coordInRange(num1, num2, min, max){
    let the_rng = Math.abs(num1 - num2);
    return the_rng >= min && the_rng <= max;
}

function colorLinesOnXAxis(imageInfo, height, width, x_offset = 0) {
    let contiguousXLines = {}
    for(let y = 0; y < height; ++y){ contiguousXLines[y] = leftToRight(imageInfo, y, width, x_offset) }
    return contiguousXLines;
}

function colorLinesOnYAxis(imageInfo, height, width, y_offset = 0) {
    let contiguousYLines = {}
    for (let x = 0; x < width; ++x) { contiguousYLines[x] = topToBottom(imageInfo, x, height, y_offset) }
    return contiguousYLines;
}

// search by one px from 0 to width on x axis for a given y axis
function leftToRight(imageInfo, y, width, x_offset = 0) {
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