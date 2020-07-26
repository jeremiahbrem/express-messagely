const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config");
const { ensureLoggedIn, ensureMessageUser, ensureToUser } = require("../middleware/auth");
const User = require("../models/user");
const Message = require("../models/message");

// GET /:id - get detail of message.
router.get("/:id", ensureMessageUser, async function(req, res, next) {
    try {
      const message = await Message.get(req.params.id);
      return res.json({message});
    } catch (err) {
      return next(err);
    }
  })

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post("/", ensureLoggedIn, async function(req, res, next) {
  try {
    const { to_username, body } = req.body;
    const message = await Message.create({
                                from_username: req.user.username,
                                to_username: to_username,
                                body: body
                               });
    return res.status(201).json({message});                           
  } catch (err) {
    return next(err);
  }
})

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post("/:id/read", ensureToUser, async function(req, res, next) {
  try {
    const message = await Message.markRead(req.params.id);
    return res.status(201).json({message});
  } catch (err) {
    return next(err);
  }
})

module.exports = router;