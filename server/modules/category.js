import Category from '../models/category';
import Q from 'q';
// let Q = require('q');

exports.getCategories = () => {
  let deferred = Q.defer();
  Category.find({}).exec((err, categories) => {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(categories);
    }
  });
  return deferred.promise;
}


exports.createCategory = (category, description) => {
  let deferred = Q.defer();
  Category.create({
    category: category,
    description: description
  }, (err, category) => {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(category);
    }
  });
  return deferred.promise;
}
