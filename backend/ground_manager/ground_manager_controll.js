import express from 'express'
import mongoose from 'mongoose'
import User from '../models/Users.js'
import Venue from '../models/Venue.js';
import Booking from '../models/bookings.js'
import Maintenance from '../models/maintenance.js'
import NotificationService from '../services/notificationService.js'

export const register = async(req,res) => {

    const {
        name,
        email, 
        mobile, 
        password
    } = req.body;

    try {
        
        const existUser = await User.findOne({
            $or:[
                {email: email},
                {mobile: mobile}
            ]
        });

        if(existUser)
        {
            console.log(`email: ${email}`);
            return res.status(400).json({
                message: "User already exist!"
            });
        }

        req.session.regUser = {
            Name: name,
            Email: email,
            Mobile: mobile,
            Pass: password,
            Role: 'service_provider',
            Status: 'pending',
            sp_type:'venue_owner',
            isDeleted: false
        };


        const newUser = new User({

            name: req.session.regUser.Name,
            email: req.session.regUser.Email,
            mobile: req.session.regUser.Mobile,
            password: req.session.regUser.Pass,
            role: req.session.regUser.Role,
            status: req.session.regUser.Status,
            SP_type:req.session.regUser.sp_type,
            isDeleted:req.session.regUser.isDeleted
        });

        await newUser.save();

        return res.status(200).json({
            message: "successfully registered!"
        })

       
    } catch (error) {
        console.error('Error sending otp: ', error);
        return res.status(500).json({
            message: "server error"
        });
    }
}

//insert a ground
export const addGround = async(req,res) => 
{
  try {
    
    const{gname,address, city,price,facilities} = req.body;

    const facilityArray = facilities ? facilities.split(",").map(f => f.trim()) : [];

    console.log(req.session.user);

    if(!req.session.user)
    {
      return res.status(401).json({message:"Please log in!"});
    }

    if(!req.file)
    {
      return res.status(400).json({ message: "Image is required" });
    }

    const newVenue = new Venue({

      name:gname,
      location:
      {
        address,
        city
      },
      price:price,
      facilities:facilityArray,
      photo:
      {
        filename:req.file.filename,
        filepath:req.file.path
      },
      ground_manager:req.session.user._id
    });

    console.log(newVenue);

    await newVenue.save();
    res.status(201).json({
      message:"Venue added successfully!",
      venue:newVenue
    })

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong", error });
  }
}

//get venues by id
export const getGround = async(req,res) => 
{
  try {
    
    if(!req.session.user)
    {
      return res.status(401).json({message:"Please log in!"});
    }

    const groundManagerId = req.session.user._id;

    const groundData = await Venue.find({
      ground_manager: groundManagerId,
      isDeleted: false
    }).lean();

    if(!groundData || groundData.length === 0)
    {
        return res.status(404).json(
          {
            message:"You Don't have any grounds registered!"
          }
        )
    }

    const cleanedGroundData = groundData.map(ground => {
      if (typeof ground.photo === 'string' && ground.photo === '') {
        return {
          ...ground,
          photo: null 
        };
      }
      return ground;
    });

    return res.status(200).json(
      {
        message:"Here your Ground",
        data:cleanedGroundData
      }
    )

  } catch (error) {
    console.error("Error retrieving venues:", error);
    return res.status(500).json({message:"Internal server error"});
  }
}

