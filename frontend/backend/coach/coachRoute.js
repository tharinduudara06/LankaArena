import express from 'express'
const coachRouter = express.Router();
import upload from '../config/multer.js'
import {add_player_to_team, addTeam, delete_team, deletePlayer, deleteSession, edit_team_name, editPlayer, get_team_players, getCoachSessions, getPlayerByEmail, getSessionByDate, getTeam, registerCoach, scheduleSession, uniformOrder, getAllAvailableGrounds, getCoachBookedGrounds, getSuggestedOpponents, searchTeams, createMatch, getCoachMatches, getMatchRequests, acceptMatchRequest, rejectMatchRequest, cancelMatch, getMyBookings, playerDownloadReceipt, cancelBooking, getGroundById, getBookedSlots, bookGround, checkAvailability, getCoachDashboardData, testDashboard, getCoachProfile, getCoachTeamData, updateCoachProfile, uploadProfileImage, uploadCertifications} from './coachController.js'
import {getAllCoaches} from './coachController.js'
import { logout } from '../controllers/logout.js';

coachRouter.post('/coach-reg', upload.array('certifications', 5), registerCoach);
coachRouter.get('/get-coach', getAllCoaches);
coachRouter.post('/add-team', upload.array('uniform',5), addTeam);
coachRouter.get('/get-team', getTeam);
coachRouter.put('/update-team/:id',edit_team_name);
coachRouter.delete('/delete-team/:id',delete_team);
coachRouter.get('/get-user-by-email/:email', getPlayerByEmail);
coachRouter.post('/add-player-to-team',add_player_to_team);
coachRouter.get('/get-team-players/:teamId', get_team_players);
coachRouter.put('/edit-player/:id', editPlayer);
coachRouter.delete('/delete-player/:playerId',deletePlayer);
coachRouter.post('/uniform-order',upload.fields([{ name: 'frontDesign' }, { name: 'backDesign' }]),uniformOrder);
coachRouter.post('/logout',logout);
coachRouter.post('/schedule-session',scheduleSession);
coachRouter.get('/get-sessions-by-date/:date',getSessionByDate);
coachRouter.get('/get-my-sessions',getCoachSessions);
coachRouter.get('/get-my-bookings',getMyBookings);
coachRouter.get('/player-downolad-receipt/:bookingId',playerDownloadReceipt);
coachRouter.put('/cancel-booking/:bookingId',cancelBooking);
coachRouter.delete('/delete-session/:id',deleteSession);

// Match-related routes
coachRouter.get('/get-booked-grounds', getCoachBookedGrounds);
coachRouter.get('/get-suggested-opponents/:teamId', getSuggestedOpponents);
coachRouter.get('/search-teams', searchTeams);
coachRouter.post('/create-match', createMatch);
coachRouter.get('/get-matches', getCoachMatches);

// Match request routes
coachRouter.get('/get-match-requests', getMatchRequests);
coachRouter.put('/accept-match-request/:matchId', acceptMatchRequest);
coachRouter.put('/reject-match-request/:matchId', rejectMatchRequest);
coachRouter.put('/cancel-match/:matchId', cancelMatch);

// Ground and booking related routes
coachRouter.get('/get-all-grounds', getAllAvailableGrounds); // Get all available grounds
coachRouter.get('/get-booked-grounds', getCoachBookedGrounds); // Get coach's booked grounds
coachRouter.get('/get-ground-by-id/:id', getGroundById);
coachRouter.get('/booked-slots/:id', getBookedSlots);
coachRouter.post('/player-book-ground', bookGround);
coachRouter.post('/check-availability', checkAvailability);

// Dashboard route
coachRouter.get('/dashboard-data', getCoachDashboardData);

// Test route
coachRouter.get('/test', testDashboard);

// Profile routes
coachRouter.get('/profile', getCoachProfile);
coachRouter.get('/team-data', getCoachTeamData);
coachRouter.put('/update-profile', updateCoachProfile);
coachRouter.post('/upload-profile-image', upload.single('profileImage'), uploadProfileImage);
coachRouter.post('/upload-certifications', upload.array('certifications', 5), uploadCertifications);

export default coachRouter;