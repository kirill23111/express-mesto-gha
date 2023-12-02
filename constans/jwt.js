const jwt = require('jsonwebtoken');
// const { privateKey } = require('./keys');

const JWT_SECRET = process.env;

const generateJwtToken = (obj) => {
  const token = jwt.sign(obj, JWT_SECRET, {
    expiresIn: '7d',
  });

  return token;
};

module.exports = generateJwtToken;
