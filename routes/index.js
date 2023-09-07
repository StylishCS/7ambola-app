var express = require('express');
var router = express.Router();
const auth = require('../middleware/protect');

router.get('/quotes',auth, function(req, res, next) {
  res.status(200).json({data:"7ambola bymsi 3liko and says: دمرتني ي عبير.."});
});

module.exports = router;
