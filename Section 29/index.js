import express from "express" // Server
import 'dotenv/config' // Environmental Variables
import fs from "fs" // Saving images on server
import axios from "axios"
import { TwitterApi } from "twitter-api-v2" // Twitter
import { Octokit } from "octokit"; // Github
import chalk from "chalk" // Color in terminal

const app = express()
const port = 3000

//TODO: Lista
//// 1. Dodaj możliwość dodawania img do readme.
// 1.1 Dodawaj pobrane zdjęcia do posta na twitterze
// 1.5 Dodaj kolory do konsoli z informacjami co zostało dodane do readme i co zostało dodane do twittera
// 2. Pomyśl na możliwością aktualizowania banera albo bio na twitterze = "Currently working on Section 29 of WebDev"
// 3n. Podstrona wyświetlająca wszystkie dotychczasowe notatki


//! Main Inputs:
  let mainTitle = "Capstone Project (Using APIs) - Commit&Tweet"
  let mainText = `Hello Friends
  Today I'm testing two api's:
  - Twitter
  - Github`

  let mainType = `Section`
  let mainNumber = 29
//!


//? 😽 Github Inputs:
  const OWNER = "KentoDecem"
  const REPO = "WebDevelopmentBootcamp"
  const PATH = "README.md"

  const OWNER_NAME = "Kento Decem"
  const OWNER_MAIL = "10kento10@gmail.com"

  //https://raw.githubusercontent.com/KentoDecem/WebDevelopmentBootcamp/main/Section%2029/presentation.gif
  let githubImagesLink = `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/${mainType}%20${mainNumber}/`
  let downloadedImagesFolderPath = "./Downloaded/"

  let presentationLinksList = []
//?


//? 🐤 Twitter Inputs:

  let mainTags = ["100DaysOfCode"]
  let mainTagsOutput = ''
  for (let i=0; i<mainTags.length; i++) {
    mainTagsOutput += `#${mainTags[i]} `
  }

  let selectedImages = []
//?


//* Twitter Object
const twitterClient = new TwitterApi({
  appKey: process.env.API_KEY,
  appSecret: process.env.API_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessSecret: process.env.ACCESS_SECRET,
});

//* Twitter Area
async function creatingTwitterPost() {
  // Get names of all files in /Downloaded/ folder
  const downloadedPathsList = fs.readdirSync(downloadedImagesFolderPath).map(file => `./Downloaded/${file}`);

  //? filter only selected images with splice()
  selectedImages = downloadedPathsList

  // Upload images to twitter
  const mediaPromises = selectedImages.map(element => {
    return twitterClient.v1.uploadMedia(`${element}`);
  });
  const mediaIds = await Promise.all(mediaPromises);



  //Twitter Text Content
  let mainTextTwitter = `${mainTitle}\n` + mainText + `\n\n#${mainType}${mainNumber} ${mainTagsOutput}`
  console.log(chalk.cyan(chalk.bold.underline("Twitter:\n") + mainTextTwitter + "\n" + selectedImages))

  //* Creating Tweet
  await twitterClient.v2.tweet({
    text: mainTextTwitter,
    media: {media_ids: mediaIds}
  });
}


//* Github Object
const octokit = new Octokit({ 
   auth: process.env.PERSONAL_TOKEN_GITHUB
});

//* Github Area
async function downloadPresentationImages() {
  // Removing and Creating folder Downloaded so that it will become brand new again...
  fs.rmSync(downloadedImagesFolderPath, { recursive: true, force: true });
  fs.mkdirSync(downloadedImagesFolderPath);

  // Getting info about repo
  const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
    owner: OWNER,
    repo: REPO,
    path: `${mainType} ${mainNumber}`,
  });

  // Iterate every file
  for (let i=0; i<response.data.length; i++) {
    let potentialFile = response.data[i].name
    
    //Check how many files with presentation.*
    if (potentialFile.includes('presentation')) {
      // Add links for future development (README.md also with this images and gifs)
      presentationLinksList.push(githubImagesLink + potentialFile)
      
      // Download our target
      try {
        let responseTarget = await axios.get(githubImagesLink + potentialFile, {responseType: 'arraybuffer'})
        fs.writeFileSync(downloadedImagesFolderPath + potentialFile, Buffer.from(responseTarget.data))
      } 
      catch(error) {
        console.log(error.message)
      }
    }
    
  }

}

async function updatingReadme() {
  
  //* Download info about README.md
  const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
  owner: OWNER,
  repo: REPO,
  path: PATH,
  });

  let SHA = response.data.sha;
  var encodedData = response.data.content;

  // Decode from Base64
  var decodedData = Buffer.from(encodedData, 'base64');

  // conversion bytes to string
  var decodedString = decodedData.toString('utf-8');

  // New text to add before section "Contributing"
  var mainTextGithub = `## ${mainType} ${mainNumber}: ${mainTitle}\n${mainText}`;

  // if files '*presentation*.*' then add them to mainTextGithub
  if (presentationLinksList.length > 0) {
    let presentationLinksHTML = ""
    presentationLinksList.forEach((element, index) => {
      presentationLinksHTML += `<img src='${element}' alt='${index+1}. Presentation of Final Project' width="500">\n`
    })
    mainTextGithub += `\n${presentationLinksHTML}`;
  }

  console.log(chalk.blue(chalk.bold.underline("\nGithub:\n") + mainTextGithub))

  var contributingIndex = decodedString.indexOf("## Contributing");


  // Check if section was found
  if (contributingIndex !== -1) {
      // Put new text before "Contributing"
      var updatedString = decodedString.slice(0, contributingIndex) + mainTextGithub + '\n\n\n' + decodedString.slice(contributingIndex);
    
      // Showing updated text in console
      // console.log(updatedString);

      // Encode string so that it will be ready to sent back
      var readyToSendString = Buffer.from(updatedString, 'utf-8').toString('base64');

      //* Updating README.md
      await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
        owner: OWNER,
        repo: REPO,
        path: PATH,
        message: `Add ${mainType} ${mainNumber}: ${mainTitle}\n${mainText}`,
        committer: {
          name: OWNER_NAME,
          email: OWNER_MAIL
        },
        content: readyToSendString,
        sha: SHA,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      })

  } else {
      console.log("Section 'Contributing' not found.");
  }
}


app.get("/", async (req,res) => {

  await downloadPresentationImages()
  updatingReadme()
  creatingTwitterPost()

  res.send("Hello")
})



app.listen(port, () => {
    console.log("Server listen on port: " + port)
})