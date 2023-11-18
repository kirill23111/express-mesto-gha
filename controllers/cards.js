const Card = require('../models/card'); // Путь к файлу с моделью карточки

// Контроллер для получения всех карточек
const getCards = (req, res) => {
  Card.find()
    .then((cards) => {
      res.status(200).json(cards);
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
};

// Контроллер для создания новой карточки
const createCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => {
      res.status(201).json(card);
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
};

// Контроллер для удаления карточки по _id
const deleteCardById = (req, res) => {
  const { cardId } = req.params.cardId;

  Card.findByIdAndRemove({ cardId })
    .then((card) => {
      if (!card) {
        res.status(404).json({ message: 'Карточка не найдена' });
        return;
      }

      res.status(200).json(card);
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
};

// Контроллер для постановки лайка карточке
const likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        res.status(404).json({ message: 'Карточка не найдена' });
        return;
      }

      res.status(200).json(card);
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
};

// Контроллер для снятия лайка с карточки
const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        res.status(404).json({ message: 'Карточка не найдена' });
        return;
      }

      res.status(200).json(card);
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCardById,
  likeCard,
  dislikeCard,
};
