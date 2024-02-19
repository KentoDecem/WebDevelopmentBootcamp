import express, { application } from "express" // Server
import 'dotenv/config' // Environmental Variables
import fs from "fs" // Saving images on server
import axios from "axios" // Downloading Images from internet: (raw.githubusercontent.com)
import { TwitterApi } from "twitter-api-v2" // Twitter
import { Octokit } from "octokit"; // Github
import chalk from "chalk" // Color in terminal

const app = express()
const port = 3000

app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }));

//TODO: Future
// 2. Pomyśl na możliwością aktualizowania banera albo bio na twitterze = "Currently working on Section 29 of WebDev"
// 3n. Podstrona wyświetlająca wszystkie dotychczasowe notatki

// 5. By default when user do not use dashboard, profile info has button Get Started instead of some not found profile
// 6. When user open dashboard - we will give him examples of posts with typing effect.

//TODO: Lista
//// 1. Dodaj możliwość dodawania img do readme.
//// 1.1 Dodawaj pobrane zdjęcia do posta na twitterze
//// 1.5 Dodaj kolory do konsoli z informacjami co zostało dodane do readme i co zostało dodane do twittera
// Client Side


//! Main Inputs:
  let title = ""
  let description = ""


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
  let mainTextTwitter = `${mainType} ${mainNumber}: ${mainTitle}\n` + mainText + `\n\n${mainTagsOutput}`
  console.log(chalk.cyan(chalk.bold.underline("Twitter:\n") + mainTextTwitter + "\n" + selectedImages + "\n"))

  //* Creating Tweet
  await twitterClient.v2.tweet({
    text: mainTextTwitter,
    media: {media_ids: mediaIds}
  });
}

async function getTwitterProfileInfo() {
  //Access User
  let twitterUserInfo = await twitterClient.currentUser()
  let twitterProfileName = twitterUserInfo.screen_name
  let twitterProfilePicture = twitterUserInfo.profile_image_url_https

  console.log(chalk.cyan(twitterProfileName))
  console.log(chalk.cyan(twitterProfilePicture))
}


//* Github Object
const octokit = new Octokit({ 
   auth: process.env.PERSONAL_TOKEN_GITHUB
});

//* Github Area
async function getGithubProfileInfo() {
try {
    // Fetch authenticated user's profile information
    const { data: user } = await octokit.rest.users.getAuthenticated();

    // Access and log desired profile information
    console.log(`Username: ${user.login}`);
    console.log(`Avatar URL: ${user.avatar_url}`); // Accessing additional fields


    const { data: repositories } = await octokit.rest.repos.listForAuthenticatedUser();

    // Show repository names
    console.log(`**Lista repozytoriów:**`);
    for (const repo of repositories) {
      console.log(`- ${repo.name}`);
    }


  } catch (error) {
    console.error('Error fetching GitHub profile:', error);
  }
}

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

async function updatingReadme(title, description) {
  // Changing description and title to readme
    // divs to new lines
    description = description.replace(/<div>/g, '<br>\n').replace(/<\/div>/g, '');
    title = title.replace(/<div>/g, '<br>\n').replace(/<\/div>/g, '');

    // if br than replace to <br>\n
    description = description.replace(/<br>(<b[^>]*>)?(<i[^>]*>)?(<u[^>]*>)?- /g, '\n$1$2$3- ');
    title = title.replace(/<br>(<b[^>]*>)?(<i[^>]*>)?(<u[^>]*>)?- /g, '\n$1$2$3- ');
  
    // replace - to li
    description = description.replace(/^(<b[^>]*>)?(<i[^>]*>)?(<u[^>]*>)?- (.+?)($|<br>)/gm, '<li>$1$2$3$4</li>');
    title = title.replace(/^(<b[^>]*>)?(<i[^>]*>)?(<u[^>]*>)?- (.+?)($|<br>)/gm, '<li>$1$2$3$4</li>');
  
    // check if br is in the first line and delete it if li is in the second one
    description = description.replace(/<br>\n<li>/, '\n<li>');
    title = title.replace(/<br>\n<li>/, '\n<li>');
    


  
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
  var mainTextGithub = `## ${title}\n${description}`;

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
        message: `Add ${mainType} ${mainNumber}: ${title}\n${description}`,
        committer: {
          name: "Commit&Tweet",
          email: "xyz@gmail.com"
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


app.post("/submit-github", async (req,res) => {
  description = req.body.description;
  title = req.body.title;

  // Changing description to twitter
  console.log(chalk.red(title))
  console.log(chalk.yellowBright(description))
  
  // await downloadPresentationImages()
  // updatingReadme(title, description)


  // creatingTwitterPost()

  res.render("dashboard.ejs", {title: title, description: description})
})

app.post("/submit-twitter", async (req,res) => {
  description = req.body.description;
  title = req.body.title;

  // Changing description to twitter
  console.log(chalk.red(title))
  console.log(chalk.yellowBright(description))
  
  // await downloadPresentationImages()
  // updatingReadme(title, description)


  // creatingTwitterPost()

  res.render("dashboard.ejs", {title: title, description: description})
})


app.get("/", async (req,res) => {

 
  // getTwitterProfileInfo()
  // getGithubProfileInfo()

  res.render("index.ejs")
})

app.get("/dashboard", (req,res) => {

  res.render("dashboard.ejs", {title: title||"Your very creative Title", description: description||"Write about what you achieve!<br>\n<li>ride a bike?</li>"})
})

app.get("/about_us", (req,res) => {

  res.render("about.ejs")
})



app.listen(port, () => {
    console.log("Server listen on port: " + port)
})