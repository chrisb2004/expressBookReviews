const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let doesExist = require("./auth_users.js").doesExist;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  let username = req.body.username;
  let password = req.body.password;

  if(!username || !password) {
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
  }

  // Check if the user does not already exist
  if (doesExist(username)) {
    return res.status(404).json({message: "User already exists!"}); 
  }

  users.push({"username": username, "password": password});
  return res.status(200).json({message: "User successfully registered. Now you can login"});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const getBooks = new Promise((resolve) => resolve(books));
    const data = await getBooks;
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const getBook = new Promise((resolve, reject) => {
      const book = books[isbn];
      if (book) resolve(book);
      else reject("Book not found");
    });
    const data = await getBook;
    return res.status(200).json(data);
  } catch (err) {
    return res.status(404).json({ message: err });
  }
});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = req.params.author;
    const getByAuthor = new Promise((resolve) => {
      resolve(Object.values(books).filter(book => book.author === author));
    });
    const data = await getByAuthor;
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching books" });
  }

/*
// version without axios adn async/await

  let author = req.params.author;
  return res.status(200).json(Object.values(books).filter(book => book.author === author));
*/

// Object.values() converts the object into an array of its inner objects (values),
// ignoring the ISBN keys (1, 2). Each element in the resulting array is one book object.
// .filter() then loops through each element (temporarily named "book"),
// keeping only the ones where the condition is true.
// "book" refers to each inner object like { author: "...", title: "...", reviews: {} },
// so book.author lets us access the author name directly.

});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  try {
    const title = req.params.title;
    const getByTitle = new Promise((resolve) => {
      resolve(Object.values(books).filter(book => book.title === title));
    });
    const data = await getByTitle;
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

//  Get book review
public_users.get('/review/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;
