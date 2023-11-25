const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;
const cardsRoutes = require('./routes/cardsRoutes');
const usersRoutes = require('./routes/usersRoutes');
const errorHandler = require('./middlewares/errorHandler');
const { createUsers, login } = require('./controllers/users');

// Middleware для установки req.user
// app.use((req, res, next) => {
//   req.user = {
//     _id: '5e44647cabaee231048130ab',
//   };
//   next();
// });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(errorHandler);
app.use('/', cardsRoutes);
app.use('/', usersRoutes);
app.post('/signin', login);
app.post('/signup', createUsers);

// Подключение к базе данных
mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', (error) => {
  console.error('Ошибка подключения к MongoDB:', error);
});

db.once('open', () => {
  console.log('Подключено к MongoDB!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
