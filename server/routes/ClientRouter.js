var express = require('express');
var ClientRouter = express.Router();
let userModule = require('../modules/user');
import * as Feed from '../modules/feed';

let Q = require('q');


ClientRouter.use((req, res, next) => {
    console.log('Route - time: ', Date.now());
    console.log(req.path);
    next();
});

ClientRouter.get('/', (req, res) => {
    res.json({ message: "Need to call specific end points to get data", error: true });
});

ClientRouter.get('/user/:userEmail', (req, res) => {
    userModule.userInfo(req.params.userEmail).then((person) => {
        return person;
    }).then((person) => {
        return getUserFeedBasedOnInterest(person.interests)
        .then((feed) => res.json({ feed: feed, message: "user feed", success: true, user: person }));
    });
});

ClientRouter.get('/user/:userid/getfeed', (req, res) => {
    let user = userModule.userInfo(req.params.userid);
    res.json({ feed: {}, success: true, message: "User specific feed" });
});

ClientRouter.post('/user/saveinterest', (req, res) => {
    res.json({ message: "User interest saved!", success: true, user: {} });
});

ClientRouter.post('/user/updateinterest', (req, res) => {
    res.json({ message: "User interest updated!", success: true, user: {} });
});

ClientRouter.post('/user', (req, res) => {
    userModule.createUser('Jasdeep', 'Madan', 'jasdeepm@gmail.com').then((person, err) => {
        console.log("person*** ", person);
        res.json({ message: "User saved!", success: true, user: person });
    });
});

function getUserFeedBasedOnInterest(interests) {
    console.log("*****interests", interests.toString());
    return Feed.getFeed(interests.toString());
}


module.exports = ClientRouter;
