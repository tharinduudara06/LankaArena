// models/bookings.js
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const bookingSchema = new Schema({
  venue: {
    type: Schema.Types.ObjectId,
    ref: "venue", 
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "pending"
  },
  date: {
    type: Date,
    required: true
  },
  method: {
    type: String,
    enum: ["credit-card", "paypal", "cash"],
    required: true
  },
  isPaid:
  {
    type:String,
    required:true,
    default:"Not-paid"
  },
  price: {
    type: Number,
    required: true
  },
  from: {
    type: Schema.Types.ObjectId,
    ref: "user", 
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  }
}, {
  timestamps: true 
});

const Booking = model("booking", bookingSchema);

export default Booking;
