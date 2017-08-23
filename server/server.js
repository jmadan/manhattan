const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const hbs = require('express-handlebars');
const api = require('./routes');
// const request = require('request');

const app = express();
//view engine setup
app.engine('hbs', hbs({
  extname: 'hbs',
  defaultLayout: 'applayout',
  layoutsDir: __dirname + '/views/layouts/'}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use('/', express.static('server/assets'));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/json'}));
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(morgan('dev'));

app.use(function (req, res, next) {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server.
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

app.get('/', (req, res) => {
    var options = {
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };
    res.render('index');
});

app.use('/api', api);

let PORT = process.env.PORT || 4000;

app.set('port', PORT);

app.listen(app.get('port'), function (err) {
    if (err) {
        console.log(err);
        return;
    }
    console.log("Server started http://localhost:"+ PORT);
    // setInterval(function() {
    //   request("https://island-of-the-hills.herokuapp.com/",(error, response, html)=>{
    //     console.log("calling self to stay awake...")
    //   });
    // }, 600000);
});
