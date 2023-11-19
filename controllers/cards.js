const mongoose = require('mongoose');
const Card = require('../models/card');
const {
  SUCCESS, INTERNAL_ERROR, CREATED, NOT_FOUND,
} = require('../constans/codes');

const getCards = (req, res) => {
  Card.find()
    .then((cards) => res.status(SUCCESS).json(cards))
    .catch((error) => res.status(INTERNAL_ERROR).json({ message: error.message }));
};

const createCard = async (req, res) => {
  try {
    const { name, link } = req.body;
    const card = await new Card({ name, link, owner: req.user._id });

    return res.status(CREATED).send(await card.save());
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).send({ message: `${error.message}` });
    }
    return res.status(INTERNAL_ERROR).send({ message: 'произошла ошибка' });
  }
};

const deleteCardById = async (req, res) => {
  try {
    const { cardId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(cardId)) {
      return res.status(400).json({ message: 'Некорректный формат id карточки' });
    }

    const card = await Card.findByIdAndDelete(cardId);

    if (!card) {
      return res.status(NOT_FOUND).json({ message: 'Карточка не найдена' });
    }

    return res.status(SUCCESS).json(card);
  } catch (error) {
    return res.status(INTERNAL_ERROR).json({ message: error.message });
  }
};

const handleLikeDislike = async (req, res, update) => {
  try {
    const { cardId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(cardId)) {
      return res.status(400).json({ message: 'Некорректный формат id карточки' });
    }

    const card = await Card.findByIdAndUpdate(
      cardId,
      update,
      { new: true },
    );

    if (!card) {
      return res.status(NOT_FOUND).json({ message: 'Карточка не найдена' });
    }

    return res.status(SUCCESS).json(card);
  } catch (error) {
    return res.status(INTERNAL_ERROR).json({ message: error.message });
  }
};

const likeCard = (req, res) => {
  handleLikeDislike(req, res, { $addToSet: { likes: req.user._id } });
};

const dislikeCard = (req, res) => {
  handleLikeDislike(req, res, { $pull: { likes: req.user._id } });
};

module.exports = {
  getCards,
  createCard,
  deleteCardById,
  likeCard,
  dislikeCard,
};
