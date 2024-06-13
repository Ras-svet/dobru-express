const router = require('express').Router();
const { openAccesToUser, getUsers, deleteAccesFromUser } = require('../controllers/users');

router.get('/:userId', openAccesToUser)
router.get('/', getUsers)
router.delete('/:userId', deleteAccesFromUser)

module.exports = router;