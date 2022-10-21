const mongoose = require("mongoose");
const HttpError = require("../models/http-error");

const Question = require("../models/question");
const User = require("../models/user");

const getAllQuestion = async (req, res, next) => {
  let questions;
  try {
    questions = await Question.find();
  } catch (err) {
    const error = new HttpError(
      "Couldn't find the questions because something went wrong with the request",
      500
    );
    return next(error);
  }

  if (!questions || questions.length === 0) {
    const error = new HttpError("error finding any question", 404); //use "throw error" when synchronous function // next(error) when async
    return next(error);
    // return res.status(404).json({ message: "error finding question by uid" });
  }
  res.json({
    questions: questions.map((ques) => ques.toObject({ getters: true })),
  });
};

const getQuestionByQId = async (req, res, next) => {
  const quesId = req.params.qid;
  let question;
  try {
    question = await Question.findById(quesId);
  } catch (err) {
    const error = new HttpError(
      "Couldn't find the question by qid because something went wrong with the request",
      500
    );
    return next(error);
  }

  if (!question) {
    const error = new HttpError("error finding question by qid in db", 404);
    return next(error);
    // return res.status(404).json({ message: "error finding question by qid" });
  }
  res.json({ question: question.toObject({ getters: true }) }); // => { place } => { place: place }
};

const getQuestionsByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  //let questions;
  let userWithQues;
  try {
    userWithQues = await User.findById(userId).populate("questions");
    //  questions = await Question.find({ userId: userId });
  } catch (err) {
    const error = new HttpError("Fetching places by uid failed", 500);
    return next(error);
  }

  if (!userWithQues || userWithQues.questions.length === 0) {
    const error = new HttpError(
      "error finding questions asked by the user",
      404
    ); //use "throw error" when synchronous function // next(error) when async
    return next(error);
    // return res.status(404).json({ message: "error finding question by uid" });
  }
  res.json({
    questions: userWithQues.questions.map((ques) =>
      ques.toObject({ getters: true })
    ),
  });
};

const createQuestion = async (req, res, next) => {
  const { questionTitle, questionBody, questionTags, askedOn, userId } =
    req.body;
  // const title = req.body.title;

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError("Creating failed while finding user", 404);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("User adding ques doesnt exist", 500);
    return next(error);
  }

  const createdQues = new Question({
    questionTitle: questionTitle,
    questionBody: questionBody,
    questionTags,
    answers: [],
    likes: [],
    dislikes: [],
    askedOn,
    userId,
    userPosted: user.name,
    userPostedAvatar: { ...user.avatar },
  });

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    await createdQues.save({ session: session });
    user.questions.push(createdQues); //not js push...see vid 15 of database
    await user.save({ session: session });
    await session.commitTransaction();
  } catch (err) {
    const error = new HttpError("Creating question failed", 500);
    return next(error);
  }

  res.status(201).json({ question: createdQues });
};

const updateQuestion = async (req, res, next) => {
  const { answerBody, answeredOn, userId } = req.body;

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError("updation failed while finding user", 404);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("User updating ques doesnt exist", 500);
    return next(error);
  }

  const quesId = req.params.qid;

  let question;
  try {
    question = await Question.findById(quesId);
  } catch (err) {
    const error = new HttpError("cant add answer", 500);
    return next(error);
  }

  const createdAns = {
    answerBody,
    userId,
    answeredOn,
    upVotes: [],
    downVotes: [],
    userAnswered: user.name,
  };

  question.answers = [...question.answers, createdAns];

  try {
    await question.save();
  } catch (err) {
    const error = new HttpError(
      "something went wrong, can't update answer",
      500
    );
    return next(error);
  }

  // DUMMY_Questions[quesIndex] = updatedQuestion;
  res.status(200).json({ question: question.toObject({ getters: true }) });
};

const deleteQuestion = async (req, res, next) => {
  const quesId = req.params.qid;

  let question;
  try {
    question = await Question.findById(quesId).populate("userId"); //populate gives access to user os userId
  } catch (err) {
    const error = new HttpError("cant delete ques", 500);
    return next(error);
  }

  if (!question) {
    const error = new HttpError("could not find question to delete", 404);
    return next(error);
  }

  if (
    question.userId.id !== req.userData.userId &&
    req.userData.userId !== "630f42be2f1ad3455ab123cc"
  ) {
    const error = new HttpError(
      "You are not allowed to delete this question",
      401
    );
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await question.remove({ session: sess });
    question.userId.questions.pull(question);
    await question.userId.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Something went wrong,cant delete ques", 500);
    return next(error);
  }

  res.status(200).json({ message: "Deleted question." });
};

const deleteAnswer = async (req, res, next) => {
  const { question_id, answer_id, answeredBy } = req.query;
  let question;
  try {
    question = await Question.findById(question_id).populate("userId"); //populate gives access to user os userId
  } catch (err) {
    const error = new HttpError("Can't delete ans", 500);
    return next(error);
  }

  if (!question) {
    const error = new HttpError(
      "could not find question to delete the ans",
      404
    );
    return next(error);
  }

  if (
    question.userId.id !== req.userData.userId &&
    req.userData.userId !== "630f42be2f1ad3455ab123cc" &&
    answeredBy !== req.userData.userId
  ) {
    const error = new HttpError(
      "You are not allowed to delete this answer",
      401
    );
    return next(error);
  }

  Question.findOneAndUpdate(
    { _id: question_id },
    { $pull: { answers: { _id: answer_id } } },
    function (err, founditem) {
      if (!err) {
        res.status(200).json({ message: "answer deleted" });
      }
      if (err) {
        res
          .status(404)
          .json({ message: "Something went wrong while deleting the answer" });
      }
    }
  );
};

