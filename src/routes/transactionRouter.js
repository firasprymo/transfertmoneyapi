const express = require('express');
const transactionController = require('../controllers/transactionController');
const authController = require('../controllers/authController');

const router = express.Router();
router.get('/notification',transactionController.SendNotification)
router.use(authController.protect);
router.get('/solde',transactionController.ConsulterSolde)
router.post('/transfertArgent', transactionController.transferArgent);
router.get('/historiques', transactionController.getAllTransactions);
router.get('/UserHistorique', transactionController.getUserHistorique);

module.exports = router;


