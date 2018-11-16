const restify = require('restify');
const errors = require('restify-errors');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const User = require('../models/user');
const config = require('../config.json');

module.exports.init = ((server) => {
	/**
	 * Add basic authentication plugin for this route
	 */
	server.use(restify.plugins.authorizationParser());

	/**
	 * Get User
	 */
	server.get('/auth', (req, res, next) => {
		if (_.isEmpty(req.authorization)
			|| _.isEmpty(req.authorization.basic)
			|| _.isEmpty(req.authorization.basic.username)
			|| _.isEmpty(req.authorization.basic.password)) {
			next(new errors.UnauthorizedError('Missing username and/or password'));
			return;
		}

		const { username } = req.authorization.basic;
		const { password } = req.authorization.basic;

		User.findOne({ email: username })
			.then((user) => {
				if (!user) {
					next(new errors.UnauthorizedError('Invalid username'));
					return;
				}

				user.verifyPassword(password)
					.then((valid) => {
						if (valid) {
							// creating jsonwebtoken using the secret from config.json
							const token = jwt.sign({
								eml: user.email,
								nme: `${user.name.first} ${user.name.last}`,
							}, config.jwt.keys.private, {
								issuer: config.jwt.issuer,
								subject: String(user._id),
								audience: config.jwt.audience,
								expiresIn: config.jwt.expires,
								algorithm: 'RS256',
							});

							// retrieve issue and expiration times
							const { iat, exp } = jwt.decode(token);
							res.send(200, { iat, exp, token });
						} else {
							next(new errors.UnauthorizedError('Invalid password'));
						}
					})
					.catch((err) => {
						next(err);
					});
			})
			.catch((err) => {
				next(err);
			});
	});
});
