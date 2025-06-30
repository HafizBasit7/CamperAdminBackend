// src/controllers/adminAuth.controller.js
const { validationResult } = require('express-validator');
const bcrypt        = require('bcryptjs');
const User          = require('../models/user.model');
const generateToken = require('../utils/generateToken');

/* ------------------------------------------------------------------ *
 *  POST /admin/login
 * ------------------------------------------------------------------ */
async function login(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.isAdmin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    return res.json({
      success: true,
      token: generateToken({ id: user._id, isAdmin: true }),
      user: {
        id:         user._id,
        email:      user.email,
        firstName:  user.firstName,
        lastName:   user.lastName,
        role:       'admin',
      },
    });
  } catch (err) {
    next(err);
  }
}

/* ------------------------------------------------------------------ *
 *  POST /admin/create    (create a new admin)
 * ------------------------------------------------------------------ */
async function createAdmin(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const {
    email,
    password,
    firstName,
    lastName,
    country,
    zipCode,
    dateOfBirth,
    idCardNo,
    drivingLicenseNo,
    drivingLicenseIssueDate,
  } = req.body;

  try {
    // ensure unique email
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create admin user
    const newAdmin = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      country,
      zipCode,
      dateOfBirth,
      idCardNo,
      drivingLicenseNo,
      drivingLicenseIssueDate,
      isAdmin: true,
      profile: {
        emailVerified: true,
        accountStatus: 'active',
      },
    });

    await newAdmin.save();

    return res.status(201).json({
      success: true,
      message: 'Admin account created',
      user: {
        id:         newAdmin._id,
        email:      newAdmin.email,
        firstName:  newAdmin.firstName,
        lastName:   newAdmin.lastName,
        role:       'admin',
      },
    });
  } catch (err) {
    next(err);
  }
}

/* ------------------------------------------------------------------ */
module.exports = { login, createAdmin };
