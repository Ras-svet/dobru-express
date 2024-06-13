const mongoose = require('mongoose');
const validator = require('validator');

const taskSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, `Напишите название дополнительного задания`]
	},
	file:{
		type: String,
	},
	text: {
		type: String,
	},
	seats: {
		type: Number,
	},
	students: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user',
		default: []
	}],
	subject: {
		type: String, 
		enum: [`Фронтенд`, `Бэкенд`],
		required: [true, `Выберите предмет`]
	},
	deadline: {
		type: Date,
	},
	groups: [{
		type: String,
		default: []
	}],
	points: {
		type: Number
	}
}, { versionKey: false })

module.exports = mongoose.model('tasks', taskSchema);