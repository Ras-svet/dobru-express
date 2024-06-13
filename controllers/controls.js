const Control = require('../models/controls');
const ValidationError = require('../errors/validation-error');
const ConflictError = require('../errors/conflict-error')

module.exports.createControl = (req, res, next) => {
	const {subject, themes, name} = req.body
	Control.create({subject, themes, name})
		.then((control) => res.status(200).send(control))
		.catch((err) => {
			if (err.code === 11000) {
				return next(new ConflictError('Контрольная с таким названием уже есть'));
			} else { return next(err); }
		});
}

module.exports.deleteControl = (req, res, next) => {
	Control.findById(req.params.controlId)
	.then((control) => {
		if (!control) {
			throw new NotFoundError('Контрольная по указанному id не найден');
		}
		Control.findByIdAndDelete(req.params.controlId)
			.then(() => {
				res.status(200).send({ message: `Контрольная ${control._id} удалена` });
			});
	})
	.catch((err) => {
		if (err.name === 'CastError') {
			return next(new CastError('Некорректный id контрольной'))
		} else { return next(err); }
	});
}

module.exports.getControls = (req, res, next) => {
	Control.find({})
	.then((controls) => res.status(200).send(controls))
	.catch((err) => next(err));
}

module.exports.openControl = (req, res, next) => {
	const { groups } = req.body;
	Control.findById(req.params.controlId)
		.then((control) => {
			if (!control) {
				throw new NotFoundError('Контрольная по указанному id не найдена');
			}

			if (!Array.isArray(groups)) {
				throw new ValidationError('Группы должны быть представлены в виде массива');
			}

			const existingGroups = control.groups.filter(group => groups.includes(group));
      if (existingGroups.length > 0) {
				throw new ConflictError('У этой группы уже есть доступ');
      }
			groups.forEach(group => {
				control.groups.push(group);
			});
			return control.save();
		})
		.then((updatedControl) => {
			res.status(200).json(updatedControl);
		})
		.catch((err) => {
			if (err.code === 11000) {
				return next(new ConflictError('Контрольная с таким названием уже есть'));
			} else if (err.name === 'CastError') {
				return next(new CastError('Некорректный id контрольной'));
			} else {
				return next(err);
			}
		});
}

module.exports.deleteAccess = (req, res, next) => {
	const { group } = req.body;
	Control.findById(req.params.controlId)
		.then((control) => {
			if (!control) {
				throw new NotFoundError('Контрольная по указанному id не найдена');
			}
			control.groups = control.groups.filter(item => item !== group);
			return control.save();
		})
		.then((updatedControl) => {
			res.status(200).json(updatedControl);
		})
		.catch((err) => {
			if (err.name === 'CastError') {
				return next(new CastError('Некорректный id контрольной'));
			} else {
				return next(err);
			}
		});
}

module.exports.getUserControls = (req, res, next) => {
	Control.find({ groups: { $in: [req.params.group] } })
	.then((controls) => {
		res.status(200).send(controls)
	})
	.catch((err) => {
		return next(err)
	})
}