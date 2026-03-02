import Equipment from '../models/equipment.js'
import Rental from '../models/rental.js'
import Venue from '../models/Venue.js'
import User from '../models/Users.js'

//add new equipment
export const addEquipment = async(req,res) => 
{
    try {
        
        const {item,serialNo,quantity,price} = req.body;

        if(!req.session.user)
        {
            return res.status(400).json(
                {
                    message:"Please log In"
                }
            )
        }

        const newEquipment = new Equipment({

            item:item,
            serialNo:serialNo,
            status:"available",
            image:req.file.filename,
            quantity:quantity,
            price:price,
            isDeleted:false
        });

        console.log(newEquipment);
        
        await newEquipment.save();

        return res.status(200).json(
            {
                message:"New Item Added successfully"
            }
        )

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Internal error occured!"
        })
    }
}

//get all equipments
export const getAllEquipments = async(req,res) => 
{
    try {
        console.log("Getting all equipments...");
        console.log("Session user:", req.session.user);
        
    // Temporarily bypass session check for testing
    console.log("Session check - User:", req.session.user);
    console.log("Session ID:", req.sessionID);
    console.log("Request cookies:", req.headers.cookie);
    
    // if(!req.session.user)
    // {
    //   console.log("No user session found");
    //   console.log("Session object:", req.session);
    //   console.log("Session ID:", req.sessionID);
    //   console.log("Request headers:", req.headers);
    //   console.log("Request cookies:", req.headers.cookie);
    //   return res.status(401).json({message:"Please log in!"});
    // }
    
    // console.log("User session found:", req.session.user);
    // console.log("Session ID:", req.sessionID);

    const equipments = await Equipment.find({isDeleted:false});
    console.log("Found equipments:", equipments.length);
    console.log("Equipment data:", equipments);

    // Always return 200, even if no equipments found
    return res.status(200).json({
        message: equipments.length > 0 ? "Found Equipments" : "No equipments found",
        data: equipments || []
    });

    } catch (error) {
        
        console.error("Error retrieving equipments:", error);
        return res.status(500).json({message:"Internal server error"});

    }
}

//update equipment
export const updateEquipment = async(req,res) =>
{
    try {

    if(!req.session.user)
    {
      console.log("no user session returning 401");
      return res.status(401).json(
        {
          message:"Please log in"
        }
      )
    }
        
        const {id} = req.params;
        const {quantity,price,status} = req.body;


        const equipment = await Equipment.findOne({
            _id:id
        });

        if(!equipment)
        {
             return res.status(404).json({message:"Equipment not found or unauthorized"});
        }

        const updatedEquipment = await Equipment.findByIdAndUpdate(
            id,
            { quantity, price, status },  
            { new: true }
        );

        if(!updatedEquipment)
        {
            return res.status(400).json({
                message:"Equipment not updated!"
            })
        }

        return res.status(200).json({
            message:"equipment Updated"
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message:"Internal server error"
        })
    }
}

//delete equipment
export const deleteEquipment = async(req,res) => 
{
    try {

    if(!req.session.user)
    {
      console.log("no user session returning 401");
      return res.status(401).json(
        {
          message:"Please log in"
        }
      )
    }
        
    const {id} = req.params;

        const equipment = await Equipment.findOne({
            _id:id
        });

        if(!equipment)
        {
             return res.status(404).json({message:"Equipment not found or unauthorized"});
        }

        const deletedEquipment = await Equipment.findByIdAndUpdate(id,{isDeleted:true},{new:true});

        if(!deletedEquipment)
        {
            return res.status(400).json({message:"Equipment Not deleted"});
        }

        return res.status(200).json({
            message:"equipment deleted successfully"
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message:"Internal server error"
        })
    }
}

//get all rentals
export const getAllRentals = async(req,res) =>
{
    try {
        
        if(!req.session.user)
        {
            console.log("no user session returning 401");
            return res.status(401).json(
                {
                message:"Please log in"
                }
            )
        }

        const rentals = await Rental.find().populate("equipment").populate("user");

        if(!rentals || rentals.length === 0)
        {
            return res.status(404).json({
                message:"rentals not found"
            })
        }

        const validRentals = rentals.filter(r => r.equipment && r.user);

        if(validRentals.length === 0) {
            return res.status(404).json({ message:"No valid rentals found" });
        }

        return res.status(200).json({
            message:"found rentals",
            data: validRentals
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message:"Internal server error"
        })
    }
}

//get all ground manager
export const getAllGroundManagers = async (req, res) => {
  try {
    console.log("Getting all ground managers...");
   
    // Filter by both role and SP_type as mentioned by user
    const managers = await User.find({ 
      role: "service_provider", 
      SP_type: "venue_owner", 
      isDeleted: false 
    });
    console.log("Found ground managers:", managers.length);

    
    const data = await Promise.all(
      managers.map(async (manager) => {
        const venue = await Venue.findOne({ ground_manager: manager._id, isDeleted: false });
        return {
          _id: manager._id,
          name: manager.name,
          email: manager.email,
          mobile: manager.mobile,
          status: manager.status,
          venue: venue ? venue.name : "Not Assigned",
        };
      })
    );

    console.log("Processed data:", data);
    res.status(200).json({ success: true, managers: data });
  } catch (error) {
    console.error("Error in getAllGroundManagers:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};


//add new ground manager
export const addManager = async (req, res) => {
  try {
    const { name, email, mobile, password, role, SP_type, status } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email },
        { mobile: mobile }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "User with this email or mobile number already exists" 
      });
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      mobile,
      password,
      role: role || 'service_provider',
      SP_type: SP_type || 'venue_owner',
      status: status || 'pending',
      isDeleted: false
    });

    await newUser.save();

    res.status(201).json({ 
      success: true, 
      message: "Ground manager added successfully",
      manager: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        mobile: newUser.mobile,
        status: newUser.status
      }
    });
  } catch (error) {
    console.error("Error adding manager:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: error.message 
    });
  }
};

//update groundm manager status
export const updateManagerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedManager = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedManager) {
      return res.status(404).json({ success: false, message: "Manager not found" });
    }

    res.json({ success: true, manager: updatedManager });
  } catch (error) {
    console.error("Error updating manager status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//get all venues
export const getAllVenues = async (req, res) => {
  try {
    console.log("Getting all venues...");
    console.log("Session user:", req.session.user);
    
    if (!req.session.user) {
      console.log("No user session found");
      return res.status(401).json({ message: "Please log in!" });
    }

    const venues = await Venue.find({ isDeleted: false })
      .populate('ground_manager', 'name email mobile')
      .select('name location price status facilities photo ground_manager createdAt');

    console.log("Found venues:", venues.length);

    if (!venues || venues.length === 0) {
      return res.status(404).json({
        message: "No venues found!"
      });
    }

    return res.status(200).json({
      message: "Found Venues",
      data: venues
    });

  } catch (error) {
    console.error("Error retrieving venues:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//update venue pricing
export const updateVenuePricing = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Please log in!" });
    }

    const { id } = req.params;
    const { price, status } = req.body;

    const venue = await Venue.findOne({ _id: id, isDeleted: false });

    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    const updateData = {};
    if (price !== undefined) updateData.price = price;
    if (status) updateData.status = status;

    const updatedVenue = await Venue.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedVenue) {
      return res.status(400).json({
        message: "Venue not updated!"
      });
    }

    return res.status(200).json({
      message: "Venue pricing updated successfully",
      data: updatedVenue
    });

  } catch (error) {
    console.error("Error updating venue pricing:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};