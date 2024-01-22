import express from "express";
const app = express();
const port = 3000;

app.get("/", (req, res) => {
    res.send("<h1>Hello, World</h1>");
});

app.get("/contact", (req, res) => {
    res.send("<h1 style='color:blue'>Contact</h1>")
});

app.get("/about", (req, res) => {
    res.send("<h1>About Me</h1><hr>");
});

app.listen(port, () => {
    console.log(`Server running on ${port}.`);
});