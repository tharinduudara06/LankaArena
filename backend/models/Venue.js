import mongoose from 'mongoose';

const venueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    }
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  facilities: [{
    type: String,
    trim: true
  }],
  photo: {
    filename:
    {
        type: String,
        required:true,
        default:''
    },
    filepath:
    {
      type:String,
      required:true,
      default:''
    },
    uploadDate: 
    {
      type: Date,
      default: Date.now
    }
  },
  ground_manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'under_maintenance'],
    default: 'active'
  }
  ,
  isDeleted:{
    type:Boolean,
    default:false
  },
}, {
  timestamps: true
});

// Index for better query performance
venueSchema.index({ ground_manager: 1 });
venueSchema.index({ 'location.city': 1 });

export default mongoose.models.venue || mongoose.model('venue', venueSchema);