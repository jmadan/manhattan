'use strict';
const article = require('../modules/article');
const brain = require('../modules/nlp/brain');
const snn = require('../modules/nlp/synaptic');
const Neo4j = require('../utils/neo4j');

function getArticleByStatus(req, res, next) {
  console.log(req.query);
  article.fetchArticles(req.query.status, req.query.limit).then(result => {
    res.json({ result: result });
  });
  return next();
}

function getArticleById(req, res, next) {
  article.getArticle(req.params.id).then(result => {
    res.json({ result: result });
  });
  return next();
}

function stemArticleById(req, res, next) {
  article
    .getArticle(req.params.id)
    .then(item => {
      article.getArticleStemWords(item).then(article => {
        res.json({ article: article, articleUpdated: false });
        return next();
      });
    })
    .catch(err => {
      res.json({ error: err });
      return next();
    });
}

function updateArticle(req, res, next) {
  if (req.params.id === req.body._id) {
    article.updateArticle(req.body).then(response => {
      if (response.lastErrorObject.n === 1) {
        if (response.value.status !== 'deleted') {
          Neo4j.createArticle(response.value).then(result => {
            console.log('Article created...', result.msg);
            Neo4j.articleCategoryRelationship(response.value);
          });
        }
        res.json({ article: response.value, articleUpdated: true });
      } else {
        res.json({ article: response.value, articleUpdated: false });
      }
    });
  } else {
    res.json({
      message: 'Mismatch of document and url parameters',
      error: true
    });
  }
  return next();
}

function classifyArticle(req, res, next) {
  if (req.params.id) {
    article
      .getArticle(req.params.id)
      .then(doc => {
        return brain.classify(doc);
      })
      .then(category => {
        res.json({ category: category });
      });
  }
  next();
}

let getSynaptic = (req, res, next) => {
  article.getArticle(req.params.id).then(doc => {
    snn.classifyDocs(doc).then(dc => {
      if (dc.category) {
        res.json({ article: dc, articleUpdated: true });
      } else {
        res.json({ article: dc, articleUpdated: false });
      }
    });
  });
  next();
};

let getBrain = (req, res, next) => {
  article.getArticle(req.params.id).then(doc => {
    brain.brainClassify(doc).then(dc => {
      if (dc.category) {
        res.json({ article: dc, articleUpdated: true });
      } else {
        res.json({ article: dc, articleUpdated: false });
      }
    });
  });
  next();
};

module.exports = {
  getArticleByStatus,
  getArticleById,
  stemArticleById,
  updateArticle,
  classifyArticle,
  getSynaptic,
  getBrain
};
