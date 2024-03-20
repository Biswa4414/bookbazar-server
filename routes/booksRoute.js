const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const validator = require("validator");

//file-imports
const userModel = require("../models/userModel.js");
const { cleanupAndValidate } = require("../utils/authUtil.js");
const bookModel = require("../models/bookModel.js");
const { checkAndValidate } = require("../utils/bookUtils.js"); // Using destructuring for correct import

//Route for Register
router.post("/register", async (req, res) => {
  const { name, email, username, password } = req.body;
  //data validation

  try {
    await cleanupAndValidate({ name, email, username, password });
  } catch (error) {
    console.log(error);
    return res.send({
      status: 400,
      message: "Validation Failed",
      error: error,
    });
  }

  //email and usernames are unique
  const userEmailExist = await userModel.findOne({ email: email });

  if (userEmailExist) {
    return res.send({
      status: 400,
      message: "Email already exist",
      emailExists: true,
    });
  }

  const usernameExist = await userModel.findOne({ username });
  if (usernameExist) {
    return res.send({
      status: 400,
      message: "Username already exist",
      usernameExists: true,
    });
  } else if (userEmailExist && usernameExist) {
    return res.send({
      status: 400,
      message: "Email and Username already exist",
      exists: true,
    });
  }

  //hashing the password

  const hashedPassword = await bcrypt.hash(
    password,
    parseInt(process.env.SALT)
  );

  //store data in DB
  const userObj = new userModel({
    //schema key : value
    name: name,
    email: email,
    username: username,
    password: hashedPassword,
  });

  try {
    const userDb = await userObj.save();
    console.log("Register Successfully");
    return res.send({
      status: 200,
      message: "Register Successfully",
      data: userDb,
    });
  } catch (error) {
    console.log(error);
    return res.send({
      status: 500,
      message: "Data base error",
      error: error,
    });
  }
});

//Route for Login
router.post("/login", async (req, res) => {
  const { loginId, password } = req.body;

  //find the user with loginId

  try {
    let userDb;
    if (validator.isEmail(loginId)) {
      userDb = await userModel.findOne({ email: loginId });
      if (!userDb) {
        return res.send({
          status: 400,
          message: "Email not found",
          exists: false,
        });
      }
    } else {
      userDb = await userModel.findOne({ username: loginId });
      if (!userDb) {
        return res.send({
          status: 400,
          message: "Username not found",
          exists: false,
        });
      }
    }

    //compare the password
    const isMatched = await bcrypt.compare(password, userDb.password);

    if (!isMatched) {
      return res.send({
        status: 401,
        message: "Password incorrect",
        pwExists: false,
      });
    }

    //session base auth
    console.log(req.session);
    req.session.isAuth = true;
    req.session.user = {
      email: userDb.email,
      username: userDb.username,
      userId: userDb._id,
    };

    return res.send({
      status: 200,
      message: "Login Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.send({
      status: 500,
      message: "Database error",
      error: error,
    });
  }
});

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

router.get("/pagination", async (req, res) => {
  const skip = Number(req.query.skip) || 0;
  const limit = Number(req.query.limit) || 10; // Assuming default limit as 10

  try {
    // Fetch paginated data
    const myData = await bookModel.find().skip(skip).limit(limit);

    // Fetch total count of documents
    const totalCount = await bookModel.countDocuments();

    const totalPage = Math.ceil(totalCount / limit);

    return res.status(200).json({
      status: 200,
      data: myData,
      totalPage: totalPage,
      currentPage: Math.floor(skip / limit) + 1,
      totalCount: totalCount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
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

//Routes for searching book with title

router.post("/search", async (req, res) => {
  const { title } = req.body;
  try {
    const book = await bookModel.findOne({ title });
    if (book) {
      return res.send({
        status: 200,
        message: "Got the Book",
        data: book,
      });
    } else {
      return res.send({
        status: 400,
        message: "Book not found",
      });
    }
  } catch (error) {
    console.log(error);
    return res.send({
      status: 500,
      message: "DB error",
    });
  }
});

module.exports = router; // Using module.exports for exporting the router
