const express = require('express');

const morgan = require('morgan');

const mongoose = require('mongoose');

const app = express();
const PORT = 3000;
const cardsRoutes = require('./routes/cardsRoutes');
const usersRoutes = require('./routes/usersRoutes');

// Middleware для установки req.user
app.use((req, res, next) => {
  req.user = {
    _id: '5e44647cabaee231048130ab',
  };
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/', cardsRoutes);
app.use('/', usersRoutes);

// Подключение к базе данных
mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Ошибка подключения к MongoDB:'));
db.once('open', () => {
  console.log('Подключено к MongoDB!');
});

// Добавим 'next' в параметры функции, чтобы избежать ошибки
app.use((err, req, res, next) => {
  console.log(err.status);
  res.status(err.status || 500).send({ message: err.message });
  next();
});

app.use((req, res) => {
  res.status(404).json({ message: 'не удалось обнаружить' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
