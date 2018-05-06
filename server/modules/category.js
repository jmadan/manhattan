// const MongoClient = require('mongodb').MongoClient;
// let BSON = require('mongodb').BSONPure;
// const DBURI = process.env.MONGODB_URI;
const MongoDB = require('../utils/mongodb');
const neo4j = require('../utils/neo4j');

let getCategories = () => {
  return new Promise((resolve, reject) => {
    MongoDB.getDocuments('categories', {}).then((result) => {
      resolve(result);
    });
  });
};

let saveCategory = item => {
  return new Promise((resolve, reject) => {
    MongoDB.insertDocument('categories', item).then((result) => {
      if(result.result.n == 1){
        console.log(result.ops[0]);
        // neo4j.createCategory(item).then(result => {
        //   console.log('response post subcategory created: - ', result);
        //   neo4j.createParentChildRelationship(item).then(res => {
        //     console.log('response post subcategory relationship: - ', res);
        //     resolve({
        //       doc: result.ops,
        //       insertedCount: result.insertedCount
        //     });
        //   });
        // });
      }
    })


    // MongoClient.connect(DBURI, (err, db) => {
    //   db.collection('categories').insertOne(item, (error, response) => {
    //     if (error) {
    //       reject(error);
    //     } else {
    //       db.close();
    //       neo4j.createCategory(item).then(result => {
    //         console.log('response post subcategory created: - ', result);
    //         neo4j.createParentChildRelationship(item).then(res => {
    //           console.log('response post subcategory relationship: - ', res);
    //           resolve({
    //             doc: response.ops,
    //             insertedCount: response.insertedCount
    //           });
    //         });
    //       });
    //     }
    //   });
    // });
  });
};

let getDistinctCategories = () => {
  return new Promise((resolve, reject) => {
    MongoDB.getDistinctQuery('feeditems', 'category',{}).then(result => {
      resolve(result);
    });
    // MongoClient.connect(DBURI, (err, db) => {
    //   if (err) {
    //     reject(err);
    //   } else {
    //     db.collection('feeditems').distinct('category', (error, result) => {
    //       if (error) {
    //         reject(error);
    //       }
    //       db.close();
    //       resolve(result);
    //     });
    //   }
    // });
  });
};

let getParentDistinctCategories = () => {
  return new Promise((resolve, reject) => {
    MongoDB.getDistinctQuery('feeditems', 'category',{ $and: [{ parent: { $exists: false } }, { status: 'active' }] }).then(result => {
      resolve(result);
    });
    // MongoClient.connect(DBURI, (err, db) => {
    //   if (err) {
    //     reject(err);
    //   } else {
    //     db
    //       .collection('feeditems')
    //       .distinct('category', { $and: [{ parent: { $exists: false } }, { status: 'active' }] }, (error, result) => {
    //         if (error) {
    //           reject(error);
    //         }
    //         db.close();
    //         resolve(result);
    //       });
    //   }
    // });
  });
};

let updateCategory = category => {
  return new Promise((resolve, reject) => {
    MongoDB.updateDocument('categories', { _id: ObjectID(category._id) }, {$set: {name: category.name}}).then(result => {
      resolve(result);
    });

    // MongoClient.connect(DBURI, (err, db) => {
    //   if (err) {
    //     reject(err);
    //   } else {
    //     db.collection('categories').updateOne({ name: category.name }, (error, result) => {
    //       if (error) {
    //         reject(error);
    //       }
    //       db.close();
    //       resolve(result);
    //     });
    //   }
    // });
  });
};

// let deleteCategory = (category)=>{
//   return new Promise((resolve, reject) => {
//     MongoClient.connect(DBURI, (err, db)=>{
//       if(err){
//         console.log(err);
//       } else {
//         db.collection("categories").deleteOne({name: category}, (err, result)=>{
//           if(err){
//             reject(err);
//           }
//           db.close();
//           resolve(result);
//         });
//       }
//     });
//   });
// }

module.exports = {
  getDistinctCategories,
  getParentDistinctCategories,
  saveCategory,
  getCategories,
  updateCategory
};
