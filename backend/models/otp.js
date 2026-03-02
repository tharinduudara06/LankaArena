import mongoose from 'mongoose'

const otpSchema = new mongoose.Schema({

    email:
    {
        type: String
    },

    otp:
    {
        type: String
    }, 

    createdAt:
    {
        type: Date,
        default: Date.now,
        expires: 60
    }
});

export default mongoose.model('otp', otpSchema);