//update venue
export const updateVenue = async(req,res) =>
{
  try {

    console.log("Update venue request received");
    console.log("Session user:", req.session.user);
    console.log("Params:", req.params);
    console.log("Body:", req.body);
    console.log("File:", req.file);

    if(!req.session.user)
    {
      console.log("no user session returning 401");
      return res.status(401).json(
        {
          message:"Please log in"
        }
      )
    }

      const {name,price} = req.body;
      const {id} = req.params;

      console.log("Extracted data - name:", name, "price:", price);

    const venue = await Venue.findOne({ 
      _id: id, 
      ground_manager: req.session.user._id 
    });

    if(!venue) {
      console.log("Venue not found or unauthorized");
      return res.status(404).json({message:"Venue not found or unauthorized"});
    }

    const updateData = {};
    if(name) updateData.name = name;
    if(price) updateData.price = price;
    
    if(req.file) {
      updateData.photo = {
        filename: req.file.filename,
        filepath: req.file.path,
        uploadDate: new Date()
      };
    }

    console.log("Update data:", updateData);

    const updatedVenue = await Venue.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log("Update successful:", updatedVenue);

    return res.status(200).json({
      message:"Venue updated successfully",
      data: updatedVenue
    });



  } catch (error) {
    console.error("Error updating venue:", error);
    return res.status(500).json({message:"Internal server error"});
  }
}

