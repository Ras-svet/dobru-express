const ControlVariants = require('../models/controlVariants');
const Control = require('../models/controls');
const Question = require('../models/questions')
const ValidationError = require('../errors/validation-error');
const CastError = require('../errors/cast-error');
const NotFoundError = require('../errors/not-found-error')

module.exports.createVariant = (req, res, next) => {
	const { controlName, easyCount, normalCount, hardCount } = req.body;
	let easyQuestions;
	let normalQuestions
	let hardQuestions
	const controlId = req.params.controlId

	Control.findById(req.params.controlId)
		.then((control) => {
			if (!control) {
				throw new NotFoundError('Контрольная не найдена');
			}

			const easyAggregation = Question.aggregate([
				{ $match: { difficulty: 'легкий', theme: { $in: control.themes } } },
				{ $sample: { size: easyCount } }
			]);

			const normalAggregation = Question.aggregate([
				{ $match: { difficulty: 'средний', theme: { $in: control.themes } } },
				{ $sample: { size: normalCount } }
			]);

			const hardAggregation = Question.aggregate([
				{ $match: { difficulty: 'сложный', theme: { $in: control.themes } } },
				{ $sample: { size: hardCount } }
			]);

			// Выполняем все три агрегации параллельно
			return Promise.all([easyAggregation, normalAggregation, hardAggregation]);
		})
		.then(([easyResult, normalResult, hardResult]) => {
			// Сохраняем результаты агрегаций в соответствующие переменные
			easyQuestions = easyResult;
			normalQuestions = normalResult;
			hardQuestions = hardResult;
			
			// Объединяем все результаты агрегаций в один массив
			const questions = [...easyQuestions, ...normalQuestions, ...hardQuestions];
			ControlVariants.create({controlId, controlName, easyCount, normalCount, hardCount, questions})
      .then((controlVariant) => {
        // После создания варианта контроля выполняем populate
        return ControlVariants.findById(controlVariant._id).populate('questions');
      })
      .then((populatedControlVariant) => {
        // Отправляем ответ клиенту
        res.status(200).send(populatedControlVariant);
      })
			.catch((err) => {
				if (err.name === 'ValidationError') {
					return next(new ValidationError('Переданы некорректные данные при генерации варианта'));
				} else { return next(err); }
			});
		})
		.catch((err) => next(err));
};

module.exports.deleteVariant = (req, res, next) => {
	ControlVariants.findById(req.params.variantId)
	.then((variant) => {
		if (!variant) {
			throw new NotFoundError('Вариант по указанному id не найден');
		}
		ControlVariants.findByIdAndDelete(req.params.variantId)
			.then(() => {
				res.status(200).send({ message: `Вариант ${variant._id} удален` });
			});
	})
	.catch((err) => {
		if (err.name === 'CastError') {
			return next(new CastError('Некорректный id варианта'))
		} else { return next(err); }
	});
}

module.exports.getRandomVariant = (req, res, next) => {
	ControlVariants.find({ controlId: { $eq: req.params.controlId } })
  .populate(['questions'])
	.then((result) => {
		const randomIndex = Math.floor(Math.random() * result.length);
		const variant = result[randomIndex];
		res.status(200).send(variant)
	})
	.catch((err) => {
		if (err.name === 'CastError') {
			return next(new CastError('Некорректный id варианта'))
		} else { return next(err); }
	});
}

module.exports.getVariants = (req, res, next) => {
	ControlVariants.find()
	.populate(['questions'])
	.then((variants) => {
		res.status(200).send(variants)
	})
}