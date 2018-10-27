// https://stackoverflow.com/questions/13963308/how-do-you-simply-obtain-an-array-of-pixel-data-from-an-image
// https://stackoverflow.com/questions/8751020/how-to-get-a-pixels-x-y-coordinate-color-from-an-image

// ========================
// first example
// imageData = context.getImageData(imageX, imageY, imageWidth, imageHeight); // get the image array

//below is how to access to your pixel details 
// red = imgData.data[0];
// green = imgData.data[1];
// blue = imgData.data[2];
// alpha = imgData.data[3];

// document.getElementById("data").innerHTML = imgData.data.toString();


// ======
//second example
// var img = document.getElementById("my-image");
// var canvas = document.createElement("canvas");
// canvas.width = img.width;
// canvas.height = img.height;
// canvas.getContext("2d").drawImage(img, 0, 0, img.width, img.height);

// ar pixelData = canvas.getContext('2d').getImageData(event.offsetX, event.offsetY, 1, 1).data;





function canvasAndContext(){
    const canvas = document.getElementById("canvas");
    return [canvas, canvas.getContext("2d")];
} // get the context

function appendImage(model_image){
    const myImage = document.getElementById("model-image")
    myImage.src = model_image;
    myImage.crossOrigin = "Anonymous";
    return myImage;
} // append an image to your html


function imageData(img) {
  console.log(img);
  const [canvas, ctx] = canvasAndContext();

  const [imgWdth, imgHght] = [
    img.offsetWidth || img.width || img.naturalWidth,
    img.offsetHeight || img.height || img.naturalHeight
  ];
  canvas.width = imgWdth;
  canvas.height = imgHght;

  ctx.drawImage(img, 0, 0, imgWdth, imgHght);
  return ctx.getImageData(0, 0, imgWdth, imgHght);
} // get the image data from your image