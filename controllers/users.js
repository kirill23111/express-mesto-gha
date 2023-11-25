// const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const generateJwtToken = require('../constans/jwt');
const User = require('../models/user'); // Путь к файлу с моделью пользователя
// const authMiddleware = require('../middlewares/auth');
const {
  SUCCESS, CREATED,
} = require('../constans/codes');
const BadRequest = require('../errors/BadRequest');
const NotFound = require('../errors/NotFound');
const Internal = require('../errors/Internal');
// Контроллер для получения всех пользователей

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    return res.send(users);
  } catch (err) {
    return next(err);
  }
};
// Контроллер для получения пользователя по _id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      throw new NotFound('Запрашиваемый пользователь не найден');
    }

    return res.status(SUCCESS).json(user);
  } catch (error) {
    // if (error.message === NOT_FOUND) {
    //   return res
    //     .status(NOT_FOUND)
    //     .send({ message: 'Пользователь не найден' });
    // }
    if (error.name === 'CastError') {
      return res.status(BadRequest).send({ message: 'Передан невалидный id' });
    }
    return res.status(Internal).send({ message: 'Произошла ошибка' });
  }
};

const createUser = async (req, res) => {
  try {
    const {
      name = 'Жак-Ив Кусто',
      about = 'Исследователь',
      avatar = 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
      email,
      password,
    } = req.body;

    // Хеширование пароля перед сохранением в базу
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      about,
      avatar,
      email,
      password: hashedPassword,
    });

    res.status(CREATED).json(user);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(BadRequest).json({ message: error.message });
    } else {
      res.status(Internal).json({ message: 'Internal Server Error' });
    }
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Находим пользователя по email
    const user = await User.findOne({ email });

    // Проверяем, найден ли пользователь и совпадает ли пароль
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(NotFound).json({ message: 'Неправильная почта или пароль' });
    }

    const token = generateJwtToken({
      _id: user._id,
    });

    res.cookie('jwt', token, {
      httpOnly: true,
      sameSite: true,
      maxAge: 3600000 * 24 * 7,
    });

    return res.send({ email: user.email });
  } catch (err) {
    return next(err);
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, about } = req.body;
    const newUserData = await User.findByIdAndUpdate(
      req.user._id,
      { name, about },
      { new: true, runValidators: true },
    );

    if (!newUserData) {
      throw new Error('NotFound');
    }

    return res.status(SUCCESS).send(newUserData);
  } catch (err) {
    if (err.message === 'NotFound') {
      return res
        .status(NotFound)
        .send({ message: 'Пользователь не найден' });
    }

    if (err.name === 'ValidationError') {
      return res.status(BadRequest).send({ message: `${err.message}` });
    }

    return res.status(Internal).send({ message: 'произошла ошибка' });
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
      return res.status(NotFound).json({ message: 'Пользователь не найден' });
    }

    if (error.name === 'ValidationError') {
      return res.status(BadRequest).json({ message: error.message });
    }

    return res.status(Internal).json({ message: 'Произошла ошибка' });
  }
};

const getCurrentUser = (req, res) => {
  const currentUser = req.user;
  res.status(SUCCESS).json(currentUser);
};

module.exports = {
  getUsers,
  getUserById,
  login,
  createUser,
  updateProfile,
  getCurrentUser,
  updateAvatar,
};
