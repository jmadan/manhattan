'use strict';

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

mongoose.Promise = require('q').Promise;

var StorySchema = new Schema({
	storyId: {
		type: String
	},
	title: {
		type: String
	},
	url: {
		type: String
	},
	storyType: {
		type: String
	},
	timeSubmitted: {
		type: Date
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
});

var Story = mongoose.model('story', StorySchema);

module.exports = Story;