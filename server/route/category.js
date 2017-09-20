'use strict';
const category = require('../modules/category');

function getCategories (req, res, next) {
  category.getCategories().then((docs)=>{
    res.json({categories: docs});
  }).catch(err=>console.log(err));
  return next();
}


module.exports = {
  getCategories: getCategories
}
