const express = require("express");
const { messageHasFixed, allMessageHasFixed, test, getMessageDetailsController, editMessageDetailsController, sendMessage, messagehasMarked, editMessageTopics, getTopicsController, getSubTopicsController } = require("../controllers/message");
const { getAccess } = require("../middlewares/auth");

const router = express.Router();

router.get("/hasFixed/:id", getAccess, messageHasFixed);
router.get("/hasMarked/:id", getAccess, messagehasMarked);
router.get("/allmessagesfixed/:id", getAccess, allMessageHasFixed);
router.post("/messagedetails/:messageId", getAccess, editMessageDetailsController);
router.get("/messagedetails/:messageId",  getAccess, getMessageDetailsController);
router.post("/edittopics/:messageId",  getAccess, editMessageTopics);
router.post("/send", getAccess, sendMessage);
router.get("/topics", getTopicsController);
router.get("/subtopics", getSubTopicsController);

router.get("/test", test);


module.exports = router;