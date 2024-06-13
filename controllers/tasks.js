const Task = require('../models/tasks');
const ValidationError = require('../errors/validation-error');
const ConflictError = require('../errors/conflict-error');
const NotFoundError = require('../errors/not-found-error')
const CastError = require('../errors/cast-error')

module.exports.createTask = (req, res, next) => {
	const {name, text, seats, subject, deadline, points} = req.body
	Task.create({name, file: req.file ? req.file.path : '' , text, seats, subject, deadline, points})
		.then((task) => res.status(200).send(task))
		.catch((err) => {
			if (err.code === 11000) {
				return next(new ConflictError('Дополнительное название с таким названием уже есть'));
			} else { return next(err); }
		});
}

module.exports.makeAppointmnetTask = (req, res, next) => {
	const userId = req.user._id
	const taskId = req.params.taskId
	Task.findById(taskId)
	.populate(['students'])
	.then((task) => {
		if (!task) {
			throw new NotFoundError('Дополнительное задание по указанному id не найдено');
		}
		if (task.students.findIndex(student => student._id.toString() === userId) !== -1) {
			throw new ConflictError('Пользователь уже записан на это дополнительное задание');
		}
		if (task.seats <= task.students.length) {
			throw new ConflictError('Количество мест для записи на это дополнительное задание исчерпано');
		}
		task.students.push(userId);
		return task.save();
	})
	.then((updatedTask) => {
		res.status(200).json(updatedTask);
	})
	.catch((err) => {
		console.log(err)
		if (err.code === 11000) {
			return next(new ConflictError('Пользователь уже записан на это дополнительное задание'));
		} else if (err.name === 'CastError') {
			return next(new CastError('Некорректный id дополнительного задания'));
		} else {
			return next(err);
		}
	})
}

module.exports.cancelAppointmentTask = (req, res, next) => {
	const userId = req.user._id;
	const taskId = req.params.taskId;

	Task.findById(taskId)
		.populate(['students'])
		.then((task) => {
			if (!task) {
					throw new NotFoundError('Дополнительное задание по указанному id не найдено');
			}
			const studentIndex = task.students.findIndex(student => student._id.toString() === userId);
			if (studentIndex === -1) {
					throw new NotFoundError('Пользователь не записан на это дополнительное задание');
			}
			task.students.splice(studentIndex, 1);
			return task.save();
		})
		.then((updatedTask) => {
			res.status(200).json(updatedTask);
		})
		.catch((err) => {
			if (err.name === 'CastError') {
					return next(new CastError('Некорректный id дополнительного задания'));
			}
			return next(err);
		});
};

module.exports.getTasks = (req, res, next) => {
	Task.find({})
		.populate(['students'])
    .then((tasks) => res.status(200).send(tasks))
    .catch((err) => next(err));
}

module.exports.openTask = (req, res, next) => {
	const { groups } = req.body;
	Task.findById(req.params.taskId)
		.then((task) => {
			if (!task) {
				throw new NotFoundError('Дополнительное задание по указанному id не найдено');
			}

			if (!Array.isArray(groups)) {
				throw new ValidationError('Группы должны быть представлены в виде массива');
			}

			const existingGroups = task.groups.filter(group => groups.includes(group));
      if (existingGroups.length > 0) {
				throw new ConflictError('У этой группы уже есть доступ');
      }
			groups.forEach(group => {
				task.groups.push(group);
			});
			return task.save();
		})
		.then((updatedTask) => {
			res.status(200).json(updatedTask);
		})
		.catch((err) => {
			if (err.code === 11000) {
				return next(new ConflictError('У этой группы уже есть доступ'));
			} else if (err.name === 'CastError') {
				return next(new CastError('Некорректный id дополнительного задания'));
			} else {
				return next(err);
			}
		});
}

module.exports.deleteAccess = (req, res, next) => {
	const { group } = req.body;
	Task.findById(req.params.taskId)
		.then((task) => {
			if (!task) {
				throw new NotFoundError('Дополнительное задание по указанному id не найдено');
			}
			task.groups = task.groups.filter(item => item !== group);
			return task.save();
		})
		.then((updatedTask) => {
			res.status(200).json(updatedTask);
		})
		.catch((err) => {
			if (err.name === 'CastError') {
				return next(new CastError('Некорректный id дополнительного задания'));
			} else {
				return next(err);
			}
		});
}

module.exports.getUserTasks = (req, res, next) => {
	Task.find({ groups: { $in: [req.params.group] } })
  .populate(['students'])
	.then((tasks) => {
		res.status(200).send(tasks)
	})
	.catch((err) => {
		next(err)
	})
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

module.exports.deleteTask = (req, res, next) => {
  Task.findById(req.params.taskId)
    .then((task) => {
      if (!task) {
        return next(new NotFoundError('Задание по указанному id не найдено'));
      }
      return Task.deleteOne(task).then(() => res.status(200).send({ message: `Задание ${task.name} удалено` }));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new CastError('Некорректный id задания'));
      } else { next(err); }
    });
};