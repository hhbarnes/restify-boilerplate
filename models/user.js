const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const bcrypt = require('mongoose-bcrypt');

require('mongoose-type-email');

const UserSchema = new mongoose.Schema({
	email: {
		type: mongoose.SchemaTypes.Email,
		trim: true,
		lowercase: true,
		unique: true,
		required: true,
	},
	name: {
		first: {
			type: String,
			trim: true,
			required: true,
		},
		last: {
			type: String,
			trim: true,
			required: true,
		},
	},
	password: {
		type: String,
		bcrypt: true,
		required: true,
	},
}, { collection: 'users' });

UserSchema.plugin(timestamps);
UserSchema.plugin(bcrypt, { rounds: 10 });

module.exports = mongoose.model('User', UserSchema);
