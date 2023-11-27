const jwt = require('jsonwebtoken');
const Internal = require('../errors/Internal');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return next(new Internal('Необходима авторизация'));
  }

  try {
    // Верификация токена
    const payload = jwt.verify(token, 'your-secret-key');

    // Добавляем payload в объект запроса
    req.user = payload;

    // Вызываем следующий middleware или обработчик маршрута
    return next();
  } catch (error) {
    return next(new Internal('Неверный токен'));
  }
};

module.exports = authMiddleware;
