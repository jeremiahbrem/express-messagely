const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const User = require("../models/user");

// GET / - get list of users.
router.get("/", ensureLoggedIn, async function(req, res, next) {
  try {
    const users = await User.all();
    return res.json({users});
  } catch (err) {
    return next(err);
  }
})

// GET /:username - get detail of users.
router.get("/:username", ensureCorrectUser, async function (req, res, next) {
  try {
    const user = await User.get(req.params.username);
    return res.json({user});
  } catch (err) {
    return next(err);
  }
})


// GET /:username/to - get messages to user
 router.get("/:username/to", ensureCorrectUser, async function (req, res, next) {
   try {
     const messages = await User.messagesTo(req.params.username);
     return res.json({messages});
   } catch (err) {
     return next(err);
   }
 })

// GET /:username/from - get messages from user
router.get("/:username/from", ensureCorrectUser, async function (req, res, next) {
  try {
    const messages = await User.messagesFrom(req.params.username);
    return res.json({messages});
  } catch (err) {
    return next(err);
  }
})

 module.exports = router;