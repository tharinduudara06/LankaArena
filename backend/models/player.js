import mongoose from 'mongoose'

const playerSchema = new mongoose.Schema({

    playerid:
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    },

    jersey:
    {
        type:String,
        default:'N/A'
    },
    
    position:
    {
        type:String,
        default:'unknown'
    },

    age:
    {
        type:Number
        
    },

    height:
    {
        type:Number
    },
    
    weight:
    {
        type:Number
    },

    team:
    {
        type:mongoose.Schema.Types.ObjectId,
        required:true
    }

});

export default mongoose.model('player',playerSchema);