//delete venue
export const deleteVenue = async(req,res) => 
{
  try {

    console.log("Delete request received");
    console.log("Session user:", req.session.user);
    console.log("Request params:", req.params);
    console.log("Request ID:", req.params.id);
    
    if(!req.session.user)
    {
      console.log("no user session returning 401");
      return res.status(401).json(
        {
          message:"Please log in"
        }
      )
    }

    const { id } = req.params;
    console.log("Looking for venue with ID:", id);

    const venue = await Venue.findOne({
      _id: id,
      ground_manager: req.session.user._id
    });

    if (!venue) {
      console.log("Venue not found or unauthorized");
      return res.status(404).json({ message: "Venue not found or unauthorized" });
    }

    const activeBookings = await Booking.find({ 
      venue: id, 
      date: { $gte: new Date() }, 
      status: { $in: ["pending", "confirmed"] }
    });

    if (activeBookings.length > 0) {
      console.log("Cannot delete venue with active bookings");
      return res.status(400).json({ message: "Cannot delete ground with future confirmed or pending bookings" });
    }

    await Venue.findByIdAndUpdate(id, { isDeleted: true });
    console.log("Venue deleted successfully");

    return res.status(200).json({
      message: "Venue deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting venue:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

//get bookings
export const getAllBookings = async(req,res) =>
{
  try {
    
    if(!req.session.user)
    {
      console.log("no user session returning 400");
      return res.status(400).json(
        {
          message:"Please log in"
        }
      )
    }

    const bookings = await Booking.find().populate("from");

    if(!bookings || bookings.length === 0)
    {
      return res.status(404).json({message:"Bookings not found"});
    }

    return res.status(200).json({
      message:"Bookings found!",
      data:bookings
    })

  } catch (error) {
    console.error("Error deleting venue:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

//booking status update
export const bookingStatusUpdate = async(req,res) =>
{
  const bookingId = req.params.id;
  const { status } = req.body;

  if (!["pending", "confirmed", "cancelled", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value." });
  }

  try {
    const booking = await Booking.findById(bookingId).populate('venue', 'name').populate('from', 'name email');
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    booking.status = status;
    await booking.save();

    // Create notification for the player when booking status changes
    try {
      if (status === 'confirmed') {
        await NotificationService.createBookingNotification(
          booking.from._id,
          'player',
          {
            venueName: booking.venue?.name || 'Unknown Venue',
            date: new Date(booking.date).toLocaleDateString(),
            time: `${new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} - ${new Date(booking.endTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`,
            bookingId: booking._id
          },
          'confirmed'
        );
      } else if (status === 'cancelled') {
        await NotificationService.createBookingNotification(
          booking.from._id,
          'player',
          {
            venueName: booking.venue?.name || 'Unknown Venue',
            date: new Date(booking.date).toLocaleDateString(),
            time: `${new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} - ${new Date(booking.endTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`,
            bookingId: booking._id,
            reason: 'Cancelled by ground manager'
          },
          'cancelled'
        );
      } else if (status === 'rejected') {
        await NotificationService.createBookingNotification(
          booking.from._id,
          'player',
          {
            venueName: booking.venue?.name || 'Unknown Venue',
            date: new Date(booking.date).toLocaleDateString(),
            time: `${new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} - ${new Date(booking.endTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`,
            bookingId: booking._id,
            reason: 'Rejected by ground manager'
          },
          'rejected'
        );
      }
    } catch (notificationError) {
      console.error('Failed to create booking status notification:', notificationError);
      // Don't fail the status update if notification fails
    }

    return res.status(200).json({
      message: `Booking status updated to ${status}.`,
      booking
    });
  } catch (err) {
    console.error("Error updating booking status:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
}

//get ground manager bookings
export const getVenueOwnerBookings = async (req, res) => {
  try {
    if (!req.session.user) {
      console.log("No user session returning 400");
      return res.status(400).json({
        message: "Please log in"
      });
    }

    const venueOwnerId = req.session.user._id; // Assuming venue owner ID is in session
    
    // First, find all venues owned by this venue owner
    const ownerVenues = await Venue.find({ 
      ground_manager: venueOwnerId,
      isDeleted: false 
    }).select('_id name');

    if (!ownerVenues || ownerVenues.length === 0) {
      return res.status(404).json({ 
        message: "No venues found for this owner" 
      });
    }

    // Extract venue IDs
    const venueIds = ownerVenues.map(venue => venue._id);

    // Find all bookings for these venues with detailed population
    const bookings = await Booking.find({ 
      venue: { $in: venueIds } 
    })
    .populate({
      path: 'venue',
      select: 'name location.city location.address'
    })
    .populate({
      path: 'from',
      select: 'name email mobile'
    })
    .sort({ date: -1, startTime: -1 }); // Sort by most recent

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ 
        message: "No bookings found for your venues" 
      });
    }

    // Format the response data
    const formattedBookings = bookings.map(booking => ({
      _id: booking._id,
      venue: {
        name: booking.venue.name,
        location: `${booking.venue.location.city}, ${booking.venue.location.address}`
      },
      customer: {
        name: booking.from.name,
        email: booking.from.email,
        mobile: booking.from.mobile
      },
      bookingDetails: {
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        price: booking.price,
        status: booking.status,
        paymentMethod: booking.method,
        paymentStatus: booking.isPaid
      },
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    }));

    return res.status(200).json({
      message: "Bookings found successfully!",
      totalBookings: bookings.length,
      totalVenues: ownerVenues.length,
      data: formattedBookings
    });

  } catch (error) {
    console.error("Error fetching venue owner bookings:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
};

// Create new maintenance schedule
export const createMaintenance = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Please log in" });
    }

    const {
      venueId,
      title,
      description,
      scheduledDate,
      startTime,
      endTime,
      priority,
      estimatedCost,
      assignedTo,
      notes
    } = req.body;

    // Verify the venue belongs to the ground manager
    const venue = await Venue.findOne({
      _id: venueId,
      ground_manager: req.session.user._id,
      isDeleted: false
    });

    if (!venue) {
      return res.status(404).json({ message: "Venue not found or unauthorized" });
    }

    const newMaintenance = new Maintenance({
      venue: venueId,
      ground_manager: req.session.user._id,
      title,
      description,
      scheduledDate: new Date(scheduledDate),
      startTime,
      endTime,
      priority: priority || 'medium',
      estimatedCost: estimatedCost || 0,
      assignedTo: assignedTo || '',
      notes: notes || ''
    });

    await newMaintenance.save();

    return res.status(201).json({
      message: "Maintenance scheduled successfully",
      data: newMaintenance
    });

  } catch (error) {
    console.error("Error creating maintenance:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get all maintenance schedules for a ground manager
export const getMaintenanceSchedules = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Please log in" });
    }

    const { venueId, status, startDate, endDate } = req.query;
    const groundManagerId = req.session.user._id;

    // Build query
    let query = {
      ground_manager: groundManagerId,
      isDeleted: false
    };

    if (venueId) {
      query.venue = venueId;
    }

    if (status) {
      query.status = status;
    }

    if (startDate && endDate) {
      query.scheduledDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const maintenanceSchedules = await Maintenance.find(query)
      .populate({
        path: 'venue',
        select: 'name location.city location.address'
      })
      .sort({ scheduledDate: 1, startTime: 1 });

    return res.status(200).json({
      message: "Maintenance schedules retrieved successfully",
      data: maintenanceSchedules
    });

  } catch (error) {
    console.error("Error fetching maintenance schedules:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Update maintenance status
export const updateMaintenanceStatus = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Please log in" });
    }

    const { id } = req.params;
    const { status, actualCost, notes } = req.body;

    if (!['pending', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const maintenance = await Maintenance.findOne({
      _id: id,
      ground_manager: req.session.user._id,
      isDeleted: false
    });

    if (!maintenance) {
      return res.status(404).json({ message: "Maintenance schedule not found" });
    }

    const updateData = { status };
    
    if (actualCost !== undefined) {
      updateData.actualCost = actualCost;
    }
    
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (status === 'completed') {
      updateData.completedAt = new Date();
      // If actualCost is not provided, set it to estimatedCost
      if (actualCost === undefined && maintenance.estimatedCost > 0) {
        updateData.actualCost = maintenance.estimatedCost;
      }
    }

    const updatedMaintenance = await Maintenance.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate({
      path: 'venue',
      select: 'name location.city'
    });

    return res.status(200).json({
      message: "Maintenance status updated successfully",
      data: updatedMaintenance
    });

  } catch (error) {
    console.error("Error updating maintenance status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Update maintenance details
export const updateMaintenance = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Please log in" });
    }

    const { id } = req.params;
    const updateData = req.body;

    const maintenance = await Maintenance.findOne({
      _id: id,
      ground_manager: req.session.user._id,
      isDeleted: false
    });

    if (!maintenance) {
      return res.status(404).json({ message: "Maintenance schedule not found" });
    }

    // Convert scheduledDate to Date object if provided
    if (updateData.scheduledDate) {
      updateData.scheduledDate = new Date(updateData.scheduledDate);
    }

    const updatedMaintenance = await Maintenance.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate({
      path: 'venue',
      select: 'name location.city location.address'
    });

    return res.status(200).json({
      message: "Maintenance updated successfully",
      data: updatedMaintenance
    });

  } catch (error) {
    console.error("Error updating maintenance:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete maintenance schedule
export const deleteMaintenance = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Please log in" });
    }

    const { id } = req.params;

    const maintenance = await Maintenance.findOne({
      _id: id,
      ground_manager: req.session.user._id,
      isDeleted: false
    });

    if (!maintenance) {
      return res.status(404).json({ message: "Maintenance schedule not found" });
    }

    // Soft delete
    await Maintenance.findByIdAndUpdate(id, { isDeleted: true });

    return res.status(200).json({
      message: "Maintenance schedule deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting maintenance:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get maintenance statistics
export const getMaintenanceStats = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Please log in" });
    }

    const groundManagerId = req.session.user._id;

    // Convert string ID to ObjectId if needed
    const objectId = mongoose.Types.ObjectId.isValid(groundManagerId) 
      ? new mongoose.Types.ObjectId(groundManagerId) 
      : groundManagerId;

    const stats = await Maintenance.aggregate([
      {
        $match: {
          ground_manager: objectId,
          isDeleted: false
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalCost: { $sum: '$actualCost' }
        }
      }
    ]);

    const totalMaintenance = await Maintenance.countDocuments({
      ground_manager: objectId,
      isDeleted: false
    });

    const totalEstimatedCost = await Maintenance.aggregate([
      {
        $match: {
          ground_manager: objectId,
          isDeleted: false
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$estimatedCost' }
        }
      }
    ]);

    const totalActualCost = await Maintenance.aggregate([
      {
        $match: {
          ground_manager: objectId,
          isDeleted: false
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$actualCost' }
        }
      }
    ]);


    return res.status(200).json({
      message: "Maintenance statistics retrieved successfully",
      data: {
        totalMaintenance,
        statusBreakdown: stats,
        totalEstimatedCost: totalEstimatedCost[0]?.total || 0,
        totalActualCost: totalActualCost[0]?.total || 0
      }
    });

  } catch (error) {
    console.error("Error fetching maintenance stats:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get payment statistics for ground manager
export const getPaymentStats = async (req, res) => {
  try {
    console.log('Payment stats request received');
    console.log('Session user:', req.session.user);
    
    if (!req.session.user) {
      console.log('No user session found');
      return res.status(401).json({ message: "Please log in" });
    }

    const groundManagerId = req.session.user._id;
    console.log('Ground manager ID:', groundManagerId);

    // Get all venues owned by this ground manager
    const venues = await Venue.find({
      ground_manager: groundManagerId,
      isDeleted: false
    }).select('_id');

    const venueIds = venues.map(venue => venue._id);

    if (venueIds.length === 0) {
      return res.status(200).json({
        message: "No venues found",
        data: {
          totalRevenue: 0,
          completedPayments: 0,
          pendingPayments: 0,
          failedPayments: 0
        }
      });
    }

    // Get payment statistics
    const paymentStats = await Booking.aggregate([
      {
        $match: {
          venue: { $in: venueIds }
        }
      },
      {
        $group: {
          _id: '$isPaid',
          count: { $sum: 1 },
          totalAmount: { $sum: '$price' }
        }
      }
    ]);

    // Calculate stats
    let totalRevenue = 0;
    let completedPayments = 0;
    let pendingPayments = 0;
    let failedPayments = 0;

    paymentStats.forEach(stat => {
      const status = stat._id?.toLowerCase();
      if (status === 'paid') {
        completedPayments = stat.totalAmount;
        totalRevenue += stat.totalAmount;
      } else if (status === 'not-paid' || status === 'notpaid') {
        pendingPayments = stat.totalAmount;
      } else if (status === 'failed') {
        failedPayments = stat.totalAmount;
      }
    });

    return res.status(200).json({
      message: "Payment statistics retrieved successfully",
      data: {
        totalRevenue,
        completedPayments,
        pendingPayments,
        failedPayments
      }
    });

  } catch (error) {
    console.error("Error fetching payment stats:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get recent transactions for ground manager
export const getRecentTransactions = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Please log in" });
    }

    const groundManagerId = req.session.user._id;
    const { status, limit = 10 } = req.query;

    // Get all venues owned by this ground manager
    const venues = await Venue.find({
      ground_manager: groundManagerId,
      isDeleted: false
    }).select('_id name');

    const venueIds = venues.map(venue => venue._id);

    if (venueIds.length === 0) {
      return res.status(200).json({
        message: "No venues found",
        data: []
      });
    }

    // Build query
    let query = { venue: { $in: venueIds } };
    if (status) {
      query.isPaid = status;
    }

    // Get recent transactions
    const transactions = await Booking.find(query)
      .populate({
        path: 'venue',
        select: 'name'
      })
      .populate({
        path: 'from',
        select: 'name email'
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Format transactions
    const formattedTransactions = transactions.map(transaction => {
      // Normalize payment status
      let normalizedStatus = transaction.isPaid;
      if (transaction.isPaid?.toLowerCase() === 'paid') {
        normalizedStatus = 'Paid';
      } else if (transaction.isPaid?.toLowerCase() === 'not-paid' || transaction.isPaid?.toLowerCase() === 'notpaid') {
        normalizedStatus = 'Not-paid';
      } else if (transaction.isPaid?.toLowerCase() === 'failed') {
        normalizedStatus = 'Failed';
      }

      return {
        _id: transaction._id,
        transactionId: `#TRX-${transaction._id.toString().slice(-4)}`,
        customer: transaction.from.name,
        venue: transaction.venue.name,
        date: transaction.date,
        amount: transaction.price,
        paymentMethod: transaction.method,
        status: normalizedStatus,
        createdAt: transaction.createdAt
      };
    });

    return res.status(200).json({
      message: "Recent transactions retrieved successfully",
      data: formattedTransactions
    });

  } catch (error) {
    console.error("Error fetching recent transactions:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get monthly revenue data for charts
export const getMonthlyRevenue = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Please log in" });
    }

    const groundManagerId = req.session.user._id;
    const { year = new Date().getFullYear() } = req.query;

    // Get all venues owned by this ground manager
    const venues = await Venue.find({
      ground_manager: groundManagerId,
      isDeleted: false
    }).select('_id');

    const venueIds = venues.map(venue => venue._id);

    if (venueIds.length === 0) {
      return res.status(200).json({
        message: "No venues found",
        data: {
          months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          revenues: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        }
      });
    }

    // Get monthly revenue data
    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          venue: { $in: venueIds },
          isPaid: { $in: ['Paid', 'paid'] },
          date: {
            $gte: new Date(`${year}-01-01`),
            $lt: new Date(`${year + 1}-01-01`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$date' },
          totalRevenue: { $sum: '$price' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Create array for all 12 months
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revenues = new Array(12).fill(0);

    // Fill in the actual revenue data
    monthlyRevenue.forEach(item => {
      revenues[item._id - 1] = item.totalRevenue;
    });

    return res.status(200).json({
      message: "Monthly revenue data retrieved successfully",
      data: {
        months,
        revenues
      }
    });

  } catch (error) {
    console.error("Error fetching monthly revenue:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get ground manager profile
export const getProfile = async (req, res) => {
  try {
    console.log('Profile request received');
    console.log('Session user:', req.session.user);
    
    if (!req.session.user) {
      console.log('No user session found');
      return res.status(401).json({ message: "Please log in" });
    }

    const groundManagerId = req.session.user._id;
    console.log('Ground manager ID:', groundManagerId);

    // Get user profile data
    const user = await User.findById(groundManagerId).select('-password');
    console.log('User found:', user);
    
    if (!user) {
      console.log('User not found in database');
      return res.status(404).json({ message: "User not found" });
    }

    // Get statistics
    const venues = await Venue.find({
      ground_manager: groundManagerId,
      isDeleted: false
    });

    const venueIds = venues.map(venue => venue._id);

    // Get booking statistics
    const totalBookings = await Booking.countDocuments({
      venue: { $in: venueIds }
    });

    // Get revenue statistics
    const revenueStats = await Booking.aggregate([
      {
        $match: {
          venue: { $in: venueIds },
          isPaid: { $in: ['Paid', 'paid'] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$price' }
        }
      }
    ]);

    const totalRevenue = revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;

    // Get maintenance statistics
    const maintenanceStats = await Maintenance.countDocuments({
      ground_manager: groundManagerId,
      isDeleted: false
    });

    const profileData = {
      _id: user._id,
      name: user.name || 'Not provided',
      email: user.email || 'Not provided',
      mobile: user.mobile || 'Not provided',
      status: user.status || 'Active',
      profileImage: user.profileImage || '',
      certifications: user.certifications || [],
      createdAt: user.createdAt,
      totalGrounds: venues.length,
      totalBookings: totalBookings,
      totalRevenue: totalRevenue,
      totalMaintenance: maintenanceStats,
      rating: 4.5 // Default rating, can be calculated from reviews later
    };

    console.log('Profile data prepared:', profileData);

    return res.status(200).json({
      message: "Profile retrieved successfully",
      data: profileData
    });

  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Update ground manager profile
export const updateProfile = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Please log in" });
    }

    const groundManagerId = req.session.user._id;
    const { name, email, mobile } = req.body;

    // Check if email or mobile already exists for another user
    if (email || mobile) {
      const existingUser = await User.findOne({
        _id: { $ne: groundManagerId },
        $or: [
          ...(email ? [{ email }] : []),
          ...(mobile ? [{ mobile }] : [])
        ]
      });

      if (existingUser) {
        return res.status(400).json({ 
          message: "Email or mobile number already exists" 
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (mobile) updateData.mobile = mobile;
    
    if (req.file) {
      updateData.profileImage = req.file.filename;
    }

    const updatedUser = await User.findByIdAndUpdate(
      groundManagerId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      data: updatedUser
    });

  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};