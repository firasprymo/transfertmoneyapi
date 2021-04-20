const express = require('express');
const transactionController = require('../controllers/transactionController');
const authController = require('../controllers/authController');

const router = express.Router();
router.use(authController.protect);
router.get('/accountBalance',transactionController.ConsulterSolde)
router.post('/transfertArgent', transactionController.transferArgent);
router.post('/ternsfertByUBpay', transactionController.trensfertUbPay)

router.get('/historiques', transactionController.getAllTransactions);
router.get('/UserHistorique', transactionController.getUserHistorique);
router
  .route('/:id')
  
  .patch(transactionController.updateTransaction)
  .delete(transactionController.deleteTransaction);


module.exports = router;


