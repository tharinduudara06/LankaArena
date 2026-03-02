import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Home from './pages/player/Home';
import Login from './pages/player/Login';
import './app.css'
import Coach_dashboard from './pages/coach/Coach_dashboard';
import OPM_dashboard from './pages/operation_manager/OPM_dashboard';
import Register from './pages/player/Register';
import OTP_verify from './pages/player/OTP_verify';
import All_users from './pages/admin/All_users';
import AddUser from './pages/admin/AddUser';
import JoinUs from './pages/player/JoinUs';
import CoachSignup from './pages/player/CoachSignup';
import RefereeSignup from './pages/player/RefereeSignup';
import GroundManagerSignup from './pages/player/GroundManagerSignup';
import Finance from './pages/admin/Finance';
import TeamManagement from './pages/coach/TeamManagement';
import UniformOrders from './pages/coach/UniformOrder';
import ManageMatches from './pages/coach/ManageMatches';
import Ground_manager_dashboard from './pages/ground_manager/Ground_manager_dashboard';
import GM_bookings from './pages/ground_manager/GM_bookings';
import GM_maintenance from './pages/ground_manager/GM_maintenance';
import GM_payments from './pages/ground_manager/GM_payments';
import OPM_ground_managers from './pages/operation_manager/OPM_ground_managers';
import OPMGroundPricing from './pages/operation_manager/OPMGroundPricing';
import OPMEquipmentInventory from './pages/operation_manager/OPM_EquipmentInventory';
import OPMEquipmentRentals from './pages/operation_manager/OPMEquipmentRentals';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminFeedbackManagement from './pages/admin/AdminFeedbackManagement';
import AdminVenueOversight from './pages/admin/AdminVenueOversight';
import PlayerDashboard from './pages/player/PlayerDashboard ';
import Player_Bookings from './pages/player/Player_Bookings';
import PlayerEquipmentRental from './pages/player/PlayerEquipmentRental';
import CoachScheduleSessions from './pages/coach/CoachScheduleSessions';
import GM_myGrounds from './pages/ground_manager/GM_myGrounds';
import GM_add_grounds from './pages/ground_manager/GM_add_grounds';
import GM_profile from './pages/ground_manager/GM_profile';
import OPM_add_new_equipment from './pages/operation_manager/OPM_add_new_equipment';
import Coach_add_team from './pages/coach/Coach_add_team';
import Coach_add_players from './pages/coach/Coach_add_players';
import PlayerRent from './pages/player/PlayerRent';
import PlayerNewBooking from './pages/player/PlayerNewBooking';
import PlayerBookGround from './pages/player/PlayerBookGround';

