'use strict';
const article = require('../modules/article');
const brain = require('../modules/nlp/brain');
const snn = require('../modules/nlp/synaptic');

function getArticleByStatus(req, res, next) {
  article.fetchArticles(req.params.status).then((result) => {
    res.json({result: result});
  })
  return next();
}

function getArticleById(req, res, next) {
  article.getArticle(req.params.id).then((result) => {
    res.json({result: result});
  });
  return next();
}


function stemArticleById(req, res, next) {
  article.getArticle(req.params.id).then((item)=>{
    article.getArticleStemWords(item).then((article) =>{
        res.json({article: article, articleUpdated: false});
        return next();
      })
  }).catch((err)=>{
    res.json({error: err})
    return next();
  });
}

function updateArticle(req, res, next) {
  if(req.params.id === req.body.id){
    article.updateArticle(req.params.id, req.body).then((response) => {
      if(response.lastErrorObject.n === 1){
        res.json({article: response.value, articleUpdated: true});
      } else {
        res.json({article: response.value, articleUpdated: false});
      }
    });
  } else {
    res.json({message: "Mismatch of document and url parameters", error: true});
  }
  return next();
}

// router.put('/articles/:id/status/update', (req, res)=>{
//   article.updateArticleStatus(req.body.id, req.body.status).then((response) => {
//     if(response.lastErrorObject.n === 1){
//       res.json({article: response.value, status_code:200, articleUpdated: true});
//     } else{
//       res.json({article: response.value, status_code:200, articleUpdated: false});
//     }
//   })
// })
//
// router.get('/articles/categories/:category', (req, res)=>{
//   article.getArticleBasedOnCategory(req.params.category).then((result) => {
//     res.json({result: result})
//   })
// })
//
// router.put('/articles/:id/category/update', (req, res)=>{
//   article.updateArticleCategory(req.params.id, req.body.category).then((result) => {
//     res.json({result: result})
//   })
// })

function classifyArticle(req, res, next) {
  if(req.params.id) {
    article.getArticle(req.params.id).then((doc) => {
      return brain.classify(doc);
    }).then((category) => {
      res.json({category: category});
    });
  }
  next();
}

let getSynaptic = (req, res, next) => {
  article.getArticle(req.params.id).then((doc) => {
    snn.synapticClassify(doc).then((dc) => {
      if(dc.category) {
        res.json({article: dc, articleUpdated: true});
      } else{
        res.json({article: dc, articleUpdated: false});
      }
    });
  });
  next();
}

module.exports = {
  getArticleByStatus: getArticleByStatus,
  getArticleById: getArticleById,
  stemArticleById: stemArticleById,
  updateArticle: updateArticle,
  classifyArticle: classifyArticle,
  getSynaptic: getSynaptic
}
