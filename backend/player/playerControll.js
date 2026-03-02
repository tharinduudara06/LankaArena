import Equipment from '../models/equipment.js'
import Rental from '../models/rental.js'
import Venue from '../models/Venue.js'
import Booking from '../models/bookings.js'
import PDFDocument from 'pdfkit';
import User from '../models/Users.js'
import Player from '../models/player.js'
import Team from '../models/team.js'
import Schedule from '../models/schedule.js'
import Match from '../models/matche.js'
import mongoose from 'mongoose';
import path from "path";
import fs from "fs";
import multer from 'multer';
import NotificationService from '../services/notificationService.js';

//get equipments by Id
export const getEquipments = async(req,res) => 
{
    try {
        
        if(!req.session.user)
        {
            return res.status(400).json({
                message:"User Not found"
            })
        }

        const {id} = req.params;

        const equipments = await Equipment.find({_id:id});

        if(!equipments)
        {
            return res.status(404).json({
                message:"Equipment not found"
            })
        }

        return res.status(200).json({
            message:"found",
            data:equipments
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message:"Internal server error"
        })
    }
}

//get all equipments
export const playerGetAllEquipments = async(req,res) => 
{
    try {
        
    if(!req.session.user)
    {
      return res.status(401).json({message:"Please log in!"});
    }

    const equipments = await Equipment.find({ isDeleted: false });

    console.log("Found equipments:", equipments);
    console.log("Number of equipments:", equipments.length);

    if(!equipments||equipments.length === 0)
    {
        return res.status(404).json(
          {
            message:"There are no any equipments!"
          }
        )
    }

    return res.status(200).json({
        message:"Found Equipments",
        data:equipments
    });

    } catch (error) {
        
        console.error("Error retrieving venues:", error);
        return res.status(500).json({message:"Internal server error"});

    }
}

//rent equipment
export const rentEquipment = async(req,res) =>
{
    try {
        
        if(!req.session.user)
        {
            return res.status(400).json({
                message:"User Not found"
            })
        }

        const userId = req.session.user._id;
        const {equipmentId,quantity,date,from,to,total} = req.body;

        // Check if equipment exists and has sufficient quantity
        const equipment = await Equipment.findById(equipmentId);
        
        if(!equipment)
        {
            return res.status(404).json({
                message:"Equipment not found"
            })
        }

        if(equipment.quantity < quantity || quantity < 0)
        {
            return res.status(402).json({
                message:`Only ${equipment.quantity} items available for rent`
            })
        }

        const rentDate = new Date(date);

        const [fromHours, fromMinutes] = from.split(":").map(Number);
        const [toHours, toMinutes] = to.split(":").map(Number);

        const startTime = new Date(rentDate);
        startTime.setHours(fromHours, fromMinutes, 0, 0);

        const endTime = new Date(rentDate);
        endTime.setHours(toHours, toMinutes, 0, 0);

        const newRental = new Rental({
            equipment:equipmentId,
            user:userId,
            quantity:quantity,
            rentDate:rentDate,
            startTime:startTime,
            endTime:endTime,
            fullPrice:total
        })

        if(!newRental)
        {
            return res.status(401).json({
                message:"Equipment rent Failed!"
            })
        }

        // Start a transaction to ensure both operations succeed or fail together
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Save the rental
            await newRental.save({ session });

            // Reduce the equipment quantity
            equipment.quantity -= quantity;
            
            // Update status to "unavailable" if quantity becomes zero
            if(equipment.quantity === 0) {
                equipment.status = "unavailable";
            }
            
            await equipment.save({ session });

            // Commit the transaction
            await session.commitTransaction();
            session.endSession();

            // Create notification for equipment rental confirmation
            try {
                await NotificationService.createEquipmentNotification(
                    userId,
                    'player',
                    {
                        equipmentName: equipment.name,
                        rentalId: newRental._id,
                        pickupDate: new Date(rentDate).toLocaleDateString()
                    },
                    'confirmed'
                );
            } catch (notificationError) {
                console.error('Failed to create equipment rental notification:', notificationError);
                // Don't fail the rental if notification fails
            }

            console.log(newRental);
            console.log(`Equipment quantity reduced by ${quantity}. New quantity: ${equipment.quantity}`);

            return res.status(200).json({
                message:"Successfully rented",
                data:newRental
            })

        } catch (transactionError) {
            // If any operation fails, abort the transaction
            await session.abortTransaction();
            session.endSession();
            
            console.error("Transaction failed:", transactionError);
            return res.status(500).json({
                message:"Rental transaction failed"
            })
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message:"Internal server error"
        })
    }
}
//get all grounds
export const getAllGrounds = async(req,res) => 
{
    try {
        
        if(!req.session.user)
        {
            return res.status(400).json({
                message:"User Not found"
            })
        }

        const grounds = await Venue.find({isDeleted:false}).populate("ground_manager", "mobile name email");

        if(!grounds || grounds.length === 0)
        {
            return res.status(404).json({
                message:"Grounds NOT found"
            })
        }

        console.log(JSON.stringify(grounds, null, 2));

        return res.status(200).json({
            message:"groundew fetched",
            data:grounds
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message:"Internal server error"
        })
    }
}