import PlayerProfile from './pages/player/PlayerProfile';
import Coach_all_grounds from './pages/coach/Coach_all_grounds';
import Coach_bookings from './pages/coach/Coach_bookings';
import Coach_add_new_booking from './pages/coach/Coach_add_new_booking';
import Coach_profile from './pages/coach/Coach_profile';
import Coach_payment_gateway from './pages/coach/Coach_payment_gateway';
import MyRentals from './pages/player/MyRentals';
import Player_sessions from './pages/player/Player_sessions';
import Player_matches from './pages/player/Player_matches';
import Player_notifications from './pages/player/Player_notifications';
import Player_payment_gateway from './pages/player/Player_payment_gateway';
import Custom_jersey from './pages/player/Custom_jersey';
import Admin_payment_gateway from './pages/admin/Admin_payment_gateway';
import OPM_payment_gateway from './pages/operation_manager/OPM_payment_gateway';
import GM_payment_gateway from './pages/ground_manager/GM_payment_gateway';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path='/' element = {<Home/>}/>
          <Route path='/log' element = {<Login/>}/>
          <Route path='/reg' element = {<Register/>}/>
          <Route path='/otp-verify' element = {<OTP_verify/>}/>
          <Route path='/all-users' element = {<All_users/>}/>
          <Route path='/add-users' element = {<AddUser/>}/>
          <Route path='/joinus' element = {<JoinUs/>}/>
          <Route path='/coach-signup' element = {<CoachSignup/>}/>
          <Route path='/referee-signup' element = {<RefereeSignup/>}/>
          <Route path='/ground-manager-signup' element = {<GroundManagerSignup/>}/>
          <Route path='/team-management' element = {<TeamManagement/>}/>
          <Route path='/uniform-order' element = {<UniformOrders/>}/>
          <Route path='/manage-matches' element = {<ManageMatches/>}/>
          <Route path='/ground-manager' element = {<Ground_manager_dashboard/>}/>
          <Route path='/ground-manager-bookings' element = {<GM_bookings/>}/>
          <Route path='/ground-manager-maintenance' element = {<GM_maintenance/>}/>
          <Route path='/ground-manager-payments' element = {<GM_payments/>}/>
          <Route path='/opm-ground-manager' element = {<OPM_ground_managers/>}/>
          <Route path='/opm-ground-pricing' element = {<OPMGroundPricing/>}/>
          <Route path='/opm-equipment-inventory' element = {<OPMEquipmentInventory/>}/>
          <Route path='/opm-equipment-rentals' element = {<OPMEquipmentRentals/>}/>
          <Route path='/admin-feedback-management' element = {<AdminFeedbackManagement/>}/>
          <Route path='/admin-venue-oversight' element = {<AdminVenueOversight/>}/>
          <Route path='/player' element = {<PlayerDashboard/>}/>
          <Route path='/player-bookings' element = {<Player_Bookings/>}/>
          <Route path='/player-equipment-rental' element = {<PlayerEquipmentRental/>}/>
          <Route path='/coach-schedule-sessions' element = {<CoachScheduleSessions/>}/>
          <Route path='/coach-add-team' element = {<Coach_add_team/>}/>
          <Route path='/coach-add-player' element = {<Coach_add_players/>}/>
          <Route path='/ground-manager-myGrounds' element = {<GM_myGrounds/>}/>
          <Route path='/ground-manager-add-ground' element = {<GM_add_grounds/>}/>
          <Route path='/ground-manager-profile' element = {<GM_profile/>}/>
          <Route path='/opm-add-new-equipment' element = {<OPM_add_new_equipment/>}/>
          <Route path='/player-rent/:id' element = {<PlayerRent/>}/>
          <Route path='/player-new-booking' element = {<PlayerNewBooking/>}/>
          <Route path='/player-book-ground/:id' element = {<PlayerBookGround/>}/>
          <Route path='/player-profile' element = {<PlayerProfile/>}/>
          <Route path='/coach-all-grounds' element = {<Coach_all_grounds/>}/>
          <Route path='/coach-bookings' element = {<Coach_bookings/>}/>
          <Route path='/coach-add-new-booking/:id' element = {<Coach_add_new_booking/>}/>
          <Route path='/coach-profile' element = {<Coach_profile/>}/>
          <Route path='/coach-payment-gateway' element = {<Coach_payment_gateway/>}/>
          <Route path='/player-rental-history' element = {<MyRentals/>}/>
          <Route path='/player-sessions' element = {<Player_sessions/>}/>
          <Route path='/player-matches' element = {<Player_matches/>}/>
          <Route path='/player-notifications' element = {<Player_notifications/>}/>
          <Route path='/player-payment-gateway' element = {<Player_payment_gateway/>}/>
          <Route path='/custom-jersey' element = {<Custom_jersey/>}/>
          

          <Route path='/admin' element = {<AdminDashboard/>}/>
          <Route path='/coach' element = {<Coach_dashboard/>}/>
          <Route path='/operation_manager' element = {<OPM_dashboard/>}/>
          <Route path='/admin-finance' element = {<Finance/>}/>
          <Route path='/admin-payment-gateway' element = {<Admin_payment_gateway/>}/>
          <Route path='/opm-payment-gateway' element = {<OPM_payment_gateway/>}/>
          <Route path='/ground-manager-payment-gateway' element = {<GM_payment_gateway/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
