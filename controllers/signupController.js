const { User, validate } = require("../model/User");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

async function signupController(req, res) {
  try {
    const { error } = validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ msg: "validation error", error: error.details[0].message });
    }
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ msg: "user already registered.." });
    }
    user = new User({
      name: req.body.name,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, 10),
    });

    await user.save();

    res.status(201).json({
      msg: "user created successfuly, otp sent to your email address..",
    });
  } catch (error) {
    res.status(400).json({ error: error });
  }
}

module.exports = { signupController };
