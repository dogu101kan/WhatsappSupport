const express = require("express");
const { getCustomers, getChat, getFilteredCustomers, notificationSetter, test } = require("../controllers/customers");
const { getAccess } = require("../middlewares/auth");

const router = express.Router();

router.get("/getfilteredchats", getAccess, getFilteredCustomers);
router.get("/:phoneNumber", getAccess, getChat);
router.get("/:phoneNumber/notification", getAccess, notificationSetter);

// filtre işlemleri ile birleştirildiğinden / route kullanılmıyor
// router.get("/", getAccess, getCustomers);
// router.get("/test/:phoneNumber",  test);

module.exports = router;