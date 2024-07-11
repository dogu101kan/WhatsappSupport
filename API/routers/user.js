const express = require("express");
const { userAccess } = require("../controllers/user");
const { getAccess, getAdminAccess } = require("../middlewares/auth");

const router = express.Router();

router.get("/useraccess", [getAccess, getAdminAccess], userAccess);

module.exports = router;