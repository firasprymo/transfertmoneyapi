const express = require('express');
const historiqueController = require('./../controllers/historiqueController');
const authController = require('./../controllers/authController');
const router = express.Router();
// Protect all routes after this middleware
router.use(authController.protect);

router
  .route('/')
  .get(historiqueController.getAllHistorique)

module.exports = router;
