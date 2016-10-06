'use strict';

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

mongoose.Promise = require('q').Promise;

var UserSchema = new Schema({
	firstName: {
		type: String,
		required: true
	},
	lastName: {
		type: String
	},
	email: {
		type: String,
		required: true
	},
	timeSubmitted: {
		type: Date,
		default: Date.now()
	},
	interests: [{
		type: String
	}]
},
{ versionKey: false});

var User = mongoose.model('user', UserSchema);

module.exports = User;