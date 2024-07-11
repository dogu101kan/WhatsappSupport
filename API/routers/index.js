const express = require("express");
const message = require("./message");
const auth = require("./auth");
const customer = require("./customer");
const user = require("./user");
const router = express.Router();

router.use("/auth", auth);
router.use("/customer", customer);
router.use("/message", message);
router.use("/user", user);

module.exports = router;