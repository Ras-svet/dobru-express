const mongoose = require('mongoose');
const validator = require('validator');

const controlSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, `Напишите название контрольной`]
	},
	subject: {
		type: String, 
		enum: [`Фронтенд`, `Бэкенд`],
		required: [true, `Выберите предмет`]
	},
	themes: [{
		type: String,
		required: [true, `Поле "тема" не заполнено`],
		default: []
	}],
	groups: [{
		type: String,
		default: []
	}]
}, { versionKey: false })

module.exports = mongoose.model('controls', controlSchema);