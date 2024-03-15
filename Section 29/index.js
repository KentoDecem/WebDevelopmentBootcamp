import express, { application } from "express" // Server
import 'dotenv/config' // Environmental Variables
import fs from "fs" // Saving images on server
import axios from "axios" // Downloading Images from internet: (raw.githubusercontent.com)
import { TwitterApi } from "twitter-api-v2" // Twitter
import { Octokit } from "octokit"; // Github
import chalk from "chalk" // Color in terminal
import multer from 'multer'; // Upload keys to our server

const app = express()
const port = process.argv[2] || 3000;

const upload = multer({ dest: 'uploads/' });

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
  let descriptionTwitter = ""
  let descriptionGithub = ""
  let titleTwitter = ""
  let titleGithub = ""


  // let mainTitle = "Capstone Project (Using APIs) - Commit&Tweet"
  // let mainText = `Hello Friends
  // Today I'm testing two api's:
  // - Twitter
  // - Github`

  // let mainType = `Section`
  // let mainNumber = 29
  let profileNameTwitter = "No Profile Found";
  let profilePictureTwitter = "images/x-logo.png";
  let profileNameGithub = "No Profile Found";
  let profilePictureGithub = "images/github-logo.png";
  let repository = "No Reposiory"
//!


//? 😽 Github Inputs:
  // const OWNER = "KentoDecem"
  // const REPO = "WebDevelopmentBootcamp"
  // const PATH = "README.md"

  // const OWNER_NAME = "Kento Decem"
  // const OWNER_MAIL = "10kento10@gmail.com"

  //https://raw.githubusercontent.com/KentoDecem/WebDevelopmentBootcamp/main/Section%2029/presentation.gif
  // let githubImagesLink = `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/${mainType}%20${mainNumber}/`
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
// const twitterClient = new TwitterApi({
//   appKey: process.env.API_KEY,
//   appSecret: process.env.API_SECRET,
//   accessToken: process.env.ACCESS_TOKEN,
//   accessSecret: process.env.ACCESS_SECRET,
// });
let twitterClient;

async function loginToTwitter() {
  let API_KEY, API_SECRET, ACCESS_TOKEN, ACCESS_SECRET;

  return new Promise((resolve, reject) => {
    
  // Read the contents of the env.txt file
  fs.readFile('env.txt', 'utf8', async (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return;
    }
    
    // Split the file content into lines
    const lines = data.split('\n');
    
    // Assign values from the file to variables
    
    lines.forEach(line => {
      const parts = line.split('=');
      const key = parts[0].trim();
      const value = parts[1].trim();
      
      if (key === 'API_KEY') {
        API_KEY = value;
      } else if (key === 'API_SECRET') {
        API_SECRET = value;
      } else if (key === 'ACCESS_TOKEN') {
        ACCESS_TOKEN = value;
      } else if (key === 'ACCESS_SECRET') {
        ACCESS_SECRET = value;
      }
    });
    
    // Print the values
    console.log(API_KEY);
    console.log(API_SECRET);
    console.log(ACCESS_TOKEN);
    console.log(ACCESS_SECRET);



    // Creating Twitter Client
    try {
      // Creating Twitter Client
      twitterClient = new TwitterApi({
        appKey: API_KEY,
        appSecret: API_SECRET,
        accessToken: ACCESS_TOKEN,
        accessSecret: ACCESS_SECRET,
      });  

      // Access User with await
      const twitterUserInfo = await twitterClient.currentUser();
      const twitterProfileName = twitterUserInfo.screen_name;
      const twitterProfilePicture = twitterUserInfo.profile_image_url_https;

      console.log(chalk.cyan(twitterProfileName));
      console.log(chalk.cyan(twitterProfilePicture));

       resolve({ success: true, profileName: twitterProfileName, profilePicture: twitterProfilePicture });
    } catch (error) {
      console.error('Error creating or fetching Twitter client:', error);
      reject(error);
    }
  });
  })
}

