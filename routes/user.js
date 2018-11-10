const User = require('../models/user');

module.exports.init = ((server) => {
	/**
	 * Create
	 */
	server.post('/users', (req, res, next) => {
		const data = req.body || {};

		User.create(data)
			.then((task) => {
				res.send(200, task);
				next();
			})
			.catch((err) => {
				res.send(500, err);
			});
	});

	/**
	 * List
	 */
	server.get('/users', (req, res, next) => {
		const limit = parseInt(req.query.limit, 10) || 10; // default limit to 10 docs
		const skip = parseInt(req.query.skip, 10) || 0; // default skip to 0 docs
		const query = req.query || {};

		// remove skip and limit from query to avoid false querying
		delete query.skip;
		delete query.limit;

		User.find(query).skip(skip).limit(limit)
			.then((users) => {
				res.send(200, users);
				next();
			})
			.catch((err) => {
				res.send(500, err);
			});
	});

	/**
	 * Read
	 */
	server.get('/users/:userId', (req, res, next) => {
		User.findById(req.params.userId)
			.then((user) => {
				res.send(200, user);
				next();
			})
			.catch((err) => {
				res.send(500, err);
			});
	});

	/**
	 * Update
	 */
	server.put('/users/:userId', (req, res, next) => {
		const data = req.body || {};
		const opts = {
			new: true,
		};

		User.findByIdAndUpdate({
			id: req.params.userId,
		}, data, opts)
			.then((user) => {
				res.send(200, user);
				next();
			})
			.catch((err) => {
				res.send(500, err);
			});
	});

	/**
	 * Delete
	 */
	server.del('/users/:userId', (req, res, next) => {
		const { userId } = req.params;

		User.findOneAndRemove({
			id: userId,
		})
			.catch((err) => {
				res.send(500, err);
			});
	});
});
