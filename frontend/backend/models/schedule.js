import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({

    coachid:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref:"user"
    },

    title:
    {
        type: String,
        required: true
    },

    date:{
        type: Date,
        required: true
    },
    startTime:{
        type: Date,
        required: true
    },
    endTime:
    {
        type:Date,
        required:true
    },

    venueid:
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"venue"
    },

    notes:
    {
        type:String
    },
    status:
    {
        type: String,
        enum: ['upcoming','completed','Cancelled'],
        default: 'upcoming'  
    },  
    isDeleted:
    {
        type:Boolean,
        default:false
    }
});

export default mongoose.model('schedule', scheduleSchema);