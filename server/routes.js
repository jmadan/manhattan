const express = require('express')
const router = express.Router()
const feed = require('./modules/feed/feedparser');
const article = require('./modules/article');
const provider = require('./modules/provider');
const category = require('./modules/category');
const nlp = require('./modules/nlp/aggregate_data');
const tdata = require('./modules/nlp/trainingdata');

router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

router.get('/', function(req, res) {
  res.json({message: "You need to call a specific endpoint to get anything back"})
})

//  **********Providers routes**************
router.get('/providers', (req, res) => {
  provider.fetchProviders().then((result)=>{
    res.json(result);
  })
})

router.post('/providers', (req, res) => {
  provider.newProvider(req.body).then((result) => {
    res.json(result);
  });
})

router.put('/providers/:status/:id', (req, res) => {
  provider.updateProvider(req.params.status, req.params.id).then((response) =>{
    if(response.lastErrorObject.n == 1){
      res.json({message: "Status "+ req.params.status +" updated", doc: response.value._id})
    } else{
      res.json({message: "Error while updating...", error: response})
    }
  })
})

router.get('/providers/:name', (req, res) => {
  let topic = req.query.topic != undefined ? req.query.topic : 'all';
  console.log("topic: ", topic);
  feed.getRSSFeedProviders().then((result)=>{
    return result.list.filter((provider) => {
      if(provider.name === req.params.name && provider.topic === topic){
        return provider;
      } else {
        return null;
      }
    });
  }).then((provider)=>{
    if(!provider.length){
      res.json({
        "error": "No Feed found with given name and topic",
        "name":req.params.name,
        "topic": topic
      })
    } else{
      res.json({
        "provider": provider,
        "name": provider.name,
        "topic": provider.topic
      })
    }
  });
})

// ************** Articles Reoutes ****************

router.get('/articles/status/:status', (req, res)=>{
  article.fetchArticles(req.params.status).then((result) => {
    res.json({result: result});
  })
})

router.get('/articles/:id', (req, res) => {
  article.getArticle(req.params.id).then((result) => {
    res.json({result: result});
  })
})


router.get('/articles/stem/:id',function(req, res) {
  article.getArticle(req.params.id).then((item)=>{
    article.getArticleStemWords(item).then((article) =>{
        res.json({result: article});
      })
  }).catch((err)=>{
    res.json({error: err})
  })
});

router.put('/articles/:id/update', (req, res)=>{
  article.updateArticle(req.params.id, req.body).then((response) => {
    res.json({result: response});
  })
})

router.put('/articles/:id/status/update', (req, res)=>{
  article.updateArticleStatus(req.body.id, req.body.status).then((response) => {
    res.json({result: response});
  })
})

router.get('/articles/categories/:category', (req, res)=>{
  article.getArticleBasedOnCategory(req.params.category).then((result) => {
    res.json({result: result})
  })
})

router.put('/articles/:id/category/update', (req, res)=>{
  article.updateArticleCategory(req.params.id, req.body.category).then((result) => {
    res.json({result: result})
  })
})


// ********** Category Routes ************

router.get('/categories', function(req, res) {
  category.getCategories().then((docs)=>{
    res.json({categories: docs});
  }).catch(err=>console.log(err));
})

router.get('/nlp/data/refresh', (req,res)=>{
  nlp.groupStemWordsByCategories().then((result) => {
    res.send(result);
  })
})

router.get('/nlp/data/category/:category', (req,res)=>{
  nlp.getStemWordsByCategory(req.params.category).then((result) => {
    res.send(result);
  })
})

router.get('/nlp/trainingdata', async(req,res)=>{
  let data = await tdata.fetchTrainingData();
  res.json(data);
})




module.exports = router
