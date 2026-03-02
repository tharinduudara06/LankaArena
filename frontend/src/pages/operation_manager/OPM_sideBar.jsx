import React from 'react'
import './styles/opm-sidebar.css'
import {Link, useNavigate} from 'react-router-dom'
import dashboard from '../../images/dashboard.png'
import managers from '../../images/managers.png'
import pricing from '../../images/pricing.png'
import inventory from '../../images/inventory.png'
import ball from '../../images/ball.png'
import notification from '../../images/notification.png'
import settings from '../../images/settings.png'
import worker01 from '../../images/worker01.jpg'
import logout2 from '../../images/logout2.png'
import axios from 'axios'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faRightFromBracket} from '@fortawesome/free-solid-svg-icons'


export default function OPM_sideBar() {

    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            console.log('Attempting logout...');
            const res = await axios.post('http://localhost:8080/api/operation-manager/logout', {}, { 
                withCredentials: true 
            });
            console.log('Logout response:', res.data);
            if (res.status === 200) {
                // Clear any local storage or session data
                localStorage.clear();
                sessionStorage.clear();
                // Navigate to login page
                navigate('/log'); 
            }
        } catch (err) {
            console.error('Logout failed:', err);
            // Even if logout fails on server, clear local data and redirect
            localStorage.clear();
            sessionStorage.clear();
            navigate('/log');
        }
    };

  return (
    <div>
      <div className="opm-sidebar">
        <div className="opm-sidebar-header">
            <p>LankaArena</p>
            <p>Operations Manager</p>
        </div>
        <div className="opm-sidebar-links">
            <div className="opm-link">
                
                <Link to='/operation_manager' className='opm-linkText'>
                    <img src={dashboard} alt="" />
                    Dashboard
                </Link>
            </div>

            <div className="opm-link">
                
                <Link to='/opm-ground-manager' className='opm-linkText'>
                    <img src={managers} alt="" />
                    Ground Managers
                </Link>
            </div>

            <div className="opm-link">
                
                <Link to='/opm-ground-pricing' className='opm-linkText'>
                    <img src={pricing} alt="" />
                    pricing Rules
                </Link>
            </div>

            <div className="opm-link">
                
                <Link to='/opm-equipment-inventory' className='opm-linkText'>
                    <img src={inventory} alt="" />
                    Equipment Inventory
                </Link>
            </div>

            <div className="opm-link">
                
                <Link to='/opm-equipment-rentals' className='opm-linkText'>
                    <img src={ball} alt="" />
                    Equipment Rentals
                </Link>
            </div>

            <div className="opm-link">
                <Link to='/opm-payment-gateway' className='opm-linkText'>
                    Payment Gateway
                </Link>
            </div>

            <div className="opm-link">
                
                <Link className='opm-linkText'>
                    <img src={notification} alt="" />
                    Notifications
                </Link>
            </div>

            <div className="opm-link">
                
                <Link className='opm-linkText'>
                    <img src={settings} alt="" />
                    Settings
                </Link>
            </div>


        </div>
        <div className="opm-sidebar-footer">
            <div className="footer-profile-icon">
                <img src={worker01} alt="" />
            </div>
            
            
                <button
                    className="logout-btn"
                    onClick={handleLogout}
                    title="Logout"
                >
                    <FontAwesomeIcon style={{color:"#00ffc3ff"}} icon={faRightFromBracket} />
                </button>
                
            
            
        </div>
      </div>
    </div>
  )
}