//get ground by id
export const getGroundById = async(req,res) => 
{
    try {
        
        if(!req.session.user)
        {
            return res.status(400).json({
                message:"User Not found"
            })
        }

        const {id} = req.params;

        const ground = await Venue.find({_id:id}).populate("ground_manager", "mobile name email");

        if(!ground || ground.length === 0)
        {
            return res.status(404).json({
                message:"Ground NOT found"
            })
        }

        return res.status(200).json({
            message:"groundew fetched",
            data:ground
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message:"Internal server error"
        })
    }
}

//book ground
export const playerBookGround = async(req,res) =>
{
    try {
        
        if(!req.session.user)
        {
            return res.status(400).json({
                message:"User Not found"
            })
        }

        const userId = req.session.user._id;

        const{venueId,date,method,price,from,to} = req.body;

        if (!venueId || !date || !method || !price || !from || !to) {
            return res.status(402).json({
                message: "All fields are required"
            })
        }

        const validMethods = ["credit-card", "paypal", "cash"];
        if (!validMethods.includes(method)) {
            return res.status(403).json({
                message: "Invalid payment method"
            })
        }

        const rentDate = new Date(date);

        const [fromHours, fromMinutes] = from.split(":").map(Number);
        const [toHours, toMinutes] = to.split(":").map(Number);

        const startTime = new Date(rentDate);
        startTime.setHours(fromHours, fromMinutes, 0, 0);

        const endTime = new Date(rentDate);
        endTime.setHours(toHours, toMinutes, 0, 0);

        const newBooking = new Booking({

            venue:venueId,
            status:'pending',
            date:rentDate,
            method:method,
            price:price,
            from:userId,
            startTime:startTime,
            endTime:endTime
        });

        if(!newBooking)
        {
            return res.status(401).json({
                message:"Booking Failed!"
            })
        }

        await newBooking.save();

        // Get venue details for notification
        const venue = await Venue.findById(venueId).select('name');
        
        // Create notification for booking confirmation
        try {
            await NotificationService.createBookingNotification(
                userId,
                'player',
                {
                    venueName: venue?.name || 'Unknown Venue',
                    date: new Date(rentDate).toLocaleDateString(),
                    time: `${from} - ${to}`,
                    bookingId: newBooking._id
                },
                'confirmed'
            );
        } catch (notificationError) {
            console.error('Failed to create booking notification:', notificationError);
            // Don't fail the booking if notification fails
        }

        return res.status(200).json({
            message:"Successfully Booked the ground!",
            data:newBooking
        })


    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message:"Internal server error"
        })
    }
}

//get bookings
export const getmyBookings = async(req,res) =>
{
    try {
        
        if(!req.session.user)
        {
            return res.status(400).json({
                message:"User Not found"
            })
        }

        const userId = req.session.user._id;

        const bookings = await Booking.find({from:userId}).populate("from").populate("venue");

        console.log("Found bookings:", bookings);
        console.log("Number of bookings:", bookings.length);

        // Check if any booking has null venue
        bookings.forEach((booking, index) => {
            console.log(`Booking ${index}:`, booking._id);
            console.log(`Venue populated:`, booking.venue);
            if (!booking.venue) {
                console.log(`⚠️ Booking ${booking._id} has NULL venue!`);
            }
        });
        
        if(!bookings || bookings.length === 0)
        {
            return res.status(404).json({
                message:"No bookings found"
            })
        }

         return res.status(200).json({
            message:"My bookings fetched!",
            data:bookings
        })


    } catch (error) {
        console.error(error);
            return res.status(500).json({
            message:"Internal server error"
        })
    }
}

