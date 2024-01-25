import express from "express";

const app = express();
const port = 3000;

import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

const d = new Date();
var today = d.getDay();
today = 6

var week = "weekday";
var advice = "it's time to work hard!";

if (today < 1 || today > 5) {
    week = "weekend";
    advice = "it's time to have fun!"
}

app.get("/", (req, res) => {
  res.render("index.ejs", {
    dayType: week,
    advice: advice
});
});

app.listen(port, () => {
  console.log(`Server running really fast on port: ${port}`);
});
