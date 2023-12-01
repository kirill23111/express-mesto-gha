// const jwt = require('jsonwebtoken');
// const { privateKey } = require('./keys');

// // const { NODE_ENV } = process.env;
// const JWT_SECRET = privateKey;

// const generateJwtToken = (payload) => {
//   const token = jwt.sign(payload, JWT_SECRET, {
//     expiresIn: '7d',
//   });

//   return token;
// };

// module.exports = generateJwtToken;
const jwt = require('jsonwebtoken');
const { privateKey } = require('./keys');

const JWT_SECRET = privateKey;

const generateJwtToken = (obj) => {
  const token = jwt.sign(obj, JWT_SECRET, {
    expiresIn: '7d',
  });

  return token;
};

module.exports = generateJwtToken;
