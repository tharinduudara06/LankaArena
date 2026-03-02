import React from 'react'
import {Link, useNavigate} from 'react-router-dom'
import dashboard from '../../images/dashboard.png'
import settings from '../../images/settings.png'
import worker01 from '../../images/worker01.jpg'
import logout2 from '../../images/logout2.png'
import user_02 from '../../images/user_02.png'
import contents from '../../images/contents.png'
import venue from '../../images/venue.png'
import security from '../../images/security.png'
import notification from '../../images/notification.png'
import money from '../../images/money.png'
import axios from 'axios'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faRightFromBracket} from '@fortawesome/free-solid-svg-icons'

export default function Admin_nav() {

    const navigate = useNavigate();

    const handleLogout = async () => {
    try {
        const res = await axios.post('http://localhost:8080/api/admin/logout', {}, { withCredentials: true });
        if (res.data?.success !== false) {
            navigate('/log');
        }
    } catch (err) {
        console.error('Logout failed', err);
        navigate('/log');
    }
};

  return (
    <div>
      <div className="opm-sidebar">
        <div className="opm-sidebar-header">
            <p>LankaArena</p>
            <p>Admin</p>
        </div>
        <div className="opm-sidebar-links">
            <div className="opm-link">
                
                <Link to='/admin' className='opm-linkText'>
                    <img src={dashboard} alt="" />
                    Dashboard
                </Link>
            </div>

            <div className="opm-link">
                
                <Link to='/all-users' className='opm-linkText'>
                    <img src={user_02} alt='home'/>
                    User Management
                </Link>
            </div>

            <div className="opm-link">
                
                <Link to="/admin-finance" className='opm-linkText'>
                    <img src={money} alt='home'/>
                    Financial & payments
                </Link>
            </div>

            <div className="opm-link">
                <Link to="/admin-payment-gateway" className='opm-linkText'>
                    Payment Gateway
                </Link>
            </div>

            <div className="opm-link">
                
                <Link to='/admin-feedback-management' className='opm-linkText'>
                    <img src={contents} alt='home'/>
                    Feedback Management
                </Link>
            </div>

            <div className="opm-link">
                
                <Link to='/admin-venue-oversight' className='opm-linkText'>
                    <img src={venue} alt='home'/>
                    Venue & Service Oversight
                </Link>
            </div>

            <div className="opm-link">
                
                <Link className='opm-linkText'>
                    <img src={security} alt='home'/>
                    System Security
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
                    System settings
                </Link>
            </div>


        </div>
        <div className="opm-sidebar-footer">
            <div className="footer-profile-icon">
                <img src={worker01} alt="" />
            </div>
            
           
                <button
                onClick={()=>handleLogout()}
                >
                <FontAwesomeIcon icon={faRightFromBracket} style={{color: "#00ffb7ff"}} />
                </button>
                
          
            
        </div>
      </div>
    </div>
  )
}
