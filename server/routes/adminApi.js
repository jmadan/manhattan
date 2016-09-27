var express = require('express');
var router = express.Router();

router.use((req, res, next) => {
	console.log('story route - time: ', Date.now());
	console.log(req.path);
	next();
});

router.get('/admin/api', (req, res) => {
	res.json({"message": "Need to call specific end points to get data", "error": true});
});

router.get('/admin/api/user/:userid', (req, res)=>{
	res.json({"user": {}, "message": "user info", "success": true});
});

router.get('/admin/api/user/:userid/getfeed', (req, res)=>{
	res.json({"feed": {}, "success": true, "message": "User specific feed"});
});

router.post('/admin/api/user/saveinterest', (req, res)=>{
	res.json({"message": "User interest saved!", "success": true, "user": {}});
});

router.post('/admin/api/user/updateinterest', (req, res)=>{
	res.json({"message": "User interest updated!", "success": true, "user": {}});
});