//download receipt
export const downloadReciept = async(req,res) =>
{
    try {
        
        const bookingId = req.params.id;

        const booking = await Booking.findById(bookingId)
        .populate("from")   
        .populate("venue"); 

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        const updatePaid = await Booking.findOneAndUpdate(
            { _id: bookingId, from: req.session.user._id }, 
            { isPaid: "paid" }, 
            { new: true }
        );


        if (!updatePaid) {
            return res.status(400).json({ message: "Payment failed" });
        }

        const doc = new PDFDocument();
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=receipt_${bookingId}.pdf`);
        doc.pipe(res);

        doc.fontSize(20).text("Booking Receipt", { align: "center" });
        doc.moveDown();

        doc.fontSize(14).text(`Player Name: ${booking.from.name}`);
        doc.text(`Player Mobile: ${booking.from.mobile}`);
        doc.text(`Ground: ${booking.venue.name}`);
        doc.text(`Payment Method: ${booking.method}`);
        doc.text(`Price: LKR ${booking.price}.00`);
        doc.text(`Booking Date: ${new Date(booking.date).toLocaleDateString()}`);
        doc.text(
      `Time: ${new Date(booking.startTime).toLocaleTimeString()} - ${new Date(
            booking.endTime
            ).toLocaleTimeString()}`
        );

            doc
      .fontSize(22)
      .fillColor("#333")
      .text("LankaArena", { align: "center" })
      .moveDown(0.2);

    doc
      .fontSize(16)
      .fillColor("#555")
      .text("Official Booking Receipt", { align: "center" });

    doc.moveDown(1);

 
    doc
      .strokeColor("#cccccc")
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke();

    doc.moveDown(1.5);

  
    doc.fontSize(14).fillColor("#000").text("Receipt Details", { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(12).fillColor("#333");

    doc.text(`Receipt ID: ${booking._id}`, { continued: false });
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();

  
    doc.fontSize(14).fillColor("#000").text("Player Information", { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(12).fillColor("#333");
    doc.text(`Name: ${booking.from?.name ?? "N/A"}`);
    doc.text(`Mobile: ${booking.from?.mobile ?? "N/A"}`);
    doc.moveDown();

 
    doc.fontSize(14).fillColor("#000").text("Booking Information", { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(12).fillColor("#333");
    doc.text(`Ground: ${booking.venue?.name ?? "N/A"}`);
    doc.text(`Booking Date: ${new Date(booking.date).toLocaleDateString()}`);
    doc.text(
      `Time: ${new Date(booking.startTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })} - ${new Date(booking.endTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    );
    doc.moveDown();


    doc.fontSize(14).fillColor("#000").text("Payment Information", { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(12).fillColor("#333");
    doc.text(`Payment Method: ${booking.method ?? "N/A"}`);
    doc.text(`Amount Paid: LKR ${booking.price}.00`);
    doc.moveDown(2);


    doc
      .fontSize(12)
      .fillColor("#555")
      .text("Thank you for booking with LankaArena!", { align: "center" })
      .moveDown(0.3);

    doc
      .fontSize(10)
      .fillColor("#999")
      .text("This is a system-generated receipt and does not require a signature.", {
        align: "center",
      });

        doc.end();

    } catch (error) {
        console.error("PDF generation error:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to generate receipt" });
    } else {
      req.socket.destroy();
    }
}
}

