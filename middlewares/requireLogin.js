const jwt = require("jsonwebtoken");
const User = require("../models/User");
const mongoose = require("mongoose");

const requireSignIn = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(404).json({
      error: "You must be logged in",
    });
  }
  const token = authorization.replace("Bearer ", "");
  jwt.verify(token, process.env.SECRET_KEY, (err, payload) => {
    if (err) {
      return res.status(401).json({
        error: "You must be logged in",
      });
    }
    const { _id } = payload;
    User.findById(_id).then(user => {
      req.user = user;
      next();
    });
  });
};

module.exports = requireSignIn;
