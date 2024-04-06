import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let countries = [];

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "password",
  port: 5432,
});
db.connect();

let errorMessage = "";

app.get("/", async (req, res) => {
  //Write your code here.
  let response = await db.query("SELECT country_code FROM visited_countries")
  let countries = response.rows.map((row) => row.country_code);
  console.log(countries);
  res.render("index.ejs", { countries: countries, total: countries.length, error:errorMessage });
});

app.post("/add", async (req, res) => {
  const input = req.body["country"];
  let country_code = "";
  try {
    const result = await db.query("SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || LOWER($1) || '%'", [input]);
    let countryCode = result.rows[0].country_code;
    console.log(countryCode);
    await db.query("INSERT INTO visited_countries (country_code) VALUES($1)", [countryCode])
    errorMessage = "";
  } catch (err) {
    console.log(err);
    if (err.code === "23505") {
      errorMessage = "Country already visited.";
    } else if (input === "") {
      errorMessage = "Please enter country name.";
    } else {
      errorMessage = "Country not found, try again.";
    }
  }

  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
