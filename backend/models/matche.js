import mongoose from 'mongoose'

const matchSchema = new mongoose.Schema({

    myteam:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'team',
        required: true
    },
    opponent:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'team',
        required: true
    },
    matchDate:{
        type: Date,
        required: true
    },
    startTime:{
        type: String,
        required: true
    },
    endTime:{
        type: String,
        required: true
    },
    ground:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'venue',
        required: true
    },
    notes:{
        type: String,
    },
    status:
    {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
        default: 'pending'
    }
})

export default mongoose.model('matche', matchSchema)