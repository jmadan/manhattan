import Story from '../models/story';
let Q = require('q');

export function getFeed(interest) {
	let deferred = Q.defer();
	Story.find({category: {$regex: interest}}, 'storyId title url category').exec((err, stories) => {
		if(err) {
			deferred.reject(err);
		} else {
			deferred.resolve(stories);
		}
	});
	return deferred.promise;
};