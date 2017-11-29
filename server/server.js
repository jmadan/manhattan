const config = require('../config');
const restify = require('restify');
const corsMiddleware = require('restify-cors-middleware');
require('newrelic');
const log = require('./utils/logger');
const providerRoute = require('./route/provider');
const articleRoute = require('./route/article');
const categoryRoute = require('./route/category');
const userRoute = require('./route/user');
const cronRoute = require('./route/cronjob');

const initialSetup = require('../server/modules/cron/initial');

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
  res.json({ message: 'this is the Manhattan home...' });
  return next();
});

server.get('/api', (req, res, next) => {
  res.json({ message: 'this is the Manhattan API home...' });
  return next();
});

server.get('/api/cron/start', cronRoute.startTask);
server.get('/api/cron/stop', cronRoute.stopTask);

server.get('/api/provider', providerRoute.getProviders);
server.get('/api/provider/:name/:topic', providerRoute.getProviderByTopic);
server.post('/api/provider', providerRoute.createProvider);

server.get('/api/article/status/:status', articleRoute.getArticleByStatus);
server.get('/api/article/:id', articleRoute.getArticleById);
server.put('/api/article/:id', articleRoute.updateArticle);
server.get('/api/article/stem/:id', articleRoute.stemArticleById);
// server.get('/api/article/classify/:id', articleRoute.getSynaptic);
// server.get('/api/article/brain/classify/:id', articleRoute.getBrain);

// server.get('/api/nlp/synaptic', articleRoute.getSynaptic);

server.get('/api/category', categoryRoute.getCategories);
server.post('/api/category', categoryRoute.newCategory);

server.get('/api/user/feed/:userId', userRoute.fetchUserFeed);
server.get('/api/user/email/:email', userRoute.fetchUserByEmail);

server.patch('/api/user/:userId', userRoute.updateUser);
server.post('/api/user/interest', userRoute.updateUserInterest);
server.post('/api/user', userRoute.createUser);

server.on(
  'after',
  restify.plugins.auditLogger({
    event: 'after',
    name: 'Manhattan',
    log: log
  })
);

server.on('uncaughtException', (req, res, route, err) => {
  let auditor = restify.auditlog({ log: log });
  auditor(req, res, route, err);
  res.send(500, 'Unexpected Error Occured');
});

server.listen(config.port, () => {
  log.info('%s listening at %s', server.name, server.url);
  initialSetup
    .distinctCategoryNumber()
    .then(num => {
      console.log(num);
      initialSetup.createDictionary();
      initialSetup.createCategoryMap();
      initialSetup.createNetwork();
    })
    .catch(e => console.log(e));
});
