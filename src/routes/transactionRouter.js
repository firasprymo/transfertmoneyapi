const express = require('express');
const transactionController = require('../controllers/transactionController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/solde',transactionController.Solde)
//router.use(authController.protect);
router.post('/transfertArgent', transactionController.GenerateUUID);

module.exports = router;


