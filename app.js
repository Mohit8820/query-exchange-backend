const express = require("express");
const HttpError = require("./models/http-error");

const questionsRoutes = require("./routes/question-routes");
const usersRoutes = require("./routes/users-routes");

const app = express();

app.use(express.json({ limit: "50mb" }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

app.use("/api/questions", questionsRoutes); // => /api/question...
app.use("/api/users", usersRoutes);

app.use((req, res) => {
  throw new HttpError("route not found", 404);
});

app.use((error, req, res, next) => {
  if (res.headerSent) return next(error);
  res.status(error.code || 500);
  res.json({ message: error.message || "there was some error" });
}); //this function will be executed only to requests that have an error attached to it.

let port = process.env.PORT;
if (port == null || port == "") {
  port = 4000;
}

const mongoose = require("mongoose");
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@clustertodo.vwsuk.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(port, function () {
      console.log(`server started on port ${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
