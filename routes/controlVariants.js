const router = require('express').Router();
const {createVariant, getRandomVariant, deleteVariant, getVariants} = require('../controllers/controlVariants')
const {validationCreateControlVariant} = require('../middlewares/validator')

router.post('/:controlId', validationCreateControlVariant, createVariant)
router.get('/:controlId', getRandomVariant)
router.delete('/:variantId', deleteVariant)
router.get('/', getVariants)

module.exports = router;