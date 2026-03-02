import React, { useEffect, useState } from 'react';
import './styles/player_equipment_rental.css';
import PlayerSidebar from './PlayerSidebar ';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faSearch, faChevronRight, faChevronLeft} from '@fortawesome/free-solid-svg-icons'
import {ToastContainer,toast} from 'react-toastify'
import axios from 'axios'
import {Link} from 'react-router-dom'

const PlayerEquipmentRental = () => {
 
  const [equipments,setEquipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(()=>{

    const fetchEquipments = async() => 
    {
      try {
        
        const res = await axios.get('http://localhost:8080/api/player/get-player-equipments',
          {withCredentials:true}
        )

        if(res.status === 200)
        {
          setEquipments(res.data.data);
        }

      } catch (error) {
        if(error.response)
        {
          if(error.response.status === 404)
          {
            toast.error("No Equipments Found",{autoClose:1500});
          }
        }
        else if(error.response.status === 500)
        {
          toast.error("Internal error occured!",{autoClose:1500});
        }
      }
    }

    fetchEquipments();

  },[])

  // Filter equipments based on search term
  const filteredEquipments = equipments.filter(equipment =>
    equipment.item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to handle unavailable equipment
  const renderEquipmentCard = (equipment) => {
    const isAvailable = equipment.status === "available";
    
    return (
      <div className={`p-er-equipment-card ${!isAvailable ? 'p-er-unavailable' : ''}`} key={equipment._id}>
        <div className="p-er-card-image">
          <img src={`/uploads/${equipment.image}`} alt={equipment.item} />
          {!isAvailable && <div className="p-er-unavailable-overlay">Unavailable</div>}
        </div>
        <div className="p-er-card-content">
          <h3 className="p-er-card-title">{equipment.item}</h3>
          
          <div className="p-er-card-footer">
            <div className="p-er-price">LKR {equipment.price}/hr</div>
            
            {isAvailable ? (
              <>
                <Link
                  to={`/player-rent/${equipment._id}`}
                  className="p-er-rent-btn">
                  Rent Now
                </Link>
                <Link className="p-er-buy">
                  Buy Now
                </Link>
              </>
            ) : (
              <>
                <button className="p-er-rent-btn p-er-disabled" disabled>
                  Rent Now
                </button>
                <button className="p-er-buy p-er-disabled" disabled>
                  Buy Now
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-er-player-equipment-rental">
        <PlayerSidebar/>
      
      <div className="p-er-main-content">
        <div className="p-er-page-header">
          <h1 className="p-er-page-title">Equipment Rental</h1>
          <div className="p-er-search-bar">
            <FontAwesomeIcon icon={faSearch}/>
            <input 
              type="text" 
              placeholder="Search for equipment..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="p-er-equipment-grid">
          {filteredEquipments.length > 0 ? (
            filteredEquipments.map(renderEquipmentCard)
          ) : (
            <div className="p-er-equipment-card">
              <h3>
                {searchTerm ? `No equipments found for "${searchTerm}"` : "No Equipments Found"}
              </h3>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PlayerEquipmentRental;