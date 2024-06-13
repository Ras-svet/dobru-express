const router = require('express').Router();
const {createControl, getControls, openControl, deleteAccess, deleteControl} = require('../controllers/controls')
const {validationCreateControl} = require('../middlewares/validator')

router.post('/', validationCreateControl, createControl);
router.get('/', getControls)
router.post('/:controlId', openControl)
router.delete('/:controlId', deleteAccess)
router.delete('/delete/:controlId', deleteControl)

module.exports = router;