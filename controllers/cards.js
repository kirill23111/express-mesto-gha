const mongoose = require('mongoose');
const Card = require('../models/card');

const getCards = (req, res) => {
  Card.find()
    .then((cards) => res.status(200).json(cards))
    .catch((error) => res.status(500).json({ message: error.message }));
};

const createCard = (req, res) => {
  const { name, link } = req.body;

  if (!name || !link) {
    return res.status(400).json({ message: 'Поля name и link обязательны' });
  }

  const card = new Card({ name, link, owner: req.user._id });

  card.save()
    .then((savedCard) => res.status(201).json(savedCard))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map((err) => err.message);
        return res.status(400).json({ message: `Ошибка валидации: ${errors.join(', ')}` });
      }
      return res.status(500).json({ message: error.message });
    });
};

const deleteCardById = (req, res) => {
  const { cardId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    return res.status(400).json({ message: 'Некорректный формат id карточки' });
  }

  Card.findByIdAndDelete(cardId)
    .then((card) => {
      if (!card) {
        return res.status(404).json({ message: 'Карточка не найдена' });
      }

      return res.status(200).json(card);
    })
    .catch((error) => {
      return res.status(500).json({ message: error.message });
    });
};

const handleLikeDislike = (req, res, update) => {
  const { cardId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    return res.status(400).json({ message: 'Некорректный формат id карточки' });
  }

  Card.findByIdAndUpdate(
    cardId,
    update,
    { new: true },
  )
    .then((card) => {
      if (!card) {
        return res.status(404).json({ message: 'Карточка не найдена' });
      }

      return res.status(200).json(card);
    })
    .catch((error) => {
      return res.status(500).json({ message: error.message });
    });
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
