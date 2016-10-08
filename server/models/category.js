'use strict';

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CategorySchema = new Schema({
	category: {
		type: String,
		required: true
	},
	description: {
		type: String
	},
	createdAt: {
		type: Date,
		default: Date.now()
	}
}, {
	versionKey: false
});

var Category = mongoose.model('category', CategorySchema);

module.exports = Category;
