let User = require('../models/user');
let Q = require('q');

exports.userInfo = (userEmail) => {
	let deferred = Q.defer();
	User.findOne({email: userEmail}).exec((err, person) => {
		if (err) {
			deferred.reject(err);
		} else {
			deferred.resolve(person);
		}
	});
	return deferred.promise;
}

exports.getUsers = () => {
	let deferred = Q.defer();
	User.find({}).exec((err, person) => {
		if (err) {
			deferred.reject(err);
		} else {
			deferred.resolve(person);
		}
	});
	return deferred.promise;
}


exports.createUser = (firstName, lastName, email) => {
	let deferred = Q.defer();
	// let person = new User({firstName: firstName, lastName: lastName, email: email})
	User.create({firstName: firstName, lastName: lastName, email: email}, (err, person) => {
		if(err){
			deferred.reject(err);
		} else{
			deferred.resolve(person);
		}
	});
	return deferred.promise;
}