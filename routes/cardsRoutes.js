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

const router = express.Router();

router.get('/', cardsController.getCards);
router.post('/', cardsController.createCard);
router.delete('/:cardId', cardsController.deleteCardById);
router.put('/:cardId/likes', cardsController.likeCard);
router.delete('/:cardId/likes', cardsController.dislikeCard);

module.exports = router;
