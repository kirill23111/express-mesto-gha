const jwt = require('jsonwebtoken');
const Internal = require('../errors/Internal');
const { privateKey } = require('../constans/keys');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return next(new Internal('Необходима авторизация'));
  }

  try {
    // Верификация токена
    const payload = jwt.verify(token, privateKey);

    // Добавляем payload в объект запроса
    req.user = payload;
    console.log(3);

    // Вызываем следующий middleware или обработчик маршрута
    next();
    return;
  } catch (error) {
    console.error(error);
    return next(new Internal('Неверный токен'));
  }
};

module.exports = authMiddleware;
