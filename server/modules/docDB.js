'use strict';

var mongoose = require('mongoose');

exports.connectDB = (mongoURI) => {
    console.log("state before connection: ", mongoose.connection.readyState);
    if (mongoose.connection.readyState != 2) {
        mongoose.connect(mongoURI);
        console.log("state after connection: ", mongoose.connection.readyState);
        console.log("Mongo Connected");
    } else {
        console.log("Mongo Already Connected");
    }
}
exports.disconnectDB = () => {
    mongoose.disconnect();
    console.log("state after disconnect: ", mongoose.connection.readyState);
    console.log("Mongo Diconnected");
}
