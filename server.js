const restify = require('restify');
const mongoose = require('mongoose');
const logger = require('./lib/logger');
const userRoute = require('./routes/user');
const packageJSON = require('./package.json');
const config = require('./config.json');

if (!process.env.NODE_ENV) {
	process.env.NODE_ENV = 'development';
}

/**
 * Initialize Logging Server
 */
const log = logger.init(config.logger);

// Handle uncaught errors
process.on('error', (err) => {
	log.error(err);
});

/**
 * Initialize Restify Server
 */
const server = restify.createServer({
	name: config.name || packageJSON.name,
	version: config.version || packageJSON.version,
	log,
});

server.on('uncaughtException', (req, res, route, err) => {
	log.error(err.message, {
		event: 'uncaughtException',
	});
	res.send(500, {
		handler: err,
	});
});

/**
 * Bundled Restify Plugins
 */
server.use(restify.plugins.acceptParser(config.server.acceptable));
server.use(restify.plugins.throttle({
	rate: config.server.throttleRate,
	burst: config.server.throttleBurst,
	ip: false,
	username: true,
}));
server.use(restify.plugins.dateParser());
server.use(restify.plugins.queryParser());
server.use(restify.plugins.fullResponse());
server.use(restify.plugins.bodyParser());
server.use((req, res, next) => {
	req.rawBody = '';
	req.setEncoding('utf8');
	req.on('data', (chunk) => {
		req.rawBody += chunk;
		req.body = JSON.parse(req.rawBody);
	});
	req.on('end', () => {
		next();
	});
});
server.use((req, res, next) => {
	log.info(`${req.method} - ${req.url}`, req);
	next();
});
server.use(restify.plugins.gzipResponse());

/**
 * Connect to MongoDB via Mongoose
 */
const mongoOpts = {
	useNewUrlParser: true,
	promiseLibrary: global.Promise,
	auto_reconnect: true,
	reconnectTries: Number.MAX_VALUE,
	reconnectInterval: 1000,
	config: {
		autoIndex: true,
	},
};

mongoose.Promise = global.Promise;
mongoose.connect(config.db.uri, mongoOpts);

const db = mongoose.connection;
db.on('error', (err) => {
	log.error(err);

	if (err.message.code === 'ETIMEDOUT') {
		mongoose.connect(config.db.uri, mongoOpts);
	}
});

db.once('open', () => {
	/**
	 * Set up Routes
	 */
	userRoute.init(server);

	/**
	 * Start API Server
	 */
	server.listen(config.server.port || 3000, config.server.host || '127.0.0.1', () => {
		log.info('%s listening at %s', server.name, server.url);
	});
});
