const mongoose = require("mongoose");
const uuid = require("uuid");
const HttpError = require("../models/http-error");

const Question = require("../models/question");
const User = require("../models/user");

const DUMMY_Questions = [
  {
    _id: "1",
    upVotes: 8,
    downVotes: 2,
    noOfAnswers: 2,
    questionTitle:
      "What is the difference between the function malloc() and calloc()?",
    questionBody:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    questionTags: "bca",
    userPosted: "mano",
    userId: "1",
    askedOn: " 2022-07-14 11:45:26.123",
    answers: [
      {
        answerBody: "<span>a</span>",
        userAnswered: "kumar",
        //   answeredOn: "jan 2",
        userId: "2",
      },
    ],
  },
  {
    _id: "2",
    upVotes: 8,
    downVotes: 2,
    noOfAnswers: 2,
    questionTitle:
      "What are the key skills a candidate requires to excel in the field of business administration?",
    questionBody: "It meant to be",
    questionTags: "bba",
    userPosted: "mano",
    userId: "1",
    askedOn: "2022-07-14 10:45:26.123",
    answers: [
      {
        answerBody: "<span>a</span>",
        userAnswered: "kumar",
        //   answeredOn: "jan 2",
        userId: "2",
      },
      {
        answerBody: "<h2>Answer 2</h2>",
        userAnswered: "kumar 333",
        //   answeredOn: "jan 2",
        userId: "22",
      },
    ],
  },
  {
    _id: "3",
    upVotes: 8,
    downVotes: 2,
    noOfAnswers: 2,
    questionTitle: "What are embedded structure?",
    questionBody: "It meant to be",
    questionTags: "b.tech",
    userPosted: "mano",
    userId: "1",
    askedOn: "jan 20",
    answers: [
      {
        answerBody: "<span>a</span>",
        userAnswered: "kumar",
        //   answeredOn: "jan 2",
        userId: "2",
      },
      {
        answerBody: "<h2>Answer 2</h2>",
        userAnswered: "kumar 333",
        //   answeredOn: "jan 2",
        userId: "22",
      },
    ],
  },
  {
    _id: "4",
    upVotes: 8,
    downVotes: 2,
    noOfAnswers: 2,
    questionTitle:
      "Without using library function compute the length of the string.",
    questionBody:
      "I'm coding a function to find the string length without using the standard headers. I completed the code with start to end but when I'm returning the count at the end, it is not returning the correct answer.",
    questionTags: "b.tech",
    userPosted: "mano",
    userId: "1",
    askedOn: "jan 1",
    answers: [],
  },
];

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
    const error = new HttpError("error finding questions by uid", 404); //use "throw error" when synchronous function // next(error) when async
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
  //console.log(req.body);
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

  console.log(user);
  const createdQues = new Question({
    questionTitle: questionTitle,
    questionBody: questionBody,
    questionTags,
    answers: [],
    //upVotes: 0,
    //downVotes: 0,
    askedOn,
    userId,
    userPosted: user.name,
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
  const { answerBody, userId } = req.body;

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

  const quesId = req.params.qid;
  console.log(quesId);

  let question;
  try {
    question = await Question.findById(quesId);
  } catch (err) {
    const error = new HttpError("cant update answer", 500);
    return next(error);
  }

  const createdAns = {
    answerBody,
    userId,
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

const deleteAnswer = (req, res, next) => {
  const { question_id, answer_id } = req.query;
  console.log(question_id, answer_id);

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

exports.getAllQuestion = getAllQuestion;
exports.getQuestionByQId = getQuestionByQId;
exports.getQuestionsByUserId = getQuestionsByUserId;
exports.createQuestion = createQuestion;
exports.updateQuestion = updateQuestion;
exports.deleteQuestion = deleteQuestion;
exports.deleteAnswer = deleteAnswer;

/*
const DUMMY_Questions = [
  {
    id: "q1",
    title: "Empire State Building",
    upVotes: 4,
    downVotes: 2,
    description: "One of the most famous sky scrapers in the world!",
    answers: ["abc", "pqr"],
    creator: "u1",
  },
  {
    id: "q2",
    title: "Empire State Building",
    description: "One of the most famous sky scrapers in the world!",
    upVotes: 4,
    downVotes: 2,
    answers: [],
    creator: "u1",
  },
];

const getQuestionByQId = (req, res, next) => {
  const quesId = req.params.qid;
  const question = DUMMY_Questions.find((q) => {
    return q.id === quesId;
  });

  if (!question) {
    throw new HttpError("error finding question by qid", 404);
    // return res.status(404).json({ message: "error finding question by qid" });
  }
  res.json({ question }); // => { place } => { place: place }
};

const getQuestionsByUserId = (req, res) => {
  const userId = req.params.uid;
  const questions = DUMMY_Questions.filter((q) => {
    return q.creator === userId;
  });
  if (!questions || questions.length === 0) {
    throw new HttpError("error finding questions by qid", 404); //use "throw error" when synchronous function // next(error) when async

    // return res.status(404).json({ message: "error finding question by uid" });
  }
  res.json({ questions });
};

const createQuestion = (req, res, next) => {
  console.log(req.body);
  const { title, description, tag, creator } = req.body;
  // const title = req.body.title;
  const createdQues = {
    id: uuid(),
    title: title,
    description: description,
    tag,
    answers: [],
    upVotes: 0,
    downVotes: 0,
    creator: creator,
  };

  DUMMY_Questions.push(createdQues); //unshift(createdPlace)

  res.status(201).json({ question: createdQues });
};

const updateQuestion = (req, res) => {
  const { answer } = req.body;
  const quesId = req.params.qid;

  const updatedQuestion = { ...DUMMY_Questions.find((q) => q.id === quesId) };
  const quesIndex = DUMMY_Questions.findIndex((q) => q.id === quesId);

  updatedQuestion.answers = [...updatedQuestion.answers, answer];

  DUMMY_Questions[quesIndex] = updatedQuestion;
  console.log(updatedQuestion);
  res.status(200).json({ question: updatedQuestion });
};

exports.getQuestionByQId = getQuestionByQId;
exports.getQuestionsByUserId = getQuestionsByUserId;
exports.createQuestion = createQuestion;
exports.updateQuestion = updateQuestion;
*/
