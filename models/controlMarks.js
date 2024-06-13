const mongoose = require('mongoose');
const validator = require('validator');

const controlMarksSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
		default: {}
	},
	controlId: {
		type: mongoose.Schema.Types.ObjectId,
    ref: 'controls',
		default: {}
	},
	variantId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'controlVariants'
	},
  userAnswers: [{
		answer: {
      type: String
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'questions'
    }
	}],
	points: {
		type: String,
		required: true
	},
  checkedPoints: {
    type: String,
    default: '0'
  }
}, { versionKey: false })

module.exports = mongoose.model('controlMarks', controlMarksSchema);