const { User, validate } = require("../model/User");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function loginController(req, res) {
  try {
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({ msg: "please enter your credentials.." });
    }

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ msg: "user not found.." });
    }
    const valid = await bcrypt.compare(req.body.password, user.password);
    if (!valid) {
      return res.status(401).json({ msg: "wrong email or password.." });
    }

    if(!user.verified){
      return res.status(401).json({msg: "User not verified.."})
    }
    
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY, {expiresIn: process.env.JWT_EXPIRE_IN});

    return res
      .header("x-auth-token", token)
      .status(200)
      .json({ data: user, token: token });
  } catch (error) {
    res.status(500).json({ msg: "INTERNAL SERVER ERROR" });
  }
}

module.exports = { loginController };
