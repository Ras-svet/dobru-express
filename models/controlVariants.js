const mongoose = require('mongoose');
const validator = require('validator');

const controlVariantSchema = new mongoose.Schema({
	controlName: {
		type: String,
		reuired: [true, `Контрольная не выбрана`]
	},
	controlId: {
		type: mongoose.Schema.Types.ObjectId,
    ref: 'controls',
		default: {}
	},
	easyCount: {
		type: Number,
		required: [true, `Выберите количество легких вопросов`],
		default: 0
	},
	normalCount: {
		type: Number,
		required: [true, `Выберите количество средних вопросов`],
		default: 0
	},
	hardCount: {
		type: Number,
		required: [true, `Выберите количество сложных вопросов`],
		default: 0
	},
	questions: [{
		type: mongoose.Schema.Types.ObjectId,
    ref: 'questions',
		default: []
	}]
}, { versionKey: false })

module.exports = mongoose.model('controlVariants', controlVariantSchema);