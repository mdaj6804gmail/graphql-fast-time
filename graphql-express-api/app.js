const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const loger = require("morgan");
const path = require("path");
const { graphqlHTTP } = require("express-graphql");
const schema = require("./graphql/schema");
const rootValue = require("./graphql/resolvers");
const auth = require("./middleware/is-auth");
const Upload = require("./utils/fileUpload");
const CastomError = require("./utils/error");

const app = express();

app.use(bodyParser.urlencoded({ extended: false })); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(express.static(path.join(__dirname, "/public/image")));
app.use(loger("dev"));
app.use(cors());
app.use(auth);

app.post("/image-upload", Upload(), (req, res, next) => {
  if (!req.isUser) {
    CastomError("User Not Authorization", 401);
  }
  if (req.file) {
    return res.status(200).send(req.file.filename);
  }
  if (req.body.image) {
    return res.status(200).send(req.body.image);
  }
  CastomError("Image Not Upload Please Select Image", 402);
});

app.use(
  "/graphql",
  graphqlHTTP((req, res) => ({
    schema: schema,
    rootValue: rootValue,
    graphiql: true,
    customFormatErrorFn(err) {
      console.log(
        "err.originalError :",
        err.message,
        err.originalError?.status,
      );
      res.statusCode = err.originalError?.status || 401;
      if (req.body.query.length <= 2) {
        res.statusCode = err.originalError?.status || 422;
      }

      const error = {
        message:
          (req.body.query.length <= 2 && "Please Enter Query Object") ||
          err.originalError?.message ||
          err.message ||
          undefined,
        status:
          (req.body.query.length <= 2 && 422) ||
          err.originalError?.status ||
          401,
        ...(err.originalError?.data || undefined),
      };

      return error;
    },
  })),
);

app.use((err, req, res, next) => {
  console.log("use Error =:", err);
  const status = err.status || 500;
  let errors = undefined;

  if (err.errors) {
    errors = err.errors;
  }

  res.status(status).json({
    message: err.message,
    status: status,
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
