const mongoose = require('mongoose');
const User = require('../models/user.model');

const getUserCampersAndBookingStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $lookup: {
          from: 'campers',
          localField: '_id',
          foreignField: 'user',
          as: 'campers'
        }
      },
      {
        $lookup: {
          from: 'bookings',
          let: { camperIds: '$campers._id' },
          pipeline: [
            {
              $match: {
                $expr: { $in: ['$camper', '$$camperIds'] }
              }
            }
          ],
          as: 'bookings'
        }
      },
      {
        $addFields: {
          totalCampers: { $size: '$campers' },
          totalBookings: { $size: '$bookings' },
          pending: {
            $size: {
              $filter: {
                input: '$bookings',
                as: 'b',
                cond: { $eq: ['$$b.status', 'pending'] }
              }
            }
          },
          confirmed: {
            $size: {
              $filter: {
                input: '$bookings',
                as: 'b',
                cond: { $eq: ['$$b.status', 'confirmed'] }
              }
            }
          },
          cancelled: {
            $size: {
              $filter: {
                input: '$bookings',
                as: 'b',
                cond: { $eq: ['$$b.status', 'cancelled'] }
              }
            }
          },
          completed: {
            $size: {
              $filter: {
                input: '$bookings',
                as: 'b',
                cond: { $eq: ['$$b.status', 'completed'] }
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          ownerId: '$_id',
          ownerName: { $concat: ['$firstName', ' ', '$lastName'] },
          totalCampers: 1,
          totalBookings: 1,
          pending: 1,
          confirmed: 1,
          cancelled: 1,
          completed: 1
        }
      }
    ]);

    res.status(200).json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
module.exports = getUserCampersAndBookingStats;