//* Twitter Area
async function creatingTwitterPost(titleTwitter, descriptionTwitter) {
  // Get names of all files in /Downloaded/ folder
  const downloadedPathsList = fs.readdirSync(downloadedImagesFolderPath).map(file => `./Downloaded/${file}`);

  //? filter only selected images with splice()
  selectedImages = downloadedPathsList

  // Upload images to twitter if selectedImages is not empty
let mediaIds = [];
if (selectedImages.length > 0) {
  const mediaPromises = selectedImages.map(async element => {
    try {
      return await twitterClient.v1.uploadMedia(`${element}`);
    } catch (error) {
      console.error('Błąd podczas przesyłania obrazu:', error);
      return null; // Zwróć null w przypadku niepowodzenia
    }
  });
  const results = await Promise.all(mediaPromises);
  // Filtruj wyniki, aby pozbyć się nulli
  mediaIds = results.filter(id => id !== null);
}

  //Twitter Text Content
  let mainTextTwitter = `${titleTwitter}\n` + descriptionTwitter + `\n\n${mainTagsOutput}`
  console.log(chalk.cyan(chalk.bold.underline("Twitter:\n") + mainTextTwitter + "\n" + selectedImages + "\n"))

  //* Creating Tweet
  if (mediaIds.length > 0) {
    // Tweet with media
    await twitterClient.v2.tweet({
      text: mainTextTwitter,
      media: { media_ids: mediaIds }
    });
  } else {
    // Tweet without media
    await twitterClient.v2.tweet({
      text: mainTextTwitter
    });
  }
}


//* Github Object
// const octokit = new Octokit({ 
//    auth: process.env.PERSONAL_TOKEN_GITHUB
// });
let octokit;
let OWNER, DIR, PATH;
let REPO = 'No repository'
let mainType, mainNumber;

async function loginToGithub() {
  let PERSONAL_TOKEN, REPOSITORY, DIRECTORY, README;

  return new Promise((resolve, reject) => {
    
  // Read the contents of the env.txt file
  fs.readFile('env.txt', 'utf8', async (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return;
    }
    
    // Split the file content into lines
    const lines = data.split('\n');
    
    // Assign values from the file to variables
    
    lines.forEach(line => {
      const parts = line.split('=');
      const key = parts[0].trim();
      const value = parts[1].trim();
      
      if (key === 'PERSONAL_TOKEN') {
        PERSONAL_TOKEN = value;
      } else if (key === 'REPOSITORY') {
        REPOSITORY = value;
      } else if (key === 'DIRECTORY') {
        DIRECTORY = value;
      } else if (key === 'README.md') {
        README = value;
      }
    });
    
    // Print the values
    console.log(PERSONAL_TOKEN);
    console.log(REPOSITORY);
    console.log(DIRECTORY);
    console.log(README);

    // if README is empty than set to README.md
    if (README === "") {
      README = "README.md";
    }

    // if DIRECTORY or REPOSITORY is empty than throw error
    if (DIRECTORY === "" || REPOSITORY === "") {
      reject("Directory is empty");
    }



    // Creating Twitter Client
    try {
      // Creating Twitter Client 
      octokit = new Octokit({ 
        auth: PERSONAL_TOKEN
     });

    // Fetch authenticated user's profile information
    const { data: user } = await octokit.rest.users.getAuthenticated();

    // Access desired profile information
    const githubProfileName = user.login;
    const githubProfilePicture = user.avatar_url;

    OWNER = githubProfileName;
    REPO = REPOSITORY;
    DIR = DIRECTORY;
    PATH = README;

    const parts = DIR.split(" ");
    mainType = parts[0];
    mainNumber = parts[1];


      console.log(chalk.blueBright(githubProfileName));
      console.log(chalk.blueBright(githubProfilePicture));

       resolve({ success: true, profileName: githubProfileName, profilePicture: githubProfilePicture, repository: REPO});
    } catch (error) {
      console.error('Error creating or fetching Githu client:', error);
      reject(error);
    }
  });
  })
}

