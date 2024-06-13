const router = require('express').Router();
const uploadMiddleware = require('../middlewares/upload')
const {createLab, createLabVariant, getLabs, openLab, deleteAccess, download, deleteLabVariant, deleteLab} = require('../controllers/labs')
const {validationCreateLab} = require('../middlewares/validator')

router.get('/', getLabs)
router.post('/', validationCreateLab, createLab)
router.post('/:labId', openLab)
router.delete('/delete/:labId', deleteLab)
router.delete('/:labId', deleteAccess)
router.post('/variant/:labId', uploadMiddleware.single('file'), createLabVariant)
router.get('/variant/:filename', download)
router.delete('/:labId/:variantId', deleteLabVariant)

module.exports = router;