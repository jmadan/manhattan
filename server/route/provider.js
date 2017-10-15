'use strict';
const provider = require('../modules/provider');

function getProviders(req, res, next) {
  provider.fetchProviders().then((result)=>{
    res.json(result);
  })
    .catch(e=>res.json({error: e}));
  return next();
}

function createProvider(req, res, next) {
  provider.newProvider(req.body).then((result) => {
    res.json(result);
  });
}


// function ('/providers/:status/:id', (req, res) => {
//   provider.updateProvider(req.params.status, req.params.id).then((response) =>{
//     if(response.lastErrorObject.n == 1){
//       res.json({message: "Status "+ req.params.status +" updated", doc: response.value._id})
//     } else{
//       res.json({message: "Error while updating...", error: response})
//     }
//   })
// })
//

function getProviderByTopic(req, res, next) {
  let topic = req.params.topic !== undefined ? req.params.topic : 'all';
  provider.fetchProviders().then((result)=>{
    return result.filter((provider) => {
      if (provider.name === req.params.name && provider.topic === topic) {
        return provider;
      }
      return null;
    });
  })
    .then((provider)=>{
      if (!provider.length) {
        let err = new restify.errors.NotFoundError('No Feed found with given name and topic');
        return next(err);
      // res.json({
      //   "error": "No Feed found with given name and topic",
      //   "name":req.params.name,
      //   "topic": topic
      // })
      }
      res.json({
        provider: provider,
        'name': provider.name,
        'topic': provider.topic
      });

      return next();
    });
}

module.exports = {
  getProviders: getProviders,
  getProviderByTopic: getProviderByTopic,
  createProvider: createProvider
};
