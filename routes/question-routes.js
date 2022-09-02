const express = require("express");
const router = express.Router();

const questionController = require("../controllers/questions-controllers.js");
const checkAuth = require("../middleware/check-auth");

router.get("/", questionController.getAllQuestion);

router.get("/:qid", questionController.getQuestionByQId);

router.get("/user/:uid", questionController.getQuestionsByUserId);

router.use(checkAuth); //checke for valid token to continue below

router.post("/", questionController.createQuestion);

router.patch("/:qid", questionController.updateQuestion);

router.delete("/delete", questionController.deleteAnswer);

router.delete("/:qid", questionController.deleteQuestion);

module.exports = router;
