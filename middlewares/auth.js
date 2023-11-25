const jwt = require('jsonwebtoken');
const Internal = require('../errors/Internal');

// const { JWT_SECRET, NODE_ENV } = process.env;

const authMiddleware = (req, res, next) => {
  // Получаем токен из заголовков запроса
  const token = req.headers.authorization;

  if (!token) {
    // Если токен отсутствует, возвращаем ошибку 401
    return res.status(Internal).json({ message: 'Токен отсутствует' });
  }

  try {
    // Верификация токена
    const payload = jwt.verify(token, 'your-secret-key'); // Замените на ваш секретный ключ

    // Добавляем payload в объект запроса
    req.user = payload;

    // Вызываем следующий middleware или обработчик маршрута
    return next();
  } catch (error) {
    // Если токен невалиден, возвращаем ошибку 401
    return res.status(Internal).json({ message: 'Неверный токен' });
  }
};

module.exports = authMiddleware;
