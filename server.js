const express = require("express");
const { router } = require("./routes/router");
const cors = require("cors");
const { notFound, errorHandler } = require("./middlewares/error/errorHandler");
const app = express();
app.use(cors());
// parses incoming data to JSON
app.use(express.json());
// routes
app.use(router);
//404 not found handler
app.use(notFound);
//error handler
app.use(errorHandler);
// creating server
app.listen(5000, () => {
  console.log("server running on 5000");
});
