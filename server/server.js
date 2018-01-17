const config = require('../config');
const restify = require('restify');
const corsMiddleware = require('restify-cors-middleware');
const log = require('./utils/logger');
const providerRoute = require('./route/provider');
const articleRoute = require('./route/article');
const categoryRoute = require('./route/category');
const userRoute = require('./route/user');
// let Rollbar = require('rollbar');
// let rollbar = new Rollbar(process.env.ROLLBAR_KEY);

const cors = corsMiddleware({
  preflightMaxAge: 5,
  origins: ['*'],
  allowHeaders: ['API-Token'],
  exposeHeaders: ['API-Token-Expiry']
});

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
// server.use(rollbar.)

server.pre((req, res, next) => {
  req.log.info({ req: req }, 'start');
  return next();
});

server.get('/', (req, res, next) => {
  res.json({ message: 'this is the Manhattan home...' });
  return next();
});

server.get('/api', (req, res, next) => {
  res.json({ message: 'this is the Manhattan API home...' });
  return next();
});

server.get('/api/provider', providerRoute.getProviders);
server.get('/api/provider/:name/:topic', providerRoute.getProviderByTopic);
server.post('/api/provider', providerRoute.createProvider);

server.get('/api/article/status', articleRoute.getArticleByStatus);
server.get('/api/article/:id', articleRoute.getArticleById);
server.put('/api/article/:id', articleRoute.updateArticle);
server.get('/api/article/stem/:id', articleRoute.stemArticleById);
server.get('/api/article/classify/:id', articleRoute.getSynaptic);
server.get('/api/article/brain/classify/:id', articleRoute.getBrain);

// server.get('/api/nlp/synaptic', articleRoute.getSynaptic);

server.get('/api/category', categoryRoute.getCategories);
server.post('/api/category', categoryRoute.newCategory);

server.get('/api/user/feed/saved/:userId', userRoute.fetchUserSavedFeed);
server.get('/api/user/feed/:userId', userRoute.fetchUserFeed);
server.get('/api/user/email/:email', userRoute.fetchUserByEmail);

server.post('/api/user/action', userRoute.userAction);
server.patch('/api/user/:userId', userRoute.updateUser);
server.post('/api/user/interest', userRoute.updateUserInterest);
server.post('/api/user', userRoute.createUser);

// server.on(
//   'after',
//   restify.plugins.auditLogger({
//     event: 'after',
//     name: 'Manhattan',
//     log: log
//   })
// );
server.on('after', (req, res) => {
  req.log.info({ req: req, res: res }, 'finished');
});

server.on('uncaughtException', (req, res, route, err) => {
  let auditor = restify.auditlog({ log: log });
  auditor(req, res, route, err);
  res.send(500, 'Unexpected Error Occured');
});

server.listen(config.port, () => {
  log.info('%s listening at %s', server.name, server.url);
});
