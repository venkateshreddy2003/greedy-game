const express = require("express");
const {
  setDataHandler,
  getDataHandler,
  queuePushHandler,
  queuePopHandler,
  queueBlockingPopHandler,
} = require("../controllers/dataCtrl");
const router = express.Router();
// setting data
router.put("/data/set", setDataHandler);
// getting data
router.get("/data/get", getDataHandler);
// pushing data into queue
router.put("/queue/push", queuePushHandler);
// popping an element from queue
router.delete("/queue/pop", queuePopHandler);
// blocking queue reading
router.get("/queue/bqpop", queueBlockingPopHandler);
module.exports = { router };
