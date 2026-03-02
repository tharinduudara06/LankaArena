import React, { useEffect, useState } from "react";
import "./styles/player_rent.css";
import PlayerSidebar from "./PlayerSidebar ";
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios'
import {ToastContainer,toast} from 'react-toastify'

const PlayerRent = () => {
    const{id} = useParams();
    const [equipments,setEquipments] = useState([]);

    const [quantity,setQuantity] = useState('');
    const [date,setDate] = useState('');
    const [from,setFrom] = useState('');
    const [to,setTo] = useState('');
    const [fullPrice,setFullPrice] = useState('');

    const navigate = useNavigate();

    const totalPrice = async(e,equipment) => 
    {

      e.preventDefault();
      try {
        const fromParts = from.split(":");
        const toParts = to.split(":");

        const fromHours = parseInt(fromParts[0]);
        const fromMinutes = parseInt(fromParts[1]);

        const toHours = parseInt(toParts[0]);
        const toMinutes = parseInt(toParts[1]);

        const fromInMinutes = fromHours * 60 + fromMinutes;
        const toInMinutes = toHours * 60 + toMinutes;

        const durationInHours = (toInMinutes - fromInMinutes) / 60;

        const duration = Math.floor(durationInHours);

        if (duration <= 0) {
          alert("Invalid time range");
          return;
        }

        const total = duration * Number(quantity) * equipment.price;

        
        setFullPrice(total);

      } catch (error) {
        console.error(error);
      }

      
    }

         useEffect(()=>{
    
            const fetchEquipments = async() => 
            {
            try {
                
                const res = await axios.get(`http://localhost:8080/api/player/get-equipments-by-id/${id}`,
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

    //####################### rent now function #################################

    const handleRentNow = async(equipment) =>
    {
      try {
        
        if (!quantity || !date || !from || !to || !fullPrice) {
          toast.error("Please fill all fields and calculate total first!", { autoClose: 1500 });
          return;
      }

      const rentData = {
        equipmentId: equipment._id,
        quantity: Number(quantity),
        date,
        from,
        to,
        total: fullPrice,
      };

      const res = await axios.post("http://localhost:8080/api/player/rent-equipment",rentData,
        { withCredentials: true }
      );

      if (res.status === 201 || res.status === 200) {
        toast.success("Equipment rented successfully!", { autoClose: 1500 });
        setQuantity('');
        setDate('');
        setFrom('');
        setTo('');
        setFullPrice('');

        setInterval(() => {
          window.location.reload();
        }, 1520);
      }

      } catch (error) {
        console.error(error);
      if(error.response)
      {
        if(error.response.status === 400)
        {
          navigate('/log');
        }
        else if(error.response.status === 401)
        {
          toast.error("Equipment rent Failed!!", { autoClose: 1500 });
        }
        else if(error.response.status === 402)
        {
          toast.error(error.response.data.message, { autoClose: 1500 });
        }
        else if(error.response.status === 500)
        {
          toast.error("Internal server error occured", { autoClose: 1500 });
        }
      }
      }
    }

  return (
    <div className="pr-rent-body">

        <ToastContainer/>
      {/* Sidebar */}
      <PlayerSidebar/>
      {/* Main Content */}
    <div className="p-rent-container">
            <div className="pr-rent-main-content">
        <div className="pr-rent-page-header">
          <h1 className="pr-rent-page-title">Equipment Rental</h1>
          
        </div>

        <div className="pr-rent-rental-container">
          {/* Equipment Card */}

            {equipments.map((equipment) => (

              <div className="pr-rent-equipment-wrapper">

                 <div key={equipment._id} className="pr-rent-equipment-card">
                    <div className="pr-rent-equipment-image">
                    <img
                        src={`/uploads/${equipment.image}`}
                        alt={equipment.item}
                    />
                    </div>
                    <div className="pr-rent-equipment-details">
                    <h2 className="pr-rent-equipment-name">{equipment.item}</h2>
                    

                    <div className="pr-rent-equipment-specs">
                        <div className="pr-rent-spec">
                          <div className="pr-rent-spec-value">LKR {equipment.price}</div>
                          <div className="pr-rent-spec-label">Per Hour</div>
                        </div>

                        <div className="pr-rent-spec">
                          <div className="pr-rent-spec-value">{equipment.quantity}</div>
                          <div className="pr-rent-spec-label">Available</div>
                        </div>
                    </div>
                </div>
          </div>

          <div className="pr-rent-rental-form">
            
            <form onSubmit={(e) => totalPrice(e, equipment)}>
                <h2 className="pr-rent-form-title">Rental Details</h2>

                <div className="pr-rent-form-group">
                <label className="pr-rent-form-label">Quantity</label>
                <input 
                onChange={(e) => setQuantity(e.target.value)}
                type="number" required className="pr-rent-form-input"/>
                </div>

                <div className="pr-rent-form-group">
                <label className="pr-rent-form-label">Rental Date</label>
                <input 
                onChange={(e) => setDate(e.target.value)}
                type="date" 
                required 
                className="pr-rent-form-input" 
                min={new Date().toLocaleDateString("en-CA")}
                />
                </div>

                <div className="pr-rent-time-selection">
                <div className="pr-rent-form-group">
                    <label className="pr-rent-form-label">From</label>
                    <input 
                    onChange={(e) => setFrom(e.target.value)}
                    type="time" required className="pr-rent-form-input"/>
                </div>

                <div className="pr-rent-form-group">
                    <label className="pr-rent-form-label">To</label>
                    <input 
                    onChange={(e) => setTo(e.target.value)}
                    type="time" required className="pr-rent-form-input"/>
                </div>
                </div>

                <button
                className="pr-rent-rent-button">Total Price</button>
            </form>

              {fullPrice ? (
                
                  <div className="pr-rent-price-summary">
                    <h3 style={{ marginBottom: "15px", color: "#00474f" }}>
                      Rental Summary
                    </h3>
                    <div className="pr-rent-price-total">
                      <span>Total:</span>
                      <span>LKR {fullPrice}</span>
                    </div>
                    <div>
                      <button 
                      onClick={() => handleRentNow(equipment)}
                      className="pr-rent-rent-button">Rent Now</button>
                    </div>
                  </div>
              ):(
                <div style={{ marginTop: "15px", color: "#555" }}>
                  Please fill the rental details and click "Total Price" to see summary.
                </div>
              )}
            
          </div>
          </div>
            ))}

        </div>
      </div>
    </div>
    </div>
  );
};

export default PlayerRent;
