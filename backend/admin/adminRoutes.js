import express from 'express'
import {allUsers, deleteUser, getAllBookings, insertUsers, updateUser, venueBookings} from './adminControl.js'
import { logout } from '../controllers/logout.js';

const adminRouter = express.Router();

adminRouter.post('/admin-add-users', insertUsers);
adminRouter.get('/all-users', allUsers);
adminRouter.put('/update-user/:id', updateUser);
adminRouter.delete('/delete-user/:id', deleteUser);
adminRouter.post('/logout',logout);
adminRouter.get('/admin-get-bookings',getAllBookings);
adminRouter.get('/get-venue-bookings',venueBookings);

export default adminRouter;