const jwt = require('jsonwebtoken');

const privateKey = 'your-secret-key';

const JWT_SECRET = privateKey;

const generateJwtToken = (obj) => {
  const token = jwt.sign(obj, JWT_SECRET, {
    expiresIn: '7d',
  });

  return token;
};

module.exports = generateJwtToken;
