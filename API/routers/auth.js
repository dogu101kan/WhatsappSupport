const express = require("express");
const { signUp, login, logout, clientStatus} = require("../controllers/auth");
const { getAccess } = require("../middlewares/auth");

const router = express.Router();


router.post("/register", signUp);
router.post("/login", login);
router.get("/logout", logout);
router.get("/status", getAccess, clientStatus);


module.exports = router;