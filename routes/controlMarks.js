const router = require('express').Router();
const {getControlMarks, checkControlMarks} = require('../controllers/controlMarks')

router.get('/', getControlMarks)
router.patch('/:controlmarkId', checkControlMarks)

module.exports = router;