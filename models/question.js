const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const questionSchema = new Schema({
  questionTitle: { type: String, required: true },
  questionBody: { type: String, required: true },
  questionTags: { type: String, required: true },
  questionImage: [
    {
      public_id: String,
      url: String,
    },
  ],
  questionImageTitles: [String],
  userPosted: { type: String, required: true },
  userPostedAvatar: {
    topType: { type: String, required: true },
    accessoriesType: { type: String, required: true },
    hairColor: { type: String, required: true },
    facialHairType: { type: String, required: true },
    facialHairColor: { type: String, required: true },
    clotheType: { type: String, required: true },
    clotheColor: { type: String, required: true },
    graphicType: { type: String, required: true },
    eyeType: { type: String, required: true },
    eyebrowType: { type: String, required: true },
    mouthType: { type: String, required: true },
    skinColor: { type: String, required: true },
  },
  likes: [{ type: mongoose.Types.ObjectId, required: true, ref: "User" }],
  dislikes: [{ type: mongoose.Types.ObjectId, required: true, ref: "User" }],
  userId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  askedOn: { type: String, required: true },
  answers: [
    {
      answerBody: { type: String, required: true },
      upvotes: [{ type: mongoose.Types.ObjectId, required: true, ref: "User" }],
      downvotes: [
        { type: mongoose.Types.ObjectId, required: true, ref: "User" },
      ],
      answeredOn: { type: String, required: true },
      answerImage: [
        {
          public_id: String,
          url: String,
        },
      ],
      answerImageTitles: [String],
      userAnswered: { type: String, required: true },
      userId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    },
  ],
});

module.exports = mongoose.model("Question", questionSchema);
