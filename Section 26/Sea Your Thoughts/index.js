import express from "express";
import fs from "fs";

const app = express();
const port = 3000;
const backgroundsAmount = 15

let titles = []
let posts = []
let randomNumbersList = [] 
let randomNumber = Math.floor(Math.random() * backgroundsAmount)

const quotesFilePath = 'quotes.txt';
const quotes = fs.readFileSync(quotesFilePath, 'utf-8').split('\n');
let usedIndexes = [];

const ideaFilePath = 'idea.txt';
const idea = fs.readFileSync(ideaFilePath, 'utf-8').split('\n');



app.use(express.static("public"))
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.post("/submit", (req, res) => {
    const submittedTitle = req.body["title"];
    const submittedPost = req.body["post"];

    // Sprawdź, czy tytuł został przekazany
    const titleToPush = submittedTitle.trim() !== "" ? submittedTitle : "Unknown";

    // Dodaj tytuł i post do odpowiednich tablic
    titles.push(titleToPush);
    posts.push(submittedPost);

    // No repetition of backgrounds
    while (randomNumbersList[randomNumbersList.length-1] == randomNumber) {
        randomNumber = Math.floor(Math.random() * backgroundsAmount)
    }
    randomNumbersList.push(randomNumber);
    
    console.log(titles);
    console.log(posts);
    
    // res.render("index.ejs", {titles: titles, posts: posts, randomNumbersList: randomNumbersList})
    res.redirect("/");
})

app.delete("/delete/:postId", (req, res) => {
    const postId = req.params.postId;
    console.log(postId)
    console.log(randomNumbersList)
    titles.splice(postId, 1);
    posts.splice(postId, 1);
    randomNumbersList.splice(postId, 1);
    res.send({ deletedIndex: postId });
})

app.patch("/update/:postId", (req, res) => {
    try {
        const postId = req.params.postId;
        const updatedTitle = req.body.title.trim() !== "" ? req.body.title : "Unknown";
        const updatedPost = req.body.post;

        console.log("Received request to update post with ID:", postId);
        console.log("Updated title:", updatedTitle);
        console.log("Updated post:", updatedPost);
        
        titles[postId] = updatedTitle;
        posts[postId] = updatedPost;

        console.log("Titles array after update:", titles);
        console.log("Posts array after update:", posts);

        res.send({ updatedIndex: postId });
    } catch (error) {
        console.error("Error updating post:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});


app.get("/", (req, res) => {
    res.render("index.ejs", {titles: titles, posts: posts, randomNumbersList: randomNumbersList});
})

app.get("/deep-dives", (req, res) => {
    // Wylosuj indeks cytatu, który nie był używany wcześniej
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * quotes.length);
    } while (usedIndexes.includes(randomIndex));

    // Dodaj wylosowany indeks do tablicy użytych indeksów
    usedIndexes.push(randomIndex);

    // Sprawdź, czy wszystkie cytaty zostały użyte, jeśli tak, wyczyść tablicę użytych indeksów
    if (usedIndexes.length === quotes.length) {
        usedIndexes = [];
    }

    const randomQuote = quotes[randomIndex].split(' - ');
    const quote = randomQuote[0];
    const author = randomQuote[1];

    const randomIdea = idea[Math.floor(Math.random() * idea.length)]

    res.render("reflection.ejs", {quote: quote, author: author, idea: randomIdea});
})

app.get("/logbook", (req, res) => {

    res.render("collection.ejs", {titles: titles, posts: posts, randomNumbersList: randomNumbersList});
})

app.get("/purpose", (req, res) => {
    res.render("about.ejs");
})

app.listen(port, () => {
    console.log(`Server sailing from port: ${port}`)
})