const category = require('../modules/category');

function getCategories(req, res, next) {
  category
    .getCategories()
    .then(docs => {
      res.json({ categories: docs });
    })
    .catch(err => console.log(err));
  return next();
}

let newCategory = (req, res, next) => {
  console.log(req.body);
  category
    .saveCategory(req.body)
    .then(response => {
      res.json({ response });
    })
    .catch(err => {
      console.log(err);
    });
  return next();
};

let getDistinctCategoriesFromClassifiedFeed = (req, res, next) => {
  category
    .getDistinctCategories()
    .then(docs => {
      res.json({ categories: docs });
    })
    .catch(err => console.log(err));
  return next();
};

let updateCategory = (req, res, next) => {
  let item = {
    name: req.body.name
  };
  category
    .updateCategory(item)
    .then(response => {
      res.json({ message: response });
    })
    .catch(err => {
      console.log(err);
    });
  return next();
};

module.exports = {
  getCategories,
  newCategory,
  updateCategory,
  getDistinctCategoriesFromClassifiedFeed
};
