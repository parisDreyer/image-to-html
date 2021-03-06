function HTMLandCSSstrings(bunch_of_rects, imgWidth, imgHeight){
    let htmlStr = [];
    let cssStr = [];

    for(let z = 0; z < bunch_of_rects.length; ++z){
        let box = bunch_of_rects[z];
        htmlStr.push(html_for_rect(box, z)); 
        cssStr.push(css_for_rect(box, z, imgWidth, imgHeight));
    }

    return { 'htmlStr': htmlStr.join(' '), 'cssStr': cssStr.join(' ') };
}

function css_for_rect(box, idx, imgWidth, imgHeight){
    let x1 = box.line1.start[0];
    let x2 = box.line2.end[0];
    let y1 = box.line1.start[1];
    let y2 = box.line2.end[1];
    // console.log(box);
    let height = abs_dist(y1, y2);
    if (height == 0) height += 0.1;
    let width = abs_dist(x1, x2);
    if (width == 0) width += 0.1;
    let heightPercent = (height / imgHeight) * 100;
    let widthPercent = (width / imgWidth) * 100;
    // let minA = Math.sqrt(boxArea(height, width));
    let relLeft = Math.floor((x1 / imgWidth) * 100);
    let relTop = Math.floor((y1 / imgHeight) * 100);

    // for some reason xPlanes are getting assigned differently from yPlanes in pixels_to_rects.js ==== i need to debug but for now the css background property uses a tempfix
    return `.box_${idx} {` + 
        `background: ${box.line1.rgba.rgba_string || box.line1.rgba}; ` +
        `height: ${heightPercent}%; ` +
        `width: ${widthPercent}%; ` +
        `min-height: ${heightPercent}%; ` +
        `min-width: ${widthPercent}%; ` +
        `left: ${relLeft}%; ` +
        `top: ${relTop}%; ` +
        `position: absolute; ` +
    `}`;
}

function html_for_rect(box, idx){
    return `<div class="box_${idx}"></div>`;
}

function abs_dist(num1,num2) { // use for finding height or width --- yeah i know this is in other files but just saves some typing -- i'm too lazy to set up webpack for this project until i need to
    return Math.abs(num1 - num2);
}

function boxArea(height, width){
    return height * width;
}