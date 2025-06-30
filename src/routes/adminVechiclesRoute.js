const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const getUserCampersAndBookingStats = require('../controllers/adminVechicles.controller');
const vehiclesRouter = express.Router();
vehiclesRouter.get('/stats-by-owner', protect,adminOnly,getUserCampersAndBookingStats);
module.exports = vehiclesRouter;
