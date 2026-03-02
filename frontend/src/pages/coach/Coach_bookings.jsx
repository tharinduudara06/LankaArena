import React, { useEffect, useState } from 'react';
import './styles/coach_bookings.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faPlus, faSearch, faMapMarkerAlt, faCalendarAlt, faUsers, faMoneyBillWave} from '@fortawesome/free-solid-svg-icons'
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'
import {ToastContainer,toast} from 'react-toastify'
import Coach_sideBar from './Coach_sideBar';

const Coach_bookings = () => {

const [bookings,setBookings] = useState([]);
const navigate = useNavigate();

//####################### Fetch Bookings #######################
useEffect(()=>{

  const fetchBookings = async() =>
  {
    try {
      
      const res = await axios.get('http://localhost:8080/api/coach/get-my-bookings',
        {withCredentials:true}
      )

      if(res.status === 200)
      {
        setBookings(res.data.data);
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
            toast.error(error.response.data.message,{autoClose:1500});
          }
          
          else if(error.response.status === 404)
          {
            toast.error(error.response.data.message,{autoClose:1500});
          }

          else if(error.response.status === 500)
          {
            toast.error("Internal server error occured!",{autoClose:1500});
          }
        }
    }
  }

  fetchBookings();

},[]);

const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
};

const formatTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });
};

//####################### Handle Pay Now #######################
const handlePayNow = (booking) => {
  // Navigate to payment gateway with booking data
  navigate('/coach-payment-gateway', { 
    state: { bookingData: booking } 
  });
};

//####################### Cancel Booking #######################
const cancelBooking = async (bookingId) => {

  if (!window.confirm("Are you sure you want to cancel this booking?")) {
    return;
  }

  try {
    
    const res = await axios.put(`http://localhost:8080/api/coach/cancel-booking/${bookingId}`,
      {},
      {withCredentials:true}
    )

    if(res.status === 200)
    {
      toast.success("Booking Cancelled Successfully",{autoClose:1500});
      setInterval(() => {
        window.location.reload();
      }, 1590);
    }

  } catch (error) {
    console.log(error);
    if(error.response)
    {

      if(error.response.status === 400)
      {
        navigate('/log');
      }
      else if(error.response.status === 404)
      {
        toast.error("Booking Not Found!",{autoClose:1500});
      }
      else if(error.response.status === 500)
      {
        toast.error("Internal server error occured!",{autoClose:1500});
      }

    }
  }

}


  return (
    <div className="p-mb-container">
     
      <ToastContainer/>
      <Coach_sideBar/>

      {/* Main Content */}
      <div className="p-mb-main-content">
        <div className="p-mb-page-header">
          <h1 className="p-mb-page-title">My Bookings</h1>
          <Link to='/coach-all-grounds' className="p-mb-action-button">
            <FontAwesomeIcon icon={faPlus}/> New Booking
          </Link>
        </div>

        <div className="p-mb-filter-section">
          <div className="p-mb-search-box">
            <FontAwesomeIcon icon={faSearch} className='p-mb-search-icon'/>
            <input type="text" className="p-mb-search-input" placeholder="Search bookings..." />
          </div>
        </div>

        <div className="p-mb-bookings-container">

          {/* Booking Card 4 */}
          {bookings ? (
            bookings.map((booking)=>(
            <div key={booking._id} className="p-mb-booking-card">
            <div className="p-mb-booking-header">
              
              <div className={`p-mb-booking-status p-mb-status-${booking.status}`}>{booking.status}</div>
            </div>
            <div className="p-mb-booking-content">
              <div className="p-mb-booking-detail">
                <div className="p-mb-detail-icon"><FontAwesomeIcon icon={faMapMarkerAlt}/></div>
                <div className="p-mb-detail-text">
                  <div className="p-mb-detail-label">Venue</div>
                  <div className="p-mb-detail-value">{booking.venue.name}</div>
                </div>
              </div>
              <div className="p-mb-booking-detail">
                <div className="p-mb-detail-icon"><FontAwesomeIcon icon={faCalendarAlt}/></div>
                <div className="p-mb-detail-text">
                  <div className="p-mb-detail-label">Date & Time</div>
                  <div className="p-mb-detail-value">{formatDate(booking.date)} • {formatTime(booking.startTime)} - {formatTime(booking.endTime)}</div>
                </div>
              </div>
              
              <div className="p-mb-booking-detail">
                <div className="p-mb-detail-icon"><FontAwesomeIcon icon={faMoneyBillWave}/></div>
                <div className="p-mb-detail-text">
                  <div className="p-mb-detail-label">Amount Paid</div>
                  <div className="p-mb-detail-value">LKR {booking.price}.00</div>
                </div>
              </div>
            </div>
            <div className="p-mb-booking-actions">
              {booking.status === "pending" && (
                  <>
                    <button
                    onClick={()=>cancelBooking(booking._id)}
                    className="p-mb-btn p-mb-btn-outline">Cancel</button>
                    <button
                    onClick={() => handlePayNow(booking)}
                    className="p-mb-btn p-mb-btn-primary">Pay Now</button>
                  </>
                )}

                {booking.status === "confirmed" && (
                  <button className="p-mb-btn p-mb-btn-outline">View Details</button>
                )}

                {booking.status === "cancelled" && (
                  <button className="p-mb-btn-second p-mb-status-cancelled">Book Again</button>
                )}
                </div>
          </div>

            ))
          ):(
            <div>
              No Bookings Found
              <Link to='/player-new-booking'>
                <FontAwesomeIcon icon={faPlus}/> New Booking
              </Link>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default Coach_bookings;