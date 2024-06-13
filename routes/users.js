const router = require('express').Router();
const { myInfo } = require('../controllers/users')
const { getRandomVariant} = require('../controllers/controlVariants')
const {getUserControls} = require('../controllers/controls')
const {makeAppointmnet, cancelAppointment, getUserLabs, download} = require('../controllers/labs')
const {createControlMarks, getControlMarksByUser} = require('../controllers/controlMarks')
const {makeAppointmnetTask, getUserTasks, cancelAppointmentTask} = require('../controllers/tasks')
const {validationCreateControlMarks} = require('../middlewares/validator')

router.get('/variant/:controlId', getRandomVariant)
router.get('/', myInfo)
router.get('/controls/:group', getUserControls)
router.get('/labs/:group', getUserLabs)
router.get('/tasks/:group', getUserTasks)
router.post('/labs/:labId', makeAppointmnet)
router.delete('/labs/:labId', cancelAppointment)
router.post('/controlmarks', validationCreateControlMarks, createControlMarks);
router.get('/controlmarks', getControlMarksByUser);
router.post('/tasks/:taskId', makeAppointmnetTask)
router.delete('/tasks/:taskId', cancelAppointmentTask)
router.get('/labs/variant/:filename', download)

module.exports = router;