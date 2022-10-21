const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  avatar: {
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
  questions: [
    { type: mongoose.Types.ObjectId, required: true, ref: "Question" },
  ],
});
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
