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
	category: {
		type: String,
		default: 'uncategorized'
	}
});

var story = mongoose.model('story', StorySchema);
mongoose.connect('mongodb://localhost:27017/niteowl');

exports.getDocuments = () => {
	var query = story.find({}).limit(10);
	return query.exec();
}

exports.saveDocuments = (storyId, title, url, storyType, timeSubmitted, score, category) => {
	var st = new story({
		storyId: storyId,
		title: title,
		url: url,
		storyType: storyType,
		timeSubmitted: timeSubmitted,
		score: score,
		category: category
	});
	st.save((err) => {
		if (err) {
			console.log("error saving this document: ", st.storyId);
		}
	});
}