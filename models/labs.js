const mongoose = require('mongoose');
const validator = require('validator');

const labSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, `Напишите название лабораторной`]
	},
	variants: [{
		nameVariant: {
			type: String,
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
		}]
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
	},
  penaltyPoints: {
    type: Number
  }
}, { versionKey: false })

module.exports = mongoose.model('labs', labSchema);