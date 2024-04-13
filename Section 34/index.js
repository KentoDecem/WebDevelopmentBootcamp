import express from "express";
import pg from "pg";
import multer from "multer";
import fs from "fs";
import axios from "axios";

const app = express();
const port = 3000;

let API_KEY = "Y6wmLNnwVrAlwCjB5+bRog==k6gwXRsjuL79ZYRy"


// Konfiguruj storage (jeśli jest to potrzebne)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/book_covers/'); // Określ katalog docelowy dla plików
  },
  filename: (req, file, cb) => {
    cb(null, 'changeme.png'); // Określ nazwę pliku
  },
});

// Inicjalizuj obiekt upload z konfiguracją multer
const upload = multer({ storage: storage });

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "section-34",
    password: "password",
    port: 5432,
});
db.connect();

let activeUser = "";
let activeUserId = 0;
let sortBy = "newest";

async function checkHowManyReadedBooks(userId) {
    let result = await db.query("SELECT * FROM book_notes WHERE user_id = $1", [userId]);
    let readedBooks = parseInt(result.rows.length)
    await db.query("UPDATE users SET readed_books = $1 WHERE id = $2", [readedBooks, userId]);
}

// Middleware to set locals
app.use(async (req, res, next) => {
    let users = (await db.query("SELECT * FROM users ORDER BY name ASC")).rows;
    activeUserId = users.find((user) => user.name == activeUser)?.id;

    res.locals.activeUser = activeUser;
    res.locals.users = users;
    next();
});

app.get("/", async (req, res) => {
    let quote1 = (await axios.get("https://api.api-ninjas.com/v1/quotes?category=happiness", {headers: {"X-Api-Key": API_KEY}})).data[0];
    let quote2 = (await axios.get("https://api.api-ninjas.com/v1/quotes?category=humor", {headers: {"X-Api-Key": API_KEY}})).data[0];
    let quote3 = (await axios.get("https://api.api-ninjas.com/v1/quotes?category=inspirational", {headers: {"X-Api-Key": API_KEY}})).data[0];
    console.log(quote2)

    let result = (await db.query("SELECT * FROM book_notes ORDER BY RANDOM() LIMIT 3")).rows;
    let first_h3 = result[0].author;
    let second_h3 = quote2.author;
    let third_h3 = quote3.author;
    let first_note = result[0].note;
    let second_note = quote2.quote;
    let third_note = quote3.quote;
    res.render("index", {first_h3: first_h3, second_h3: second_h3, third_h3: third_h3, first_note: first_note, second_note: second_note, third_note: third_note});
});

app.get("/biblioteka",async (req, res) => {

    let sqlQuery = "SELECT * FROM book_notes WHERE user_id = $1";
    
    switch (sortBy) {
        case "newest":
            sqlQuery += " ORDER BY readed_date DESC";
            break;
        case "oldest":
            sqlQuery += " ORDER BY readed_date ASC";
            break;
        case "highest_rated":
            sqlQuery += " ORDER BY rating DESC";
            break;
        case "lowest_rated":
            sqlQuery += " ORDER BY rating ASC";
            break;
        case "longest":
            sqlQuery += " ORDER BY LENGTH(note) DESC";
            break;
        case "shortest":
            sqlQuery += " ORDER BY LENGTH(note) ASC";
            break;
        case "alphabetically_title":
            sqlQuery += " ORDER BY title ASC";
            break;
        case "alphabetically_author":
            sqlQuery += " ORDER BY author ASC";
            break;
        default:
            // Obsługa domyślna, na przykład błąd lub inna akcja
    }


    res.locals.sortBy = sortBy;
    res.locals.book_notes = (await db.query(sqlQuery, [activeUserId])).rows;

    if (activeUser == "") {
        res.redirect("/");
        return;
    }

    checkHowManyReadedBooks(activeUserId);
    res.render("biblioteka");
});

app.post("/biblioteka/sortuj", async (req, res) => {
    sortBy = req.body.sortuj
    res.redirect("/biblioteka")
})

app.get("/dodaj_ksiazke",(req, res) => {
    res.render("add_book");
})

