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
const Conflict = require('../errors/Conflict');
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
const getUserById = async (req, res, next) => {
  console.log('getUserById');
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      throw new NotFound('Запрашиваемый пользователь не найден');
    }

    return res.status(SUCCESS).json(user);
  } catch (error) {
    if (error.name === 'CastError') {
      return next(new NotFound('Пользователь не найден'));
    }
    return next(new Internal('Произошла ошибка'));
  }
};

// возвращает либо Promise с пользователем, либо Promise с null
const getUserByEmail = async (email) => await User.findOne({ email });

const createUser = async (registrationUserDto) => {
  const {
    name = 'Жак-Ив Кусто',
    about = 'Исследователь',
    avatar = 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    email,
    password,
  } = registrationUserDto;
  // Хеширование пароля перед сохранением в базу
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    about,
    avatar,
    email,
    password: hashedPassword,
  });

  return user._doc;
  // return res
  //   .status(SUCCESS)
  //   .send({
  //     name: newUser.name,
  //     about: newUser.about,
  //     avatar: newUser.avatar,
  //     email: newUser.email,
  //   });
};

const registration = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) throw new BadRequest('Email обязателен');

    const foundUser = await getUserByEmail(email);

    if (foundUser !== null) {
      return res.status(Conflict).json({ error: 'Пользователь с таким Email уже существует' });
    }

    const { password, ...createdUser } = await createUser(req.body);
    // console.log(createdUser);

    return res.status(CREATED).json(createdUser);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return next(new BadRequest('Ошибка валидации'));
    }
    if (!error.message) return next(new BadRequest('Произошла ошибка'));
    return next(new BadRequest(error.message));
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Находим пользователя по email
    const user = await User.findOne({ email }).select('+password');

    // Проверяем, найден ли пользователь
    if (user === null) throw new NotFound(`Пользователя с email ${email} не существует`);

    // Проверяем, совпадает ли пароль
    bcrypt.compare(password, user.password, (err, result) => {
      if (result === false) throw new BadRequest('Неправильный пароль');
      // const { name, about } = user;
      const token = generateJwtToken({
        email,
        // name,
        // about,
        password: user.password,
      });

      res.cookie('jwt', token, {
        httpOnly: true,
        sameSite: true,
        maxAge: 3600000 * 24 * 7,
      });

      res.header('jwt', token);

      return res.send({ token });
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return next(new BadRequest('Ошибка валидации'));
    }
    if (!error.message) return next(new BadRequest('Произошла ошибка'));
    return next(new BadRequest(error.message));
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, about } = req.body;
    const newUserData = await User.findByIdAndUpdate(
      req.user._id,
      { name, about },
      { new: true, runValidators: true },
    );

    if (!newUserData) {
      throw new NotFound('Пользователь не найден');
    }

    return res.status(SUCCESS).send(newUserData);
  } catch (err) {
    if (err instanceof NotFound) {
      return next(err);
    }
    if (err.name === 'ValidationError') {
      return next(new BadRequest('Произошла ошибка'));
    }
    return next(new Internal('Произошла ошибка'));
  }
};

const updateAvatar = async (req, res, next) => {
  try {
    const { avatar } = req.body;

    // Проверяем существование пользователя перед обновлением
    const existingUser = await User.findById(req.user._id);
    if (!existingUser) {
      throw new NotFound('Пользователь не найден');
    }

    // Проверяем, совпадает ли новый аватар с текущим
    if (avatar === existingUser.avatar) {
      return res.status(SUCCESS).json(existingUser);
    }

    // Обновляем аватар пользователя
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true, runValidators: true },
    );

    return res.status(SUCCESS).json(updatedUser);
  } catch (error) {
    if (error instanceof NotFound) {
      return next(error);
    }

    if (error.name === 'ValidationError') {
      return next(new BadRequest('Произошла ошибка'));
    }

    return next(new Internal('Произошла ошибка'));
  }
};

const getCurrentUser = (req, res) => {
  const { password, ...currentUser } = req.user;

  res.status(SUCCESS).json(currentUser);
};

module.exports = {
  getUsers,
  getUserById,
  login,
  updateProfile,
  getCurrentUser,
  updateAvatar,
  registration,
};
