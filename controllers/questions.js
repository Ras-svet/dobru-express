const Question = require('../models/questions');
const ValidationError = require('../errors/validation-error');
const NotFoundError = require('../errors/not-found-error')

module.exports.createQuestion = (req, res, next) => {
	const {subject, theme, difficulty, question, type, answers, goodAnswer} = req.body
	Question.create({subject, theme, difficulty, question, type, answers, goodAnswer})
		.then((question) => res.status(200).send(question))
		.catch((err) => {
			if (err.name === 'ValidationError') {
				return next(new ValidationError('Переданы некорректные данные при создании вопроса'));
			} else { return next(err); }
		});
}

module.exports.deleteQuestion = (req, res, next) => {
	Question.findById(req.params.questionId)
	.then((question) => {
		if (!question) {
			throw new NotFoundError('Вопрос по указанному id не найден');
		}
		Question.findByIdAndDelete(req.params.questionId)
			.then(() => {
				res.status(200).send({ message: `Вопрос ${question._id} удален` });
			});
	})
	.catch((err) => {
		if (err.name === 'CastError') {
			return next(new CastError('Некорректный id вопроса'))
		} else { return next(err); }
	});
}

module.exports.updateQuestion = (req, res, next) => {
  const { difficulty, question, type, answers, goodAnswer } = req.body;
  Question.findByIdAndUpdate(req.params.questionid, { difficulty, question, type, answers, goodAnswer }, { new: true, runValidators: true })
    .then((question) => {
      if (!question) {
        throw new NotFoundError('Вопрос по указанному id не найден');
      }
      res.status(200).send(question);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new ValidationError('Переданы некорректные данные при обновлении профиля.'));
      } else { next(err); }
    });
};

module.exports.getThemes = (req, res, next) => {
	Question.distinct('theme')
	.then((themes) => {
		if (!themes) {
			throw new NotFoundError('Темы не найдены');
		}
		res.status(200).send(themes);
	})
	.catch((err) => next(err));
}

module.exports.getQuestion = (res, req, next) => {
	Question.findById(req.params.questionId)
		.then((question) => {
			if(!question) {
				throw new NotFoundError('Вопрос не найден');
			}
			res.status(200).send(question)
		})
		.catch((err) => next(err));
}

module.exports.getQuestions = (req, res, next) => {
	Question.find({})
    .then((questions) => res.status(200).send(questions))
    .catch((err) => next(err));
}