const jwt = require('jsonwebtoken');
const { privateKey } = require('./keys');

const { NODE_ENV } = process.env;
const JWT_SECRET = privateKey;

const generateJwtToken = (payload) => {
  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
  });

  return token;
};

module.exports = generateJwtToken;
