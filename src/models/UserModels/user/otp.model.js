const {Schema, model} = require('mongoose');
const sendEmail  = require('../../utils/mail.util');

const otpSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    otpCode: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        enum: ['verify', 'reset'],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 5, 
    },
});

//Index
otpSchema.index({email: 1, type: 1}, {unique: true});
otpSchema.index({email: 1, type: 1, otpCode: 1});

//Send email
otpSchema.post('save', doc => {
    let message;
    if(doc.type === 'reset') {
        message = `Your otp code to reset password is: ${doc.otpCode}`
    } else {
        message = `Your otp code to verify email is: ${doc.otpCode}`
    }

    sendEmail(doc.email, message);
});

module.exports = model("otp", otpSchema);