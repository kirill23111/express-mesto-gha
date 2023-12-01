const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { celebrate, Joi } = require('celebrate');

const app = express();
const PORT = 3000;
const { errors } = require('celebrate'); // Добавляем обработку ошибок celebrate
const cardsRoutes = require('./routes/cardsRoutes');
const usersRoutes = require('./routes/usersRoutes');
// const routes = require('./routes/index');
const errorHandler = require('./middlewares/errorHandler');
const { login, registration } = require('./controllers/users');
const NotFound = require('./errors/NotFound');
const Internal = require('./errors/Internal');

mongoose.connect('mongodb://localhost:27017/mestodb');

const db = mongoose.connection;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieParser());
app.use('/cards', cardsRoutes);
app.use('/users', usersRoutes);

app.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
      avatar: Joi.string().uri(),
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  }),
  registration,
);

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

app.use(errors());
app.use(errorHandler);

// app.use((err, req, res, next) => {
//   console.log(2);
//   res.status(500).send({ message: 'Произошла ошибка' });
//   next();
// });

app.use((req, res) => {
  if (res.headersSent === false) res.status(404).json({ message: 'Не удалось обнаружить' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
