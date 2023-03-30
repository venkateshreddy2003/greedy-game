// key value memory data store
const datastore = new Map();
const setDataHandler = async (req, res, next) => {
  try {
    // destructuring
    const { command } = req.body;
    const lst = command.split(" ");
    const expiry = command.search("EX");
    // if the command is not valid throwing an error
    if (lst[0] !== "SET" || lst.length < 3) {
      const error = new Error();
      error.message = "invalid command";
      error.statusCode = 400;
      throw error;
    }
    // no optional arguments
    if (lst.length === 3) {
      if (!datastore.has(lst[1])) {
        datastore.set(lst[1], lst[2]);
        return res.status(201).json();
      } else {
        datastore.set(lst[1], lst[2]);
        return res.status(200).json();
      }
    }
    // with optional arguments
    if (lst.length >= 4) {
      if (command.endsWith("NX") && !datastore.has(lst[1])) {
        datastore.set(lst[1], lst[2]);
      }
      if (command.endsWith("XX") && datastore.has(lst[1])) {
        datastore.set(lst[1], lst[2]);
      }
    }
    console.log(expiry);
    // handling expiry
    if (expiry !== -1 && lst.length >= 5 && lst[3] === "EX") {
      const expiryMilliSeconds = (await parseInt(lst[4])) * 1000;
      datastore.set(lst[1], {
        expire: Date.now() + expiryMilliSeconds,
        data: lst[2],
      });
      console.log(datastore.get(lst[1]));
    }
    // sending empty blank response
    res.status(200).json();
  } catch (error) {
    // handling error and passing to error handler middleware
    next(error);
  }
};
const getDataHandler = (req, res, next) => {
  try {
    // destructuring
    const { command } = req.body;
    const lst = command.split(" ");
    console.log(lst);
    console.log(datastore);
    // checking whether command is invalid
    if (lst[0] !== "GET") {
      const error = new Error();
      error.message = "invalid command";
      error.statusCode = 400;
      throw error;
    }
    // if data is expired then it will not be sent
    if (lst.length === 2) {
      console.log("s");
      if (datastore.has(lst[1])) {
        const temp = datastore.get(lst[1])?.expire;
        console.log(temp);
        console.log("ok");
        if (temp) {
          if (temp > Date.now()) {
            return res.json({
              value: datastore.get(lst[1])?.data,
            });
          } else {
            datastore.delete(lst[1]);
            const error = new Error();
            error.message = "key not found";
            error.statusCode = 404;
            throw error;
          }
        }
        return res.json({
          value: datastore.get(lst[1]),
        });
      }
      // key not found case
      else {
        const error = new Error();
        error.message = "key not found";
        error.statusCode = 404;
        throw error;
      }
    } else {
      const error = new Error();
      error.message = "invalid command";
      error.statusCode = 400;
      throw error;
    }
  } catch (error) {
    // handling errors
    // console.log(error);
    console.log(error.message);
    next(error);
  }
};
const queuePushHandler = (req, res, next) => {
  // destructuring
  const { command } = req.body;

  const lst = command.split(" ");
  try {
    // command is valid or not
    if (lst.length >= 3 && lst[0] === "QPUSH") {
      if (!datastore.has(lst[1])) {
        datastore.set(lst[1], [...lst.slice(2)]);
        return res.status(201).json("ok");
      } else {
        datastore.set(lst[1], [...datastore.get(lst[1]), ...lst.slice(2)]);
        res.status(200).json("ok");
      }
    } else {
      const error = new Error("invalid command");
      error.statusCode = 400;
      throw error;
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};
const queuePopHandler = (req, res, next) => {
  // res.json(req.url);
  try {
    const { command } = req.body;
    const lst = command.split(" ");
    // checking command is valid or not
    if (lst.length === 2 && lst[0] === "QPOP") {
      if (datastore.has(lst[1])) {
        const val = datastore.get(lst[1]).pop();
        if (val) {
          res.status(200).json({ value: val });
        } else {
          const error = new Error("null Queue is empty");
          error.statusCode = 200;
          throw error;
        }
      } else {
        res.status(404).json("null");
      }
    } else {
      const error = new Error("Invalid command");
      error.statusCode = 400;
      throw error;
    }
  } catch (error) {
    next(error);
  }
};
const queueBlockingPopHandler = (req, res, next) => {
  try {
    const { command } = req.body;
    const lst = command.split(" ");
    if (lst.length === 3 && lst[0] === "BQPOP") {
      if (datastore.has(lst[1])) {
        setTimeout(() => {
          const val = datastore.get(lst[1])[datastore.get(lst[1]).length - 1];
          if (val) {
            res.status(200).json(val);
          } else {
            res.status(200).json({ error: "null Queue is empty" });
          }
        }, parseFloat(lst[2]) * 1000);
      } else {
        res.status(404).json("null");
      }
    } else {
      const error = new Error("Invalid command");
      error.statusCode = 400;
      throw error;
    }
  } catch (error) {
    next(error);
  }
};
module.exports = {
  setDataHandler,
  getDataHandler,
  queuePushHandler,
  queuePopHandler,
  queueBlockingPopHandler,
};
