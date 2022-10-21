const HttpError = require("../models/http-error");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

const getUserbyId = async (req, res, next) => {
  const userId = req.params.uid;
  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      "Couldn't find the user by uid because something went wrong with the request",
      500
    );
    return next(error);
  }
  if (!user) {
    const error = new HttpError("error finding user by uid in db", 404);
    return next(error);
  }
  res.json({ user: user.toObject({ getters: true }) });
};

const signup = async (req, res, next) => {
  const { name, email, password, avatar } = req.body;
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

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError("Password hashing failed", 500);
    return next(error);
  }

  const createdUser = new User({
    name, // name: name
    email,
    password: hashedPassword,
    avatar: { ...avatar },
    questions: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("Sign up failed", 500);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Sign up failed while creating token", 500);
    return next(error);
  }

  res.status(201).json({
    userId: createdUser.id,
    uname: createdUser.name,
    email: createdUser.email,
    uavatar: createdUser.avatar,
    token: token,
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

  if (!existingUser) {
    const error = new HttpError("Invalid Credentials, User not found", 403);
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch {
    const error = new HttpError("Comparing Password Failed", 500);
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError("Invalid Credentials, Wrong Password", 403);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("login up failed while creating token", 500);
    return next(error);
  }

  res.status(200).json({
    userId: existingUser.id,
    uname: existingUser.name,
    email: existingUser.email,
    uavatar: existingUser.avatar,
    token: token,
  });
};

exports.getUsers = getUsers;
exports.getUserbyId = getUserbyId;
exports.signup = signup;
exports.login = login;
