import express from 'express'
import upload from '../config/multer.js'
import { addEquipment, deleteEquipment, getAllEquipments, getAllGroundManagers, getAllRentals, updateEquipment, updateManagerStatus, addManager, getAllVenues, updateVenuePricing } from './operation_manager_controll.js';
import { logout } from '../controllers/logout.js';

const opm_router = express.Router();

opm_router.post('/add-new-equipment', upload.single("image"), addEquipment);
opm_router.get('/test-session', (req, res) => {
    console.log("Test session endpoint called");
    console.log("Session user:", req.session.user);
    console.log("Session ID:", req.sessionID);
    console.log("Session object:", req.session);
    
    if (req.session.user) {
        res.json({
            message: "Session found",
            user: req.session.user,
            sessionId: req.sessionID
        });
    } else {
        res.status(401).json({
            message: "No session found",
            sessionId: req.sessionID
        });
    }
});

opm_router.get('/get-equipments', getAllEquipments);
opm_router.put('/update-equipment/:id', updateEquipment);
opm_router.delete('/delete-equipment/:id', deleteEquipment);
opm_router.get('/get-rentals',getAllRentals);
opm_router.post('/logout',logout);
opm_router.get('/get-all-managers',getAllGroundManagers);
opm_router.post('/add-manager', addManager);
opm_router.put('/update-manager-status/:id',updateManagerStatus);
opm_router.get('/get-venues', getAllVenues);
opm_router.put('/update-venue-pricing/:id', updateVenuePricing);

export default opm_router;