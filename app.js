const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { celebrate, Joi } = require('celebrate');

const app = express();
const { errors } = require('celebrate'); // Добавляем обработку ошибок celebrate
const {
  createUserValidation,
} = require('./middlewares/validation');
const cardsRoutes = require('./routes/cardsRoutes');
const usersRoutes = require('./routes/usersRoutes');
// const routes = require('./routes/index');
const errorHandler = require('./middlewares/errorHandler');
const { login, registration } = require('./controllers/users');
const authMiddleware = require('./middlewares/auth');
const NotFound = require('./errors/NotFound');

const { PORT = 3000, MONGO_URL = 'mongodb://127.0.0.1:27017/mestodb' } = process.env;
mongoose.connect(MONGO_URL);

const db = mongoose.connection;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieParser());
app.use('/cards', cardsRoutes);
app.use('/users', usersRoutes);

app.post('/signup', createUserValidation, registration);

app.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  }),
  login,
);

db.on('error', (error) => {
  console.error('Ошибка подключения к MongoDB:', error);
});

db.once('open', () => {
  console.log('Подключено к MongoDB!');
});

app.use(authMiddleware, (req, res) => {
  if (res.headersSent === false) throw new NotFound('Не удалось обнаружить');
});

app.use(errors());
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
