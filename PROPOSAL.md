# Image-to-Html

## Background and Overview

Tired of hand-tooling boiler-plate html and css when shaping your next pixel-perfect rendering of a web-design-document?  
`Now You don't have to:`  
Introducing `Image-to-Html`, a pixel-perfect webpage generator tool that converts design images to html containers with pixel-perfect css styling. 
- `NB:` The project goal for the next 10 days (`2018, Monday, October 29` -- `Monday, November 5`) is to create a proof-of-concept `Image-to-Html` generator that constructs box-model web pages based on rectalinear-design document image files.
- The long term goal for this project is to generate detailed html/css renderings of any image file using bezier-curves and triangular subsections of image regions to generate facsimiles of any image file, such that `Image-to-Html` could render a web page that looks like a specific-person's face if supplied with an image of that person's face.

## Functionality & MVP
- Image-to-Html works by parsing an image file into a 2d array of pixels, then mapping extended color regions into html containers. 
    - `[ ]` The generator should be able to generate a website that has the same geometrical layout and proportions to the supplied image file.
    - `[ ]` The generator follows an outermost-to-innermost logical pattern such that any geometrical regions of the supplied-image-file having a plane that is larger than an overlapping plane is considered the parent-container.
- Color regions that differ from surrounding color regions on any vector of the 2d rgba array are considered as possible borders between containers.
    - `[ ]` each geometrical region of the generated page should have the same rgba color values as the corresponding geometrical region of the supplied image file
- Image-to-Html generates a series of possible [parent, sibling, child] container relationships for each design element that is located by rgba differentials, then assembles each set of container relationships to compare and contrast results for a best fit web page.
    - `[ ]` The `Image-to-Html` generator does not generate web-pages that are not in the supplied image-file
- This is a resource intensive application that may take hours to generate web-pages complex image files.

## Wireframes
- Users will be able to paste a link to an image file or paste an image file into the bold-bordered input field at the bottom of the below design doc page.
![Main Page](/design_doc_main_page.png)
- The above design doc was made at: https://wireframe.cc/
- The grey button adjacent to the bold-bordered input field is a submit button.
    - Upon clicking the submit button, the two equally-sized boxes with identical internal components but different background shading will render the image that was input into the bold-bordered input box.
- The equally sized boxes will render two different events. The box on the left will render the user-input-image as an html img component. The box on the left is an html5 canvas that will render the image as it is deconstructed into rgba coordinates and then reconstructed into an html page. 
- The example page identified in the above wireframe is simply a clone of the site itself, such that it represents the event that a user had taken a screenshot of the webpage and asked the Image-to-Html generator to generate a facsimile of the site.

## Technologies
- basic functionality will be implemented from scratch in javascript
- text-recognition and advanced image recognition will use libraries
    - I will not start the advanced elements until the basic functionality is complete.
    - stay tuned for updates after Monday, November 5, 2018

## Implementation Timeline

#### Monday, October 29, 2018
- Finish project proposal
- Setup detection of main (largest) image elements
#### Tuesday, October 30, 2018
- Finish generation of main image elements into html containers
- Establish naming convention for css classes
- generate css file and html file with appropriate basic components 
#### Wednesday, October 31, 2018
- Detect medium-size details in image
- Generate html and css from medium size details in image
- setup flex container and align-items property logic for generated css -- this will mostly be a brute force approach that tries different container configurations until the images match up
#### Thursday, November 1, 2018
- Reconcile parent-sibling-child relationships between generated medium-and-large size html
- start fine-tuned image detection of details less than 40px in size
#### Friday, November 2, 2018
- Fine tune detection of dominant patterns vs less sizeable patterns and prioritize the high contrast pattern elements (rgba values that are opposite on the color spectrum)
- Generate smaller html and css
#### Saturday, November 3, 2018
- fiddle with css logic while sitting at the beach drinking coffee
#### Sunday, November 4, 2018
- test all main elements, identify issues that need to be fixed for the final demo version due Monday Nov 5.
- Setup webpage on github show
#### Monday, November 5, 2018
- Finish