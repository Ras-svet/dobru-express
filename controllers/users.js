const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { NODE_ENV, JWT_SECRET } = process.env;

const User = require('../models/users')
const ValidationError = require('../errors/validation-error');
const NotFoundError = require('../errors/not-found-error');
const CastError = require('../errors/cast-error');
const ConflictError = require('../errors/conflict-error');

module.exports.myInfo = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь по указанному id не найден');
      }
      res.send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new CastError('Неккоретный id пользователя'));
      } else { return next(err); }
    });
};

module.exports.createUser = async (req, res, next) => {
  try {
    const {
      group, firstName, lastName, email, password, telegram, github
    } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      group, firstName, lastName, email, password: hash, telegram, github
    });
    res.status(201).send({
      _id: newUser._id,
      group: newUser.group,
			firstName: newUser.firstName,
			lastName: newUser.lastName,
      email: newUser.email,
      telegram: newUser.telegram,
      github: newUser.github
    });
  } catch (err) {
    console.log(err)
    if (err.code === 11000) {
      return next(new ConflictError('Пользователь c указанной почтой уже есть в системе'));
    } else if (err.name === 'ValidationError') {
      return next(new ValidationError('Переданы некорректные данные при создании пользователя'));
    } else { return next(err); }
  }
};

module.exports.createAdmin = async (req, res, next) => {
  try {
    const {
      firstName, lastName, email, password, group
    } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const admin = await User.create({
      firstName, lastName, email, group, password: hash, role: 'admin'
    });
    res.status(201).send({
      _id: admin._id,
			firstName: admin.firstName,
			lastName: admin.lastName,
      email: admin.email,
			group: admin.group,
			role: admin.role
    });
  } catch (err) {
    if (err.code === 11000) {
      return next(new ConflictError('Пользователь c указанной почтой уже есть в системе'));
    } else if (err.name === 'ValidationError') {
      return next(new ValidationError('Переданы некорректные данные при создании пользователя'));
    } else { return next(err); }
  }
};

module.exports.openAccesToUser = (req, res, next) => {
  const userId = req.params.userId
  User.findByIdAndUpdate(userId, { role: 'user' }, { new: true })
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь по указанному id не найден');
      }
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new CastError('Некорректный id пользователя'));
      } else {
        return next(err);
      }
    });
}

module.exports.deleteAccesFromUser = (req, res, next) => {
  const userId = req.params.userId
  User.findByIdAndUpdate(userId, { role: '' }, { new: true })
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь по указанному id не найден');
      }
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new CastError('Некорректный id пользователя'));
      } else {
        return next(err);
      }
    });
}

module.exports.getUsers = (req, res, next) => {
  User.find({ role: { $ne: 'admin' } })
  .then((users) => res.status(200).send(users))
  .catch((err) => next(err));
}

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findbyCredentials(email, password)
	.then((user) => {
		if (!user) {
			throw new AuthError('Неверные учетные данные');
		}
		const token = jwt.sign(
			{ _id: user._id, role: user.role },
			NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
		);
		const role = user.role
    const group = user.group
		res.status(200).send({ token, role, group });
	})
	.catch((err) => {
		return next(err)}); 
};