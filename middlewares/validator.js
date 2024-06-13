const { celebrate, Joi } = require('celebrate');

const validationCreateControl = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required(),
		subject: Joi.string().valid('Фронтенд', 'Бэкенд').required(),
    themes: Joi.array().items(Joi.string().required()).default([])
  }),
});

const validationCreateControlVariant = celebrate({
	body: Joi.object().keys({
		controlName: Joi.string().required(),
		easyCount: Joi.number().integer().required(),
		normalCount: Joi.number().integer().required(),
		hardCount: Joi.number().integer().required(),
	})
})

const validationCreateQuestion = celebrate({
	body: Joi.object().keys({
		subject: Joi.string().valid('Фронтенд', 'Бэкенд').required(),
		theme: Joi.string().required(),
		difficulty: Joi.string().valid('легкий', 'средний', 'сложный').required(),
		question: Joi.string().required(),
		type: Joi.string().valid('открытый вопрос', 'с вариантами ответа').required().default('открытый вопрос'),
		answers: Joi.array().items(Joi.string()),
		goodAnswer: Joi.string(),
	})
})

const validationUpdateQuestion = celebrate({
	body: Joi.object().keys({
		difficulty: Joi.string().valid('легкий', 'средний', 'сложный').required(),
		question: Joi.string().required(),
		type: Joi.string().valid('открытый вопрос', 'с вариантами ответа').required().default('открытый вопрос'),
		answers: Joi.array().items(Joi.string()).default([]),
		goodAnswer: Joi.string(),
	})
})

const validationCreateLab = celebrate({
  body: Joi.object().keys({
		name: Joi.string().required(),
		subject: Joi.string().valid('Фронтенд', 'Бэкенд').required(),
		deadline: Joi.date().required(),
		points: Joi.number().required(),
    penaltyPoints: Joi.number().required(),
	}),
});

const validationCreateControlMarks = celebrate({
  body: Joi.object().keys({
		controlId: Joi.string().required().exist(),
		variantId: Joi.string().required().exist(),
    userAnswers: Joi.array(),
  }),
});

// const validationCreateTask = celebrate({
//   body: Joi.object().keys({
// 		name: Joi.string().required(),
// 		text: Joi.string().required(),
// 		seats: Joi.number().required(),
// 		subject: Joi.string().valid('Фронтенд', 'Бэкенд').required(),
// 		deadline: Joi.date().required(),
// 		points: Joi.number().required()
// 	}),
// });

const validationSignIn = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
});

const validationSignUp = celebrate({
  body: Joi.object().keys({
		firstName: Joi.string().required(),
		lastName: Joi.string().required(),
    password: Joi.string().required(),
    email: Joi.string().required().email(),
		group: Joi.string().required(),
    telegram: Joi.string(),
    github: Joi.string()
  }),
});

module.exports = {
	validationCreateControl,
	validationCreateControlVariant,
	validationCreateQuestion,
	validationUpdateQuestion,
	validationCreateLab,
	validationCreateControlMarks,
	// validationCreateTask,
	validationSignIn,
	validationSignUp
}