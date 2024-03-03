// const validator = require("validator")

 const checkAndValidate = ({ title, author, publishedYear }) => {
  return new Promise((resolve, reject) => {
    if (!title || !author || !publishedYear) {
      reject("Missing Credential");
    }

    if (typeof title !== "string") reject("Title is not a String");
    if (typeof author !== "string") reject("Author's name is not a String");

    resolve();
  });
};

module.exports = {checkAndValidate}
