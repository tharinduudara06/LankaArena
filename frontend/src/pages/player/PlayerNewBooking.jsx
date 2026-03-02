import React, { useEffect, useState } from 'react';
import './styles/player_new_booking.css'
import PlayerSidebar from './PlayerSidebar ';
import {ToastContainer,toast} from 'react-toastify'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faMapMarkerAlt} from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom';

const PlayerNewBooking = () => {

    const [grounds,setGrounds] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {

        const fetchGrounds = async() => 
        {
            try {
                
                const res = await axios.get('http://localhost:8080/api/player/get-all-grounds',
                    {withCredentials:true}
                )

                if(res.status === 200 || res.status === 201)
                {
                    setGrounds(res.data.data);
                }

            } catch (error) {
                if(error.response.status === 400)
                {
                    navigate('/log');
                }

                else if(error.response.status === 404)
                {
                    toast.error("There no any grounds!",{autoClose:1500});
                }
                else if(error.response.status === 500)
                {
                    toast.error("Internal server error!",{autoClose:1500});
                }
            }
        }
        fetchGrounds();
    },[]);

    return (
        <div className="p-nr-player-container">
            {/* Sidebar */}
           
           <PlayerSidebar/>

           <ToastContainer/>

            {/* Main Content */}
            <div className="p-nr-main-content">
                <div className="p-nr-page-header">
                    <h1 className="p-nr-page-title">Available Grounds</h1>
                </div>
                
                <div className="p-nr-search-filter-container">
                    <div className="p-nr-search-box">
                        <i className="fas fa-search"></i>
                        <input type="text" placeholder="Search grounds by name or location..." />
                    </div>
                    <div className="p-nr-filter-dropdown">
                        <i className="fas fa-filter"></i>
                        <span>Filter by</span>
                    </div>
                </div>
                
                <div className="p-nr-grounds-container">
                    {/* Ground Cards */}
                    {grounds.length > 0 ? (
                        grounds.map((ground) => (
                    <div key={ground._id} className="p-nr-ground-card">
                        <img src={`/uploads/${ground.photo.filename}`} alt="Colombo Sports Ground" className="p-nr-ground-image" />
                        <div className="p-nr-ground-details">
                            <h3 className="p-nr-ground-name">{ground.name}</h3>
                            <div className="p-nr-ground-info">
                                <div className="p-nr-ground-address">
                                    <FontAwesomeIcon icon={faMapMarkerAlt}/>
                                    <span>{ground.location.address},{ground.location.city}</span>
                                </div>
                                <div className="p-nr-ground-price">LKR {ground.price} / hr</div>
                            </div>
                            <div className="p-nr-ground-phone">
                                <i className="fas fa-phone"></i>
                                <span>{ground.ground_manager.mobile}</span>
                            </div>
                            <div className="p-nr-facilities">
                                <div className="p-nr-facilities-title">Facilities:</div>
                                
                                <div className="p-nr-facilities-list">
                                {ground.facilities.map((facility,i) => (
                                    
                                    <span key={i} className="p-nr-facility-tag">{facility}</span>
                                    
                                ))}
                                </div>
                                
                            </div>
                            <Link to={`/player-book-ground/${ground._id}`} className="p-nr-book-button">Book Now</Link>
                        </div>
                    </div>
                        ))
                    ):(
                        <div className="p-nr-ground-card">
                            No PlayGrounds or courts available
                        </div>
                    )}
                    
                </div>
            </div>
        </div>
    );
};

export default PlayerNewBooking;