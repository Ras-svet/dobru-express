const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const AuthError = require('../errors/auth-error');

const userSchema = new mongoose.Schema({
	email: {
		type: String,
    unique: true,
    required: [true, 'Поле "email" должно быть заполнено'],
    validate: {
      validator: (v) => validator.isEmail(v),
      message: () => 'Некорректный email',
    },
	},
	firstName: {
		type: String,
		required: [true, 'Поле "имя" должно быть заполнено'],
	},
	lastName: {
		type: String,
		required: [true, 'Поле "фамилия" должно быть заполнено'],
	},
	password: {
    type: String,
    required: [true, 'Поле "пароль" должно быть заполнено'],
    select: false,
  },
	group: {
		type: String,
		required: [true, 'Поле "группа" должно быть заполнено'],
	},
  github: {
    type: String,
    unique: true,
  },
  telegram: {
    type: String,
    unique: true,
  },
	role: {
    type: String,
    enum: ['', 'user', 'admin'],
    default: ''
  }
}, { versionKey: false })

userSchema.statics.findbyCredentials = function (email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new AuthError('Неправильная почта или пароль');
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new AuthError('Неправильная почта или пароль');
          }
          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);