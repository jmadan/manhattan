import Story from '../models/story';
let Q = require('q');

export function getFeed(interests) {
	let deferred = Q.defer();
	Story.find({$text : {$search: interests}}, 'storyId title url category').exec((err, stories) => {
		if(err) {
			deferred.reject(err);
		} else {
			deferred.resolve(stories);
		}
	});
	// Story.find({category: {$regex: interest, $options: 'i'}}, 'storyId title url category').exec((err, stories) => {
	// 	if(err) {
	// 		deferred.reject(err);
	// 	} else {
	// 		deferred.resolve(stories);
	// 	}
	// });
	return deferred.promise;
};