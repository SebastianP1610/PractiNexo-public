const express = require('express');
const { sugerenciasMatching } = require('../controllers/matchingController');

const router = express.Router();

router.post('/sugerencias', sugerenciasMatching);

module.exports = router;
