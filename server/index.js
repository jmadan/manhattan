let express = require('express');
let path = require('path');
let bodyParser = require('body-parser');
let cron = require('node-cron');
let docDB = require('./modules/docDB');
let hnNews = require('./modules/hackernews');

let ClientRouter = require('./routes/ClientRouter');

let app = express();

app.use('/', express.static('app/public'));
app.use(bodyParser.json());

app.use(bodyParser.json({ type: 'application/json'}));

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(function (req, res, next) {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server.
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Disable caching so we'll always get the latest comments.
    res.setHeader('Cache-Control', 'no-cache');
    console.log("***********request: ", req.url);
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

let PORT = process.env.PORT;
let server = app.listen(PORT || 3000, 'localhost', function (err) {
    if (err) {
        console.log(err);
        return;
    }
    docDB.connectDB();
    console.log("Server started http://localhost:3000");
    // cron.schedule('* * * * *', () => {
    // console.log('running the cron');
    // hnNews.getLatestHNStories();
    // hnNews.updateHNStoriesMetaData();
    // hnNews.updateHNStoriesText();
    // });
});