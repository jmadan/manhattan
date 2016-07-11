'use strict';

var mongoose = require('mongoose');

exports.connectDB = () => {
	console.log(process.env.MANHATTANDB);
	mongoose.connect(process.env.MANHATTANDB);
	console.log("state: ", mongoose.connection.readyState);
	console.log("Mongo Connected");
}
exports.disconnectDB = () => {
	mongoose.disconnect();
	console.log("state: ", mongoose.connection.readyState);
	console.log("Mongo Diconnected");
}