//get player profile
export const getProfile = async(req,res) => 
{
    try {
        
        if(!req.session.user)
        {
            return res.status(400).json({
                message:"User Not found"
            })
        }

        const userId = req.session.user._id;

        const privateDetails = await User.findById({_id:userId}).lean();
        const playerDetails = await Player.findOne({playerid:userId}).lean();

        console.log("Session userId:", userId);
        console.log("Private details:", privateDetails);
        console.log("Player details:", playerDetails); 

        if(!privateDetails)
        {
            return res.status(404).json({
                message:"User NOT found"
            })
        }
        
        let teamName = "";
        
        if (playerDetails) {
            if (playerDetails.team) {
                const team = await Team.findById(playerDetails.team).lean();
                if (team) teamName = team.name;
            }
        }

        const combinedProfile = {
            ...privateDetails,
            ...(playerDetails || {}), 
            teamName
        };

        return res.status(200).json({
            message: playerDetails ? "Player profile found" : "Player profile not completed",
            data: combinedProfile,
            hasPlayerProfile: !!playerDetails
        })

    } catch (error) {
        console.error("Error in getProfile:", error);
        res.status(500).json({ 
            message: "Internal error occurred",
            error: error.message 
        });
    }
}

// Update player personal profile
export const updateProfile = async (req, res) => {

    try {
        
        if(!req.session.user)
        {
            return res.status(400).json({
                message:"User Not found"
            })
        }

        const {name,email,mobile} = req.body;

        const userId = req.session.user._id;

        const updatedData = await User.findByIdAndUpdate(userId,{name:name,email:email,mobile:mobile},{new:true});

        if(!updatedData)
        {
            return res.status(404).json({
                message:"User NOT found"
            });
        }

        console.log(updatedData);

        return res.status(200).json({
            message:"Profile Updated",
            data:updatedData
        });

    } catch (error) {
        console.error("Error in getProfile:", error);
        res.status(500).json({ 
            message: "Internal error occurred",
            error: error.message 
        });
    }
}

//update player profile
export const updatePlayerProfile = async(req,res) =>
{
    try {
        
        if(!req.session.user)
        {
            return res.status(400).json({
                message:"User Not found"
            })
        }

        const {age,height,weight} = req.body;

        const userId = req.session.user._id;

        const updatedData = await Player.findOneAndUpdate({playerid:userId},{age:age,height:height,weight:weight},{new:true});

        if(!updatedData)
        {
            return res.status(404).json({
                message:"Update Failed"
            });
        }

        return res.status(200).json({
            message:"Player Profile Updated",
            data:updatedData
        });

    } catch (error) {
        
        console.error("Error in getProfile:", error);
        res.status(500).json({ 
            message: "Internal error occurred",
            error: error.message 
        });

    }
}

//update player profile photo
export const updateProfilePhoto = async (req, res) => {

    try {
        
        if (!req.session.user) {
            return res.status(400).json({
                message: "User Not found"
            });
        }

        const userId = req.session.user._id;

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const updatedData = await User.findByIdAndUpdate(userId, { profileImage: req.file.filename }, { new: true });

        if (!updatedData) {
            return res.status(404).json({
                message: "User NOT found"
            });
        }

        return res.status(200).json({
            message: "Profile Photo Updated",
            data: updatedData
        });

    } catch (error) {
        
        console.error("Error in updateProfilePhoto:", error);
        res.status(500).json({
            message: "Internal error occurred",
            error: error.message
        });

    }
}

//delete account
export const deleteAccount = async(req,res) =>
{
    try {
        
        if(!req.session.user)
        {
            return res.status(400).json({
                message:"Please log in"
            })
        }

        const userId = req.session.user._id;

        const deletedUser = await User.findByIdAndUpdate(userId,{isDeleted:true},{new:true});
        const deletedPlayer = await Player.findOneAndDelete({playerid:userId});

        await Team.updateMany(
            { player: userId },
            { $pull: { player: userId } }
        );

        if(!deletedUser || !deletedPlayer)
        {
            return res.status(404).json({
                message:"User NOT found"
            });
        }

        req.session.destroy();

        return res.status(200).json({
            message:"Account Deleted",
            data:deletedUser
        });

    } catch (error) {
        
        console.error("Error in deleteAccount:", error);
        res.status(500).json({ 
            message: "Internal error occurred",
            error: error.message 
        });

    }
}

