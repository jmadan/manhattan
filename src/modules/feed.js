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

export function deleteStory(storyId) {
	Story.remove({storyId: storyId}, (err) => {
		return err;
	});
};

export function updateStory(storyId, category) {
	let deferred = Q.defer();
	Story.findOneAndUpdate({storyId: storyId}, {category: category}, {new: true}, (err, doc)=>{
		if(err){
			deferred.reject(err);
		} else {
			deferred.resolve(doc);
		}
	});
	return deferred.promise;
};