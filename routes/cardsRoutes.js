const express = require('express');
const {
  getCards,
  createCard,
  deleteCardById,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');
const {
  createCardValidation,
  dislikeCardValidation,
  deleteCardByIdValidation,
  likeCardValidation,
} = require('../middlewares/validation');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.get('/', authMiddleware, getCards);
router.post('/', [authMiddleware, createCardValidation], createCard);
router.delete('/:cardId', [authMiddleware, deleteCardByIdValidation], deleteCardById);
router.put('/:cardId/likes', [authMiddleware, likeCardValidation], likeCard);
router.delete('/:cardId/likes', [authMiddleware, dislikeCardValidation], dislikeCard);

module.exports = router;
