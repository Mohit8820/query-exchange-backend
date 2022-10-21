const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  avatar: {
    topType: String,
    accessoriesType: String,
    hairColor: String,
    facialHairType: String,
    facialHairColor: String,
    clotheType: String,
    clotheColor: String,
    graphicType: String,
    eyeType: String,
    eyebrowType: String,
    mouthType: String,
    skinColor: String,
  },
  questions: [
    { type: mongoose.Types.ObjectId, required: true, ref: "Question" },
  ],
});
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
