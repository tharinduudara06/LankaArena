import React, { useEffect, useState } from 'react';
import './styles/coach_all_grounds.css';
import {ToastContainer,toast} from 'react-toastify'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faMapMarkerAlt} from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom';
import Coach_sideBar from './Coach_sideBar';

const Coach_all_grounds = () => {

    const [grounds,setGrounds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {

        const fetchGrounds = async() => 
        {
            try {
                setLoading(true);
                setError(null);
                console.log('Fetching grounds...');
                
                const res = await axios.get('http://localhost:8080/api/coach/get-all-grounds',
                    {withCredentials:true}
                )

                console.log('Grounds response:', res.data);
                console.log('Grounds data:', res.data.data);
                console.log('Grounds count:', res.data.data?.length);

                if(res.status === 200)
                {
                    setGrounds(res.data.data || []);
                    console.log('Grounds set in state:', res.data.data);
                }

            } catch (error) {
                console.error('Error fetching grounds:', error);
                console.error('Error response:', error.response?.data);
                setError(error.response?.data?.message || 'Failed to fetch grounds');
                
                if(error.response?.status === 400)
                {
                    navigate('/log');
                }
                else if(error.response?.status === 404)
                {
                    toast.error("There no any grounds!",{autoClose:1500});
                }
                else if(error.response?.status === 500)
                {
                    toast.error("Internal server error!",{autoClose:1500});
                }
                else
                {
                    toast.error("Failed to fetch grounds!",{autoClose:1500});
                }
            } finally {
                setLoading(false);
            }
        }
        fetchGrounds();
    },[]);

    return (
        <div className="c-ag-player-container">
            {/* Sidebar */}
           
           <Coach_sideBar/>

           <ToastContainer/>

            {/* Main Content */}
            <div className="c-ag-main-content">
                <div className="c-ag-page-header">
                    <h1 className="c-ag-page-title">Available Grounds</h1>
                </div>
                
                <div className="c-ag-search-filter-container">
                    <div className="c-ag-search-box">
                        <i className="fas fa-search"></i>
                        <input type="text" placeholder="Search grounds by name or location..." />
                    </div>
                    <div className="c-ag-filter-dropdown">
                        <i className="fas fa-filter"></i>
                        <span>Filter by</span>
                    </div>
                </div>
                
                <div className="c-ag-grounds-container">
                    {/* Loading State */}
                    {loading && (
                        <div className="c-ag-loading">
                            <div className="c-ag-spinner"></div>
                            <p>Loading grounds...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="c-ag-error">
                            <p>Error: {error}</p>
                            <button onClick={() => window.location.reload()}>Retry</button>
                        </div>
                    )}

                    {/* Ground Cards */}
                    {!loading && !error && grounds.length > 0 ? (
                        grounds.map((ground) => (
                    <div key={ground._id} className="c-ag-ground-card">
                        <img src={`/uploads/${ground.photo.filename}`} alt={ground.name} className="c-ag-ground-image" />
                        <div className="c-ag-ground-details">
                            <h3 className="c-ag-ground-name">{ground.name}</h3>
                            <div className="c-ag-ground-info">
                                <div className="c-ag-ground-address">
                                    <FontAwesomeIcon icon={faMapMarkerAlt}/>
                                    <span>{ground.location.address},{ground.location.city}</span>
                                </div>
                                <div className="c-ag-ground-price">LKR {ground.price} / hr</div>
                            </div>
                            <div className="c-ag-ground-phone">
                                <i className="fas fa-phone"></i>
                                <span>{ground.ground_manager?.mobile || 'N/A'}</span>
                            </div>
                            <div className="c-ag-facilities">
                                <div className="c-ag-facilities-title">Facilities:</div>
                                
                                <div className="c-ag-facilities-list">
                                {ground.facilities && ground.facilities.length > 0 ? (
                                    ground.facilities.map((facility,i) => (
                                        <span key={i} className="c-ag-facility-tag">{facility}</span>
                                    ))
                                ) : (
                                    <span className="c-ag-facility-tag">No facilities listed</span>
                                )}
                                </div>
                                
                            </div>
                            <Link to={`/coach-add-new-booking/${ground._id}`} className="c-ag-book-button">Book Now</Link>
                        </div>
                    </div>
                        ))
                    ) : !loading && !error && (
                        <div className="c-ag-ground-card">
                            <p>No PlayGrounds or courts available</p>
                        </div>
                    )}
                    
                    {/* Additional ground cards can be added here */}
                </div>
            </div>
        </div>
    );
};

export default Coach_all_grounds;