const like = async (req, res, next) => {
  const { userId } = req.body;

  Question.findByIdAndUpdate(
    req.params.qid,
    { $push: { likes: userId }, $pull: { dislikes: userId } },
    function (err, foundQues) {
      if (!foundQues) {
        res
          .status(404)
          .json({ message: "Ques liking failed while finding ques" });
      } else if (err) {
        res
          .status(404)
          .json({ message: "Something went wrong while liking the ques" });
      } else {
        res.status(200).json({
          message: "ques liked",
        });
      }
    }
  );
};

const unlike = async (req, res, next) => {
  const { userId } = req.body;

  Question.findByIdAndUpdate(
    req.params.qid,
    { $pull: { likes: userId } },
    function (err, foundQues) {
      if (!foundQues) {
        res
          .status(404)
          .json({ message: "Ques unliking failed while finding ques" });
      } else if (err) {
        res
          .status(404)
          .json({ message: "Something went wrong while unliking the ques" });
      } else {
        res.status(200).json({
          message: "ques unliked",
        });
      }
    }
  );
};

const dislike = async (req, res, next) => {
  const { userId } = req.body;

  Question.findByIdAndUpdate(
    req.params.qid,
    { $pull: { likes: userId }, $push: { dislikes: userId } },
    function (err, foundQues) {
      if (!foundQues) {
        res
          .status(404)
          .json({ message: "Ques disliking failed while finding ques" });
      } else if (err) {
        res
          .status(404)
          .json({ message: "Something went wrong while disliking the ques" });
      } else {
        res.status(200).json({
          message: "ques disliked",
        });
      }
    }
  );
};

const undoDislike = async (req, res, next) => {
  const { userId } = req.body;

  Question.findByIdAndUpdate(
    req.params.qid,
    { $pull: { dislikes: userId } },
    function (err, foundQues) {
      if (!foundQues) {
        res
          .status(404)
          .json({ message: "Ques disliking failed while finding ques" });
      } else if (err) {
        res
          .status(404)
          .json({ message: "Something went wrong while disliking the ques" });
      } else {
        res.status(200).json({
          message: "ques disliked",
        });
      }
    }
  );
};

const upvote = async (req, res, next) => {
  const { userId } = req.body;
  Question.updateOne(
    { "answers._id": req.params.aid },
    {
      $push: {
        "answers.$.upvotes": userId,
      },
    },
    { new: true },
    function (err, foundQues) {
      if (!foundQues) {
        res
          .status(404)
          .json({ message: "Ans liking failed while finding ques" });
      } else if (err) {
        res
          .status(404)
          .json({ message: "Something went wrong while liking the Ans" });
      } else {
        res.status(200).json({
          message: "Ans liked",
        });
      }
    }
  );
};

const undoUpvote = async (req, res, next) => {
  const { userId } = req.body;

  Question.updateOne(
    { "answers._id": req.params.aid },
    { $pull: { "answers.$.upvotes": userId } },
    function (err, foundQues) {
      if (!foundQues) {
        res
          .status(404)
          .json({ message: "Ques unliking failed while finding ques" });
      } else if (err) {
        res
          .status(404)
          .json({ message: "Something went wrong while unliking the ques" });
      } else {
        res.status(200).json({
          message: "ques unliked",
        });
      }
    }
  );
};

const downvote = async (req, res, next) => {
  const { userId } = req.body;

  Question.updateOne(
    { "answers._id": req.params.aid },
    {
      $pull: { "answers.$.upvotes": userId },
      $push: { "answers.$.downvotes": userId },
    },
    function (err, foundQues) {
      if (!foundQues) {
        res
          .status(404)
          .json({ message: "Ques disliking failed while finding ques" });
      } else if (err) {
        res
          .status(404)
          .json({ message: "Something went wrong while disliking the ques" });
      } else {
        res.status(200).json({
          message: "ques disliked",
        });
      }
    }
  );
};

const undoDownvote = async (req, res, next) => {
  const { userId } = req.body;

  Question.updateOne(
    { "answers._id": req.params.aid },
    {
      $pull: { "answers.$.downvotes": userId },
    },
    function (err, foundQues) {
      if (!foundQues) {
        res
          .status(404)
          .json({ message: "Ques disliking failed while finding ques" });
      } else if (err) {
        res
          .status(404)
          .json({ message: "Something went wrong while disliking the ques" });
      } else {
        res.status(200).json({
          message: "ques disliked",
        });
      }
    }
  );
};

exports.getAllQuestion = getAllQuestion;
exports.getQuestionByQId = getQuestionByQId;
exports.getQuestionsByUserId = getQuestionsByUserId;
exports.createQuestion = createQuestion;
exports.updateQuestion = updateQuestion;
exports.deleteQuestion = deleteQuestion;
exports.deleteAnswer = deleteAnswer;
exports.like = like;
exports.unlike = unlike;
exports.dislike = dislike;
exports.undoDislike = undoDislike;
exports.upvote = upvote;
exports.undoUpvote = undoUpvote;
exports.downvote = downvote;
exports.undoDownvote = undoDownvote;
