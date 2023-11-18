const express = require('express');
const usersController = require('../controllers/users'); // Путь к файлу с контроллерами пользователей

const usersRouter = express.Router();

// Роут для получения всех пользователей
usersRouter.get('/users', usersController.getUsers);

// Роут для получения пользователя по _id
usersRouter.get('/users/:userId', usersController.getUserById);

// Роут для создания нового пользователя
usersRouter.post('/users', usersController.createUser);

// Роут для обновления профиля пользователя
usersRouter.patch('/users/me', usersController.updateProfile);

// Роут для обновления аватара пользователя
usersRouter.patch('/users/me/avatar', usersController.updateAvatar);

module.exports = usersRouter;
