let MongoClient = require('../server/modules/mongodb');
let Neo4jClient = require('../server/utils/neo4j');

function importCategories() {
  MongoClient.getDocuments('categories', {})
    .then(items => {
      items.map(i => {
        Neo4jClient.createCategory(i).then(response => {
          console.log(response);
        });
      });
    })
    .catch(err => {
      throw err;
    });
}

function createCategoryRelationship() {
  MongoClient.getDocuments('categories', {})
    .then(items => {
      console.log('I got in here.......');
      items.forEach(cat => {
        Neo4jClient.createRelationship(cat).then(result => {
          console.log(result);
        });
      });
    })
    .catch(err => {
      throw err;
    });
}

module.exports = {
  importCategories,
  createCategoryRelationship
};
