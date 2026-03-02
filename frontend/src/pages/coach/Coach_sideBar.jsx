import React from 'react'
import './styles/coach_sideBar.css'
import {Link, useNavigate} from 'react-router-dom'
import dashboard from '../../images/dashboard.png'
import managers from '../../images/managers.png'
import jersey from '../../images/jersey.png'
import booking from '../../images/booking.png'
import attendance from '../../images/attendance.png'
import trophy from '../../images/trophy.png'
import sessions from '../../images/sessions.png'
import notification from '../../images/notification.png'
import settings from '../../images/settings.png'
import worker01 from '../../images/worker01.jpg'
import profile from '../../images/profile.png'
import logout2 from '../../images/logout2.png'
import axios from 'axios'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faRightFromBracket} from '@fortawesome/free-solid-svg-icons'


export default function Coach_sideBar() {

    const navigate = useNavigate();

    const handleLogout = async () => {
    try {
        const res = await axios.post('http://localhost:8080/api/coach/logout', {}, { withCredentials: true });
        if (res.status === 200) {
            navigate('/log'); 
        }
    } catch (err) {
        console.error('Logout failed', err);
    }
};
  return (
    <div>
      <div className="coach-nav-container">
        <div className="opm-sidebar-header">
            <p>LankaArena</p>
            <p>Team Manager</p>
        </div>
        <div className="opm-sidebar-links">
            <div className="opm-link">
                
                <Link to='/coach' className='opm-linkText'>
                    <img src={dashboard} alt="" />
                    Dashboard
                </Link>
            </div>

            <div className="opm-link">
                
                <Link to='/team-management' className='opm-linkText'>
                    <img src={managers} alt="" />
                    Team Management
                </Link>
            </div>

            <div className="opm-link">
                
                <Link to='/uniform-order' className='opm-linkText'>
                    <img src={jersey} alt="" />
                    Uniform Orders
                </Link>
            </div>

            <div className="opm-link">
                
                <Link to='/manage-matches' className='opm-linkText'>
                    <img src={trophy} alt="" />
                    Manage Matches
                </Link>
            </div>

            <div className="opm-link">
                
                <Link to='/coach-schedule-sessions' className='opm-linkText'>
                    <img src={sessions} alt="" />
                    Schedule Sessions
                </Link>
            </div>

            <div className="opm-link">
                
                <Link to='/coach-bookings' className='opm-linkText'>
                    <img src={booking} alt="" />
                    My Bookings
                </Link>
            </div>

            <div className="opm-link">
                
                <Link to='/coach-profile' className='opm-linkText'>
                    <img src={profile} alt="" />
                    Profile
                </Link>
            </div>
        </div>
        <div className="coach-sidebar-footer">
            <div className="footer-profile-pic">
                <img src={worker01} alt="" />
            </div>

            
                <button
                onClick={handleLogout}
                >
                <FontAwesomeIcon icon={faRightFromBracket} style={{ color: "#00ffc8ff", fontSize: "15px" }} />
                </button>
            
        </div>
      </div>
    </div>
  )
}
