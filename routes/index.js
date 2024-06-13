const express = require('express')
const router = express.Router();
const isAdmin = require('../middlewares/isAdmin')
const isStudent = require('../middlewares/isStudent')
const NotFoundError = require('../errors/not-found-error');

const auth = require('../middlewares/auth');
const {
  validationSignIn,
  validationSignUp,
} = require('../middlewares/validator');

const questionRoutes = require('./questions');
const controlRoutes = require('./controls');
const controlVariantsRoutes = require('./controlVariants');
const controlMarksRoutes = require('./controlMarks');
const labRoutes = require('./labs');
const taskRoutes = require('./tasks')
const userRoutes = require('./users')
const accessRoutes = require('./access')

const { createAdmin, createUser, login } = require('../controllers/users');

router.post('/signin', validationSignIn, login);
router.post('/signup', validationSignUp, createUser);
router.post('/createadmin', validationSignUp, createAdmin)

router.use(auth);

router.use('/questions', isAdmin, questionRoutes);
router.use('/controls', isAdmin, controlRoutes);
router.use('/controlvariants', isAdmin, controlVariantsRoutes);
router.use('/controlmarks', isAdmin, controlMarksRoutes);
router.use('/labs', isAdmin, labRoutes);
router.use('/tasks', isAdmin, taskRoutes)
router.use('/access', isAdmin, accessRoutes)
router.use('/users', isStudent, userRoutes);
router.use('*', (req, res, next) => {
  next(new NotFoundError('Запрос отправлен по неправильному URL'));
});

module.exports = router;