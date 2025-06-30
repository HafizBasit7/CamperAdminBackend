
const { validationResult } = require('express-validator');
const User = require('../models/user.model');
const Camper = require('../models/camper.model');
const CamperForSale = require('../models/camperForSale.model');
const Booking = require('../models/booking.model');

exports.getUsers = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const {
    page = 1,
    limit = 10,
    search = '',
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const match = {
    isAdmin: false // always exclude admins
  };

  if (search) {
    match.$or = [
      { firstName: new RegExp(search, 'i') },
      { lastName: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
    ];
  }

  if (status) match.accountStatus = status;

  try {
    const users = await User.find(match)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .lean();

    const total = await User.countDocuments(match);

    const enriched = await Promise.all(
      users.map(async (u) => {
        const vehiclesUploaded =
          (await Camper.countDocuments({ user: u._id })) +
          (await CamperForSale.countDocuments({ user: u._id }));
        const vehiclesBooked = await Booking.countDocuments({ user: u._id });

        return {
          id: u._id,
          name: `${u.firstName} ${u.lastName}`,
          email: u.email,
          role: 'user',
          status: u.accountStatus,
          verified: u.emailVerified,
          joinDate: u.createdAt,
          vehiclesUploaded,
          vehiclesBooked,
        };
      })
    );

    res.json({
      success: true,
      data: enriched,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};


exports.updateStatus = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const { id } = req.params;
  const { status } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.accountStatus = status;
    await user.save();
    res.json({ success: true, message: 'Status updated' });
  } catch (err) {
    next(err);
  }
};
