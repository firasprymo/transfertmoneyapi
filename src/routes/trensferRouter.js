const express = require('express');
const trensferController = require('./../controllers/transactionController');
const authController = require('./../controllers/authController');

const router = express.Router();
router.use(authController.protect);
router.post('/transfertArgent', trensferController.GenerateUUID);


module.exports = router;