//cancel booking
export const cancelBooking = async(req,res) =>
{
    try {
        
        if(!req.session.user)
        {
            console.log("User not logged in");
            return res.status(400).json({
                message:"Please log in"
            })
        }

        const {id} = req.params;

        const cancelledBooking = await Booking.findByIdAndUpdate(id,{status:"cancelled"},{new:true}).populate('venue', 'name');

        if(!cancelledBooking)
        {
            return res.status(404).json({
                message:"Booking NOT found"
            });
        }

        // Create notification for booking cancellation
        try {
            await NotificationService.createBookingNotification(
                cancelledBooking.from,
                'player',
                {
                    venueName: cancelledBooking.venue?.name || 'Unknown Venue',
                    date: new Date(cancelledBooking.date).toLocaleDateString(),
                    time: `${new Date(cancelledBooking.startTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} - ${new Date(cancelledBooking.endTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`,
                    bookingId: cancelledBooking._id,
                    reason: 'Cancelled by player'
                },
                'cancelled'
            );
        } catch (notificationError) {
            console.error('Failed to create booking cancellation notification:', notificationError);
            // Don't fail the cancellation if notification fails
        }

        return res.status(200).json({
            message:"Booking Cancelled",
            data:cancelledBooking
        });

    } catch (error) {
        
        console.error("Error in cancelBooking:", error);
        res.status(500).json({ 
            message: "Internal error occurred",
            error: error.message 
        });

    }
}

