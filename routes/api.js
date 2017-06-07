var express = require('express');
var router = express.Router();



/* GET users listing. */
router.get('/', function(req, res, next) {
    console.log("here");
});

router.get('/login', function(req, res, next) {
    console.log("here");
});

router.post('/login', function(req, res, next) {
    console.log("here");

    console.log(req);
});


module.exports = router;
