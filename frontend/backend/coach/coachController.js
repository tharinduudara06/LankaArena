import User from '../models/Users.js'
import Player from '../models/player.js';
import Team from '../models/team.js'
import mongoose from 'mongoose';
import PDFDocument from "pdfkit";
import Schedule from '../models/schedule.js';
import Venue from '../models/Venue.js';
import Booking from '../models/bookings.js';
import Match from '../models/matche.js';
import fs from "fs";
import path from "path";
import NotificationService from '../services/notificationService.js';

// Register a new coach
export const registerCoach = async (req, res) => {
    try {
        const { name, email, mobile, password } = req.body;
        
        // Check if user already exists
        const existUser = await User.findOne({
            $or: [
                { email: email },
                { mobile: mobile }
            ]
        });

        if (existUser) {
            return res.status(400).json({
                message: "User with this email or mobile already exists!"
            });
        }

        // Handle file uploads
        let certificationFiles = [];
        if (req.files && req.files.length > 0) {
            certificationFiles = req.files.map(file => ({
                filename: file.filename,
                originalName: file.originalname,
                path: file.path
            }));
        }

        // Create new coach
        const newCoach = new User({
            name,
            email,
            mobile,
            password, 
            role: 'service_provider',
            SP_type: 'coach',
            status: 'pending',
            certifications: certificationFiles,
            isDeleted: false
        });

        await newCoach.save();

        res.status(201).json({
            message: 'Coach registration submitted successfully! Waiting for approval.',
            coach: {
                id: newCoach._id,
                name: newCoach.name,
                email: newCoach.email,
                status: newCoach.status
            }
        });

    } catch (error) {
        console.error('Error registering coach:', error);
        res.status(500).json({
            message: 'Server error during registration'
        });
    }
};

// Get all coaches (for admin)
export const getAllCoaches = async (req, res) => {
    try {
        const coaches = await User.find({ 
            role: 'service_provider', 
            SP_type: 'coach' 
        }).select('-password');
        
        res.status(200).json(coaches);
    } catch (error) {
        console.error('Error fetching coaches:', error);
        res.status(500).json({
            message: 'Server error fetching coaches'
        });
    }
};

//coach add a new team
export const addTeam = async(req,res) => 
{
    try {
        
        if(!req.session.user)
        {
            return res.status(400).json({
                message:"please log In"
            })
        }

        const {name,sport,won} = req.body;

        
        let uniformPhotos = [];
        if (req.files && req.files.length > 0) {
            uniformPhotos = req.files.map(file => file.filename);
        }

        const coachId = req.session.user._id;

        const newTeam = new Team({
            name:name,
            sport:sport,
            won:won,
            coach:coachId,
            uniformImage:uniformPhotos
        })

        console.log(newTeam);

        await newTeam.save();

        return res.status(201).json({
            message:"Team added successfully!",
            team:newTeam
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message:"Internal server error"
        })
    }
}

//get all teams by coach id
export const getTeam = async(req,res) => 
{
    try {

        console.log("Session object:", req.session);
        
        if(!req.session.user)
        {
            return res.status(400).json({
                message:"please log In"
            })
        }

        const coachId = req.session.user._id;
        console.log("Coach ID for teams:", coachId);

        const teams = await Team.find({coach: coachId});
        console.log("Found teams:", teams.length);
        console.log("Teams:", teams);

        if(!teams || teams.length === 0)
        {
            return res.status(200).json({
                message:"You don't have a team..Please add a team",
                data: []
            })
        }

        return res.status(200).json({
            message:"your teams",
            data:teams
        });

    } catch (error) {
        console.error("Error in getTeam:", error);
        return res.status(500).json({
            message:"Internal server error"
        })
    }
}

//update team name
export const edit_team_name = async(req,res) => 
{
    try {
        
        if(!req.session.user)
        {
            return res.status(400).json({
                message:"please log In"
            })
        }

        const {name} = req.body;
        const{id} = req.params;

        const updatedName = await Team.findByIdAndUpdate(
            id, 
            {name},
            {new:true}
        )

        if(!updatedName)
        {
            return res.status(404).json({
                message:"NOt Updated"
            })
        }

        return res.status(200).json({
            message:"Name Updated",
            updatedName,
        })

    } catch (error) {
        return res.status(500).json({
            message:"Internal sever error"
        })
    }
}

//delet team
export const delete_team = async(req,res) =>
{
    try {

        if(!req.session.user)
        {
            return res.status(400).json({
                message:"please log In"
            })
        }
        
        const {id} = req.params;

        const deletedTeam = await Team.findByIdAndDelete({ _id: id });
        const deleteTeamPlayers = await Player.deleteMany({ team:id });

        if(!deletedTeam || !deleteTeamPlayers)
        {
            return res.status(404).json({
                message:"Not deleted"
            })
        }

        return res.status(200).json({
            message:"Deleted successfully"
        })


    } catch (error) {
        return res.status(500).json({
            message:"Internal sever error"
        })
    }
}

//get-player-by-email
export const getPlayerByEmail = async(req,res) =>
{
    try {
        
        const email = req.params.email;

        console.log(email);

        const player = await User.findOne({ email , isDeleted: false, role: 'player' }).select('-password');

        if (!player) return res.json({ player: null });
        res.json({ player });

    } catch (error) {
        
    }
}

