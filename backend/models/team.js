import Player from './player.js'
import mongoose from 'mongoose'

const teamSchema = new mongoose.Schema({

    name:
    {
        type:String,
        required:true
    },

    sport:
    {
        type:String,
        required:true
    },

    coach:
    {
        type:mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },

    player:
    [
        {type:mongoose.Schema.Types.ObjectId,ref: 'user'},
    ],

    uniformImage:[
        {type:String,default:''}
    ],

    won:
    {
        type:Number
    }

});

export default mongoose.model('team',teamSchema);