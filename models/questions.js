const mongoose = require('mongoose');
const validator = require('validator');

const questionSchema = new mongoose.Schema({
	subject: {
		type: String, 
		enum: [`Фронтенд`, `Бэкенд`],
		required: [true, `Выберите предмет`]
	},
	theme: {
		type: String,
		required: [true, `Напишите тему вопроса`]
	},
	difficulty: {
		type: String,
		enum: ['легкий','средний', 'сложный'],
		required: [true, `Выберите сложность вопроса`],
	},
	question: {
		type: String,
		required: [true, `Поле "вопрос" должно быть заполнено`]
	},
	type: {
		type: String,
		enum: [`открытый вопрос`, `с вариантами ответа`],
		required: [true, `Выберите тип вопроса`],
		default: 'открытый вопрос'
	},
	answers: [{
		type: String,
		default: []
	}],
	goodAnswer: {
		type: String,
    default: ''
	}
}, { versionKey: false })

module.exports = mongoose.model('questions', questionSchema);