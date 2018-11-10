const restify = require('restify');
const bunyan = require('bunyan');
const Bunyan2Loggly = require('bunyan-loggly');
const path = require('path');
const fs = require('fs');

module.exports.init = (config) => {
	/**
	 * Setup Streams
	 */
	const streams = [{
		stream: process.stdout,
		level: 'debug',
	}];

	// Setup Loggly Stream
	if (config.loggly.use) {
		const logglyConfig = config.loggly.config;
		const logglyBuffer = config.loggly.buffer;
		const logglyStream = new Bunyan2Loggly(logglyConfig, logglyBuffer.length, logglyBuffer.timeout);

		streams.push({
			stream: logglyStream,
			level: 'error',
		});
	}

	// Setup Rotating File Stream
	if (config.file.use) {
		const fileConfig = config.file;

		// create logs directory if not exists.
		if (!fs.existsSync(fileConfig.dir)) {
			fs.mkdirSync(fileConfig.dir);
		}

		streams.push({
			type: 'rotating-file',
			path: path.join(fileConfig.dir, '/', fileConfig.name),
			period: fileConfig.period,
			count: fileConfig.count,
			level: 'info',
		});
	}

	/**
	 * Setup Bunyan Logger
	 */
	const logger = bunyan.createLogger({
		name: config.name,
		serializers: restify.bunyan.serializers,
		streams,
	});

	return logger;
};
