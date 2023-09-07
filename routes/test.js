var express = require("express");
var router = express.Router();

router.get("/", function (req, res, next) {
  res
    .status(200)
    .json({ data: "7ambola bymsi 3liko and says: الباك شغال ي رجوله" });
});

module.exports = router;
