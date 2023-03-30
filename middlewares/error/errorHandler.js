//Not found
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  res.status(404);
  next(error);
};

//Err handler
const errorHandler = (err, req, res, next) => {
  // console.log(err);
  // for handling 204 status codes beacuse they won't return any content
  if (err.statusCode === 204) {
    res.setHeader("error", "queue is empty");
  }
  return res.status(err?.statusCode).send({
    error: err?.message,
  });
};

module.exports = { errorHandler, notFound };
