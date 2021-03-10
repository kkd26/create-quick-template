var express = require('express');
var router = express.Router();

const getRouter = require('./newRouter');

router.use('/user', getRouter('users'));

module.exports = router;
