const router = require('express').Router();
const uploadMiddleware = require('../middlewares/upload')
const {createTask, getTasks, openTask, deleteAccess, download, deleteTask} = require('../controllers/tasks')
// const {validationCreateTask} = require('../middlewares/validator')

router.get('/', getTasks)
router.post('/', uploadMiddleware.single('file'), createTask)
router.post('/:taskId', openTask)
router.delete('/:taskId', deleteAccess)
router.get('/:filename', download)
router.delete('/delete/:taskId', deleteTask)

module.exports = router;