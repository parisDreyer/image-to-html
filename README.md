# Image-to-HTML
### A feature recognition app that analyzes an image to make a webpage


## Live
[Live Demo](https://parisdreyer.github.io/image-to-html/)



## Technologies
* Javascript
* HTML
* CSS




### Dependencies (if you're running it on a local machine)
- Browser, such as Chrome or Firefox
- Python (or other Simple Server to serve up image files from local machine to get past CORS)
### Download Instructions
- git clone the repo by typing `git clone https://github.com/parisDreyer/image-to-html.git`
- then `CD` into the root directory of your project
- then type in terminal `python -m SimpleHTTPServer` or similar server on localhost
- the project will be available on some port accessible through your browser (probably `localhost:8000`)


- Be sure to enable the ability to `open windows` on your browser for the Demo page
    - If you do not do so, you will be prompted to do so after clicking the `Analyze Image` button. Click the `Analyze Image` Button one more time after enabling open windows
- For a demo of the features, click the `Analyze Image` button at the bottom of the Live Demo
    - You can additionally demo:
        - template_examples/[template2.png, template3.png, template4.png, template5.jpeg, template6.png, template7.png, template8.jpeg, template9.jpeg]
    - input a full url to the image you want to generate a web-page out of
    - ![Image of Main Page](mainPageDemo.png "Form Page")
## Features
### Basic Functionality
- Input the url to the `Image File Path` input box above the `Analyze Image Button`
- Update the `Pivot Size` and `Color Variability` -- the smaller the Pivot Size the slower the calculations are. The larger the color variability the slower the calculations.
- Uses a pivot algorithm in concert with a seed-fill algorithm and random sampling to generate statistically likely color groups from an array of pixels.
- After generating color groups CSS and HTML files are generated using the relative height, width and position of each color region
- ![Sample Generated Image](demoYellow.png "Sample Generated Image")