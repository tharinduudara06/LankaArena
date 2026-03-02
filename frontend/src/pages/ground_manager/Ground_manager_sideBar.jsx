import React, { useState } from 'react';
import './styles/groundManager_sideBar.css';
import { Link, useNavigate } from 'react-router-dom';
import dashboard from '../../images/dashboard.png';
import worker01 from '../../images/worker01.jpg';
import logout2 from '../../images/logout2.png';
import calendar2 from '../../images/calendar2.png';
import task from '../../images/task.png';
import tools from '../../images/tools.png';
import money from '../../images/money.png';
import venue from '../../images/venue.png'
import profile from '../../images/profile.png';
import axios from 'axios'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faRightFromBracket} from '@fortawesome/free-solid-svg-icons'

export default function Ground_manager_sideBar() {

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
        const res = await axios.post('http://localhost:8080/api/ground-manager/logout', {}, { withCredentials: true });
        if (res.status === 200) {
            navigate('/log'); // redirect to login page
        }
    } catch (err) {
        console.error('Logout failed', err);
    }
};

  const [openSubmenus, setOpenSubmenus] = useState({
    booking: false,
    maintenance: false
  });

  const toggleSubmenu = (menu) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  return (
    <div>
      <div className="gm-nav-container">
        <div className="gm-sidebar-header">
          <p>LankaArena</p>
          <p>Ground Manager</p>
        </div>
        
        <div className="gm-sidebar-links">
          
          <div className="gm-link active">
            <Link to='/ground-manager' className='gm-linkText'>
              <img src={dashboard} alt="" />
              Dashboard
            </Link>
          </div>

          <div className="gm-link active">
              <Link to='/ground-manager-bookings' className='gm-linkText'>
                <img src={calendar2} alt="" />
                Bookings
              </Link>
          </div>

          <div className="gm-link">
            <Link to='/ground-manager-maintenance' className='gm-linkText'>
              <img src={tools} alt="" />
              Maintenance
            </Link>
          </div>

          <div className="gm-link">
            <Link to='/ground-manager-payments' className='gm-linkText'>
              <img src={money} alt="" />
              Payments
            </Link>
          </div>

          <div className="gm-link">
            <Link to='/ground-manager-payment-gateway' className='gm-linkText'>
              Payment Gateway
            </Link>
          </div>

          <div className="gm-link">
            <Link to='/ground-manager-myGrounds' className='gm-linkText'>
              <img src={venue} alt="" />
              My Ground
            </Link>
          </div>

          <div className="gm-link">
            <Link to='/ground-manager-profile' className='gm-linkText'>
              <img src={profile} alt="" />
              Profile
            </Link>
          </div>
        </div>

        <div className="gm-sidebar-footer">
          <div className="gm-footer-profile-pic">
            <img src={worker01} alt="" />
          </div>

          
            <button 
            onClick={()=>handleLogout()}
            >
              <FontAwesomeIcon icon={faRightFromBracket} style={{color:"#00ffccff"}}/>
            </button>
          
        </div>
      </div>
    </div>
  );
}