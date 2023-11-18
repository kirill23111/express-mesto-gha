const mongoose = require('mongoose');
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

  // Проверка корректности формата id пользователя
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Некорректный формат id пользователя' });
  }

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

const createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => {
      res.status(201).json(user);
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        res.status(400).json({ message: error.message });
      } else {
                res.status(500).json({ message: 'Internal Server Error' });
      }
    });
};
// Контроллер для обновления профиля пользователя
// const updateProfile = (req, res) => {
//   const { name, about } = req.body;
//   const updatedUser = new User({ name, about });

//   updatedUser
//     .validate()
//     .then(() => {
//       User.findByIdAndUpdate(req.user._id, { name, about }, { new: true })
//         .then((user) => {
//           if (!user) {
//             res.status(404).json({ message: 'Пользователь не найден' });
//             return;
//           }
//           res.status(200).json(user);
//         })
//         .catch((error) => {
//           res.status(500).json({ message: error.message });
//         });
//     })
//     .catch((error) => {
//       res.status(400).json({ message: error.message });
//     });
// };
const updateProfile = async (req, res) => {
  try {
    const newUserData = await User.findByIdAndUpdate(
      req.user._id,
      req.body,
      { new: true, runValidators: true },
    );

    if (!newUserData) {
      throw new Error('NotFound');
    }

    return res.status(200).send(newUserData);
  } catch (err) {
    if (err.message === 'NotFound') {
      return res
        .status(404)
        .send({ message: 'Пользователь указанным id не найден' });
    }

    if (err.name === 'ValidationError') {
      return res.status(400).send({ message: `${err.message}` });
    }

    return res.status(500).send({ message: 'на сервере произошла ошибка' });
  }
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
