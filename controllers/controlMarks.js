const ControlMarks = require('../models/controlMarks');
const ValidationError = require('../errors/validation-error');
const ConflictError = require('../errors/conflict-error');
const controlMarks = require('../models/controlMarks');
const ControlVariant = require('../models/controlVariants')

module.exports.createControlMarks = async (req, res, next) => {
  const { controlId, variantId, userAnswers } = req.body;

  try {
    const controlVariant = await ControlVariant.findById(variantId).populate('questions');
    const points = calculatePoints(controlVariant.questions, userAnswers);
    const result = await ControlMarks.create({ userId: req.user._id, controlId, variantId, userAnswers, points });

    res.status(200).send(result);
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return next(new ConflictError('Контрольная с таким названием уже есть'));
    } else {
      next(err);
    }
  }
};

function calculatePoints(questions, userAnswers) {
  let totalPoints = 0;

  questions.forEach(question => {
    const userAnswer = userAnswers.find(answer => String(answer.id) === String(question._id));

    if (userAnswer && userAnswer.answer === question.goodAnswer) {
      totalPoints += 1;
    }
  });

  return totalPoints;
}

module.exports.getControlMarks = (req, res, next) => {
  ControlMarks.find()
    .populate(['controlId', 'variantId', 'userId'])
    .populate({
      path: 'variantId',
      populate: {
        path: 'questions',
        model: 'questions'
      }
    })
    .then((controlMarks) => res.status(200).send(controlMarks))
    .catch((err) => next(err));
}

module.exports.getControlMarksByUser = (req, res, next) => {
  ControlMarks.find({ userId: req.user._id })
    .populate(['controlId', 'variantId', 'userAnswers.id'])
    .then((controlMarks) => res.status(200).send(controlMarks))
    .catch((err) => next(err));
}

module.exports.checkControlMarks = (req, res, next) => {
  ControlMarks.findByIdAndUpdate(req.params.controlmarkId, {checkedPoints: req.body.checkedPoints}, { new: true })
    .populate(['controlId', 'variantId', 'userId'])
    .populate({
      path: 'variantId',
      populate: {
        path: 'questions',
        model: 'questions'
      }
    })
		.then((controlmark) => {
			if (!controlmark) {
				throw new NotFoundError('Решение по укаазнному id не найдено');
			}
			res.status(200).send(controlmark);
		})
    .catch((err) => next(err));
}