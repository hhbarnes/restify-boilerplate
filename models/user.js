const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');

const UserSchema = new mongoose.Schema({
	email: {
		type: String,
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
}, { collection: 'users' });

UserSchema.plugin(timestamps);

module.exports = mongoose.model('User', UserSchema);
