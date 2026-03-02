import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({

    name:
    {
        type: String,
    },

    email:
    {
        type: String,
        trim: true
    },

    mobile:
    {
        type: String,
        trim: true
    },

    password:
    {
        type: String,
        trim: true
    },

    role:
    {
        type: String,
        trim: true
    },

    SP_type:
    {
        type: String
    },

    status:
    {
        type: String
    },

    certifications: [{
        filename: String,
        originalName: String,
        path: String,
        uploadDate: {
            type: Date,
            default: Date.now
        }
    }],
    profileImage:
    {
        type:String,
    },

    isDeleted:{

        type:Boolean,
        default:false
    }

}, {
    timestamps: true
});

export default mongoose.model('user', userSchema);