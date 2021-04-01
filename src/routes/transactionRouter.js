const express = require('express');
const transactionController = require('../controllers/transactionController');
const authController = require('../controllers/authController');

const router = express.Router();
router.use(authController.protect);
router.post('/notification',transactionController.SendNotification)
router.get('/solde',transactionController.ConsulterSolde)
router.post('/transfertArgent', transactionController.trensferArgent);

module.exports = router;


