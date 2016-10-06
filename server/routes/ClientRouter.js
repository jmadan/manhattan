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

ClientRouter.get('/user/all', (req, res) => {
    userModule.getUsers().then((persons) => {
        res.json({ users: persons, message: "user feed", success: true});
    });
});

ClientRouter.post('/user/create', (req, res) => {
    userModule.createUser(req.body.firstName, req.body.lastName, req.body.email).then((person, err) => {
        console.log("person*** ", person);
        res.json({ message: "User saved!", success: true, user: person });
    });
});

ClientRouter.get('/user/:userEmail', (req, res) => {
    userModule.userInfo(req.params.userEmail)
    .then((person) => {
        if(person == null){
            throw new Error("Can't find the user");
        }
        res.json({ message: "user fetched", success: true, user: person });
    })
    .catch((error) => {
        res.json({ message: error.message, success: false });  
    });
});

ClientRouter.get('/user/feed/:userEmail', (req, res) => {
    userModule.userInfo(req.params.userEmail).then((person) => {
        if(person == null){
            throw new Error("Can't find the user");
        }
        return person;
    }).then((person) => {
        return getUserFeedBasedOnInterest(person.interests)
        .then((feed) => res.json({ feed: feed, message: "user specific feed", success: true, user: person }));
    }).catch((err) => {

        res.json({ feed: {}, message: err.message, success: false })
    });
});

ClientRouter.post('/user/saveinterest', (req, res) => {
    res.json({ message: "User interest saved!", success: true, user: {} });
});

ClientRouter.post('/user/updateinterest', (req, res) => {
    res.json({ message: "User interest updated!", success: true, user: {} });
});



function getUserFeedBasedOnInterest(interests) {
    console.log("*****interests", interests.toString());
    return Feed.getFeed(interests.toString());
}


module.exports = ClientRouter;
