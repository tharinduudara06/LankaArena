import express, { text } from 'express'
import User from '../models/Users.js'
import nodemailer from 'nodemailer'
import Booking from '../models/bookings.js'
import Venue from '../models/Venue.js'

const from_email = 'pasinduh84@gmail.com';
const App_pass = 'oylo ganv vrhp yimo';

const transporter = nodemailer.createTransport({
    service:'gmail',
    auth:
    {
        user:from_email,
        pass:App_pass
    }
});

export const insertUsers = async (req, res) => {

    
    const { name, email, mobile, password, role, SP_type, status } = req.body;

    try {

        const isUser = await User.findOne(
            {
                $or:
                    [
                        {
                            email: email,
                            mobile: mobile
                        }
                    ]
            }
        );

        if (isUser) {
            return res.status(400).json(
                {
                    msg: "Account already exists!"
                }
            )
        }

        const newUser = new User(
            {
                name,
                email,
                mobile,
                password,
                role,
                SP_type,
                status,
                isDeleted: false
            }
        );

        await newUser.save();

        const mailOptions = {
            from: from_email,
            to: email,
            subject: "Account Registered",
            text:`Your Account has been created!
            Your password is ${password}
            Please update Your password!`
        }

        transporter.sendMail(mailOptions,(error, info)=>{
            if(error)
            {
                console.error('Error sending email: ', error);
                return res.status(500).json({
                    message: 'Failed to send Email'
                });
            }

            return res.status(200).json({
                message: 'Email sent successfully!'
            });
        })

        return res.status(200).json(
            {
                msg: "Account created Successfully!"
            }
        )

    } catch (error) {
        return res.status(500).json(
            {
                msg:"Something went Wrong!"
            }
        )
    }
}

//all users
export const allUsers = async(req,res) =>
{
    try {
        
        const users = await User.find({isDeleted:false});

        if(!users)
        {
            return res.status(404).json({
                message:"Users Not Found"
            })
        }

        return res.status(200).json(
            {
                data:users
            }
        )

    } catch (error) {
        return res.status(500).json({
            msg:"Something went Wrong!"
        })
    }
}

//update user
export const updateUser = async(req,res) => 
{
    try {
        
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {new:true});

        if(!updateUser)
        {
            return res.status(400).json({ msg:"User not updated" });
        }

        return res.status(200).json({ success: true, data: updatedUser });

    } catch (error) {
        res.status(500).json({ success: false, message: err.message });
    }
}

//delete user
export const deleteUser = async(req,res) => 
{
    try {
        const deletedUser = await User.findByIdAndUpdate(req.params.id,{isDeleted:true},{new:true});
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
}

//get all bookings
export const getAllBookings = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    const bookings = await Booking.find()
      .populate("from")
      .populate({
        path: "venue",
        populate: { path: "ground_manager", select: "name" }
      });

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({
        message: "Bookings not found"
      });
    }

    // Collect all manager names
    const managerNames = bookings.map(b => b.venue?.ground_manager?.name || "Unknown");

    return res.status(200).json({
      message: "Bookings found",
      data: bookings,
      managerNames
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

//fetch all the ground bookings
export const venueBookings = async(req,res) =>
{

   try {
    const venues = await Venue.find({ isDeleted: false })
      .populate('ground_manager', 'name email') 
      .select('name location status') 
      .lean();

    // Get booking counts for each venue
    const venuesWithBookings = await Promise.all(
      venues.map(async (venue) => {
        
        const bookingsCount = await Booking.countDocuments({
          venue: venue._id,
          
        });

        return {
          _id: venue._id,
          name: venue.name,
          location: `${venue.location.city}, ${venue.location.address}`,
          status: venue.status,
          bookings: `${bookingsCount}`
        };
      })
    );

    if(!venueBookings)
    {
        return res.status(404).json({message:"Bookings not found!"});
    }

    return res.status(200).json(
        {
            message:"Found",
            data:venuesWithBookings
        });

  } catch (error) {
    console.error('Error fetching venues:', error);
    res.status(500).json({ error: 'Failed to fetch venues' });
  }

}