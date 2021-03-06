"use strict";

const rp = require("request-promise");
const cheerio = require("cheerio");
// const MongoClient = require("mongodb").MongoClient;
let ObjectID = require("mongodb").ObjectID;
// const DBURI = process.env.MONGODB_URI;
const textract = require("textract");
const natural = require("natural");
const MongoDB = require("../utils/mongodb");

const lancasterStemmer = natural.LancasterStemmer;

exports.fetchArticles = (status, noofdocs = 10) => {
  return new Promise((resolve, reject) => {
    MongoDB.getDocumentsWithLimit('feeditems', { status: status }, {pubDate: -1},10)
    .then(result => {
      resolve(result);
    });

    // MongoClient.connect(DBURI, (err, db) => {
    //   if (err) {
    //     throw err;
    //   }
    //   db
    //     .db("manhattan")
    //     .collection("feeditems")
    //     .find({ status: status })
    //     .sort({ pubDate: -1 })
    //     .limit(parseInt(noofdocs, 10))
    //     .toArray((err, docs) => {
    //       if (err) {
    //         reject(err);
    //       }
    //       resolve(docs);
    //     });
    // });
  });
};

exports.fetchClassifiedArticles = () => {
  return new Promise((resolve, reject) => {
    MongoDB.getDocuments('feeditems', { status: "classified" }, {pubDate: -1})
    .then(result => {
      resolve(result);
    });
    // MongoClient.connect(DBURI, (err, db) => {
    //   db
    //     .db("manhattan")
    //     .collection("feeditems")
    //     .find({ status: "classified" })
    //     .sort({ pubDate: -1 })
    //     .toArray((err, docs) => {
    //       if (err) {
    //         reject(err);
    //       }
    //       resolve(docs);
    //     });
    // });
  });
};

exports.getArticle = id => {
  return new Promise((resolve, reject) => {
    MongoDB.findDocument('feeditems', { _id: ObjectID(id) })
    .then(result => {
      resolve(result);
    });


    // MongoClient.connect(DBURI, (err, db) => {
    //   db.collection("feeditems").findOne({ _id: ObjectID(id) }, (err, item) => {
    //     if (err) {
    //       reject(err);
    //     } else {
    //       resolve(item);
    //     }
    //   });
    // });
  });
};

exports.updateArticle = data => {
  let query = null;
  if (data.status === "deleted") {
    query = {
      $set: {
        status: data.status
      }
    };
  } else {
    query = {
      $set: {
        keywords: data.keywords,
        stemwords: data.stemwords,
        category: data.category,
        parentcat: JSON.parse(data.parentcat),
        subcategory: JSON.parse(data.subcat),
        status: data.status
      }
    };
  }
  return new Promise((resolve, reject) => {
    MongoDB.updateDocument("feeditems", { _id: ObjectID(data._id) }, query)
      .then(result => {
        resolve(result);
      })
      .catch(err => {
        reject(err);
      });
    // MongoClient.connect(DBURI, (err, db) => {
    //   db.collection('feeditems').findOneAndUpdate(
    //     { _id: ObjectID(data._id) },
    //     {
    //       $set: {
    //         keywords: data.keywords,
    //         stemwords: data.stemwords,
    //         category: data.category,
    //         parentcat: JSON.parse(data.parentcat),
    //         subcategory: JSON.parse(data.subcat),
    //         status: data.status
    //       }
    //     },
    //     { returnOriginal: false },
    //     (err, doc) => {
    //       if (err) {
    //         reject(err);
    //       }
    //       resolve(doc);
    //     }
    //   );
    // });
  });
};

exports.autoUpdateArticleByClassification = data => {
  return new Promise((resolve, reject) => {
    MongoDB.updateDocument('feeditems', { _id: ObjectID(data._id) }, {
      $set: {
        category: data.category,
        status: data.status
      }
    })
    .then(result => {
      resolve(result);
    });

    // MongoClient.connect(DBURI, (err, db) => {
    //   db
    //     .db("manhattan")
    //     .collection("feeditems")
    //     .findOneAndUpdate(
    //       { _id: ObjectID(data._id) },
    //       {
    //         $set: {
    //           category: data.category,
    //           status: data.status
    //         }
    //       },
    //       { returnOriginal: false },
    //       (err, doc) => {
    //         if (err) {
    //           reject(err);
    //         }
    //         resolve(doc);
    //       }
    //     );
    // });
  });
};

