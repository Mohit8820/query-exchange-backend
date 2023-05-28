const express = require("express");
const router = express.Router();

const questionController = require("../controllers/questions-controllers.js");
const checkAuth = require("../middleware/check-auth");

router.get("/", questionController.getAllQuestion);

router.get("/:qid", questionController.getQuestionByQId);

router.get("/user/:uid", questionController.getQuestionsByUserId);

router.use(checkAuth); //check for valid token to continue below

router.post("/", questionController.createQuestion);

router.patch("/:qid", questionController.updateQuestion);

router.patch("/like/:qid", questionController.like);
router.patch("/unlike/:qid", questionController.unlike);
router.patch("/dislike/:qid", questionController.dislike);
router.patch("/undoDislike/:qid", questionController.undoDislike);

router.patch("/upvote/:aid", questionController.upvote);
router.patch("/undoUpvote/:aid", questionController.undoUpvote);
router.patch("/downvote/:aid", questionController.downvote);
router.patch("/undoDownvote/:aid", questionController.undoDownvote);

router.delete("/delete", questionController.deleteAnswer);

router.delete("/:qid", questionController.deleteQuestion);

module.exports = router;