//add-player-to-team
export const add_player_to_team = async(req,res) => 
{
    try {

        if(!req.session.user)
        {
            return res.status(401).json({
                message:"please log In"
            })
        }
        
        const {playerId,teamId} = req.body;

        if(!playerId || !teamId)
        {
            return res.status(404).json({
                message:"User not found"
            })
        }

        const existingPlayer = await Player.findOne({ 
            playerid: playerId, 
            team: teamId 
        });

        if (existingPlayer) {
            return res.status(400).json({
                message: "Player is already in this team"
            });
        }

        const newPlayer = new Player({

            playerid:playerId,
            jersey:'N/A',
            position:'Unknown',
            age:0,
            height:0.0,
            weight:0.0,
            team:teamId
        });

        await newPlayer.save();

        const updatedTeam = await Team.findByIdAndUpdate(
            teamId,
            { $push: { player: playerId } },
            { new: true }
        )

         return res.status(200).json({
            message: "Player added to team successfully",
            player: newPlayer,
            team: updatedTeam
        });

    } catch (error) {
         console.error(error);
        return res.status(500).json({ message: "Error adding player to team", error });
    }
}

//get players by team id
export const get_team_players = async(req,res) => 
{
    try {

        if(!req.session.user)
        {
            return res.status(400).json({
                message:"please log In"
            })
        }
        
        const {teamId} = req.params;

        console.log('teamId received:', teamId);

        const teamObjectId = new mongoose.Types.ObjectId(teamId);

        const players = await Player.find({ team: teamObjectId })
        .populate({
            path: 'playerid',
            match: { isDeleted: false },
            select: 'name email'
        })
        .then(players => players.filter(player => player.playerid !== null));

        if (!players || players.length === 0) {
            return res.status(404).json({ message: "No players found for this team" });
        }

        const result = players.map(p => ({
            id: p._id,
            name: p.playerid.name,
            email: p.playerid.email,
            jersey: p.jersey,
            position: p.position,
            age: p.age,
            height: p.height,
            weight: p.weight,
        }));

         return res.status(200).json({
            message: "Players found",
            data: result
        }); 

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", error });
    }
}

//edit player
export const editPlayer = async(req,res) =>
{
    try {
        
        const {id} = req.params;
        const {jersey,position,age,height,weight} = req.body;

        const updatedPlayer = await Player.findByIdAndUpdate(id,
            {
                jersey:jersey,
                position:position,
                age:age,
                height:height,
                weight:weight
            },
            {
                new:true
            });

            if(!updatedPlayer)
            {
                return res.status(404).json({
                    message:"Update failed"
                })
            }

            return res.status(200).json({
                message:"Update Successfull"
            })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error adding player to team", error });
    }
}