app.post("/dodaj_ksiazke", upload.single("image"), async (req, res) => {
    let title = req.body.title;
    let author = req.body.author;
    let note = req.body.note;
    let rating = req.body.rating;
    let readed_date = req.body.readed_date;
    console.log(readed_date)
    
    let result = await db.query("INSERT INTO book_notes (title, author, note, rating, readed_date, user_id) VALUES ($1, $2, $3, $4, $5 , $6) RETURNING *", [title, author, note, rating, readed_date, activeUserId]);
    let bookId = parseInt(result.rows[0].book_cover_id)

     // Nowa nazwa pliku
    let newFileName = `${bookId}.png`;
    let oldPath = 'public/images/book_covers/changeme.png'; // Stara ścieżka pliku
    let newPath = `public/images/book_covers/${newFileName}`; // Nowa ścieżka pliku

    // Zmień nazwę pliku
    fs.rename(oldPath, newPath, (err) => {
        if (err) {
            console.error("Błąd podczas zmiany nazwy pliku:", err);
            // Obsłuż błąd w jakiś sposób
        } else {
            console.log("Nazwa pliku została pomyślnie zmieniona.");
            // Możesz kontynuować zapisywanie informacji do bazy danych lub inne operacje
        }
    });

    res.redirect("/biblioteka");
})

app.post("/biblioteka/usun_ksiazke", async (req, res) => {
    await db.query("DELETE FROM book_notes WHERE book_cover_id = $1", [req.body.id]);

    // and delete the image with same id
    let fileNameToDelete = `${req.body.id}.png`;
    let pathToDelete = `public/images/book_covers/${fileNameToDelete}`;
    fs.unlink(pathToDelete, (err) => {
        if (err) {
            console.error("Błąd podczas usuwania pliku:", err);
        } else {
            console.log("Plik został usunięty.");
        }
    });
    res.redirect("/biblioteka");
});

app.post("/biblioteka/edytuj_ksiazke", upload.single("image"), async (req, res) => {
    let title = req.body.title;
    let author = req.body.author;
    let note = req.body.note;
    let rating = req.body.rating;
    let readed_date = req.body.readed_date;
    let id = req.body.id;

    await db.query("UPDATE book_notes SET title = $1, author = $2, note = $3, rating = $4, readed_date = $5 WHERE book_cover_id = $6", [title, author, note, rating, readed_date, id]);

    // Nowa nazwa pliku
    let newFileName = `${id}.png`;
    let oldPath = 'public/images/book_covers/changeme.png'; // Stara ścieżka pliku
    let newPath = `public/images/book_covers/${newFileName}`; // Nowa ścieżka pliku

    fs.access(oldPath, fs.constants.F_OK, (err) => {
    if (err) {
        if (err.code === 'ENOENT') {
            console.error('Stara ścieżka nie istnieje.');
            // Obsłuż ten przypadek w jakiś sposób, np. informacja dla użytkownika
        } else {
            console.error('Błąd podczas sprawdzania istnienia starej ścieżki:', err);
            // Obsłuż błąd w jakiś sposób
        }
    } else {
        // Zmień nazwę pliku
        fs.rename(oldPath, newPath, (err) => {
            if (err) {
                console.error("Błąd podczas zmiany nazwy pliku:", err);
                // Obsłuż błąd w jakiś sposób
            } else {
                console.log("Nazwa pliku została pomyślnie zmieniona.");
                // Możesz kontynuować zapisywanie informacji do bazy danych lub inne operacje
            }
        });
    }
});

    res.redirect("/biblioteka");
});


app.post("/user", async (req, res) => {
    if (req.body.add_user) {
        res.render("new_user");
        return;
    }

    let user = req.body.user;
    activeUser = user;
    res.redirect("/biblioteka");
});

app.post("/add_user", async (req, res) => {
    let newUser = req.body.user
    await db.query("INSERT INTO users (name, readed_books) VALUES ($1, 0)", [newUser]);
    activeUser = newUser;
    res.redirect("/biblioteka");
});

app.get("/biblioteka/usun_uzytkownika", async (req, res) => {
    // make array of all book_cover_ids that belong to activeUserID
    let book_cover_ids = (await db.query("SELECT book_cover_id FROM book_notes WHERE user_id = $1", [activeUserId])).rows;
    book_cover_ids.forEach(book => {
        const filePath = `public/images/book_covers/${book.book_cover_id}.png`;
        
        fs.unlink(filePath, err => {
            if (err) {
                console.error(`Błąd podczas usuwania pliku ${filePath}: ${err}`);
                return;
            }
            console.log(`Plik ${filePath} został usunięty.`);
        });
    });

    await db.query("DELETE FROM book_notes WHERE user_id = $1", [activeUserId]);
    await db.query("DELETE FROM users WHERE name = $1", [activeUser]);



    res.redirect("/");
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
