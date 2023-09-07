var express = require("express");
var router = express.Router();
const { signupController } = require("../controllers/signupController");
const { loginController } = require("../controllers/loginController");

/* GET users listing. */
router.post("/login", loginController);
router.post("/signup", signupController);

module.exports = router;
