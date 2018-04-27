'use strict';
let neo4j = require('../utils/neo4j');

let fetchCatRecommendations = (userId) => {
  return new Promise((resolve, reject) => {
    neo4j.otherCategoryRecommendation(userId).then(result => {
      resolve(result);
    })
      .catch(err => {
        reject(err);
      });
  });
};

module.exports = {
  fetchCatRecommendations
};
