// const express = require('express');
// const cardsController = require('../controllers/cards'); // Путь к файлу с контроллерами карточек

// const cardsRouter = express.Router();

// // Роут для получения всех карточек
// cardsRouter.get('/cards', cardsController.getCards);

// // Роут для создания новой карточки
// cardsRouter.post('/cards', cardsController.createCard);

// // Роут для удаления карточки по _id
// cardsRouter.delete('/cards/:cardId', cardsController.deleteCardById);

// // Роут для постановки лайка карточке
// cardsRouter.put('/cards/:cardId/likes', cardsController.likeCard);

// // Роут для снятия лайка с карточки
// cardsRouter.delete('/cards/:cardId/likes', cardsController.dislikeCard);

// module.exports = cardsRouter;
const express = require('express');
const cardsController = require('../controllers/cards');
const {
  createCardValidation,
  cardIdValidation,
} = require('../middlewares/validation');

const router = express.Router();

router.get('/cards', cardsController.getCards);
router.post('/cards', createCardValidation, cardsController.createCard);
router.delete('/cards/:cardId', cardIdValidation, cardsController.deleteCardById);
router.put('/cards/:cardId/likes', cardsController.likeCard);
router.delete('/cards/:cardId/likes', cardsController.dislikeCard);

module.exports = router;
