import React, { useEffect, useState } from "react";
import "./styles/playerBookGround.css";
import PlayerSidebar from "./PlayerSidebar ";
import {ToastContainer,toast} from 'react-toastify'
import axios from 'axios'
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faMapMarkerAlt,faPhone,faMoneyBillWave,faCreditCard} from "@fortawesome/free-solid-svg-icons"

const PlayerBookGround = () => {

  const {id} = useParams();

  const [ground, setGround] = useState([]);
  const [fullPrice,setFullPrice] = useState('');
  const[date,setDate] = useState('');
  const [from,setFrom] = useState('');
  const[to,setTo] = useState('');
  const [paymethod, setPaymethod] = useState('credit-card');
  const [hour, setHours] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

const totalPrice = (e, g) => {
  e.preventDefault();

  try {
    
    if (!from || !to) {
      toast.error("Please select both start and end time!");
      return;
    }

    const start = from.split(':').map(Number);
    const end = to.split(':').map(Number);

   
    if (start.length !== 2 || end.length !== 2 || 
        start.some(isNaN) || end.some(isNaN)) {
      toast.error("Invalid time format!");
      return;
    }

    const [startHour, startMinute] = start;
    const [endHour, endMinute] = end;

    
    if (startHour < 0 || startHour > 23 || startMinute < 0 || startMinute > 59 ||
        endHour < 0 || endHour > 23 || endMinute < 0 || endMinute > 59) {
      toast.error("Invalid time values!");
      return;
    }

   
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    
    if (endTotalMinutes <= startTotalMinutes) {
      toast.error("End time must be later than start time!");
      return;
    }

    
    const exactHours = (endTotalMinutes - startTotalMinutes) / 60;
    
    
    const hours = Math.floor(exactHours);
    
    const total = hours * g.price;

   
    setFullPrice(total.toFixed(2));
    setHours(hours);

  } catch (error) {
    toast.error("An error occurred while calculating the price!");
    console.error("Error in totalPrice:", error);
  }
};

//################################ fetch grounds by id ##############################
  useEffect(() => {

    const fetchGround = async() =>
    {
      try {
        
        const res = await axios.get(`http://localhost:8080/api/player/get-ground-by-id/${id}`,
          {withCredentials:true}
        )

        if(res.status === 200)
        {
          setGround(res.data.data);
        }

        const resSlots = await axios.get(`http://localhost:8080/api/player/booked-slots/${id}`, { withCredentials: true });
          if (resSlots.status === 200) {
            console.log('Booked slots response:', resSlots.data);
            console.log('Booked slots data:', resSlots.data.bookedSlots);
            setBookedSlots(resSlots.data.bookedSlots);
          }

      } catch (error) {
        if(error.response)
        {
          if(error.response.status === 400)
          {
            navigate('/log');
          }
          else if(error.response.status === 404)
          {
            toast.error("Ground Not Found!",{autoClose:1500});
          }

          else if(error.response.status === 500)
          {
            toast.error("Internal server error occured!",{autoClose:1500});
          }
        }
      }
    }

    fetchGround();

  },[id]);

  
  //############################ confirm booking ##############################
  const handleConfirm = async(ground) =>
  {
    try {

      const available = await checkAvailability(ground._id, date, from, to);
        if (!available) {
        return;
        }

      if (!paymethod || !['credit-card', 'paypal', 'cash'].includes(paymethod)) {
        toast.error("Please select a valid payment method!");
        return;
    }

    if (!date || !from || !to) {
      toast.error("Please fill all required fields!");
      return;
    }
      
      const bookingData = {
        venueId:ground._id,
        date:date,
        method:paymethod,
        price:fullPrice,
        from:from,
        to:to
      }

      const res = await axios.post('http://localhost:8080/api/player/player-book-ground',bookingData,
        {withCredentials:true}
      )

      if(res.status === 200)
      {
        toast.success("Successfully saved Your Booking,Waiting for approval",{autoClose:1500});
        setFullPrice('');
        setDate('');
        setFrom('');
        setTo('');
        setPaymethod('credit-card');
      }

    } catch (error) {
      if(error.response)
      {
        if(error.response.status === 400)
        {
          navigate('/log');
        }
        else if(error.response.status === 401)
        {
          toast.error("Booking Failed!",{autoClose:1500});
        }
        else if(error.response.status === 402)
        {
          toast.error(error.response.data.message,{autoClose:1500});
        }
        else if(error.response.status === 403)
        {
            toast.error(error.response.data.message,{autoClose:1500});
        }
        else if(error.response.status === 404)
        {
            toast.error(error.response.data.message,{autoClose:1500});
        }
        else if(error.response.status === 500)
        {
          toast.error("internal server error!",{autoClose:1500});
        }
      }
    }
  }

  //############################ check availability ##############################
  const checkAvailability = async (groundId, date, from, to) => {
  try {
    const res = await axios.post("http://localhost:8080/api/player/check-availability",
      { venueId: groundId, date, from, to },
      { withCredentials: true }
    );

    if (res.status === 200 && res.data.available) {
      return true;
    }
  } catch (error) {
    if (error.response && error.response.status === 409) {
      toast.error(error.response.data.message, { autoClose: 2000 });
      return false;
    } else {
      toast.error("Error checking availability!", { autoClose: 2000 });
      return false;
    }
  }
};

useEffect(() => {
  console.log("Booked slots:", bookedSlots);
  console.log("Selected date:", date);
  if (date && bookedSlots.length > 0) {
    const filteredSlots = bookedSlots.filter(slot => {
      const slotDate = slot.date; // Already in YYYY-MM-DD format from backend
      const selectedDate = date; // Already in YYYY-MM-DD format from input
      console.log("Comparing slot date:", slotDate, "with selected date:", selectedDate);
      console.log("Are they equal?", slotDate === selectedDate);
      return slotDate === selectedDate;
    });
    console.log("Filtered slots for selected date:", filteredSlots);
  }
}, [date, bookedSlots]);

// Function to create test bookings
const createTestBookings = async () => {
  try {
    setLoading(true);
    const response = await axios.post(`http://localhost:8080/api/player/create-test-bookings/${id}`, {}, { withCredentials: true });
    if (response.status === 200) {
      toast.success("Test bookings created successfully!");
      // Refresh booked slots
      const resSlots = await axios.get(`http://localhost:8080/api/player/booked-slots/${id}`, { withCredentials: true });
      if (resSlots.status === 200) {
        setBookedSlots(resSlots.data.bookedSlots);
      }
    }
  } catch (error) {
    console.error("Error creating test bookings:", error);
    toast.error("Failed to create test bookings");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="p-nb-body">
      {/* Sidebar */}
      <PlayerSidebar/>
      <ToastContainer/>
      {/* Main Content */}
      <div className="p-nb-main-content">
        <div className="p-nb-page-header">
          <h1 className="p-nb-page-title">Book Now</h1>
        </div>

        <div className="p-nb-booking-container">
          
          {ground.length > 0 ? (
            ground.map((g) => (
              
            <div key={g._id} className="p-nb-booking-wrapper">
            <div className="p-nb-ground-info">
            <div className="p-nb-ground-image">
              <img
                src={`/uploads/${g.photo.filename}`}
                alt="Sports Ground"
              />
            </div>

            <h2 className="p-nb-ground-name">{g.name}</h2>

            <div className="p-nb-price-tag">LKR {g.price} / hour</div>

            <div className="p-nb-ground-details">
              <div className="p-nb-detail-item">
                <FontAwesomeIcon icon={faMapMarkerAlt}/>
                <span>{g.location.address},{g.location.city}</span>
              </div>
              <div className="p-nb-detail-item">
                <FontAwesomeIcon icon={faPhone}/>
                <span>{g.ground_manager.mobile}</span>
              </div>
              
            </div>

            <div className="p-nb-facilities">
              <h3>Facilities</h3>
              <div className="p-nb-facility-tags">
                {g.facilities.map((facility,i) => (
                  <span key={i} className="p-nb-facility-tag">{facility}</span>
                ))}
                
              </div>
            </div>
          </div>
              

            
          <div className="p-nb-booking-form">
            
            <form onSubmit={(e)=>totalPrice(e,g)}>
              <div className="p-nb-form-section">
              <h3>
                <i className="far fa-calendar-alt"></i> Select Date & Time
              </h3>

              <div className="p-nb-form-group">
                <label htmlFor="booking-date">Booking Date</label>
                <input 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                type="date" id="booking-date" required className="p-nb-form-control" 
                min={new Date().toLocaleDateString("en-CA")}
                />
              </div>

              {date && (
              <div className="p-nb-booked-slots">
                <h4>Unavailable Time Slots</h4>
                <div style={{fontSize: '12px', color: '#666', marginBottom: '10px'}}>
                  Total booked slots: {bookedSlots.length} | Selected date: {date}
                </div>
                {(() => {
                  const filteredSlots = bookedSlots.filter(slot => {
                    const slotDate = slot.date;
                    const selectedDate = date;
                    console.log("Comparing slot date:", slotDate, "with selected date:", selectedDate);
                    return slotDate === selectedDate;
                  });
                  
                  console.log("Filtered slots for date", date, ":", filteredSlots);
                  
                  return filteredSlots.length > 0 ? (
                    <ul>
                      {filteredSlots.map((slot, i) => (
                        <li key={i}>
                          {slot.startTime} - {slot.endTime}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No bookings found for this date. All slots are available!</p>
                  );
                })()}
              </div>
            )}

              <div className="p-nb-time-inputs">
                <div className="p-nb-form-group">
                  <label htmlFor="start-time">Start Time</label>
                  <input 
                  
                  onChange={(e) => setFrom(e.target.value)}
                  type="time" id="start-time" required className="p-nb-form-control" />
                </div>

                <div className="p-nb-form-group">
                  <label htmlFor="end-time">End Time</label>
                  <input
                   
                  onChange={(e) => setTo(e.target.value)}
                  type="time" id="end-time" required className="p-nb-form-control" />
                </div>
              </div>
            </div>
            

            <div className="p-nb-form-section">
              <h3>
                <i className="far fa-credit-card"></i> Payment Method
              </h3>

              <div className="p-nb-payment-methods">
                <label className="p-nb-payment-option">
                  <input 
                  onChange={(e) => setPaymethod(e.target.value)}
                  type="radio" 
                  name="payment-method" 
                  value="credit-card" 
                  checked={paymethod === 'credit-card'}
                  />
                  <div className="p-nb-payment-option-content">
                    <div className="p-nb-custom-radio"></div>
                    <div className="p-nb-payment-option-icon">
                      <FontAwesomeIcon icon={faCreditCard}/>
                    </div>
                    <span className="p-nb-payment-option-label">Credit Card</span>
                  </div>
                </label>

                <label className="p-nb-payment-option">
                  <input 
                  onChange={(e) => setPaymethod(e.target.value)}
                  type="radio" 
                  name="payment-method" 
                  value="paypal" 
                  checked={paymethod === 'paypal'}
                  />
                  <div className="p-nb-payment-option-content">
                    <div className="p-nb-custom-radio"></div>
                    <div className="p-nb-payment-option-icon">
                      
                    </div>
                    <span className="p-nb-payment-option-label">PayPal</span>
                  </div>
                </label>

                <label className="p-nb-payment-option">
                  <input 
                  onChange={(e) => setPaymethod(e.target.value)}
                  type="radio" 
                  name="payment-method" 
                  value="cash" 
                  checked={paymethod === 'cash'}
                  />
                  <div className="p-nb-payment-option-content">
                    <div className="p-nb-custom-radio"></div>
                    <div className="p-nb-payment-option-icon">
                      <FontAwesomeIcon icon={faMoneyBillWave}/>
                    </div>
                    <span className="p-nb-payment-option-label">Cash</span>
                  </div>
                </label>
              </div>
            </div>
            

            <div className="p-nb-btn-total">
              <button>Total price</button>
            </div>
            </form>

            {fullPrice ? (
              <div className="p-nb-form-section">
              <h3>
                <i className="fas fa-receipt"></i> Price Summary
              </h3>

              <div className="p-nb-price-summary">
                <div className="p-nb-price-row">
                  <span>Price per hour</span>
                  <span>LKR {g.price}</span>
                </div>
                <div className="p-nb-price-row">
                  <span>Duration</span>
                  <span>{hour} hours</span>
                </div>
                <div className="p-nb-price-row total">
                  <span>Total Amount</span>
                  <span>LKR {fullPrice}</span>
                </div>

                 <button 
                 onClick={()=>handleConfirm(g)}
                 className="p-nb-btn-book">Confirm Booking</button>
              </div>
            </div>
            ):(
              <div
                style={{marginTop:"20px", padding:"10px"}}
              >Please fill the rental details and click "Total Price" to see summary.</div>
            )}

          </div>
          </div>
            ))
          ):(
            <div
              style={{width:"100%",padding:"20px",textAlign:"center",fontWeight:"bold",fontSize:"1.5rem"}}
            >No Ground Selected</div>
          )}
         

        
        </div>
      </div>
    </div>
  );
};

export default PlayerBookGround;