//* Github Area

async function downloadPresentationImages() {

  let githubImagesLink = `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/${mainType}%20${mainNumber}/`

  // Removing and Creating folder Downloaded so that it will become brand new again...
  fs.rmSync(downloadedImagesFolderPath, { recursive: true, force: true });
  fs.mkdirSync(downloadedImagesFolderPath);

  // Clearing array
  presentationLinksList = []

  // Checking if octokit exists
  if (!octokit) {
    return Promise.reject(new Error("Octokit is not available."));
  }

  try {
    // Getting info about repo
    const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner: OWNER,
      repo: REPO,
      path: `${mainType} ${mainNumber}`,
    });

    // Iterate every file
    for (let i = 0; i < response.data.length; i++) {
      let potentialFile = response.data[i].name;

      //Check how many files with presentation.*
      if (potentialFile.includes('presentation')) {
        // Add links for future development (README.md also with this images and gifs)
        presentationLinksList.push(githubImagesLink + potentialFile);

        // Download our target
        try {
          let responseTarget = await axios.get(githubImagesLink + potentialFile, { responseType: 'arraybuffer' });
          fs.writeFileSync(downloadedImagesFolderPath + potentialFile, Buffer.from(responseTarget.data));
        } catch (error) {
          console.log(error.message);
        }
      }
    }
  } catch (error) {
    return Promise.reject(error);
  }
}

async function updatingReadme(titleGithub, descriptionGithub) {
  
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
  var mainTextGithub = `## ${titleGithub}\n${descriptionGithub}`;

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
        message: `Add ${titleGithub}\n${descriptionGithub}`,
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
  descriptionTwitter = req.body.descriptionTwitter;
  descriptionGithub = req.body.descriptionGithub;
  titleTwitter = req.body.titleTwitter;
  titleGithub = req.body.titleGithub;



  console.log(`Title Github: ${titleGithub}`)
  console.log(`Description Github: ${descriptionGithub}`)
  
  try {
    await downloadPresentationImages();
    console.log("Downloading presentation images completed successfully.");
  } catch (error) {
    console.error("Error downloading presentation images:", error.message);
  }

  updatingReadme(titleGithub, descriptionGithub)

    res.render("dashboard.ejs", {
      profileNameTwitter: profileNameTwitter,
      profilePictureTwitter: profilePictureTwitter,
      profileNameGithub: profileNameGithub,
      profilePictureGithub: profilePictureGithub,
      repository: REPO
    });
})

app.post("/submit-twitter", async (req,res) => {
  descriptionTwitter = req.body.descriptionTwitter;
  descriptionGithub = req.body.descriptionGithub;
  titleTwitter = req.body.titleTwitter;
  titleGithub = req.body.titleGithub;



  console.log(`Description Twitter: ${descriptionTwitter}`)

  try {
    await downloadPresentationImages();
    console.log("Downloading presentation images completed successfully.");
  } catch (error) {
    console.error("Error downloading presentation images:", error.message);
  }

  creatingTwitterPost(titleTwitter, descriptionTwitter)


  // after creating post so that it will again render properly on website
  descriptionTwitter = descriptionTwitter.replace(/\n/g, "<br>")

    res.render("dashboard.ejs", {
      profileNameTwitter: profileNameTwitter,
      profilePictureTwitter: profilePictureTwitter,
      profileNameGithub: profileNameGithub,
      profilePictureGithub: profilePictureGithub,
      repository: REPO
    });
})




const keyMapping = {
    "API_KEY": "API_KEY =",
    "API_SECRET": "API_SECRET =",
    "ACCESS_TOKEN": "ACCESS_TOKEN =",
    "ACCESS_SECRET": "ACCESS_SECRET =",
    "PERSONAL_TOKEN": "PERSONAL_TOKEN =",
    "REPOSITORY": "REPOSITORY =",
    "DIRECTORY": "DIRECTORY =",
    "README.md": "README.md ="
};

