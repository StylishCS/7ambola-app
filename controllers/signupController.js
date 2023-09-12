const { User, validate } = require("../model/User");
const { OTP } = require("../model/OTP");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

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
      verified: false,
    });

    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      service: "Gmail",
      port: 587,
      secure: false,
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });

    let otp = await Math.floor(1000 + Math.random() * 9000);

    let message = {
      from: "7AMBOLA",
      to: req.body.email,
      subject: "Verify Creating Account",
      text: `Your Verification code is ${otp}, Please don't share it with anyone, this code will expire in 2 minutes`,
      html: `<p>Your Verification code is<br><h1>${otp}</h1><br>Please don't share it with anyone.<br>this code will expire in 2 minutes`,
    };
    await transporter.sendMail(message).catch((err) => {
      return res.status(400).json({ error: true, msg: "OTP NOT SENT..." });
    });

    const d = new Date();
    d.setMinutes(d.getMinutes());
    const d2 = new Date();
    d.setMinutes(d.getMinutes() + 5);

    let OTP_Obj = new OTP({
      code: await bcrypt.hash(String(otp), 10),
      email: user.email,
      createdAt: Number(d),
      expiresAt: Number(d2),
      verified: false,
    });

    await user.save();
    await OTP_Obj.save();
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: process.env.JWT_EXPIRE_IN,
    });

    res.status(201).json({
      email: user.email,
      token: token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
}

async function resendOTP(req, res) {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).json({ error: "user not found.." });
  }
  await OTP.deleteMany({email: user.email})
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    service: "Gmail",
    port: 587,
    secure: false,
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  });

  let otp = await Math.floor(1000 + Math.random() * 9000);

  let message = {
    from: "7AMBOLA",
    to: req.body.email,
    subject: "Verify Creating Account",
    text: `Your Verification code is ${otp}, Please don't share it with anyone, this code will expire in 2 minutes`,
    html: `<p>Your Verification code is<br><h1>${otp}</h1><br>Please don't share it with anyone.<br>this code will expire in 2 minutes`,
  };
  await transporter.sendMail(message).catch((err) => {
    return res.status(400).json({ error: true, msg: "OTP NOT SENT..." });
  });

  const d = new Date();
  d.setMinutes(d.getMinutes());
  const d2 = new Date();
  d.setMinutes(d.getMinutes() + 5);

  let OTP_Obj = new OTP({
    code: await bcrypt.hash(String(otp), 10),
    email: req.body.email,
    createdAt: Number(d),
    expiresAt: Number(d2),
    verified: false,
  });

  await OTP_Obj.save();
  res.status(201).json({msg:"code sent.."})
}

async function verify(req, res) {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ msg: "user not found.." });
    }
    if (user.verified) {
      return res.status(400).json({ msg: "user already verified.." });
    }
    const otp = await OTP.findOne({ email: user.email });
    if (!otp) {
      return res.status(404).json({ msg: "no otp was sent.." });
    }
    let d = new Date();
    if ((Number(d) < Number(otp.expiresAt))) {
      return res.status(400).json({ msg: "otp has expired.." });
    }
    if (await bcrypt.compare(otp.code, req.body.otp)) {
      return res.status(401).json({ msg: "Wrong code.." });
    }
    user.verified = true;
    await user.save()
    await OTP.deleteMany({ email: user.email });
    res.status(200).json({msg: "user verified successfuly"})
  } catch (error) {
    return res.status(500).json({msg: "INTERNAL SERVER ERROR"})
  }

  
}

module.exports = { signupController, verify, resendOTP };
