var express = require("express");
var router = express.Router();
const auth = require("../middleware/protect");
const { signupController, verify, resendOTP, resetPassword, resetRequest } = require("../controllers/signupController");
const { loginController } = require("../controllers/loginController");

/* GET users listing. */
router.post("/login", loginController);
router.post("/signup", signupController);
router.post("/verify", auth, verify);
router.post("/resend-otp", resendOTP);
router.post("/reset-otp", resendOTP);
router.post("/reset-verify", resetRequest);
router.post("/reset-password", auth, resetPassword);

module.exports = router;