let filePath = 'env.txt';

// saving user keys for using apis
app.post("/key", (req,res) => {
    let key_name = req.body.key_name;
    let key_entry = req.body.key_entry;

    console.log(`key_name: ${key_name} key_entry: ${key_entry}`)

    // Ścieżka do pliku, gdzie chcesz zapisać dane

    // Wczytaj zawartość pliku
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error("Błąd podczas odczytu pliku:", err);
            res.status(500).send("Wystąpił błąd podczas odczytu danych.");
            return;
        }

        // Przekształć dane do tablicy linii
        let lines = data.split('\n');

        // Znajdź linię odpowiadającą kluczowi
        let lineIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith(keyMapping[key_name])) {
                lineIndex = i;
                break;
            }
        }

        // Jeśli istnieje linia z kluczem, nadpisz ją
        if (lineIndex !== -1) {
            lines[lineIndex] = `${keyMapping[key_name]} ${key_entry}`;
        } else {
            // Jeśli nie istnieje, dodaj nową linię na końcu pliku
            lines.push(`${keyMapping[key_name]} ${key_entry}`);
        }

        // Zapisz zaktualizowane dane do pliku
        fs.writeFile(filePath, lines.join('\n'), (err) => {
            if (err) {
                console.error("Błąd podczas zapisywania do pliku:", err);
                res.status(500).send("Wystąpił błąd podczas zapisywania danych.");
            } else {
                console.log("Dane zostały zapisane do pliku.");
                res.status(200).send("Dane zostały zapisane do pliku.");
            }
        });
    });

})

// show keys that already exists
app.get("/key/:key_name", (req,res) => {
    let key_name = req.params.key_name;

    // Jeśli klucz istnieje w mapowaniu, zwróć jego wartość
    if (keyMapping.hasOwnProperty(key_name)) {

        // Wczytaj zawartość pliku
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error("Błąd podczas odczytu pliku:", err);
                res.status(500).send("Wystąpił błąd podczas odczytu danych.");
                return;
            }

            // Przekształć dane do tablicy linii
            const lines = data.split('\n');

            // Znajdź linię odpowiadającą kluczowi
            let keyValue = null;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].startsWith(keyMapping[key_name])) {
                    keyValue = lines[i].replace(keyMapping[key_name], '').trim();
                    break;
                }
            }

            if (keyValue !== null) {
                res.status(200).send(keyValue);
            } else {
                res.send("");
            }
        });
    } else {
        res.status(400).send("Podany klucz nie jest obsługiwany.");
    }
})

// check if key exists
app.get("/entered-keys", (req, res) => {
    // Odczytaj plik env.txt
    fs.readFile('env.txt', 'utf8', (err, data) => {
        if (err) {
            console.error("Błąd podczas odczytu pliku:", err);
            res.status(500).send("Wystąpił błąd podczas odczytu danych.");
            return;
        }

        // Przekształć dane do tablicy linii
        let lines = data.split('\n');
        let enteredKeys = [];

        // Przejdź przez wszystkie linie i dodaj klucze do tablicy enteredKeys
        lines.forEach(line => {
            // Podziel linię na części na podstawie znaku równości
            let parts = line.split('=');
            if (parts.length === 2) {
                // Usuń białe znaki z końca wartości klucza i sprawdź, czy jest ona niepusta
                let value = parts[1].trim();
                if (value.length > 0) {
                    let keyFound = false;
                    for (const key in keyMapping) {
                        if (line.startsWith(keyMapping[key])) {
                            enteredKeys.push(key);
                            keyFound = true;
                            break;
                        }
                    }
                    // Jeśli nie znaleziono klucza, a wartość klucza nie jest pusta, można zgłosić błąd
                    if (!keyFound) {
                        console.error("Nieprawidłowa linia w pliku env.txt:", line);
                    }
                }
            }
        });

        // Zwróć listę enteredKeys jako odpowiedź
        res.status(200).json(enteredKeys);
    });
});

