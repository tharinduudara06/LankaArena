import express from "express";
import { 
  addGround,
  bookingStatusUpdate,
  deleteVenue,
  getAllBookings,
  getGround,
  getVenueOwnerBookings,
  register, 
  updateVenue,
  createMaintenance,
  getMaintenanceSchedules,
  updateMaintenanceStatus,
  updateMaintenance,
  deleteMaintenance,
  getMaintenanceStats,
  getPaymentStats,
  getRecentTransactions,
  getMonthlyRevenue,
  getProfile,
  updateProfile
} from "./ground_manager_controll.js";
import upload from '../config/multer.js'
import { logout } from "../controllers/logout.js";

const gm_router = express.Router();

gm_router.post('/gm-reg', register);
gm_router.post('/gm-add-ground', upload.single("photo"),addGround);
gm_router.get('/gm-get-grounds', getGround);
gm_router.put('/gm-update-venue/:id', upload.single('photo'),updateVenue);
gm_router.delete('/gm-delete-venue/:id', deleteVenue);
gm_router.get('/get-bookings',getAllBookings);
gm_router.put('/update-booking-status/:id', bookingStatusUpdate);
gm_router.post('/logout',logout);
gm_router.get('/get-venue-owner-bookings',getVenueOwnerBookings);

// Maintenance routes
gm_router.post('/maintenance/create', createMaintenance);
gm_router.get('/maintenance/schedules', getMaintenanceSchedules);
gm_router.put('/maintenance/update-status/:id', updateMaintenanceStatus);
gm_router.put('/maintenance/update/:id', updateMaintenance);
gm_router.delete('/maintenance/delete/:id', deleteMaintenance);
gm_router.get('/maintenance/stats', getMaintenanceStats);

// Payment routes
gm_router.get('/payments/stats', getPaymentStats);
gm_router.get('/payments/transactions', getRecentTransactions);
gm_router.get('/payments/monthly-revenue', getMonthlyRevenue);

// Profile routes
gm_router.get('/profile', getProfile);
gm_router.put('/profile', upload.single('profileImage'), updateProfile);

export default gm_router;