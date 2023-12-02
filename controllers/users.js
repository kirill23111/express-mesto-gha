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
// Контроллер для получения пользователя по id
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      throw new NotFound('Запрашиваемый пользователь не найден');
    }

    return res.status(SUCCESS).json(user);
  } catch (error) {
    if (error.name === 'CastError') {
      return next(new BadRequest('Передается невалидный id'));
    }
    return next(error);
  }
};

// возвращает либо Promise с пользователем, либо Promise с null
const getUserByEmail = async (email) => User.findOne({ email });

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

  return user;
};

const getFormattedUser = (user) => {
  const jsonUser = JSON.parse(JSON.stringify(user));

  return {
    _id: jsonUser._id,
    name: jsonUser.name,
    about: jsonUser.about,
    avatar: jsonUser.avatar,
    email: jsonUser.email,
    password: jsonUser.password,
  };
};

const registration = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) throw new BadRequest('Email обязателен');

    const foundUser = await getUserByEmail(email);

    if (foundUser !== null) {
      return next(new Conflict('Пользователь с таким Email уже существует'));
    }

    const createdUser = await createUser(req.body);
    const { password, ...formatedCreatedUser } = getFormattedUser(createdUser);

    return res.status(CREATED).json(formatedCreatedUser);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return next(new BadRequest('Ошибка валидации'));
    }
    if (!error.message) return next(new BadRequest('Произошла ошибка'));
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Находим пользователя по email
    const user = await User.findOne({ email }).select('+password');

    // Проверяем, найден ли пользователь
    if (user === null) {
      return next(new Internal(`Пользователя с email ${email} не существует`));
    }

    // Проверяем, совпадает ли пароль
    const passwordResult = bcrypt.compareSync(password, user.password);

    if (passwordResult === false) throw new Internal('Неправильный пароль');

    const token = generateJwtToken({
      id: user.id,
      email,
      password: user.password,
    });

    return res
      .cookie('jwt', token, {
        httpOnly: true,
        sameSite: true,
        maxAge: 3600000 * 24 * 7,
      })
      .header('jwt', token)
      .send({ token });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return next(new BadRequest('Ошибка валидации'));
    }
    // if (!error.message) return next(new NotFound('Произошла ошибка'));
    return next(error);
  }
};

const updateProfile = (req, res, next) => {
  const userId = req.user.id;
  const { name, about } = req.body;

  User.findByIdAndUpdate(
    userId,
    { name, about },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (user === null) {
        throw new NotFound('Пользователь не найден');
      }
      return res
        .status(SUCCESS)
        .send({
          name: user.name,
          about: user.about,
        });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequest('Некорректные данные'));
      }
      if (err.name === 'CastError') {
        return next(new BadRequest('Передается невалидный id'));
      }
      return next(err);
    });
};

const updateAvatar = async (req, res, next) => {
  try {
    const { avatar } = req.body;

    // Проверяем существование пользователя перед обновлением
    const findedUser = await User.findById(req.user.id);
    if (findedUser === null) {
      throw new NotFound('Пользователь не найден');
    }

    // Проверяем, совпадает ли новый аватар с текущим
    if (avatar === findedUser.avatar) {
      return res.status(SUCCESS).json(findedUser);
    }

    // Обновляем аватар пользователя
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
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

    return next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const reqUserId = req.user.id;
    const findedUser = await User.findById(reqUserId).lean();

    if (findedUser === null) return next(new NotFound('Пользователь не найден'));

    return res.json(findedUser);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return next(new BadRequest('Ошибка валидации'));
    }
    if (!error.message) return next(new NotFound('Произошла ошибка'));
    return next(error);
  }
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
