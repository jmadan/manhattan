let config = {};

config.mongoURI = {
	dev: process.env.ManhattanDBDev,
	test: process.env.ManhattanDBTest,
	prod: process.env.MONGODB_URI
};

export default config;