const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const questionSchema = new Schema({
  questionTitle: { type: String, required: true },
  questionBody: { type: String, required: true },
  questionTags: { type: String, required: true },
  userPosted: { type: String, required: true },
  userId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  askedOn: { type: String, required: true },
  answers: [
    {
      answerBody: { type: String, required: true },
      userAnswered: { type: String, required: true },
      userId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    },
  ],
});

module.exports = mongoose.model("Question", questionSchema);
