function isStudent(req, res, next) {
  if (req.user && req.user.role === 'user') {
    next();
  } else {
    res.status(403).send('Доступ зарпещен');
  }
}

module.exports = isStudent;