import express from 'express'
import { cancelBooking, cancelRental, checkAvailability, createTestBookings, deleteAccount, downloadReciept, getAllGrounds, getBookedSlots, getEquipments, getGroundById, getmyBookings, getMyRentals, getProfile, playerBookGround, playerGetAllEquipments, rentEquipment, updatePlayerProfile, updateProfile, updateProfilePhoto, getPlayerByUserId, getTeamById, getSessionsByCoachId, getTeamMatches, getDashboardData } from './playerControll.js';
import upload from '../config/multer.js'
import { logout } from '../controllers/logout.js';


const playerRouter = express.Router();

playerRouter.get('/get-equipments-by-id/:id', getEquipments);
playerRouter.post('/rent-equipment', rentEquipment);
playerRouter.get('/get-all-grounds', getAllGrounds);
playerRouter.get('/get-ground-by-id/:id',getGroundById);
playerRouter.post('/player-book-ground',playerBookGround);
playerRouter.get('/get-my-bookings',getmyBookings);
playerRouter.get('/get-my-rentals',getMyRentals);
playerRouter.put('/cancel-rental/:id',cancelRental);
playerRouter.get('/player-downolad-receipt/:id',downloadReciept);
playerRouter.get('/get-profile',getProfile);
playerRouter.put('/update-profile/personal',updateProfile);
playerRouter.put('/update-profile/player',updatePlayerProfile);
playerRouter.put('/update-profile/photo',upload.single('profileImage'),updateProfilePhoto);
playerRouter.get('/get-player-equipments',playerGetAllEquipments);
playerRouter.post('/logout',logout);
playerRouter.delete('/delete-account',deleteAccount);
playerRouter.put('/cancel-booking/:id',cancelBooking);
playerRouter.post('/check-availability', checkAvailability);
playerRouter.get('/booked-slots/:venueId',getBookedSlots);
playerRouter.post('/create-test-bookings/:venueId', createTestBookings);

// Player sessions endpoints
playerRouter.get('/by-user/:userId', getPlayerByUserId);
playerRouter.get('/team/:teamId', getTeamById);
playerRouter.get('/sessions/by-coach/:coachId', getSessionsByCoachId);

// Player matches endpoints
playerRouter.get('/get-team-matches/:teamId', getTeamMatches);

// Dashboard endpoint
playerRouter.get('/dashboard-data', getDashboardData);

// Test endpoint to check schedules
playerRouter.get('/test-schedules', async (req, res) => {
  try {
    const Schedule = (await import('../models/schedule.js')).default;
    const schedules = await Schedule.find({ isDeleted: false }).populate('coachid', 'name email');
    res.json({ success: true, schedules });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Test endpoint to check sessions for a specific coach
playerRouter.get('/test-coach-sessions/:coachId', async (req, res) => {
  try {
    const { coachId } = req.params;
    const Schedule = (await import('../models/schedule.js')).default;
    const sessions = await Schedule.find({ 
      coachid: coachId, 
      isDeleted: false 
    }).populate('coachid', 'name email');
    
    const now = new Date();
    const upcomingSessions = sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate > now;
    });
    
    res.json({ 
      success: true, 
      totalSessions: sessions.length,
      upcomingSessions: upcomingSessions.length,
      sessions: sessions,
      currentTime: now
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Quick test endpoint to check team and coach
playerRouter.get('/test-team-coach', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const userId = req.session.user._id;
    const Player = (await import('../models/player.js')).default;
    const Team = (await import('../models/team.js')).default;

    // Get player
    const player = await Player.findOne({ playerid: userId }).lean();
    console.log('Player:', player);

    if (!player || !player.team) {
      return res.json({ success: false, message: "Player or team not found" });
    }

    // Get team
    const team = await Team.findById(player.team).lean();
    console.log('Team:', team);

    res.json({
      success: true,
      player: player,
      team: team,
      hasCoach: !!team.coach,
      coachId: team.coach
    });

  } catch (error) {
    console.error('Test error:', error);
    res.json({ success: false, error: error.message });
  }
});

// Debug endpoint that mimics Player_sessions.jsx logic exactly
playerRouter.get('/debug-player-sessions', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const userId = req.session.user._id;
    console.log('=== DEBUG: Starting player sessions debug ===');
    console.log('User ID:', userId);

    // Step 1: Get player info (same as Player_sessions.jsx)
    const Player = (await import('../models/player.js')).default;
    const Team = (await import('../models/team.js')).default;
    const Schedule = (await import('../models/schedule.js')).default;

    const playerResponse = await Player.findOne({ playerid: userId })
      .populate('team', 'name sport coach')
      .lean();

    console.log('Player response:', playerResponse);

    if (!playerResponse) {
      return res.json({ success: false, message: "Player not found" });
    }

    const teamId = playerResponse.team;
    console.log('Team ID:', teamId);

    // Step 2: Get team details (same as Player_sessions.jsx)
    const teamResponse = await Team.findById(teamId)
      .populate('player', 'name email mobile')
      .lean();

    console.log('Team response:', teamResponse);

    if (!teamResponse) {
      return res.json({ success: false, message: "Team not found" });
    }

    // Step 3: Get coach details
    const User = (await import('../models/Users.js')).default;
    const coach = await User.findById(teamResponse.coach).select('name email mobile').lean();
    console.log('Coach details:', coach);

    const coachId = teamResponse.coach;
    console.log('Coach ID for sessions:', coachId);

    // Step 4: Get sessions by coach (same as Player_sessions.jsx)
    const sessions = await Schedule.find({ 
      coachid: coachId,
      isDeleted: false 
    })
    .populate('venueid', 'name location')
    .sort({ date: 1, startTime: 1 })
    .lean();

    console.log('Found sessions:', sessions.length);

    const now = new Date();
    const upcomingSessions = sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate > now;
    });

    res.json({
      success: true,
      player: playerResponse,
      team: teamResponse,
      coach: coach,
      coachId: coachId,
      totalSessions: sessions.length,
      upcomingSessions: upcomingSessions.length,
      sessions: sessions,
      currentTime: now
    });

  } catch (error) {
    console.error('Debug error:', error);
    res.json({ success: false, error: error.message });
  }
});

export default playerRouter;