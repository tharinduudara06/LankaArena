import mongoose from 'mongoose'

const equipmentSchema = new mongoose.Schema(
    {
        item:
        {
            type:String
        },

        serialNo:
        {
            type:String
        },

        status:
        {
            type:String
        },

        image:
        {
            type:String,
            default:''
        },

        price:
        {
            type:Number
        },

        quantity:
        {
            type:Number
        },

        createdAt:
        {
            type: Date,
            default: Date.now
        },
        isDeleted:
        {
            type:Boolean,
            default:false
        }
    }
)

export default mongoose.model('equipment', equipmentSchema);