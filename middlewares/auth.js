const jwt = require('jsonwebtoken');
const Internal = require('../errors/Internal');
// const { privateKey } = require('../constans/keys');
const privateKey = 'your-secret-key';
const authMiddleware = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return next(new Internal('Необходима авторизация'));
  }

  try {
    // Верификация токена
    const { iat, exp, ...payload } = jwt.verify(token, privateKey);
    // Добавляем payload в объект запроса
    req.user = payload;

    // Вызываем следующий middleware или обработчик маршрута
    return next();
  } catch (error) {
    return next(new Internal('Неверный токен'));
  }
};

module.exports = authMiddleware;
