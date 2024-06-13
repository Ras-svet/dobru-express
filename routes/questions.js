const router = require('express').Router();
const {createQuestion, getThemes, getQuestion, getQuestions, deleteQuestion, updateQuestion} = require('../controllers/questions')
const {validationCreateQuestion, validationUpdateQuestion} = require('../middlewares/validator')

router.post('/', validationCreateQuestion, createQuestion);
router.get('/themes', getThemes);
router.get('/:questionId', getQuestion);
router.get('/', getQuestions);
router.delete('/:questionId', deleteQuestion);
router.patch('/:questionId', validationUpdateQuestion, updateQuestion)

module.exports = router;