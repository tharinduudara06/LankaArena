// models/rental.js
import mongoose from "mongoose";

const rentalSchema = new mongoose.Schema(
  {
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "equipment", 
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user", 
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    fullPrice: {
      type: Number,
      required: true,
    },
    rentDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["upcoming", "active", "completed", "cancelled"],
      default: "upcoming",
    },
  },
  { timestamps: true } 
);

export default mongoose.model("rental", rentalSchema);
