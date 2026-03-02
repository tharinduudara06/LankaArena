import React, { useState, useEffect } from 'react'
import Ground_manager_sideBar from './Ground_manager_sideBar'
import './styles/gm_add_ground.css'
import axios from 'axios'
import {ToastContainer,toast} from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default function GM_add_grounds() {

    const [g_name,setG_name] = useState('');
    const [address,setAddress] = useState('');
    const [city,setCity] = useState('');
    const [price,setPrice] = useState('');
    const [facilities,setFacilities] = useState('');
    const [photo,setPhoto] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Map-related state
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [mapCenter, setMapCenter] = useState([6.9271, 79.8612]); // Default to Colombo, Sri Lanka
    const [isMapVisible, setIsMapVisible] = useState(false);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);

    const navigate = useNavigate();

    // Reverse geocoding function to get address from coordinates
    const reverseGeocode = async (lat, lng) => {
        setIsLoadingLocation(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
            );
            const data = await response.json();
            
            if (data && data.display_name) {
                const address = data.display_name;
                const city = data.address?.city || data.address?.town || data.address?.municipality || 'Unknown City';
                setAddress(address);
                setCity(city);
                toast.success("Location selected successfully!", {
                    position: 'top-center',
                    autoClose: 2000
                });
            }
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            toast.error("Failed to get address. Please try again.", {
                position: 'top-center',
                autoClose: 2000
            });
        } finally {
            setIsLoadingLocation(false);
        }
    };

    // Map click handler component
    const MapClickHandler = () => {
        useMapEvents({
            click: (e) => {
                const { lat, lng } = e.latlng;
                setSelectedPosition([lat, lng]);
                reverseGeocode(lat, lng);
            },
        });
        return null;
    };

    // Get user's current location
    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setMapCenter([latitude, longitude]);
                    setSelectedPosition([latitude, longitude]);
                    reverseGeocode(latitude, longitude);
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    toast.error("Unable to get your location. Please select manually on the map.", {
                        position: 'top-center',
                        autoClose: 3000
                    });
                }
            );
        } else {
            toast.error("Geolocation is not supported by this browser.", {
                position: 'top-center',
                autoClose: 3000
            });
        }
    };

    const handleSubmit = async(e) => 
    {
        e.preventDefault();
        setIsSubmitting(true);

        // Validate that location is selected
        if (!selectedPosition) {
            toast.error("Please select a location on the map!", {
                position: 'top-center',
                autoClose: 2000
            });
            setIsSubmitting(false);
            return;
        }

        try {

            const data = new FormData();
            data.append("gname", g_name);
            data.append("address", address);
            data.append("city", city);
            data.append("price", price);
            data.append("facilities", facilities);
            data.append("photo", photo);
            
            const res = await axios.post("http://localhost:8080/api/ground-manager/gm-add-ground",data,
                {
                    withCredentials:true,
                    headers: { "Content-Type": "multipart/form-data" }
                }
            );

            if(res.status === 201)
            {
                toast.success("Successfully Registered your Ground!",
                    {
                        position:'top-center',
                        autoClose:1500
                    }
                )

                setG_name('');
                setAddress('');
                setCity('');
                setPrice('');
                setFacilities('');
                setPhoto(null);
                setSelectedPosition(null);
                setIsMapVisible(false);
            }

        } catch (error) {
            if(error.response)
            {
                if(error.response.status === 400)
                {
                        toast.error("Please add your Image!",
                        {
                            position:'top-center',
                            autoClose:1500
                        }
                    )
                }
                else if(error.response.status === 401)
                {
                    navigate('/log');
                }
                else if(error.response.status === 500)
                {
                    toast.error("Something Went wrong!!",
                        {
                            position:'top-center',
                            autoClose:1500
                        }
                    )
                }
            }
        } finally {
            setIsSubmitting(false);
        }
    }

  return (
    <div className="gm-ag-wrapper">
        <Ground_manager_sideBar/>

      <div className="gm-mg-add-ground-container">
        <ToastContainer/>
        
        <div className="gm-ag-main-content">
            <div className="gm-ag-header">
                <h1 className="gm-ag-title">Add New Ground</h1>
                <p className="gm-ag-subtitle">Register your sports ground to start accepting bookings</p>
            </div>

            <div className="gm-mg-add-ground-main">
                <form encType="multipart/form-data" onSubmit={handleSubmit} className="gm-ag-form">
                    <div className="gm-ag-form-grid">
                        <div className="gm-ag-form-group">
                            <label className="gm-ag-label">Ground Name</label>
                            <input
                                value={g_name}
                                onChange={(e) => setG_name(e.target.value)}
                                type="text" 
                                name='gname'
                                className="gm-ag-input"
                                placeholder="Enter ground name"
                                required
                            />
                        </div>

                        <div className="gm-ag-form-group gm-ag-full-width">
                            <label className="gm-ag-label">Ground Location</label>
                            <div className="gm-ag-location-container">
                                <div className="gm-ag-location-buttons">
                                    <button 
                                        type="button"
                                        onClick={() => setIsMapVisible(!isMapVisible)}
                                        className="gm-ag-map-toggle-btn"
                                    >
                                        {isMapVisible ? 'Hide Map' : 'Select Location on Map'}
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={getCurrentLocation}
                                        className="gm-ag-current-location-btn"
                                        disabled={isLoadingLocation}
                                    >
                                        {isLoadingLocation ? 'Getting Location...' : 'Use Current Location'}
                                    </button>
                                </div>
                                
                                {isMapVisible && (
                                    <div className="gm-ag-map-container">
                                        <MapContainer
                                            center={mapCenter}
                                            zoom={13}
                                            style={{ height: '300px', width: '100%' }}
                                        >
                                            <TileLayer
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            />
                                            <MapClickHandler />
                                            {selectedPosition && (
                                                <Marker position={selectedPosition} />
                                            )}
                                        </MapContainer>
                                        <p className="gm-ag-map-instruction">
                                            Click on the map to select your ground location
                                        </p>
                                    </div>
                                )}
                                
                                {selectedPosition && (
                                    <div className="gm-ag-selected-location">
                                        <div className="gm-ag-location-info">
                                            <strong>Selected Location:</strong>
                                            <p><strong>Address:</strong> {address}</p>
                                            <p><strong>City:</strong> {city}</p>
                                        </div>
                                    </div>
                                )}
                                
                                {!selectedPosition && (
                                    <div className="gm-ag-location-placeholder">
                                        <p>Please select a location using the map or current location button</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="gm-ag-form-group">
                            <label className="gm-ag-label">Price per Hour (LKR)</label>
                            <input 
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                type="number" 
                                name='price'
                                className="gm-ag-input"
                                placeholder="0.00"
                                min="0"
                                required
                            />
                        </div>

                        <div className="gm-ag-form-group gm-ag-full-width">
                            <label className="gm-ag-label">Facilities</label>
                            <input 
                                value={facilities}
                                onChange={(e) => setFacilities(e.target.value)}
                                type="text" 
                                name="facility" 
                                className="gm-ag-input"
                                placeholder='EX: football, cricket, rugby, changing rooms...'
                                required
                            />
                        </div>

                        <div className="gm-ag-form-group gm-ag-full-width">
                            <label className="gm-ag-label">Ground Image</label>
                            <div className="gm-ag-file-upload">
                                <input 
                                    onChange={(e) => setPhoto(e.target.files[0])}
                                    type="file" 
                                    name='photo'
                                    className="gm-ag-file-input"
                                    accept="image/*"
                                    required
                                />
                                <div className="gm-ag-file-display">
                                    {photo ? (
                                        <div className="gm-ag-file-selected">
                                            <span className="gm-ag-file-name">{photo.name}</span>
                                            <span className="gm-ag-file-change">Change Image</span>
                                        </div>
                                    ) : (
                                        <div className="gm-ag-file-placeholder">
                                            <span className="gm-ag-file-icon">📷</span>
                                            <span>Click to select ground image</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {photo && (
                                <div className="gm-ag-image-preview">
                                    <img 
                                        src={URL.createObjectURL(photo)} 
                                        alt="Ground preview" 
                                        className="gm-ag-preview-img"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="gm-ag-submit-container">
                        <button 
                            type="submit" 
                            className={`gm-ag-submit-btn ${isSubmitting ? 'gm-ag-submitting' : ''}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="gm-ag-spinner"></span>
                                    Registering Ground...
                                </>
                            ) : (
                                'Register Ground'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      </div>
    </div>
  )
}