//delete player
export const deletePlayer = async (req, res) => {
  const playerId = req.params.playerId;

  try {
    
    const player = await Player.findById(playerId);
    if (!player) return res.status(404).json({ message: "Player not found" });

   
    await Team.findByIdAndUpdate(player.team, {
      $pull: { player: player.playerid } 
    });

    
    await Player.findByIdAndDelete(playerId);

    res.status(200).json({ message: "Player deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//uniform order
export const uniformOrder = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(400).json({ message: "Please log in" });
    }

    const { teamId, players } = req.body;

    if (!req.files || !req.files.frontDesign || !req.files.backDesign) {
      return res.status(400).json({
        message: "Both front and back images are required",
      });
    }

    const frontImage = `/uploads/${req.files.frontDesign[0].filename}`;
    const backImage = `/uploads/${req.files.backDesign[0].filename}`;

    // Save images in the team document
    const updatedTeam = await Team.findByIdAndUpdate(
      teamId,
      { $set: { uniformImage: [frontImage, backImage] } },
      { new: true }
    );

    if (!updatedTeam) {
      return res.status(404).json({ message: "Team not found" });
    }

    const playersData = JSON.parse(players || '[]');

    // Generate PDF in memory
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Set response headers to download PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=uniform_order_${Date.now()}.pdf`);

    // Pipe PDF directly to response
    doc.pipe(res);

    doc.fontSize(20).text(`Uniform Order - Team: ${updatedTeam.name}`, { underline: true });
    doc.moveDown();

    doc.fontSize(14);
    playersData.forEach((player, index) => {
      doc.text(
        `${index + 1}. ${player.playerName} | Jersey: ${player.jerseyNumber} | Size: ${player.size} | Sleeve: ${player.sleeve} | Qty: ${player.quantity}`
      );
    });

    doc.end(); // finalize PDF
  } catch (error) {
    console.error("Error in uniformOrder:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//schedule session
export const scheduleSession = async (req, res) => {

try {
    const { title, date, startTime, endTime, location, notes } = req.body;

    if (!req.session.user) {
      return res.status(401).json({ message: 'Please log in' });
    }

    if (!title || !date || !startTime || !endTime || !location) {
      return res.status(400).json({ message: 'All required fields must be filled' });
    }

    // Parse location to get venue name and booking ID
    const [venueName, bookingId] = location.split('|');
    
    // Find the specific booking by ID
    const confirmedBooking = await Booking.findOne({
      _id: bookingId,
      from: req.session.user._id,
      status: 'confirmed'
    });

    if (!confirmedBooking) {
      return res.status(403).json({ 
        message: 'You can only schedule sessions at venues you have confirmed bookings for. Please book a ground first.' 
      });
    }

    // Get venue details
    const venue = await Venue.findById(confirmedBooking.venue);
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    // Validate that the session date matches the booking date
    const sessionDate = new Date(date);
    const bookingDate = new Date(confirmedBooking.date);

    if (sessionDate.toDateString() !== bookingDate.toDateString()) {
      return res.status(400).json({ 
        message: `Session date must match your booking date (${bookingDate.toLocaleDateString()})` 
      });
    }

    // Validate that the session time falls within the booked time slots
    const sessionStartTime = new Date(`${date}T${startTime}`);
    const sessionEndTime = new Date(`${date}T${endTime}`);
    const bookingStartTime = new Date(confirmedBooking.startTime);
    const bookingEndTime = new Date(confirmedBooking.endTime);

    // Check if session time is within the booked time slot
    if (sessionStartTime < bookingStartTime || sessionEndTime > bookingEndTime) {
      return res.status(400).json({ 
        message: `Session time must be within your booked time slot (${bookingStartTime.toLocaleTimeString()} - ${bookingEndTime.toLocaleTimeString()})` 
      });
    }

    // Create schedule document
    const newSession = new Schedule({
      coachid: req.session.user._id,
      title,
      date: new Date(date),
      startTime: new Date(`${date}T${startTime}`),
      endTime: new Date(`${date}T${endTime}`),
      venueid: venue._id,
      notes
    });

    await newSession.save();

    // Get team players to notify them about the training session
    const teamData = await Team.findById(confirmedBooking.from).populate('player');
    
    if (teamData && teamData.player && teamData.player.length > 0) {
      // Notify all players in the team about the new training session
      for (const playerId of teamData.player) {
        try {
          await NotificationService.createTrainingNotification(
            playerId,
            'player',
            {
              coachName: req.session.user.name || 'Coach',
              date: new Date(date).toLocaleDateString(),
              time: `${startTime} - ${endTime}`,
              venue: venue.name,
              sessionId: newSession._id
            },
            'scheduled'
          );
        } catch (notificationError) {
          console.error('Failed to create training session notification for player:', playerId, notificationError);
        }
      }
    }

    res.status(200).json({ message: 'Session scheduled successfully', data: newSession });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }

}

//get session by date
export const getSessionByDate = async(req,res) =>{

    try {
    if (!req.session.user) return res.status(401).json({ message: "Not logged in" });

    const { date } = req.params;
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const sessions = await Schedule.find({
      coachid: req.session.user._id,
      date: { $gte: start, $lte: end },
      isDeleted: false
    }).populate('venueid');

    res.status(200).json({ data: sessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

//get all sessions for coach

export const getCoachSessions = async (req, res) => {
  try {
    const coachId = req.session.user._id; // or req.params.coachId if passed in URL

    if (!coachId) {
      return res.status(401).json({ message: "Coach not authenticated" });
    }

    // Fetch all sessions for this coach, excluding deleted ones
    const sessions = await Schedule.find({ coachid: coachId, isDeleted: false })
      .populate("venueid", "name location") // populate only name & location
      .sort({ date: 1, startTime: 1 }); // sort by date and start time

    return res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//delete any session
export const deleteSession = async (req, res) => {
  try {
    const sessionId = req.params.id;

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    // Remove session from DB
    const deletedSession = await Schedule.findByIdAndDelete(sessionId);

    if (!deletedSession) {
      return res.status(404).json({ message: "Session not found" });
    }

    return res.status(200).json({ success: true, message: "Session deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get all available grounds for coaches
export const getAllAvailableGrounds = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Please log in" });
    }

    // Get all available grounds (not deleted)
    const grounds = await Venue.find({ 
      isDeleted: false,
      status: 'active'
    }).populate("ground_manager", "mobile name email");

    console.log("Found grounds:", grounds.length);

    if (!grounds || grounds.length === 0) {
      return res.status(404).json({
        message: "No grounds available",
        data: []
      });
    }

    return res.status(200).json({
      message: "Available grounds retrieved successfully",
      data: grounds
    });

  } catch (error) {
    console.error("Error in getAllAvailableGrounds:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get coach's booked grounds
export const getCoachBookedGrounds = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Please log in" });
    }

    const coachId = req.session.user._id;
    console.log("Coach ID:", coachId);

    // Get all bookings for this coach (both confirmed and pending)
    const bookings = await Booking.find({
      from: coachId,
      status: { $in: ['confirmed', 'pending'] }
    }).populate('venue', 'name location price');

    console.log("Found bookings:", bookings.length);
    console.log("Bookings:", bookings);

    if (!bookings || bookings.length === 0) {
      return res.status(200).json({
        message: "No booked grounds found. Please book a ground first.",
        data: []
      });
    }

    return res.status(200).json({
      message: "Booked grounds retrieved successfully",
      data: bookings
    });

  } catch (error) {
    console.error("Error in getCoachBookedGrounds:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get suggested opponent teams based on age similarity
export const getSuggestedOpponents = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Please log in" });
    }

    const { teamId } = req.params;

    if (!teamId) {
      return res.status(400).json({ message: "Team ID is required" });
    }

    // Get the selected team's players and calculate average age
    const teamPlayers = await Player.find({ team: teamId }).populate('playerid', 'name');
    
    if (!teamPlayers || teamPlayers.length === 0) {
      return res.status(404).json({ message: "No players found in this team" });
    }

    // Calculate average age
    const totalAge = teamPlayers.reduce((sum, player) => sum + (player.age || 0), 0);
    const averageAge = totalAge / teamPlayers.length;

    // Find other teams with similar average age (±2 years)
    const allTeams = await Team.find({
      coach: { $ne: req.session.user._id } // Exclude coach's own teams
    }).populate('coach', 'name');

    const suggestedTeams = [];

    for (const team of allTeams) {
      const teamPlayers = await Player.find({ team: team._id });
      if (teamPlayers.length > 0) {
        const teamTotalAge = teamPlayers.reduce((sum, player) => sum + (player.age || 0), 0);
        const teamAverageAge = teamTotalAge / teamPlayers.length;
        
        // Check if age difference is within ±2 years
        if (Math.abs(teamAverageAge - averageAge) <= 2) {
          suggestedTeams.push({
            _id: team._id,
            name: team.name,
            sport: team.sport,
            averageAge: teamAverageAge.toFixed(1),
            coachName: team.coach.name
          });
        }
      }
    }

    return res.status(200).json({
      message: "Suggested opponents retrieved successfully",
      data: suggestedTeams,
      selectedTeamAverageAge: averageAge.toFixed(1)
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Search teams by name
export const searchTeams = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Please log in" });
    }

    const { searchTerm } = req.query;

    if (!searchTerm || searchTerm.trim() === '') {
      return res.status(400).json({ message: "Search term is required" });
    }

    // Search for teams by name (excluding coach's own teams)
    const teams = await Team.find({
      name: { $regex: searchTerm, $options: 'i' },
      coach: { $ne: req.session.user._id }
    }).populate('coach', 'name');

    const teamResults = teams.map(team => ({
      _id: team._id,
      name: team.name,
      sport: team.sport,
      coachName: team.coach.name
    }));

    return res.status(200).json({
      message: "Teams found",
      data: teamResults
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Create a new match
export const createMatch = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Please log in" });
    }

    const { myTeam, opponentTeam, matchDate, startTime, endTime, ground, notes } = req.body;

    // Validate required fields
    if (!myTeam || !opponentTeam || !matchDate || !startTime || !endTime || !ground) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    // Verify that the team belongs to the coach
    const team = await Team.findOne({ _id: myTeam, coach: req.session.user._id });
    if (!team) {
      return res.status(403).json({ message: "You can only schedule matches for your own teams" });
    }

    // Verify that the ground is booked by the coach
    const booking = await Booking.findOne({
      from: req.session.user._id,
      venue: ground,
      status: 'confirmed'
    });
    if (!booking) {
      return res.status(403).json({ message: "You can only schedule matches on grounds you have booked" });
    }

    // Create the match
    const newMatch = new Match({
      myteam: myTeam,
      opponent: opponentTeam,
      matchDate: new Date(matchDate),
      startTime: startTime,
      endTime: endTime,
      ground: ground,
      notes: notes || '',
      status: 'pending'
    });

    await newMatch.save();

    // Get team players to notify them about the new match
    const myTeamData = await Team.findById(myTeam).populate('player');
    const opponentTeamData = await Team.findById(opponentTeam);
    const groundVenue = await Venue.findById(ground);
    
    if (myTeamData && myTeamData.player && myTeamData.player.length > 0) {
      // Notify all players in the team about the new match
      for (const playerId of myTeamData.player) {
        try {
          await NotificationService.createMatchNotification(
            playerId,
            'player',
            {
              team1: myTeamData?.name || 'Your Team',
              team2: opponentTeamData?.name || 'Opponent Team',
              date: new Date(matchDate).toLocaleDateString(),
              time: `${startTime} - ${endTime}`,
              venue: groundVenue?.name || 'Unknown Venue',
              matchId: newMatch._id
            },
            'scheduled'
          );
        } catch (notificationError) {
          console.error('Failed to create match notification for player:', playerId, notificationError);
        }
      }
    }

    // Populate the match data for response
    const populatedMatch = await Match.findById(newMatch._id)
      .populate('myteam', 'name sport')
      .populate('opponent', 'name sport')
      .populate('ground', 'name location');

    return res.status(201).json({
      message: "Match scheduled successfully",
      data: populatedMatch
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get coach's matches (matches initiated by coach + accepted matches where coach is opponent)
export const getCoachMatches = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Please log in" });
    }

    const coachId = req.session.user._id;

    // Get all teams belonging to this coach
    const coachTeams = await Team.find({ coach: coachId });
    const teamIds = coachTeams.map(team => team._id);

    // Get matches where coach's teams are the myteam (initiated by the coach)
    // OR where coach's teams are the opponent AND (status is accepted OR cancelled)
    const matches = await Match.find({
      $or: [
        { myteam: { $in: teamIds } }, // Matches initiated by this coach
        { 
          opponent: { $in: teamIds }, 
          status: { $in: ['accepted', 'cancelled'] } // Matches where this coach is opponent and accepted or cancelled
        }
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

    console.log('Matches with coach info:', JSON.stringify(matches, null, 2));

    return res.status(200).json({
      message: "Matches retrieved successfully",
      data: matches
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get incoming match requests for coach's teams (only pending requests)
export const getMatchRequests = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Please log in" });
    }

    const coachId = req.session.user._id;

    // Get all teams belonging to this coach
    const coachTeams = await Team.find({ coach: coachId });
    const teamIds = coachTeams.map(team => team._id);

    // Find matches where coach's teams are the opponent (incoming requests) - only pending
    const matchRequests = await Match.find({
      opponent: { $in: teamIds },
      status: 'pending'
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

    console.log('Match requests with coach info:', JSON.stringify(matchRequests, null, 2));

    return res.status(200).json({
      message: "Match requests retrieved successfully",
      data: matchRequests
    });

  } catch (error) {
    console.error("Error fetching match requests:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


// Accept a match request
export const acceptMatchRequest = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Please log in" });
    }

    const { matchId } = req.params;
    const coachId = req.session.user._id;

    // Find the match
    const match = await Match.findById(matchId)
      .populate('opponent', 'coach');

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    // Verify that the coach owns the opponent team
    if (match.opponent.coach.toString() !== coachId) {
      return res.status(403).json({ message: "You can only accept requests for your own teams" });
    }

    // Update match status to accepted
    match.status = 'accepted';
    await match.save();

    // Get the initiating team to notify their players
    const initiatingTeam = await Team.findById(match.myteam).populate('player');
    const opponentTeamData = await Team.findById(match.opponent);
    const groundVenue = await Venue.findById(match.ground);
    
    console.log('Match acceptance notification data:');
    console.log('Match object:', match);
    console.log('Initiating team ID:', match.myteam);
    console.log('Opponent team ID:', match.opponent);
    console.log('Ground ID:', match.ground);
    console.log('Initiating team object:', initiatingTeam);
    console.log('Opponent team object:', opponentTeamData);
    console.log('Ground venue object:', groundVenue);
    console.log('Initiating team name:', initiatingTeam?.name);
    console.log('Opponent team name:', opponentTeamData?.name);
    console.log('Ground venue name:', groundVenue?.name);
    
    if (initiatingTeam && initiatingTeam.player && initiatingTeam.player.length > 0) {
      // Notify all players in the initiating team about match acceptance
      for (const playerId of initiatingTeam.player) {
        try {
          const notificationData = {
            team1: initiatingTeam?.name || 'Your Team',
            team2: opponentTeamData?.name || 'Opponent Team',
            date: new Date(match.matchDate).toLocaleDateString(),
            time: `${match.startTime} - ${match.endTime}`,
            venue: groundVenue?.name || 'Unknown Venue',
            matchId: match._id,
            resultMessage: 'Match request has been accepted!'
          };
          console.log('Sending notification data:', notificationData);
          await NotificationService.createMatchNotification(
            playerId,
            'player',
            notificationData,
            'result'
          );
        } catch (notificationError) {
          console.error('Failed to create match acceptance notification for player:', playerId, notificationError);
        }
      }
    }

    // Populate the updated match for response
    const updatedMatch = await Match.findById(matchId)
      .populate('myteam', 'name sport coach')
      .populate('opponent', 'name sport')
      .populate('ground', 'name location')
      .populate('myteam.coach', 'name email');

    return res.status(200).json({
      message: "Match request accepted successfully",
      data: updatedMatch
    });

  } catch (error) {
    console.error("Error accepting match request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Reject a match request
export const rejectMatchRequest = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Please log in" });
    }

    const { matchId } = req.params;
    const coachId = req.session.user._id;

    // Find the match
    const match = await Match.findById(matchId)
      .populate('opponent', 'coach');

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    // Verify that the coach owns the opponent team
    if (match.opponent.coach.toString() !== coachId) {
      return res.status(403).json({ message: "You can only reject requests for your own teams" });
    }

    // Update match status to rejected
    match.status = 'rejected';
    await match.save();

    // Get the initiating team to notify their players
    const initiatingTeam = await Team.findById(match.myteam).populate('player');
    const opponentTeamData = await Team.findById(match.opponent);
    const groundVenue = await Venue.findById(match.ground);
    
    if (initiatingTeam && initiatingTeam.player && initiatingTeam.player.length > 0) {
      // Notify all players in the initiating team about match rejection
      for (const playerId of initiatingTeam.player) {
        try {
          await NotificationService.createMatchNotification(
            playerId,
            'player',
            {
              team1: initiatingTeam?.name || 'Your Team',
              team2: opponentTeamData?.name || 'Opponent Team',
              date: new Date(match.matchDate).toLocaleDateString(),
              time: `${match.startTime} - ${match.endTime}`,
              venue: groundVenue?.name || 'Unknown Venue',
              matchId: match._id,
              reason: 'Match request has been rejected'
            },
            'cancelled'
          );
        } catch (notificationError) {
          console.error('Failed to create match rejection notification for player:', playerId, notificationError);
        }
      }
    }

    return res.status(200).json({
      message: "Match request rejected successfully"
    });

  } catch (error) {
    console.error("Error rejecting match request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Cancel a match
export const cancelMatch = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Please log in" });
    }

    const { matchId } = req.params;
    const coachId = req.session.user._id;

    // Find the match
    const match = await Match.findById(matchId)
      .populate('myteam', 'coach')
      .populate('opponent', 'coach');

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    // Verify that the coach owns either the myteam or opponent team
    const isMyTeamOwner = match.myteam.coach.toString() === coachId;
    const isOpponentOwner = match.opponent.coach.toString() === coachId;

    if (!isMyTeamOwner && !isOpponentOwner) {
      return res.status(403).json({ message: "You can only cancel matches involving your teams" });
    }

    // Check if match can be cancelled (not already completed)
    if (match.status === 'completed') {
      return res.status(400).json({ message: "Cannot cancel a completed match" });
    }

    // Update match status to cancelled
    match.status = 'cancelled';
    await match.save();

    return res.status(200).json({
      message: "Match cancelled successfully"
    });

  } catch (error) {
    console.error("Error cancelling match:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Debug endpoint to check coach data
export const getCoachDebugInfo = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Please log in" });
    }

    const coachId = req.session.user._id;
    console.log("Debug - Coach ID:", coachId);

    // Get teams
    const teams = await Team.find({ coach: coachId });
    console.log("Debug - Teams found:", teams.length);

    // Get bookings
    const bookings = await Booking.find({ from: coachId });
    console.log("Debug - Bookings found:", bookings.length);

    // Get all bookings with different statuses
    const confirmedBookings = await Booking.find({ from: coachId, status: 'confirmed' });
    const pendingBookings = await Booking.find({ from: coachId, status: 'pending' });
    const cancelledBookings = await Booking.find({ from: coachId, status: 'cancelled' });

    return res.status(200).json({
      message: "Debug info retrieved",
      data: {
        coachId: coachId,
        teamsCount: teams.length,
        teams: teams,
        totalBookings: bookings.length,
        confirmedBookings: confirmedBookings.length,
        pendingBookings: pendingBookings.length,
        cancelledBookings: cancelledBookings.length,
        allBookings: bookings
      }
    });

  } catch (error) {
    console.error("Debug error:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get coach's bookings (for Coach_bookings.jsx)
export const getMyBookings = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const coachId = req.session.user._id;
    console.log("Getting bookings for coach:", coachId);

    // Get all bookings for this coach
    const bookings = await Booking.find({ from: coachId })
      .populate('venue', 'name location price')
      .sort({ createdAt: -1 });

    console.log("Found bookings:", bookings.length);

    if (!bookings || bookings.length === 0) {
      return res.status(200).json({
        message: "No bookings found",
        data: []
      });
    }

    return res.status(200).json({
      message: "Bookings retrieved successfully",
      data: bookings
    });

  } catch (error) {
    console.error("Error in getMyBookings:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

// Download receipt for a booking
export const playerDownloadReceipt = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const { bookingId } = req.params;
    const coachId = req.session.user._id;

    // Find the booking
    const booking = await Booking.findOne({ 
      _id: bookingId, 
      from: coachId 
    }).populate('venue', 'name location price');

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    // Update booking status to paid
    booking.isPaid = "paid";
    await booking.save();

    // Generate PDF receipt (simplified version)
    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="booking-receipt-${bookingId}.pdf"`);

    doc.pipe(res);
    
    doc.fontSize(20).text('Booking Receipt', 100, 100);
    doc.fontSize(12).text(`Booking ID: ${bookingId}`, 100, 150);
    doc.text(`Venue: ${booking.venue.name}`, 100, 170);
    doc.text(`Date: ${new Date(booking.date).toLocaleDateString()}`, 100, 190);
    doc.text(`Time: ${new Date(booking.startTime).toLocaleTimeString()} - ${new Date(booking.endTime).toLocaleTimeString()}`, 100, 210);
    doc.text(`Status: ${booking.status}`, 100, 230);
    doc.text(`Payment Status: ${booking.isPaid}`, 100, 250);
    doc.text(`Price: LKR ${booking.price}`, 100, 270);
    doc.text(`Payment Method: ${booking.method}`, 100, 290);
    
    doc.end();

  } catch (error) {
    console.error("Error in playerDownloadReceipt:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

// Cancel a booking
export const cancelBooking = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const { bookingId } = req.params;
    const coachId = req.session.user._id;

    // Find and update the booking
    const booking = await Booking.findOneAndUpdate(
      { 
        _id: bookingId, 
        from: coachId,
        status: { $in: ['pending', 'confirmed'] }
      },
      { status: 'cancelled' },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found or cannot be cancelled"
      });
    }

    return res.status(200).json({
      message: "Booking cancelled successfully",
      data: booking
    });

  } catch (error) {
    console.error("Error in cancelBooking:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

// Get ground by ID
export const getGroundById = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const { id } = req.params;
    
    const ground = await Venue.find({_id: id}).populate("ground_manager", "mobile name email");
    
    if (!ground || ground.length === 0) {
      return res.status(404).json({
        message: "Ground not found"
      });
    }

    return res.status(200).json({
      message: "Ground retrieved successfully",
      data: ground
    });

  } catch (error) {
    console.error("Error in getGroundById:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

// Get booked slots for a ground
export const getBookedSlots = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const { id } = req.params;
    
    console.log("=== Coach getBookedSlots called ===");
    console.log("Received venueId:", id);

    // Get all bookings for this venue
    const bookings = await Booking.find({ 
      venue: id,
      status: { $in: ['confirmed', 'pending'] }
    }).select('date startTime endTime status').lean();

    console.log("Found bookings:", bookings.length);
    console.log("Booking details:", bookings.map(b => ({
      id: b._id,
      status: b.status,
      date: b.date,
      startTime: b.startTime,
      endTime: b.endTime
    })));

    // Format the bookings to match player version
    const bookedSlots = bookings.map(b => {
      // Convert to local time and format as AM/PM
      const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      };

      const slot = {
        date: new Date(b.date).toISOString().split("T")[0],
        startTime: formatTime(b.startTime),
        endTime: formatTime(b.endTime)
      };
      
      console.log("Processed slot:", slot);
      return slot;
    });

    console.log("Final bookedSlots array:", bookedSlots);
    console.log("=== End Coach getBookedSlots ===");

    return res.status(200).json({
      message: "Booked slots retrieved successfully",
      bookedSlots: bookedSlots
    });

  } catch (error) {
    console.error("Error in getBookedSlots:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

// Book a ground
export const bookGround = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const coachId = req.session.user._id;
    const { venueId, date, method, price, from, to } = req.body;

    console.log('Booking data received:', { venueId, date, method, price, from, to });

    // Convert time strings to Date objects
    const bookingDate = new Date(date);
    const [fromHour, fromMin] = from.split(":").map(Number);
    const [toHour, toMin] = to.split(":").map(Number);

    const startDateTime = new Date(bookingDate);
    startDateTime.setHours(fromHour, fromMin, 0, 0);

    const endDateTime = new Date(bookingDate);
    endDateTime.setHours(toHour, toMin, 0, 0);

    // Create new booking
    const booking = new Booking({
      venue: venueId,
      from: coachId,
      date: bookingDate,
      startTime: startDateTime,
      endTime: endDateTime,
      price: parseFloat(price),
      method: method,
      status: 'pending'
    });

    await booking.save();

    return res.status(200).json({
      message: "Ground booked successfully",
      data: booking
    });

  } catch (error) {
    console.error("Error in bookGround:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

// Check availability
export const checkAvailability = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const { venueId, date, from, to } = req.body;

    if (!venueId || !date || !from || !to) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    // Convert time strings to Date objects for proper comparison
    const bookingDate = new Date(date); 
    const [fromHour, fromMin] = from.split(":").map(Number);
    const [toHour, toMin] = to.split(":").map(Number);

    const startDateTime = new Date(bookingDate);
    startDateTime.setHours(fromHour, fromMin, 0, 0);

    const endDateTime = new Date(bookingDate);
    endDateTime.setHours(toHour, toMin, 0, 0);

    // Check for conflicting bookings
    const conflictingBookings = await Booking.find({
      venue: venueId,
      status: { $ne: "cancelled" },
      $or: [
        {
          startTime: { $lt: endDateTime },
          endTime: { $gt: startDateTime }
        }
      ]
    });

    if (conflictingBookings.length > 0) {
      return res.status(409).json({ 
        message: "Selected time slot is already booked!",
        available: false
      });
    }

    return res.status(200).json({ 
      available: true,
      message: "Time slot is available"
    });

  } catch (error) {
    console.error("Error in checkAvailability:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

// Simple test endpoint
export const testDashboard = async (req, res) => {
  console.log('=== TEST ENDPOINT CALLED ===');
  return res.status(200).json({
    success: true,
    message: "Test endpoint working",
    data: {
      activePlayers: 5,
      upcomingSessions: 3,
      matchesWon: 2,
      recentActivities: []
    }
  });
};

// Get coach profile data
export const getCoachProfile = async (req, res) => {
  try {
    console.log('=== Get Coach Profile ===');
    
    if (!req.session.user) {
      console.log('No user in session');
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const coachId = req.session.user._id;
    console.log('Coach ID:', coachId);

    // Get coach data from User model
    const coachData = await User.findById(coachId).select('-password');
    
    if (!coachData) {
      return res.status(404).json({
        success: false,
        message: "Coach not found"
      });
    }

    console.log('Coach data found:', coachData);

    return res.status(200).json({
      success: true,
      message: "Coach profile retrieved successfully",
      data: coachData
    });

  } catch (error) {
    console.error('Error in getCoachProfile:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get coach team data
export const getCoachTeamData = async (req, res) => {
  try {
    console.log('=== Get Coach Team Data ===');
    
    if (!req.session.user) {
      console.log('No user in session');
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const coachId = req.session.user._id;
    console.log('Coach ID:', coachId);

    // Get teams belonging to this coach
    const teams = await Team.find({ coach: coachId })
      .populate('player', 'name email profileImage')
      .lean();

    console.log('Teams found:', teams.length);

    // Get total matches won across all teams
    let totalWon = 0;
    let allPlayers = [];
    
    if (teams.length > 0) {
      totalWon = teams.reduce((total, team) => total + (team.won || 0), 0);
      
      // Collect all players from all teams
      teams.forEach(team => {
        if (team.player && team.player.length > 0) {
          allPlayers = allPlayers.concat(team.player);
        }
      });
      
      console.log('Players found:', allPlayers.length);
      console.log('Player data sample:', allPlayers[0]);
    }

    // Get team data (use first team if multiple teams exist)
    const teamData = teams.length > 0 ? {
      name: teams[0].name,
      sport: teams[0].sport,
      players: allPlayers,
      uniformImage: teams[0].uniformImage || [],
      won: totalWon
    } : {
      name: '',
      sport: '',
      players: [],
      uniformImage: [],
      won: 0
    };

    console.log('Team data:', teamData);

    return res.status(200).json({
      success: true,
      message: "Team data retrieved successfully",
      data: teamData
    });

  } catch (error) {
    console.error('Error in getCoachTeamData:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Update coach profile
export const updateCoachProfile = async (req, res) => {
  try {
    console.log('=== Update Coach Profile ===');
    
    if (!req.session.user) {
      console.log('No user in session');
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const coachId = req.session.user._id;
    const { name, email, mobile } = req.body;

    console.log('Update data:', { name, email, mobile });

    // Update coach data
    const updatedCoach = await User.findByIdAndUpdate(
      coachId,
      { name, email, mobile },
      { new: true, select: '-password' }
    );

    if (!updatedCoach) {
      return res.status(404).json({
        success: false,
        message: "Coach not found"
      });
    }

    console.log('Coach updated successfully');

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedCoach
    });

  } catch (error) {
    console.error('Error in updateCoachProfile:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Upload profile image
export const uploadProfileImage = async (req, res) => {
  try {
    console.log('=== Upload Profile Image ===');
    
    if (!req.session.user) {
      console.log('No user in session');
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const coachId = req.session.user._id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided"
      });
    }

    const profileImagePath = req.file.path;
    console.log('File uploaded to path:', profileImagePath);
    console.log('File details:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Update coach profile image
    const updatedCoach = await User.findByIdAndUpdate(
      coachId,
      { profileImage: profileImagePath },
      { new: true, select: '-password' }
    );

    if (!updatedCoach) {
      return res.status(404).json({
        success: false,
        message: "Coach not found"
      });
    }

    console.log('Profile image updated successfully');
    console.log('Updated coach profileImage:', updatedCoach.profileImage);

    return res.status(200).json({
      success: true,
      message: "Profile image updated successfully",
      data: { profileImage: profileImagePath }
    });

  } catch (error) {
    console.error('Error in uploadProfileImage:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Upload certifications
export const uploadCertifications = async (req, res) => {
  try {
    console.log('=== Upload Certifications ===');
    
    if (!req.session.user) {
      console.log('No user in session');
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const coachId = req.session.user._id;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No certification files provided"
      });
    }

    // Process uploaded files
    const certificationFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      uploadDate: new Date()
    }));

    // Get current coach data
    const coach = await User.findById(coachId);
    if (!coach) {
      return res.status(404).json({
        success: false,
        message: "Coach not found"
      });
    }

    // Add new certifications to existing ones
    const updatedCertifications = [...(coach.certifications || []), ...certificationFiles];

    // Update coach certifications
    const updatedCoach = await User.findByIdAndUpdate(
      coachId,
      { certifications: updatedCertifications },
      { new: true, select: '-password' }
    );

    console.log('Certifications updated successfully');

    return res.status(200).json({
      success: true,
      message: "Certifications uploaded successfully",
      data: { certifications: updatedCoach.certifications }
    });

  } catch (error) {
    console.error('Error in uploadCertifications:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get coach dashboard data
export const getCoachDashboardData = async (req, res) => {
  try {
    console.log('=== Coach Dashboard Data Request ===');
    
    if (!req.session.user) {
      console.log('No user in session');
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const coachId = req.session.user._id;
    console.log('Coach ID:', coachId);

    // GET REAL DATA FROM DATABASE
    
    // 1. Get teams belonging to this coach
    const coachTeams = await Team.find({ coach: coachId });
    console.log('Coach teams found:', coachTeams.length);
    const teamIds = coachTeams.map(team => team._id);
    console.log('Team IDs:', teamIds);
    
    // 2. Count players in these teams
    let activePlayersCount = 0;
    if (teamIds.length > 0) {
      activePlayersCount = await Player.countDocuments({ 
        team: { $in: teamIds } 
      });
    }
    console.log('Active players count:', activePlayersCount);

    // 3. Count sessions for this coach
    const upcomingSessionsCount = await Schedule.countDocuments({ 
      coachid: coachId,
      isDeleted: false 
    });
    console.log('Upcoming sessions count:', upcomingSessionsCount);

    // 4. Count matches won from team.won field
    let totalMatchesWon = 0;
    if (coachTeams.length > 0) {
      totalMatchesWon = coachTeams.reduce((total, team) => total + (team.won || 0), 0);
    }
    console.log('Total matches won:', totalMatchesWon);

    // 5. Get recent activities
    const recentSessions = await Schedule.find({ 
      coachid: coachId,
      isDeleted: false 
    })
    .populate('venueid', 'name')
    .sort({ date: -1 })
    .limit(3);

    let recentMatches = [];
    if (teamIds.length > 0) {
      recentMatches = await Match.find({
        $or: [
          { myteam: { $in: teamIds } },
          { opponent: { $in: teamIds } }
        ]
      })
      .populate('myteam', 'name')
      .populate('opponent', 'name')
      .populate('ground', 'name')
      .sort({ matchDate: -1 })
      .limit(2);
    }

    // Format recent activities
    const recentActivities = [];

    // Add recent sessions
    recentSessions.forEach(session => {
      // Format time properly
      const formatTime = (dateTime) => {
        if (!dateTime) return 'N/A';
        const date = new Date(dateTime);
        return date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      };

      recentActivities.push({
        type: 'session',
        title: 'Training Session',
        description: `${session.title} at ${session.venueid?.name || 'Unknown Venue'}`,
        date: session.date,
        time: formatTime(session.startTime)
      });
    });

    // Add recent matches
    recentMatches.forEach(match => {
      const isMyTeam = teamIds.includes(match.myteam._id.toString());
      const team1 = isMyTeam ? match.myteam.name : match.opponent.name;
      const team2 = isMyTeam ? match.opponent.name : match.myteam.name;
      
      // Format time properly
      const formatTime = (timeString) => {
        if (!timeString) return 'N/A';
        // If it's already a string, return as is
        if (typeof timeString === 'string') {
          return timeString;
        }
        // If it's a Date object, format it
        const date = new Date(timeString);
        return date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      };
      
      recentActivities.push({
        type: 'match',
        title: 'Match Scheduled',
        description: `${team1} vs ${team2} at ${match.ground?.name || 'Unknown Venue'}`,
        date: match.matchDate,
        time: formatTime(match.startTime)
      });
    });

    // Sort activities by date (most recent first)
    recentActivities.sort((a, b) => new Date(b.date) - new Date(a.date));

    const responseData = {
      activePlayers: activePlayersCount,
      upcomingSessions: upcomingSessionsCount,
      matchesWon: totalMatchesWon,
      recentActivities: recentActivities.slice(0, 5)
    };

    console.log('Final response data:', responseData);
    console.log('=== End Coach Dashboard Data Request ===');

    return res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error("Error in getCoachDashboardData:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