exports.updateArticleCategory = (id, category) => {
  return new Promise((resolve, reject) => {
    MongoDB.updateDocument('feeditems',
    { _id: ObjectID(id) },
    { $set: { category: category, status: "classified" } }
    )
    .then(result => {
      resolve(result);
    });


    // MongoClient.connect(DBURI, (err, db) => {
    //   db
    //     .db("manhattan")
    //     .collection("feeditems")
    //     .findOneAndUpdate(
    //       { _id: ObjectID(id) },
    //       { $set: { category: category, status: "classified" } },
    //       (err, doc) => {
    //         if (err) {
    //           reject(err);
    //         }
    //         resolve(doc);
    //       }
    //     );
    // });
  });
};

exports.updateArticleStatus = (id, status) => {
  return new Promise((resolve, reject) => {
    MongoDB.updateDocument('feeditems',
    { _id: ObjectID(id) },
    { $set: { status: status } }
    )
    .then(result => {
      resolve(result);
    });


    // MongoClient.connect(DBURI, (err, db) => {
    //   db
    //     .db("manhattan")
    //     .collection("feeditems")
    //     .findOneAndUpdate(
    //       { _id: ObjectID(id) },
    //       { $set: { status: status } },
    //       { returnOriginal: false },
    //       (err, doc) => {
    //         if (err) {
    //           reject(err);
    //         }
    //         resolve(doc);
    //       }
    //     );
    // });
  });
};

exports.getItemDetails = item => {
  return new Promise((resolve, reject) => {
    rp(item.url)
      .then(response => {
        let $ = cheerio.load(response, { normalizeWhitespace: true });
        item.keywords = $('meta[name="keywords"]').attr("content");
        item.itembody = $("body")
          .text()
          .replace("/s+/mg", "")
          .replace(/[^a-zA-Z ]/g, "")
          .trim();
        resolve(item);
      })
      .catch(err => reject(err));
  });
};

exports.getArticleText = item => {
  textract.fromUrl(item.url, function(error, text) {
    return text;
  });
};

exports.getArticleStemWords = item => {
  return new Promise((resolve, reject) => {
    try {
      textract.fromUrl(item.url, function(error, text) {
        if (text) {
          item.itembody = text;
          item.stemwords = lancasterStemmer.tokenizeAndStem(text);
          resolve(item);
        }
        reject(error);
      });
    } catch (err) {
      reject(err);
    }
  });
};

exports.saveItem = item => {
  return new Promise((resolve, reject) => {
    MongoDB.insertDocument('feeditems', item)
    .then(result => {
      resolve(result);
    });


    // MongoClient.connect(DBURI, (err, db) => {
    //   db
    //     .db("manhattan")
    //     .collection("articles")
    //     .insertOne(item, (err, savedItem) => {
    //       if (err) {
    //         reject(err);
    //       } else {
    //         db.close();
    //         resolve(savedItem);
    //       }
    //     });
    // });
  });
};

exports.getArticleBasedOnCategory = category => {
  return new Promise((resolve, reject) => {
    MongoDB.findDocument('feeditems', { category: category.toLowerCase() })
    .then(result => {
      resolve(result);
    });

    // MongoClient.connect(DBURI, (err, db) => {
    //   db
    //     .db("manhattan")
    //     .collection("feeditems")
    //     .find({ category: category.toLowerCase() })
    //     .toArray((err, item) => {
    //       if (err) {
    //         reject(err);
    //       } else {
    //         resolve(item);
    //       }
    //     });
    // });
  });
};

exports.updateItem = item => {
  return new Promise((resolve, reject) => {
    MongoDB.updateDocument('feeditems',
    { _id: ObjectID(item.id) },
    {
      $set: {
        itembody: item.itembody,
        keywords: item.keywords,
        stemwords: item.stemwords,
        category: item.category
      }
    })
    .then(result => {
      resolve(result);
    });

    // MongoClient.connect(DBURI, (err, db) => {
    //   db
    //     .db("manhattan")
    //     .collection("feeditems")
    //     .findOneAndUpdate(
    //       { _id: ObjectID(item.id) },
    //       {
    //         $set: {
    //           itembody: item.itembody,
    //           keywords: item.keywords,
    //           stemwords: item.stemwords,
    //           category: item.category
    //         }
    //       },
    //       { returnOriginal: false },
    //       (err, doc) => {
    //         if (err) {
    //           reject(err);
    //         }
    //         resolve(doc);
    //       }
    //     );
    // });
  });
};

// to get the description of the articles and format the response
exports.formatFeedResponse = items => {
  let idArray = items.map(i => ObjectID(i._fields[0]));
  return new Promise((resolve, reject) => {
    MongoDB.getDocuments(
      "feeditems",
      { _id: { $in: idArray } },
      {
        _id: 1,
        title: 1,
        url: 1,
        description: 1,
        author: 1,
        pubDate: 1,
        provider: 1,
        keywords: 1,
        img: 1
      }
    )
      .then(docs => {
        resolve(docs);
      })
      .catch(err => reject(err));
  });
};
