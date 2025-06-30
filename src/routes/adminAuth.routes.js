
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {login, createAdmin} = require('../controllers/adminAuth.controller');

// POST /admin/login
router.post(
  '/',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password length min 6'),
  ],
  login
);

// POST /admin/create
router.post(
  '/create',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password length min 6'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
  ],
  createAdmin
);

module.exports = router;
