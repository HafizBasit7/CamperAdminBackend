
const jwt = require('jsonwebtoken');

module.exports = function generateToken(payload, expiresIn = '1d') {
  return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn });
};
