const mongoose = require('mongoose');
const card = require('../models/card');

const getCards = (req, res) => {
  card.find()
    .then((cards) => res.status(200).json(cards))
    .catch((error) => res.status(500).json({ message: error.message }));
};

const createCard = async (req, res) => {
  try {
    const { name, link } = req.body;
    const card = await new Card({ name, link, owner: req.user._id });

    return res.status(201).send(await card.save());
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).send({ message: `${error.message}` });
    }
    return res.status(500).send({ message: 'произошла ошибка' });
  }
};

const deleteCardById = async (req, res) => {
  try {
    const { cardId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(cardId)) {
      return res.status(400).json({ message: 'Некорректный формат id карточки' });
    }

    const card = await card.findByIdAndDelete(cardId);

    if (!card) {
      return res.status(404).json({ message: 'Карточка не найдена' });
    }

    return res.status(200).json(card);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const handleLikeDislike = async (req, res, update) => {
  try {
    const { cardId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(cardId)) {
      return res.status(400).json({ message: 'Некорректный формат id карточки' });
    }

    const card = await card.findByIdAndUpdate(
      cardId,
      update,
      { new: true },
    );

    if (!card) {
      return res.status(404).json({ message: 'Карточка не найдена' });
    }

    return res.status(200).json(card);
  } catch (error) {
    return res.status(500).json({ message: error.message });
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
