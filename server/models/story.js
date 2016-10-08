'use strict';

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

mongoose.Promise = require('q').Promise;

var StorySchema = new Schema({
	storyId: {
		type: String
	},
	title: {
		type: String,
		required: true
	},
	url: {
		type: String,
		required: true
	},
	storyType: {
		type: String,
		required: true
	},
	timeSubmitted: {
		type: Date,
		default: Date.now()
	},
	score: {
		type: Number
	},
	bodyText: {
		type: String,
		default: 'No Body'
	},
	category: {
		type: String,
		default: 'uncategorized'
	},
	source: {
		type: String
	},
	features: [{
		type: String
	}]
}, {
	versionKey: false
});

var Story = mongoose.model('story', StorySchema);

module.exports = Story;
