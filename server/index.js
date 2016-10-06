let express = require('express');
let path = require('path');
let bodyParser = require('body-parser');
let cron = require('node-cron');
let docDB = require('./modules/docDB');
let morgan = require('morgan');
import ServerConfig from '../config/config';

let ClientRouter = require('./routes/ClientRouter');
import AdminRouter from './routes/AdminRouter';

let app = express();

app.use('/', express.static('app/public'));
app.use(bodyParser.json());

app.use(bodyParser.json({ type: 'application/json'}));

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(morgan('combined'));

app.use(function (req, res, next) {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server.
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Disable caching so we'll always get the latest comments.
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

app.get('/', (req, res) => {
    // res.render('index');
    var options = {
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };
    res.json({message: "Welcome to Manhattan Project"});
});

app.use('/api', ClientRouter);
app.use('/admin/api', AdminRouter);

let PORT = process.env.PORT;
let server = app.listen(PORT || 3000, 'localhost', function (err) {
    if (err) {
        console.log(err);
        return;
    }
    docDB.connectDB(ServerConfig.mongoURI[process.env.NODE_ENV]);
    console.log("Server started http://localhost:3000");
    cron.schedule('* * * * *', () => {
        console.log('running the cron');
    });
    // cron.schedule('* * * * *', () => {
    // console.log('running the cron');
    // hnNews.getLatestHNStories();
    // hnNews.updateHNStoriesMetaData();
    // hnNews.updateHNStoriesText();
    // });
});