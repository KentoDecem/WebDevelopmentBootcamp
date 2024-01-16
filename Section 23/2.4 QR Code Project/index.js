/* 
1. Use the inquirer npm package to get user input.
2. Use the qr-image npm package to turn the user entered URL into a QR code image.
3. Create a txt file to save the user input using the native fs node module.
*/

import inquirer from "inquirer"
import qr from "qr-image"
import fs from "fs"

inquirer
  .prompt([
    /* Pass your questions in here */
    {
        name: "link",
        message: "Give me some link:"
    }
  ])
  .then((answers) => {
    // Use user feedback for... whatever!!
    var qr_svg = qr.image(answers.link, { type: 'png' });
    qr_svg.pipe(fs.createWriteStream('qr-code.png'));
 
    fs.writeFile("user-link.txt", answers.link, (err) => {console.log(answers.link)});
  })
  .catch((error) => {
    if (error.isTtyError) {
      // Prompt couldn't be rendered in the current environment
    } else {
      // Something else went wrong
    }
  });
