import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Connect to database
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Permalist",
  password: "password",
  port: 5432,
})
db.connect();

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

async function getItems() {
  const result = await db.query("SELECT * FROM items ORDER BY id ASC");
  items = result.rows;
  console.log(items)
  return items;
}

app.get("/", async (req, res) => {
  const items = await getItems();

  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  const title = req.body.newItem;
  await db.query("INSERT INTO items (title) VALUES ($1)", [title]);

  res.redirect("/");
});

app.post("/edit", async (req, res) => {
  await db.query("UPDATE items SET title = $2 WHERE id = $1", [req.body.updatedItemId, req.body.updatedItemTitle]);

  res.redirect("/");
});

app.post("/delete", async (req, res) => {
  const id = req.body.deleteItemId;
  await db.query("DELETE FROM items WHERE id = $1", [id]);
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
