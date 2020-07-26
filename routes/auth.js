const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const db = require("../db");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const User = require("../models/user");

// POST /login - login: {username, password} => {token}
router.post("/login", async function(req, res, next) {
  try {
    const { username, password } = req.body; 
    if (await User.authenticate(username, password)) {
      let token = jwt.sign({ username }, SECRET_KEY);
      User.updateLoginTimestamp(username);
      return res.json({ token });
    }
    throw new ExpressError("Invalid user/password", 400); 
  } catch (err) {
    return next(err);
  }
})

// POST /register - register user: registers, logs in, and returns token.
router.post("/register", async function (req, res, next) {
  try {
    let { username } = await User.register(req.body);
    let token = jwt.sign({username}, SECRET_KEY);
    User.updateLoginTimestamp(username);
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
}); 

 module.exports = router;
