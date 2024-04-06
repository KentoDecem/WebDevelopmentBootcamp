import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world2",
  password: "password",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 1;

let users = [
  { id: 1, name: "Angela", color: "teal" },
  { id: 2, name: "Jack", color: "powderblue" },
];

async function allUsers() {
  const result = await db.query("SELECT * FROM users");
  users = result.rows;
  return users;
}

async function checkVisisted() {
  const result = await db.query("SELECT country_code FROM visited_countries WHERE user_id = $1", [currentUserId]);
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });

  console.log(countries)
  return countries;
}
app.get("/", async (req, res) => {
  const countries = await checkVisisted();
  const users = await allUsers();

  const currentUser = users.find((user) => user.id == currentUserId);

  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: users,
    color: currentUser.color,
  });
});

app.post("/add", async (req, res) => {
  const input = req.body["country"];

  try {
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()]
    );

    const data = result.rows[0];
    const countryCode = data.country_code;
    try {
      await db.query(
        "INSERT INTO visited_countries (country_code, user_id) VALUES ($1, $2)",
        [countryCode, currentUserId]
      );
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
  res.redirect("/");
});

app.post("/user", async (req, res) => {
  if (req.body.add == "new") {
    res.render("new.ejs");
  }

  if (req.body.user) {
    currentUserId = req.body.user
    res.redirect("/");
  }
});

app.post("/new", async (req, res) => {
  const result = await db.query("INSERT INTO users (name, color) VALUES ($1, $2) RETURNING id", [
    req.body.name,
    req.body.color
  ])
  currentUserId = result.rows[0].id

  res.redirect("/")
  ////Hint: The RETURNING keyword can return the data that was inserted.
  ////https://www.postgresql.org/docs/current/dml-returning.html
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
