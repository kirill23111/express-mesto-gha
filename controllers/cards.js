const Card = require('../models/card');
const {
  SUCCESS, CREATED,
} = require('../constans/codes');
const BadRequest = require('../errors/BadRequest');
const Forbidden = require('../errors/Forbidden');
const NotFound = require('../errors/NotFound');
const Internal = require('../errors/Internal');

const getCards = (req, res) => {
  Card.find()
    .then((cards) => res.status(SUCCESS).json(cards))
    .catch((error) => res.status(Internal).json({ message: error.message }));
};

const createCard = async (req, res) => {
  try {
    const { name, link } = req.body;
    const card = await new Card({ name, link, owner: req.user._id });

    return res.status(CREATED).send(await card.save());
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(BadRequest).send({ message: `${error.message}` });
    }
    return res.status(Internal).send({ message: 'произошла ошибка' });
  }
};

// const deleteCardById = async (req, res) => {
//   try {
//     const card = await Card.findByIdAndDelete(req.params.cardId);

//     if (!card) {
//       return res.status(NOT_FOUND).json({ message: 'Карточка не найдена' });
//     }

//     return res.status(SUCCESS).json({ message: 'Карточка успешно удалена' });
//   } catch (error) {
//     if (error.message === NOT_FOUND) {
//       return res
//         .status(NOT_FOUND)
//         .send({ message: 'Карточка не найдена' });
//     }

//     if (error.name === 'CastError') {
//       return res.status(BAD_REQUEST).send({ message: 'Передано неверное id карточки' });
//     }
//     return res.status(INTERNAL_ERROR).send({ message: 'Произошла ошибка' });
//   }
// };
const deleteCardById = async (req, res) => {
  try {
    const { cardId } = req.params;
    const userId = req.user._id;

    // Найти карточку по id
    const card = await Card.findById(cardId);

    if (!card) {
      return res.status(NotFound).json({ message: 'Карточка не найдена' });
    }

    // Проверить, что пользователь, пытающийся удалить карточку, является её автором
    if (card.owner.toString() !== userId) {
      return res.status(Forbidden).json({ message: 'Нет прав для удаления карточки' });
    }

    // Удалить карточку
    await card.remove();

    return res.status(SUCCESS).json({ message: 'Карточка успешно удалена' });
  } catch (error) {
    console.error(error);
    return res.status(Internal).json({ message: 'Произошла ошибка при удалении карточки' });
  }
};

const handleLikeDislike = async (req, res, update) => {
  try {
    const { cardId } = req.params;

    const card = await Card.findByIdAndUpdate(
      cardId,
      update,
      { new: true },
    );

    if (!card) {
      return res.status(NotFound).json({ message: 'Карточка не найдена' });
    }

    return res.status(SUCCESS).json(card);
  } catch (error) {
    if (error.message === NotFound) {
      return res
        .status(NotFound)
        .send({ message: 'Карточка не найдена' });
    }

    if (error.name === 'CastError') {
      return res.status(BadRequest).send({ message: 'Передано неверное id карточки' });
    }
    return res.status(Internal).send({ message: 'Произошла ошибка' });
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
