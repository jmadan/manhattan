const config = require('../config');
const restify = require('restify');
const corsMiddleware = require('restify-cors-middleware');
// const bunyan = require('bunyan');
const log = require('./utils/logger');
// const provider = require('./modules/provider');
const provider = require('./route/provider');
const article = require('./route/article');
const category = require('./route/category');

const cors = corsMiddleware({
  preflightMaxAge: 5,
  origins: ['*'],
  allowHeaders: ['API-Token'],
  exposeHeaders: ['API-Token-Expiry']
});

// let log = bunyan.createLogger({name: 'Manhattan'});
// let log = new Logger();

const server = restify.createServer({
  name: config.name,
  url: config.base_url,
  version: '1.0.0',
  log: log
});

server.pre(restify.pre.sanitizePath());
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());
server.use(restify.plugins.fullResponse());
server.pre(cors.preflight);
server.use(cors.actual);


server.get('/', (req, res, next) => {
  res.json({message: 'this is the Manhattan home...'});
  return next();
});

server.get('/api', (req, res, next) => {
  res.json({message: 'this is the Manhattan API home...'});
  return next();
});

server.get('/api/provider', provider.getProviders);
// server.get('/api/provider/:status/:id', provider.getProviders);
server.get('/api/provider/:name/:topic', provider.getProviderByTopic);
server.post('/api/provider', provider.createProvider);

server.get('/api/article/status/:status', article.getArticleByStatus);
server.get('/api/article/:id', article.getArticleById);
server.put('/api/article/:id', article.updateArticle);
server.get('/api/article/stem/:id', article.stemArticleById);
server.get('/api/article/classify/:id', article.classifyArticle);

server.get('/api/nlp/synaptic', article.getSynaptic);

server.get('/api/category', category.getCategories);
server.post('/api/category', category.newCategory);

server.on('after', restify.plugins.auditLogger({
  event: 'after',
  name: 'Manhattan',
  log: log
}
));


server.on('uncaughtException', (req, res, route, err) => {
  let auditor = restify.auditlog({log: log});
  auditor(req, res, route, err);
  res.send(500, 'Unexpected Error Occured');
});

server.listen(config.port, ()=>{
  log.info('%s listening at %s', server.name, server.url);
});
