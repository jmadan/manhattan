var express = require('express');
var ClientRouter = express.Router();
import * as Feed from '../modules/feed';

let Q = require('q');

ClientRouter.use((req, res, next) => {
  console.log('Route - time: ', Date.now());
  console.log(req.path);
  next();
});

ClientRouter.get('/', (req, res) => {
  res.json({
    message: "Need to call specific end points to get data",
    error: true
  });
});

module.exports = ClientRouter;
