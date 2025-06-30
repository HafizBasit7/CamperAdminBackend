const {Schema, model} = require('mongoose');

const followSchema = new Schema({
    follower: {
        type: Schema.ObjectId,
        required: true,
        ref: 'user',
    },
    followee: {
        type: Schema.ObjectId,
        required: true,
        ref: 'user',
    },
}, {timestamps: true});

//Index
followSchema.index({follower: 1, followee: 1}, {unique: true});

module.exports = model('follow', followSchema);