//check ground book availability
export const checkAvailability = async (req, res) => {
  try {
    const { venueId, date, from, to } = req.body;

    if (!venueId || !date || !from || !to) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    
    const bookingDate = new Date(date); 
    const [fromHour, fromMin] = from.split(":").map(Number);
    const [toHour, toMin] = to.split(":").map(Number);

    const startDateTime = new Date(bookingDate);
    startDateTime.setHours(fromHour, fromMin, 0, 0);

    const endDateTime = new Date(bookingDate);
    endDateTime.setHours(toHour, toMin, 0, 0);

    const existBooking = await Booking.find({
      venue: venueId,
      status: { $ne: "cancelled" },
      $or: [
        {
          startTime: { $lt: endDateTime },
          endTime: { $gt: startDateTime }
        }
      ]
    });

    if (existBooking.length > 0) {
      return res
        .status(409)
        .json({ message: "Selected time slot is already booked!" });
    }

    return res.status(200).json({ available: true });

  } catch (error) {
    console.error("Check availability error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//get booked slots for a ground
export const getBookedSlots = async (req, res) => {
  try {
    const { venueId } = req.params;

    console.log("=== getBookedSlots called ===");
    console.log("Received venueId:", venueId);

    // First, let's check if there are ANY bookings for this venue
    const allBookings = await Booking.find({ venue: venueId });
    console.log("All bookings for venue:", allBookings.length);
    console.log("All bookings details:", allBookings.map(b => ({
      id: b._id,
      venue: b.venue,
      status: b.status,
      date: b.date,
      startTime: b.startTime,
      endTime: b.endTime
    })));

    const bookings = await Booking.find({
      venue: venueId,
      status: { $ne: "cancelled" }
    });

    console.log("Found non-cancelled bookings:", bookings.length);
    console.log("Booking details:", bookings.map(b => ({
      id: b._id,
      status: b.status,
      date: b.date,
      startTime: b.startTime,
      endTime: b.endTime
    })));

    const bookedSlots = bookings.map(b => {
      // Convert to local time and format as AM/PM
      const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      };

      const slot = {
        date: b.date.toISOString().split("T")[0],
        startTime: formatTime(b.startTime),
        endTime: formatTime(b.endTime)
      };
      
      console.log("Processed slot:", slot);
      return slot;
    });

    console.log("Final bookedSlots array:", bookedSlots);
    console.log("=== End getBookedSlots ===");

    return res.status(200).json({ bookedSlots });
  } catch (error) {
    console.error("Error in getBookedSlots:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Test function to create dummy bookings for testing
export const createTestBookings = async (req, res) => {
  try {
    const { venueId } = req.params;
    
    console.log("Creating test bookings for venue:", venueId);
    
    // Create some test bookings
    const testBookings = [
      {
        venue: venueId,
        from: req.session.user._id,
        date: new Date('2024-01-15'),
        startTime: new Date('2024-01-15T09:00:00'),
        endTime: new Date('2024-01-15T11:00:00'),
        price: 100,
        method: 'credit-card',
        status: 'confirmed'
      },
      {
        venue: venueId,
        from: req.session.user._id,
        date: new Date('2024-01-15'),
        startTime: new Date('2024-01-15T14:00:00'),
        endTime: new Date('2024-01-15T16:00:00'),
        price: 100,
        method: 'credit-card',
        status: 'pending'
      },
      {
        venue: venueId,
        from: req.session.user._id,
        date: new Date('2024-01-16'),
        startTime: new Date('2024-01-16T10:00:00'),
        endTime: new Date('2024-01-16T12:00:00'),
        price: 100,
        method: 'credit-card',
        status: 'confirmed'
      }
    ];
    
    const createdBookings = await Booking.insertMany(testBookings);
    console.log("Created test bookings:", createdBookings.length);
    
    return res.status(200).json({ 
      message: "Test bookings created successfully",
      bookings: createdBookings 
    });
  } catch (error) {
    console.error("Error creating test bookings:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//get user rentals
export const getMyRentals = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        message: "Please log in"
      });
    }

    const userId = req.session.user._id;

    const rentals = await Rental.find({ user: userId })
      .populate("equipment")
      .sort({ createdAt: -1 }); // Sort by newest first

    if (!rentals || rentals.length === 0) {
      return res.status(404).json({
        message: "No rentals found"
      });
    }

    // Add status to each rental based on current time and database status
    const rentalsWithStatus = rentals.map(rental => {
      const now = new Date();
      const rentDate = new Date(rental.rentDate);
      const startTime = new Date(rental.startTime);
      const endTime = new Date(rental.endTime);

      let status = rental.status || "upcoming"; // Use database status if available
      
      // Only override status if it's not cancelled and not completed
      if (status !== "cancelled" && status !== "completed") {
        if (now > endTime) {
          status = "completed";
        } else if (now >= startTime && now <= endTime) {
          status = "active";
        }
      }

      return {
        ...rental.toObject(),
        status
      };
    });

    return res.status(200).json({
      message: "Rentals fetched successfully",
      data: rentalsWithStatus
    });

  } catch (error) {
    console.error("Error in getMyRentals:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

//cancel rental
export const cancelRental = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        message: "Please log in"
      });
    }

    const { id } = req.params;
    const userId = req.session.user._id;

    // Find the rental and verify it belongs to the user
    const rental = await Rental.findOne({ _id: id, user: userId });
    
    if (!rental) {
      return res.status(404).json({
        message: "Rental not found or you don't have permission to cancel this rental"
      });
    }

    // Check if rental can be cancelled (only upcoming rentals can be cancelled)
    const now = new Date();
    const startTime = new Date(rental.startTime);
    
    if (now >= startTime) {
      return res.status(400).json({
        message: "Cannot cancel rental that has already started or is in progress"
      });
    }

    if (rental.status === "cancelled") {
      return res.status(400).json({
        message: "Rental is already cancelled"
      });
    }

    // Update rental status to cancelled
    const cancelledRental = await Rental.findByIdAndUpdate(
      id, 
      { status: "cancelled" }, 
      { new: true }
    ).populate("equipment");

    // Restore equipment quantity
    const equipment = await Equipment.findById(rental.equipment);
    if (equipment) {
      equipment.quantity += rental.quantity;
      if (equipment.status === "unavailable" && equipment.quantity > 0) {
        equipment.status = "available";
      }
      await equipment.save();
    }

    // Create notification for rental cancellation
    try {
      await NotificationService.createEquipmentNotification(
        userId,
        'player',
        {
          equipmentName: equipment?.name || 'Unknown Equipment',
          rentalId: cancelledRental._id,
          reason: 'Cancelled by player'
        },
        'cancelled'
      );
    } catch (notificationError) {
      console.error('Failed to create rental cancellation notification:', notificationError);
      // Don't fail the cancellation if notification fails
    }

    return res.status(200).json({
      message: "Rental cancelled successfully",
      data: cancelledRental
    });

  } catch (error) {
    console.error("Error in cancelRental:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

function formatTime(date) {
  return new Date(date).toISOString().substring(11, 16);
}

// Get player by user ID
export const getPlayerByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const player = await Player.findOne({ playerid: userId })
      .populate('team', 'name sport coach')
      .populate('playerid', 'name email mobile');

    if (!player) {
      return res.status(404).json({
        success: false,
        message: "Player not found"
      });
    }

    return res.status(200).json({
      success: true,
      player: player
    });

  } catch (error) {
    console.error("Error in getPlayerByUserId:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get team by ID
export const getTeamById = async (req, res) => {
  try {
    const { teamId } = req.params;

    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const team = await Team.findById(teamId)
      .populate('player', 'name email mobile');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }

    // Get coach details separately to avoid population issues
    const coach = await User.findById(team.coach).select('name email mobile');

    return res.status(200).json({
      success: true,
      team: {
        ...team.toObject(),
        coach: coach
      }
    });

  } catch (error) {
    console.error("Error in getTeamById:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get sessions by coach ID
export const getSessionsByCoachId = async (req, res) => {
  try {
    const { coachId } = req.params;

    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const sessions = await Schedule.find({ 
      coachid: coachId, 
      isDeleted: false 
    })
    .populate('venueid', 'name location')
    .sort({ date: 1, startTime: 1 });

    return res.status(200).json({
      success: true,
      schedules: sessions
    });

  } catch (error) {
    console.error("Error in getSessionsByCoachId:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get matches for a specific team
export const getTeamMatches = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const { teamId } = req.params;

    if (!teamId) {
      return res.status(400).json({
        success: false,
        message: "Team ID is required"
      });
    }

    // Verify the team exists
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }

    // Get all matches where this team is either myteam or opponent
    const matches = await Match.find({
      $or: [
        { myteam: teamId },
        { opponent: teamId }
      ]
    })
    .populate({
      path: 'myteam',
      select: 'name sport coach',
      populate: {
        path: 'coach',
        select: 'name email'
      }
    })
    .populate('opponent', 'name sport')
    .populate('ground', 'name location')
    .sort({ matchDate: 1 });

    return res.status(200).json({
      success: true,
      message: "Matches retrieved successfully",
      matches: matches
    });

  } catch (error) {
    console.error("Error in getTeamMatches:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get comprehensive dashboard data for player
export const getDashboardData = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const userId = req.session.user._id;

    // Get user profile
    const userProfile = await User.findById(userId).lean();
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Get player details
    const playerDetails = await Player.findOne({ playerid: userId })
      .populate('team', 'name sport')
      .lean();
    
    console.log('Player details:', playerDetails);

    // Get bookings (pending, confirmed, upcoming)
    const bookings = await Booking.find({ from: userId })
      .populate('venue', 'name location')
      .sort({ startTime: 1 })
      .lean();

    // Get rentals (upcoming, active, completed)
    const rentals = await Rental.find({ user: userId })
      .populate('equipment', 'name type')
      .sort({ startTime: 1 })
      .lean();

    // Get team matches if player has a team
    let teamMatches = [];
    if (playerDetails && playerDetails.team) {
      const matches = await Match.find({
        $or: [
          { myteam: playerDetails.team._id },
          { opponent: playerDetails.team._id }
        ]
      })
      .populate('myteam', 'name sport')
      .populate('opponent', 'name sport')
      .populate('ground', 'name location')
      .sort({ matchDate: 1 })
      .lean();

      teamMatches = matches;
    }

    // Get coach sessions if player has a team with coach
    let coachSessions = [];
    if (playerDetails && playerDetails.team) {
      console.log('Player team ID:', playerDetails.team._id);
      
      // Get team details to get coach ID (same approach as Player_sessions.jsx)
      const team = await Team.findById(playerDetails.team._id).lean();
      console.log('Team details:', team);
      
      if (team && team.coach) {
        const coachId = team.coach;
        console.log('Coach ID for sessions:', coachId);
        
        const sessions = await Schedule.find({ 
          coachid: coachId,
          isDeleted: false 
        })
        .populate('venueid', 'name location')
        .sort({ date: 1, startTime: 1 })
        .lean();

        console.log('Found coach sessions:', sessions.length);
        coachSessions = sessions;
      } else {
        console.log('No coach found in team details');
      }
    } else {
      console.log('No team found for player');
    }

    // Calculate statistics
    const now = new Date();
    
    // Pending bookings count
    const pendingBookings = bookings.filter(booking => booking.status === 'pending').length;
    
    // Upcoming rentals count
    const upcomingRentals = rentals.filter(rental => {
      const startTime = new Date(rental.startTime);
      return startTime > now && rental.status !== 'cancelled' && rental.status !== 'completed';
    }).length;
    
    // Team matches count (upcoming)
    const upcomingMatches = teamMatches.filter(match => {
      const matchDate = new Date(match.matchDate);
      return matchDate > now && match.status !== 'cancelled' && match.status !== 'completed';
    }).length;
    
    // Coach sessions count (upcoming)
    const upcomingSessions = coachSessions.filter(session => {
      const sessionDate = new Date(session.date);
      const isUpcoming = sessionDate > now;
      console.log(`Session ${session._id}: date=${session.date}, sessionDate=${sessionDate}, now=${now}, isUpcoming=${isUpcoming}`);
      return isUpcoming;
    }).length;
    
    console.log('Total coach sessions:', coachSessions.length);
    console.log('Upcoming coach sessions:', upcomingSessions);
    console.log('Current time:', now);

    // Format upcoming bookings (next 3)
    const upcomingBookings = bookings
      .filter(booking => {
        const startTime = new Date(booking.startTime);
        return startTime > now && booking.status !== 'cancelled';
      })
      .slice(0, 3)
      .map(booking => ({
        id: booking._id,
        title: booking.venue?.name || 'Unknown Venue',
        location: booking.venue?.location 
          ? `${booking.venue.location.address}, ${booking.venue.location.city}`
          : 'Unknown Location',
        date: new Date(booking.startTime).toLocaleDateString(),
        time: new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: booking.status
      }));

    // Format upcoming matches (next 2)
    const upcomingMatchesFormatted = teamMatches
      .filter(match => {
        const matchDate = new Date(match.matchDate);
        return matchDate > now && match.status !== 'cancelled' && match.status !== 'completed';
      })
      .slice(0, 2)
      .map(match => ({
        id: match._id,
        title: `Vs. ${match.opponent?.name || 'Unknown Team'}`,
        sport: match.myteam?.sport || 'Unknown Sport',
        date: new Date(match.matchDate).toLocaleDateString(),
        ground: match.ground?.name || 'Unknown Ground'
      }));

    // Format recent activity (last 5 activities)
    const recentActivities = [];
    
    // Add recent bookings
    bookings.slice(0, 3).forEach(booking => {
      recentActivities.push({
        id: booking._id,
        title: `Booking ${booking.status} for ${booking.venue?.name || 'Unknown Venue'}`,
        time: new Date(booking.createdAt).toLocaleString(),
        type: 'booking'
      });
    });
    
    // Add recent rentals
    rentals.slice(0, 2).forEach(rental => {
      recentActivities.push({
        id: rental._id,
        title: `Rented ${rental.equipment?.name || 'equipment'}`,
        time: new Date(rental.createdAt).toLocaleString(),
        type: 'rental'
      });
    });

    // Sort activities by time and take latest 5
    recentActivities.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

    const dashboardData = {
      user: {
        name: userProfile.name,
        email: userProfile.email,
        mobile: userProfile.mobile,
        profileImage: userProfile.profileImage
      },
      player: playerDetails ? {
        age: playerDetails.age,
        height: playerDetails.height,
        weight: playerDetails.weight,
        position: playerDetails.position,
        jersey: playerDetails.jersey,
        team: playerDetails.team
      } : null,
      stats: {
        pendingBookings,
        upcomingRentals,
        teamMatches: upcomingMatches,
        coachSessions: upcomingSessions
      },
      upcomingBookings,
      upcomingMatches: upcomingMatchesFormatted,
      recentActivities
    };

    return res.status(200).json({
      success: true,
      message: "Dashboard data retrieved successfully",
      data: dashboardData
    });

  } catch (error) {
    console.error("Error in getDashboardData:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};