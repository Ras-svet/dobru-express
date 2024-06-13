const multer = require('multer')
const moment = require('moment')

const fileStorage = multer.diskStorage({
	destination (req, file, cb) {
		cb(null, 'uploads/')
	},
	filename (req, file, cb) {
		const date = moment().format('DDMMYYYY-HHmmss_SSS')
		cb(null, `${date}-${file.originalname}`)
	}
})

const fileFilter = (req, file, cb) => {
	if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'text/html' || file.mimetype === 'application/msword' || file.mimetype === 'application/pdf' || file.mimetype === 'application/zip' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
		cb(null, true)
	} else {
		cb(null, false)
	}
}

module.exports = multer({
	storage: fileStorage,
	fileFilter: fileFilter
})