// Download the env.txt file
app.get("/download", (req, res) => {
    // Read the contents of the env.txt file
    fs.readFile('env.txt', 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading the file:", err);
            res.status(500).send("An error occurred while reading the data.");
            return;
        }
        // Set response headers for the downloaded file
        res.set({
            'Content-Type': 'text/plain',
            'Content-Disposition': 'attachment; filename="env.txt"'
        });
        // Send the file content in the response
        res.send(data);
    });
});

// Upload file as env.txt
app.post('/upload', upload.single('file'), (req, res) => {
    // Check if a file was uploaded
    if (!req.file) {
        res.status(400).send('No file uploaded.');
        return;
    }

    // Read the uploaded file
    fs.readFile(req.file.path, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading the uploaded file:", err);
            res.status(500).send("An error occurred while reading the uploaded file.");
            return;
        }

        // Write the content of the uploaded file to env.txt
        fs.writeFile('env.txt', data, (err) => {
            if (err) {
                console.error("Error writing to the file:", err);
                res.status(500).send("An error occurred while writing to the file.");
                return;
            }
            // Send a success response
            res.status(200).send("File uploaded successfully.");

            // Delete the uploaded file from the 'uploads' directory
            fs.unlink(req.file.path, (err) => {
                if (err) {
                    console.error("Error deleting the uploaded file:", err);
                } else {
                    console.log("Uploaded file deleted successfully:", req.file.path);
                }
            });
        });
    });
});


// Login for twitter
app.get("/login-twitter", async (req, res) => {
  try {
    const loginResult = await loginToTwitter();
    // If login is successful, send success response with profile data
    res.send({
      success: true,
      profileName: loginResult.profileName,
      profilePicture: loginResult.profilePicture
    });

    profileNameTwitter = loginResult.profileName;
    profilePictureTwitter = loginResult.profilePicture;

  } catch (error) {
    // If there's an error, send error response
    res.status(500).send({ success: false, error: error.message });

    profileNameTwitter = "No Profile Found";
    profilePictureTwitter = "images/x-logo.png";
  }

})

app.get("/login-github", async (req, res) => {
  try {
    const loginResult = await loginToGithub();
    // If login is successful, send success response with profile data
    res.send({
      success: true,
      profileName: loginResult.profileName,
      profilePicture: loginResult.profilePicture,
      repository: loginResult.repository
    });

    profileNameGithub = loginResult.profileName;
    profilePictureGithub = loginResult.profilePicture;
    repository = loginResult.repository;

  } catch (error) {
    // If there's an error, send error response
    res.status(500).send({ success: false, error: error.message });

    profileNameGithub = "No Profile Found";
    profilePictureGithub = "images/github-logo.png";
    repository = "No Repository";
  }
})


app.get("/", async (req, res) => {
    res.render("index.ejs", {
      profileNameTwitter: profileNameTwitter,
      profilePictureTwitter: profilePictureTwitter,
      profileNameGithub: profileNameGithub,
      profilePictureGithub: profilePictureGithub,
      repository: REPO
    });
});

app.get("/dashboard", async (req,res) => {
    res.render("dashboard.ejs", {
      profileNameTwitter: profileNameTwitter,
      profilePictureTwitter: profilePictureTwitter,
      profileNameGithub: profileNameGithub,
      profilePictureGithub: profilePictureGithub,
      repository: REPO
    });
})

app.get("/about_us", (req,res) => {
  res.render("about.ejs", {
    profileNameTwitter: profileNameTwitter,
    profilePictureTwitter: profilePictureTwitter,
    profileNameGithub: profileNameGithub,
    profilePictureGithub: profilePictureGithub,
    repository: REPO
  });
})



app.listen(port, () => {
    console.log("Server listen on port: " + port)
})
