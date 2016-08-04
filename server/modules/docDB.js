'use strict';

var mongoose = require('mongoose');

exports.connectDB = () => {
	console.log(process.env.MANHATTANDB);
	console.log("before state: ", mongoose.connection.readyState);
	if (mongoose.connection.readyState != 2) {
		mongoose.connect("mongodb://127.0.0.1:27017/niteowl");
		console.log("after state: ", mongoose.connection.readyState);
		console.log("Mongo Connected");
	} else {
		console.log("Mongo Already Connected");
	}
}
exports.disconnectDB = () => {
	mongoose.disconnect();
	console.log("state: ", mongoose.connection.readyState);
	console.log("Mongo Diconnected");
}