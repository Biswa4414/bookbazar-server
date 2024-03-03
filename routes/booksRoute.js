const express = require("express");
const router = express.Router();
const { checkAndValidate } = require("../utils/bookUtils.js"); // Using destructuring for correct import
const bookModel = require("../models/bookModel.js");

// Route for create a new Book
router.post("/", async (req, res) => {
  const { title, author, publishedYear } = req.body;
  try {
    await checkAndValidate({ title, author, publishedYear });

    const checkExistBook = await bookModel.findOne({ title: title });

    if (checkExistBook) {
      return res.send({
        status: 400,
        message: "Book title already present,Give a different title",
      });
    }

    const bookObj = new bookModel({
      title: req.body.title,
      author: req.body.author,
      publishedYear: req.body.publishedYear,
    });

    // Assuming you have a model method for saving the book
    const bookDb = await bookObj.save();

    return res.send({
      status: 200,
      message: "Book created successfully",
      data: bookDb,
    });
  } catch (error) {
    console.log(error);
    return res.send({
      status: 500,
      message: "Db error",
    });
  }
});

// Route for Get All Books from database
router.get("/", async (req, res) => {
  try {
    const books = await bookModel.find();
    return res.send({
      status: 200,
      message: "Finallyyyyyy ! Got your Books",
      data: books,
    });
  } catch (error) {
    console.log(error);
    return res.send({
      status: 500,
      message: error.message,
    });
  }
});

// Route for Get One Book from database by id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const book = await bookModel.findById(id);
    return res.send({
      status: 200,
      message: "Finallyyyyyy ! Got your Book",
      data: book,
    });
  } catch (error) {
    console.log(error.message);
    return res.send({
      status: 500,
      message: error.message,
    });
  }
});

// Route for Update a Book
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await bookModel.findByIdAndUpdate(id, req.body);

    if (!result) {
      return res.send({
        status: 400,
        message: "Book not found",
      });
    }

    return res.send({
      status: 200,
      message: "Book update successfully",
      data: result,
    });
  } catch (error) {
    console.log(error);
    return res.send({
      status: 500,
      message: error.message,
    });
  }
});

// Route for Delete a book
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await bookModel.findByIdAndDelete(id);

    if (!result) {
      return res.send({
        status: 400,
        message: "Book not found",
      });
    }

    return res.send({
      status: 200,
      message: "Book delete successfully",
    });
  } catch (error) {
    console.log(error);
    return res.send({
      status: 500,
      message: error.message,
    });
  }
});

//Check Book Title Exist or not
router.post("/check", async (req, res) => {
  const { title, author, publishedYear } = req.body;
  try {
    await checkAndValidate({ title, author, publishedYear });

    const checkExistBook = await bookModel.findOne({ title: title });

    if (checkExistBook) {
      return res.send({
        status: 400,
        message: "Give a different title",
      });
    }
    else{
      const bookObj = new bookModel({
        title: req.body.title,
        author: req.body.author,
        publishedYear: req.body.publishedYear,
      });
  
      // Assuming you have a model method for saving the book
      const bookDb = await bookObj.save();
  
      return res.send({
        status: 200,
        message: "Book created successfully",
        data: bookDb,
      });
    }
  } catch (error) {
    console.log(error);
    return res.send({
      status: 500,
      message: "Db error",
    });
  }
});

module.exports = router; // Using module.exports for exporting the router
