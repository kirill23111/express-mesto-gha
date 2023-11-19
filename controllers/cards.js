const mongoose = require('mongoose');
const http2 = require('http2');
const Card = require('../models/card');

const getCards = (req, res) => {
  Card.find()
    .then((cards) => res.status(http2.constants.HTTP_STATUS_OK).json(cards))
    .catch((error) => res.status(http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
      .json({ message: error.message }));
};

const createCard = async (req, res) => {
  try {
    const { name, link } = req.body;
    const card = await new Card({ name, link, owner: req.user._id });

    return res.status(http2.constants.HTTP_STATUS_CREATED).send(await card.save());
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(http2.constants.HTTP_STATUS_BAD_REQUEST).send({ message: `${error.message}` });
    }
    return res.status(http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'произошла ошибка' });
  }
};

const deleteCardById = async (req, res) => {
  try {
    const { cardId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(cardId)) {
      return res.status(http2.constants.HTTP_STATUS_BAD_REQUEST).json({ message: 'Некорректный формат id карточки' });
    }

    const card = await Card.findByIdAndDelete(cardId);

    if (!card) {
      return res.status(http2.constants.HTTP_STATUS_NOT_FOUND).json({ message: 'Карточка не найдена' });
    }

    return res.status(http2.constants.HTTP_STATUS_OK).json(card);
  } catch (error) {
    return res.status(http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const handleLikeDislike = async (req, res, update) => {
  try {
    const { cardId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(cardId)) {
      return res.status(http2.constants.HTTP_STATUS_BAD_REQUEST)
        .json({ message: 'Некорректный id' });
    }

    const card = await Card.findByIdAndUpdate(
      cardId,
      update,
      { new: true },
    );

    if (!card) {
      return res.status(http2.constants.HTTP_STATUS_NOT_FOUND)
        .json({ message: 'Карточка не найдена' });
    }

    return res.status(http2.constants.HTTP_STATUS_OK).json(card);
  } catch (error) {
    return res.status(http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
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
