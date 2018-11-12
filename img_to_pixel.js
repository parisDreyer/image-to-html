// https://stackoverflow.com/questions/13963308/how-do-you-simply-obtain-an-array-of-pixel-data-from-an-image
// https://stackoverflow.com/questions/8751020/how-to-get-a-pixels-x-y-coordinate-color-from-an-image
// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas


function canvasAndContext(){
    const canvas = document.getElementById("canvas");
    return [canvas, canvas.getContext("2d")];
} // get the context

function appendImage(model_image){

   const myImage = document.getElementById("model-image");
   myImage.src = model_image;
   myImage.crossOrigin = "Anonymous"; //https://stackoverflow.com/questions/22097747/how-to-fix-getimagedata-error-the-canvas-has-been-tainted-by-cross-origin-data
   
   return myImage;
} // append an image to your html


function imageData(img) {
  const [canvas, ctx] = canvasAndContext();

  const [imgWdth, imgHght] = [
    img.offsetWidth || img.width || img.naturalWidth,
    img.offsetHeight || img.height || img.naturalHeight
  ];
  canvas.width = imgWdth;
  canvas.height = imgHght;

  ctx.drawImage(img, 0, 0, imgWdth, imgHght);
  const imageInfo = {
      canvas: canvas,
      context: ctx, 
      pixels: ctx.getImageData(0, 0, imgWdth, imgHght),
      height: imgHght,
      width: imgWdth
    };

    return imageInfo;
} // get the image data from your image