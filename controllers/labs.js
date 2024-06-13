const Lab = require('../models/labs');
const ValidationError = require('../errors/validation-error');
const ConflictError = require('../errors/conflict-error');
const NotFoundError = require('../errors/not-found-error')
const CastError = require('../errors/cast-error')

module.exports.createLab = (req, res, next) => {
	const {name, subject, deadline, points, penaltyPoints} = req.body
	Lab.create({name, subject, deadline, points, penaltyPoints})
		.then((lab) => res.status(200).send(lab))
		.catch((err) => {
			if (err.code === 11000) {
				return next(new ConflictError('Лабораторная с таким названием уже существует'));
			} else { next(err); }
		});
}

module.exports.createLabVariant = (req, res, next) => {
	const labId = req.params.labId;
	const { nameVariant, text, seats } = req.body;

	Lab.findByIdAndUpdate(labId, {
		$addToSet: { variants: { nameVariant, text, seats, file: req.file ? req.file.path : '' } }}, { new: true })
		.then((lab) => {
			if (!lab) {
				throw new NotFoundError('Лабораторная по указанному id не найдена');
			}
			res.status(200).send(lab);
		})
		.catch((err) => {
			if (err.code === 11000) {
				return next(new ConflictError(err));
			} else if (err.name === 'CastError') {
				return next(new CastError('Некорректный id лабораторной'));
			} else {
				return next(err);
			}
		});
};

module.exports.deleteLabVariant = (req, res, next) => {
  const labId = req.params.labId;
  const variantId = req.params.variantId;

  Lab.findByIdAndUpdate(labId, {
    $pull: { variants: { _id: variantId } }
  }, { new: true })
    .then((lab) => {
      if (!lab) {
        throw new NotFoundError('Лабораторная по указанному id не найдена');
      }
      res.status(200).send(lab);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new CastError('Некорректный id лабораторной или варианта'));
      } else {
        return next(err);
      }
    });
};

module.exports.makeAppointmnet = (req, res, next) => {
	const userId = req.user._id
	const labId = req.params.labId
	const {variantId} = req.body
	Lab.findById(labId)
	.populate(['variants.students'])
	.then((lab) => {
		if (!lab) {
				throw new NotFoundError('Лабораторная по указанному id не найдена');
		}
		const variant = lab.variants.find(v => v._id.toString() === variantId);
		if (!variant) {
				throw new NotFoundError('Вариант лабораторной работы не найден');
		}
    const isUserAlreadyAppointed = lab.variants.some((v) =>
        v.students.some((student) => student._id.toString() === userId)
      );
      if (isUserAlreadyAppointed) {
        throw new ConflictError('Пользователь уже записан на другой вариант');
      }
		if (variant.students.findIndex(student => student._id.toString() === userId) !== -1) {
				throw new ConflictError('Пользователь уже записан на этот вариант');
		}
		if (variant.seats <= variant.students.length) {
				throw new ConflictError('Количество мест для записи на вариант исчерпано');
		}
		variant.students.push(userId);
		return lab.save();
	})
	.then((updatedLab) => {
		res.status(200).json(updatedLab);
	})
	.catch((err) => {
		if (err.code === 11000) {
				next(new ConflictError('Пользователь уже записан на этот вариант'));
		} else if (err.name === 'CastError') {
				next(new CastError('Некорректный id лабораторной'));
		} else {
				next(err);
		}
	});
};

module.exports.cancelAppointment = (req, res, next) => {
	const userId = req.user._id;
	const labId = req.params.labId;
	const { variantId } = req.body;

	Lab.findById(labId)
		.populate(['variants.students'])
		.then((lab) => {
			if (!lab) {
					throw new NotFoundError('Лабораторная по указанному id не найдена');
			}
			const variant = lab.variants.find(v => v._id.toString() === variantId);
			if (!variant) {
					throw new NotFoundError('Вариант лабораторной работы не найден');
			}
			const studentIndex = variant.students.findIndex(student => student._id.toString() === userId);
			if (studentIndex === -1) {
					throw new NotFoundError('Пользователь не записан на этот вариант');
			}
			variant.students.splice(studentIndex, 1);
			return lab.save();
		})
		.then((updatedLab) => {
			res.status(200).json(updatedLab);
		})
		.catch((err) => {
			if (err.name === 'CastError') {
					return next(new CastError('Некорректный id лабораторной'));
			}
			return next(err);
		});
};

module.exports.getLabs = (req, res, next) => {
	Lab.find({})
		.populate(['variants.students'])
    .then((labs) => res.status(200).send(labs))
    .catch((err) => next(err));
}

module.exports.download = (req, res, next) => {
  const filename = req.params.filename;
  const filePath = `D:\\вкр\\dobru-express\\uploads\\${filename}`
  res.download(filePath, filename, (err) => {
    if (err) {
      console.error('Ошибка при скачивании файла:', err);
      res.status(500).send('Ошибка при скачивании файла');
    }
  });
}

module.exports.openLab = (req, res, next) => {
	const { groups } = req.body;
	Lab.findById(req.params.labId)
		.then((lab) => {
			if (!lab) {
				throw new NotFoundError('Лабораторная по указанному id не найдена');
			}

			if (!Array.isArray(groups)) {
				throw new ValidationError('Группы должны быть представлены в виде массива');
			}

			const existingGroups = lab.groups.filter(group => groups.includes(group));
      if (existingGroups.length > 0) {
				throw new ConflictError('У этой группы уже есть доступ');
      }
			groups.forEach(group => {
				lab.groups.push(group);
			});
			return lab.save();
		})
		.then((updatedLab) => {
			res.status(200).json(updatedLab);
		})
		.catch((err) => {
			if (err.code === 11000) {
				return next(new ConflictError(err));
			} else if (err.name === 'CastError') {
				return next(new CastError('Некорректный id лабораторной'));
			} else {
				return next(err);
			}
		});
}

module.exports.deleteAccess = (req, res, next) => {
	const { group } = req.body;
	Lab.findById(req.params.labId)
		.then((lab) => {
			if (!lab) {
				throw new NotFoundError('Лабораторная по указанному id не найдена');
			}
			lab.groups = lab.groups.filter(item => item !== group);
			return lab.save();
		})
		.then((updatedLab) => {
			res.status(200).json(updatedLab);
		})
		.catch((err) => {
			if (err.name === 'CastError') {
				return next(new CastError('Некорректный id лабораторной'));
			} else {
				return next(err);
			}
		});
}

module.exports.getUserLabs = (req, res, next) => {
	Lab.find({ groups: { $in: [req.params.group] } })
  .populate(['variants.students'])
	.then((labs) => {
		return res.status(200).send(labs)
	})
	.catch((err) => {
		return next(err)
	})
}

module.exports.deleteLab = (req, res, next) => {
	Lab.findById(req.params.labId)
	.then((lab) => {
		if (!lab) {
			throw new NotFoundError('Лабораторная по указанному id не найдена');
		}
		Lab.findByIdAndDelete(req.params.labId)
			.then(() => {
				res.status(200).send({ message: `Лабораторная ${lab.name} удалена` });
			});
	})
	.catch((err) => {
		if (err.name === 'CastError') {
			return next(new CastError('Некорректный id лабораторной'))
		} else { return next(err); }
	});
}