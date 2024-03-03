const express = require("express");
const mongoose = require("mongoose");
const bookRoute = require("./routes/booksRoute.js");
const cors = require("cors");
require("dotenv").config();

//file-imports

//IMPORT CONSTANT
const app = express();
const PORT = process.env.PORT || 8000;

//middleware
app.use(express.json());
app.use(cors());
//// app.use(
//   cors({
//     origin: 'http://localhost:3000',
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     allowedHeaders: ['Content-Type'],
//   })
// );

//mongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("mongoDB connected Succesfully");
  })
  .catch((error) => {
    console.log(error);
  });

//API

app.use("/books", bookRoute);

app.get("/", (req, res) => {
  return res.send("Server is running");
});

app.listen(PORT, () => {
  console.log(`app is listening to port: ${PORT}`);
});
