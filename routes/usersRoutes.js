// const express = require('express');
// const usersController = require('../controllers/users');
// const authMiddleware = require('../middlewares/auth');

// const usersRouter = express.Router();

// // Роут для получения всех пользователей
// usersRouter.get('/users', authMiddleware, usersController.getUsers);

// // Роут для получения пользователя по _id
// usersRouter.get('/users/:userId', authMiddleware, usersController.getUserById);

// // Роут для создания нового пользователя
// // usersRouter.post('/signin', usersController.login);
// // usersRouter.post('/signup', usersController.createUser);

// // Роут для обновления профиля пользователя
// usersRouter.patch('/users/me', authMiddleware, usersController.updateProfile);

// // Роут для обновления аватара пользователя
// usersRouter.patch('/users/me/avatar', authMiddleware, usersController.updateAvatar);

// // Роут для получения информации о текущем пользователе
// usersRouter.get('/users/me', authMiddleware, usersController.getCurrentUser);

// module.exports = usersRouter;
const express = require('express');
const usersController = require('../controllers/users');
const authMiddleware = require('../middlewares/auth');
const {
  updateProfileValidation,
  updateAvatarValidation,
  getUserByIdValidation,
} = require('../middlewares/validation');

const router = express.Router();

router.get('/', authMiddleware, usersController.getUsers);
router.get('/me', authMiddleware, usersController.getCurrentUser);
router.patch('/me', authMiddleware, updateProfileValidation, usersController.updateProfile);
router.patch('/me/avatar', authMiddleware, updateAvatarValidation, usersController.updateAvatar);
router.get('/:userId', authMiddleware, getUserByIdValidation, usersController.getUserById);

module.exports = router;
