import React from 'react';
import './styles/PlayerSidebar.css';
import {Link, useNavigate} from 'react-router-dom'
import dashboard from '../../images/dashboard.png'
import booking from '../../images/booking.png'
import trophy from '../../images/trophy.png'
import equipment_rental from '../../images/equipment_rental.png'
import progress from '../../images/progress.png'
import user_02 from '../../images/user_02.png'
import nutritions from '../../images/nutritions.png'
import pay_history from '../../images/pay_history.png'
import ratings from '../../images/ratings.png'
import settings from '../../images/settings.png'
import sessions from '../../images/sessions.png'
import worker01 from '../../images/worker01.jpg'
import profile from '../../images/profile.png'
import jersey from '../../images/jersey.png'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faRightFromBracket} from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'

const PlayerSidebar = () => {
  const menuItems = [
    { id: 1, name: 'Dashboard',icon:dashboard, link:'/player' },
    { id: 2, name: 'My Bookings', icon:booking, link:'/player-bookings' },
    { id: 3, name: 'My Matches', icon:trophy, link:'/player-matches' },
    { id: 4, name: 'Equipment Rental',icon:equipment_rental, link:'/player-rental-history' },
    { id: 5, name: 'Training Sessions',icon:sessions, link:'/player-sessions'},
    { id: 6, name: 'Custom Jersey',icon:jersey, link:'/custom-jersey'},
    { id: 7, name: 'profile',icon:profile,link:'/player-profile'}
  ];

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
        const res = await axios.post('http://localhost:8080/api/player/logout', {}, { withCredentials: true });
        if (res.status === 200) {
            navigate('/log'); 
        }
    } catch (err) {
        console.error('Logout failed', err);
    }
};

  return (

    <div className="player-sidebar">
      <div className="player-sidebar-header">
        <p>LankaArena</p>
        <p>Player</p>
      </div>
      
      <div className="player-sidebar-links">
        {menuItems.map(item => (
          <div className="player-link" key={item.id}>
            <Link to={item.link} className = "player-linkText">
              <div className="icon-placeholder">
                <img src={item.icon} alt="" />
              </div>
              {item.name}
            </Link>
          </div>

        ))}
      </div>
      
      <div className="player-sidebar-footer">
        <div className="player-footer-profile-icon">
          <img src={worker01} alt="" />
        </div>
        
        <button
         onClick={()=>handleLogout()}
         className="player-footer-logout">
          <FontAwesomeIcon style={{color:"#00c9b1ff"}} icon={faRightFromBracket}/>
        </button>
      </div>
    </div>
  );
};

export default PlayerSidebar;
