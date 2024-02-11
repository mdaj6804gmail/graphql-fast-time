const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const loger = require("morgan");
const path = require("path");
const { graphqlHTTP } = require("express-graphql");
const schema = require("./graphql/schema");
const rootValue = require("./graphql/resolvers");

const app = express();

app.use(bodyParser.urlencoded({ extended: false })); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(express.static(path.join(__dirname, "/public/image")));
app.use(loger("dev"));
app.use(cors());

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: rootValue,
    graphiql: true,
    customFormatErrorFn(err) {
      // console.log(err.originalError);
      const error = {
        message: err.originalError.message || undefined,
        code: err.originalError.code || 401,
        ...err.originalError.data,
      };

      return error;
    },
  }),
);

app.use((err, req, res, next) => {
  // console.log("use Error =:", err);
  const status = err.statusCode || 500;
  let errors = undefined;

  if (err.errors) {
    errors = err.errors;
  }
  console.log(err);

  res.status(status).json({
    message: err.message,
    statusCode: status,
    errors: errors,
  });
});

app.listen(8080, () => {
  mongoose
    .connect("mongodb://localhost:27017/feedapp")
    .then(() => {
      console.log(`db is connect`);
    })
    .catch((err) => {
      console.log(err);
    });
});
