const Card = require('../models/card');
const { SUCCESS, CREATED } = require('../constans/codes');
const BadRequest = require('../errors/BadRequest');
const Forbidden = require('../errors/Forbidden');
const NotFound = require('../errors/NotFound');
const Internal = require('../errors/Internal');

const getCards = (req, res, next) => {
  Card.find()
    .then((cards) => res.status(SUCCESS).json(cards))
    .catch((error) => next(new Internal(`Произошла ошибка при получении карточек: ${error.message}`)));
};

const createCard = async (req, res, next) => {
  try {
    const { name, link } = req.body;
    const card = await new Card({ name, link, owner: req.user.id });

    return res.status(CREATED).send(await card.save());
  } catch (error) {
    if (error.name === 'ValidationError') {
      return next(new BadRequest(`${error.message}`));
    }
    return next(error);
  }
};

const deleteCardById = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const userId = req.user.id;
    const card = await Card.findById(cardId);

    if (card === null) {
      return next(new NotFound('Карточка не найдена'));
    }
    if (card.owner.toString() !== userId) {
      return next(new Forbidden('Вы не можете удалить чужую карточку'));
    }

    await Card.deleteOne({ _id: cardId });

    return res.json({ message: 'Карточка успешно удалена' });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

const handleLikeDislike = async (req, res, next, update) => {
  try {
    const { cardId } = req.params;

    const card = await Card.findByIdAndUpdate(
      cardId,
      update,
      { new: true },
    );

    if (!card) {
      return next(new NotFound('Карточка не найдена'));
    }

    return res.status(SUCCESS).json(card);
  } catch (error) {
    if (error instanceof NotFound) {
      return next(error);
    }

    if (error.name === 'CastError') {
      return next(new BadRequest('Передано неверное id карточки'));
    }

    return next(error);
  }
};

const likeCard = (req, res, next) => {
  handleLikeDislike(req, res, next, { $addToSet: { likes: req.user.id } });
};

const dislikeCard = (req, res, next) => {
  handleLikeDislike(req, res, next, { $pull: { likes: req.user.id } });
};

module.exports = {
  getCards,
  createCard,
  deleteCardById,
  likeCard,
  dislikeCard,
};
