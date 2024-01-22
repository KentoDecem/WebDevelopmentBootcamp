import express from "express";
import morgan from "morgan";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;


const ourOwnMiddleware = (req,res,next) => {
  console.log("Request method: ", req.method);
  next();
};

app.use(morgan("dev"));
app.use(ourOwnMiddleware);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
