// const mongoose = require('mongoose');
const User = require('../models/user'); // Путь к файлу с моделью пользователя
const {
  SUCCESS, INTERNAL_ERROR, CREATED, NOT_FOUND, BAD_REQUEST,
} = require('../constans/codes');

// Контроллер для получения всех пользователей
const getUsers = (req, res) => {
  User.find()
    .then((users) => {
      res.status(SUCCESS).json(users);
    })
    .catch((err) => {
      console.log(err.status);
      res.status(INTERNAL_ERROR).json({ message: 'Произошла ошибка' });
    });
};

// Контроллер для получения пользователя по _id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(NOT_FOUND).json({ message: 'Пользователь не найден' });
    }

    return res.status(SUCCESS).json(user);
  } catch (error) {
    if (error.message === 'NotFound') {
      return res
        .status(NOT_FOUND)
        .send({ message: 'Пользователь не найден' });
    }
    if (error.name === 'CastError') {
      return res.status(BAD_REQUEST).send({ message: 'Передан невалидный id' });
    }
    return res.status(INTERNAL_ERROR).send({ message: 'Произошла ошибка' });
  }
};

const createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => {
      res.status(CREATED).json(user);
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        res.status(BAD_REQUEST).json({ message: error.message });
      } else {
        res.status(INTERNAL_ERROR).json({ message: 'Internal Server Error' });
      }
    });
};

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

    return res.status(SUCCESS).send(newUserData);
  } catch (err) {
    if (err.message === 'NotFound') {
      return res
        .status(NOT_FOUND)
        .send({ message: 'Пользователь не найден' });
    }

    if (err.name === 'ValidationError') {
      return res.status(BAD_REQUEST).send({ message: `${err.message}` });
    }

    return res.status(INTERNAL_ERROR).send({ message: 'произошла ошибка' });
  }
};

const updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      throw new Error('NotFound');
    }

    return res.status(SUCCESS).json(updatedUser);
  } catch (error) {
    if (error.message === 'NotFound') {
      return res.status(NOT_FOUND).json({ message: 'Пользователь не найден' });
    }

    if (error.name === 'ValidationError') {
      return res.status(BAD_REQUEST).json({ message: error.message });
    }

    return res.status(INTERNAL_ERROR).json({ message: 'Произошла ошибка' });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateProfile,
  updateAvatar,
};
