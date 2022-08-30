const HttpError = require("../models/http-error");
const User = require("../models/user");

const DUMMY_USERS = [
  {
    _id: "u1",
    name: "Max Schwarz",
    email: "test@test.com",
    password: "testers",
  },
];

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch {
    const error = new HttpError("fetching users failed", 500);
    return next(error);
  }

  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch {
    const error = new HttpError("sign up failed", 500);
    return next(error);
  }
  if (existingUser) {
    const error = new HttpError("user exists already,please login", 422);
    return next(error);
  }

  const createdUser = new User({
    name, // name: name
    email,
    password,
    questions: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("Sign up failed", 500);
    return next(error);
  }

  res.status(201).json({
    message: "signed in",
    user: createdUser.toObject({ getters: true }),
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch {
    const error = new HttpError("log in failed", 500);
    return next(error);
  }

  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError("Invalid Credentials", 401);
    return next(error);
  }

  res.status(200).json({ message: "Logged in!", user: existingUser });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
