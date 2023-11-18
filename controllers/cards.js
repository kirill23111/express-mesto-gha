const mongoose = require('mongoose');
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
// const createCard = (req, res) => {
//   const { name, link } = req.body;

//   // Проверка наличия обязательных полей
//   if (!name || !link) {
//     return res.status(400).json({ message: 'Поля name и link обязательны для создания карточки' });
//   }

//   Card.create({ name, link, owner: req.user._id })
//     .then((card) => {
//       res.status(201).json(card);
//     })
//     .catch((error) => {
//       res.status(500).json({ message: error.message });
//     });
// };

const createCard = (req, res) => {
  const { name, link } = req.body;

  // Проверка наличия обязательных полей
  if (!name || !link) {
    return res.status(400).json({ message: 'Поля name и link обязательны для создания карточки' });
  }

  const card = new Card({ name, link, owner: req.user._id });

  card.save()
    .then((savedCard) => {
      res.status(201).json(savedCard);
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map((err) => err.message);
        return res.status(400).json({ message: `Ошибка валидации: ${errors.join(', ')}` });
      }
      res.status(500).json({ message: error.message });
    });
};

// Контроллер для удаления карточки по _id
const deleteCardById = (req, res) => {
  const { cardId } = req.params;

  // Проверка корректности формата id карточки
  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    return res.status(400).json({ message: 'Некорректный формат id карточки' });
  }

  Card.findByIdAndDelete(cardId)
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

const likeCard = (req, res) => {
  const { cardId } = req.params;

  // Проверка корректности формата id карточки
  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    return res.status(400).json({ message: 'Некорректный формат id карточки' });
  }

  Card.findByIdAndUpdate(
    cardId,
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

const dislikeCard = (req, res) => {
  const { cardId } = req.params;

  // Проверка корректности формата id карточки
  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    return res.status(400).json({ message: 'Некорректный формат id карточки' });
  }

  Card.findByIdAndUpdate(
    cardId,
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
