import express from "express" // Server
import 'dotenv/config' // Environmental Variables
import fs from "fs" // Saving images on server
import axios from "axios"
import { TwitterApi } from "twitter-api-v2" // Twitter
import { Octokit } from "octokit"; // Github

const app = express()
const port = 3000

//TODO: Lista
// 1. Dodaj możliwość dodawania img do readme.
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
//?


//? 🐤 Twitter Inputs:
  //https://raw.githubusercontent.com/KentoDecem/WebDevelopmentBootcamp/main/Section%2029/presentation.gif
  let githubImageLink = `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/${mainType}%20${mainNumber}/presentation.`
  let imageFilePath = "./Downloaded/presentation."


  let mainTags = ["100DaysOfCode"]
  let mainTagsOutput = ''
  for (let i=0; i<mainTags.length; i++) {
    mainTagsOutput += `#${mainTags[i]} `
  }
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
  // Download image from github repository --> So that we can use it in our twitter post.
  try {
    // Getting gif from Github
    let response = await axios.get(githubImageLink + "gif", {
      responseType: 'arraybuffer'
    })

    fs.writeFileSync(imageFilePath + "gif", Buffer.from(response.data))

  } catch (error) {
    console.log(error)
  }

  // Post image to twitter
  const mediaIds = await Promise.all([
  twitterClient.v1.uploadMedia('./Commit&Tweet.png'),
  ]);

  //Twitter Text Content
  let mainTextTwitter = `${mainTitle}\n` + mainText + `\n\n#${mainType}${mainNumber} ${mainTagsOutput}`

  //* Creating Tweet
  // await twitterClient.v2.tweet({
  //   text: mainTextTwitter,
  //   media: {media_ids: mediaIds}
  // });
}


//* Github Object
const octokit = new Octokit({ 
   auth: process.env.PERSONAL_TOKEN_GITHUB
});

//* Github Area
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
  //! if file presentation.* in folder mainType mainNumber then add <img src="/presentation.*" alt="Presentation of Final Projecy" width="500">

  var contributingIndex = decodedString.indexOf("## Contributing");

  console.log(contributingIndex)

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
  creatingTwitterPost()
  // updatingReadme()
  res.send("Hello")
})



app.listen(port, () => {
    console.log("Server listen on port: " + port)
})