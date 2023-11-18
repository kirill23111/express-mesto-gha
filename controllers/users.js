const User = require('../models/user'); // Путь к файлу с моделью пользователя

// Контроллер для получения всех пользователей
const getUsers = (req, res) => {
  User.find()
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
};

// Контроллер для получения пользователя по _id
const getUserById = (req, res) => {
  const userId = req.params.userId;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        res.status(404).json({ message: 'Пользователь не найден' });
        return;
      }

      res.status(200).json(user);
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
};

// Контроллер для создания нового пользователя
const createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => {
      res.status(201).json(user);
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
};

// Контроллер для обновления профиля пользователя
const updateProfile = (req, res) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true })
    .then((user) => {
      if (!user) {
        res.status(404).json({ message: 'Пользователь не найден' });
        return;
      }

      res.status(200).json(user);
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
};

// Контроллер для обновления аватара пользователя
const updateAvatar = (req, res) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true })
    .then((user) => {
      if (!user) {
        res.status(404).json({ message: 'Пользователь не найден' });
        return;
      }

      res.status(200).json(user);
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateProfile,
  updateAvatar,
};
