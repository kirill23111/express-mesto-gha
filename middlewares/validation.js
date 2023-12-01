const { celebrate, Joi } = require('celebrate');

const URL_REGEX = /^(https?:\/\/)(www\.)?([a-z1-9-]{2,}\.)+[a-z]{2,}\/?[a-z0-9-._~:/?#[\]@!$&'()*+,;=]*/i;

const loginValidation = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
});

const createUserValidation = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().regex(URL_REGEX),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
});

const getUserByIdValidation = celebrate({
  params: Joi.object().keys({
    userId: Joi.string().length(24).hex().required(),
  }),
});

const updateProfileValidation = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
});

const updateAvatarValidation = celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().uri().regex(URL_REGEX).required(),
  }),
});

const deleteCardByIdValidation = celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().length(24).hex().required(),
  }),
});

const likeCardValidation = celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().length(24).hex().required(),
  }),
});

const dislikeCardValidation = celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().length(24).hex().required(),
  }),
});

const createCardValidation = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().regex(URL_REGEX).required(),
  }),
});

module.exports = {
  loginValidation,
  createUserValidation,
  getUserByIdValidation,
  updateProfileValidation,
  updateAvatarValidation,
  createCardValidation,
  deleteCardByIdValidation,
  dislikeCardValidation,
  likeCardValidation,
};
