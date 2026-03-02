import React, { useEffect, useState } from 'react';
import './styles/CoachScheduleSessions.css';
import Coach_sideBar from './Coach_sideBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faCalendarCheck,
  faChevronLeft,
  faChevronRight,
  faEdit,
  faTrash,
  faTimes,
  faCalendar
} from '@fortawesome/free-solid-svg-icons';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  format,
  isSameMonth,
  isSameDay
} from 'date-fns';
import {Link, useNavigate} from 'react-router-dom';
import axios from 'axios';
import {ToastContainer, toast} from 'react-toastify';

const CoachScheduleSessions = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = new Date();

  // Dummy sessions (replace later with DB data)
  const sessions = [
    { date: '2024-07-10' },
    { date: '2024-07-12' },
    { date: '2024-07-16' },
    { date: '2024-07-19' },
    { date: '2024-07-23' },
    { date: '2024-07-27' },
  ];

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    // Reset form when closing modal
    setTitle("");
    setDate("");
    setStartTime("");
    setEndTime("");
    setLocation("");
    setNotes("");
    setSelectedBooking(null);
    setBookingsForSelectedDate([]);
  };

  // Handle location selection
  const handleLocationChange = (e) => {
    const selectedValue = e.target.value;
    setLocation(selectedValue);
    
    if (selectedValue) {
      // Parse the value to get booking ID
      const [venueName, bookingId] = selectedValue.split('|');
      
      // Find the specific booking by ID
      const booking = confirmedBookings.find(b => b._id === bookingId);
      setSelectedBooking(booking);
      
      // Reset time inputs when location changes
      setStartTime("");
      setEndTime("");
    } else {
      setSelectedBooking(null);
    }
  };

  // Generate time options based on selected booking
  const generateTimeOptions = (startTime, endTime) => {
    const options = [];
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    // Generate 30-minute intervals including the end time
    const current = new Date(start);
    while (current <= end) {
      const timeString = current.toTimeString().slice(0, 5);
      options.push(timeString);
      current.setMinutes(current.getMinutes() + 30);
    }
    
    return options;
  };

  // Get available time slots for selected booking
  const getAvailableTimeSlots = () => {
    if (!selectedBooking) return [];
    
    const startTime = new Date(selectedBooking.startTime).toTimeString().slice(0, 5);
    const endTime = new Date(selectedBooking.endTime).toTimeString().slice(0, 5);
    
    return generateTimeOptions(startTime, endTime);
  };

  // Handle date selection
  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);
    
    if (selectedDate) {
      // Filter bookings for the selected date
      const bookingsForDate = confirmedBookings.filter(booking => 
        new Date(booking.date).toISOString().split('T')[0] === selectedDate
      );
      setBookingsForSelectedDate(bookingsForDate);
      
      // Reset location and time when date changes
      setLocation("");
      setStartTime("");
      setEndTime("");
      setSelectedBooking(null);
    } else {
      setBookingsForSelectedDate([]);
    }
  };

  // Calendar calculations
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderDays = () => {
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="c-ss-calendar-weekdays">
        {weekDays.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const rows = [];
    let day = startDate;

    while (day <= endDate) {
      const days = [];
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, 'd');
        const cloneDay = day;

        const hasSession = AllSessions.some(
        (s) => format(new Date(s.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));

        days.push(
          <div
            key={day}
            className={`
              ${!isSameMonth(day, monthStart) ? 'c-ss-other-month' : ''}
              ${isSameDay(day, today) ? 'c-ss-today' : ''}
              ${hasSession ? 'c-ss-has-session' : ''}
            `}
            onClick={() => handleDateClick(cloneDay)}
          >
            {formattedDate}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="c-ss-calendar-days" key={day}>
          {days}
        </div>
      );
    }
    return <div>{rows}</div>;
  };



  const [bookings, setBookings] = useState([]);
  const [confirmedBookings, setConfirmedBookings] = useState([]);
  const [sessionsForSelectedDate, setSessionsForSelectedDate] = useState([]);
  const [AllSessions, setSessions] = useState([]);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [bookingsForSelectedDate, setBookingsForSelectedDate] = useState([]);

  const navigate = useNavigate();

  //####################### fetch bookings for this coach ##########################
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
        // Filter for confirmed bookings only
        const confirmed = res.data.data.filter(booking => booking.status === 'confirmed');
        setConfirmedBookings(confirmed);
        
        // Generate available dates from confirmed bookings
        const dates = [...new Set(confirmed.map(booking => 
          new Date(booking.date).toISOString().split('T')[0]
        ))].sort();
        setAvailableDates(dates);
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

//############################## schedule a session ##############################
const handleSubmit = async () => {
  if (!title || !date || !startTime || !endTime || !location) {
    toast.error("Please fill all required fields", { autoClose: 1500 });
    return;
  }

  try {
    const res = await axios.post("http://localhost:8080/api/coach/schedule-session",
      {
        title,
        date,
        startTime,
        endTime,
        location,
        notes
      },
      { withCredentials: true }
    );

    if (res.status === 200) {
      toast.success("Session scheduled successfully!", { autoClose: 1500 });
      setTitle('');
      setDate('');
      setStartTime('');
      setEndTime('');
      setLocation('');
      setNotes('');
      closeModal();
      setSessions(prev => [...prev, res.data.data]);
    }
  } catch (error) {
    if (error.response) {
      if(error.response.status === 400) {
        toast.error(error.response.data.message, { autoClose: 1500 });
      }
      if(error.response.status === 401) {
        navigate('/log');
      }
      else if (error.response.status === 404) {
        toast.error(error.response.data.message, { autoClose: 1500 });
      }
      else if (error.response.status === 500) {
        toast.error("Internal server error occurred!", { autoClose: 1500 });
      }
    } else {
      toast.error("Server not reachable", { autoClose: 1500 });
    }
  }
};

//############## fetch session list ###########################################
const handleDateClick = async (day) => {
  const formattedDate = format(day, 'yyyy-MM-dd');
  console.log('Fetching sessions for:', formattedDate);

  try {
    const res = await axios.get(`http://localhost:8080/api/coach/get-sessions-by-date/${formattedDate}`, {
      withCredentials: true
    });
    if (res.status === 200) {
      setSessionsForSelectedDate(res.data.data);
    }
  } catch (err) {
    console.error(err);
    toast.error("Failed to fetch sessions", { autoClose: 1500 });
  }
};

//####################################### fetch all scheduled sessions ############################
useEffect(()=>{

  const fetchCoachSessions = async () => {
  try {
    const res = await axios.get('http://localhost:8080/api/coach/get-my-sessions', { withCredentials: true });
    if (res.status === 200) {
      console.log("Sessions:", res.data.data);
      setSessions(res.data.data);
    }
  } catch (err) {
    console.error(err);
  }
};
fetchCoachSessions();
},[]);

//################################ handle delete session ####################################
const handleDeleteSession = async (sessionId) => {
  if (!window.confirm("Are you sure you want to delete this session?")) return;

  try {
    const res = await axios.delete(`http://localhost:8080/api/coach/delete-session/${sessionId}`, {
      withCredentials: true
    });

    if (res.status === 200) {
      toast.success("Session deleted successfully", { autoClose: 1500 });
      // Refresh session list after deletion
      setSessionsForSelectedDate(prev => prev.filter(s => s._id !== sessionId));
      setSessions(prev => prev.filter(s => s._id !== sessionId));
    }
  } catch (err) {
    console.error(err);
    toast.error("Failed to delete session", { autoClose: 1500 });
  }
};



  return (
    <div className="c-ss-container">
      {/* Sidebar */}
      <Coach_sideBar />
      <ToastContainer/>
      {/* Main Content */}
      <div className="c-ss-main-content">
        <div className="c-ss-page-header">
          <h1 className="c-ss-page-title">Schedule Sessions</h1>
          <div className="c-ss-header-actions">
            <Link to='/coach-all-grounds' className="c-ss-btn c-ss-btn-primary">
              <FontAwesomeIcon icon={faCalendar} /> Book Ground
            </Link>
            <button 
              className={`c-ss-btn ${confirmedBookings.length > 0 ? 'c-ss-btn-primary' : 'c-ss-btn-disabled'}`}
              onClick={confirmedBookings.length > 0 ? openModal : () => toast.error("You need confirmed ground bookings to schedule sessions. Please book a ground first.", {autoClose: 3000})}
              disabled={confirmedBookings.length === 0}
            >
              <FontAwesomeIcon icon={faPlus} /> New Session
            </button>
          </div>
        </div>

        <div className="c-ss-dashboard-cards">
          <div className="c-ss-card c-ss-card-1">
            <div className="c-ss-card-icon">
              <FontAwesomeIcon icon={faCalendarCheck} />
            </div>
            <div className="c-ss-card-title">Scheduled Sessions</div>
            <div className="c-ss-card-value">{AllSessions.length}</div>
          </div>
        </div>

        {confirmedBookings.length === 0 && (
          <div className="c-ss-warning-card">
            <div className="c-ss-warning-icon">⚠️</div>
            <div className="c-ss-warning-content">
              <h3>No Confirmed Ground Bookings</h3>
              <p>You need to have confirmed ground bookings to schedule sessions. Please book a ground first to start scheduling your training sessions.</p>
              <Link to='/coach-all-grounds' className="c-ss-btn c-ss-btn-primary">
                <FontAwesomeIcon icon={faCalendar} /> Book Ground Now
              </Link>
            </div>
          </div>
        )}

        <div className="c-ss-schedule-section">
          <div className="c-ss-section-card">
            <div className="c-ss-section-header">
              <h2 className="c-ss-section-title">Upcoming Sessions</h2>
              <a href="#" className="c-ss-view-all">
                View All
              </a>
            </div>

            <div className="c-ss-session-list">
              {sessionsForSelectedDate.length > 0 ? (
                sessionsForSelectedDate.map((s) => (
                  <div className="c-ss-session-item" key={s._id}>
                    <div className="c-ss-session-time">
                      {format(new Date(s.startTime), 'hh:mm a')} - {format(new Date(s.endTime), 'hh:mm a')}
                    </div>
                    <div className="c-ss-session-details">
                      <div className="c-ss-session-title">{s.title}</div>
                      <div className="c-ss-session-desc">
                        {s.venueid ? s.venueid.name : "No venue"} • Notes: {s.notes || "None"}
                      </div>
                    </div>
                    <div className="c-ss-session-actions">
                      <div className="c-ss-session-action-btn">
                        <FontAwesomeIcon icon={faEdit} />
                      </div>
                      <div 
                      onClick={() => handleDeleteSession(s._id)}
                      className="c-ss-session-action-btn">
                        <FontAwesomeIcon icon={faTrash} />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="c-ss-no-sessions">No sessions scheduled for this date</div>
              )}
            </div>

          {/* Functional Calendar */}
          
          <div className="c-ss-section-card ">
            <div className="c-ss-section-header">
              <h2 className="c-ss-section-title">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <a href="#" className="c-ss-view-all">
                View Month
              </a>
            </div>

            <div className="c-ss-calendar">
              <div className="c-ss-calendar-header">
                <div className="c-ss-calendar-nav">
                  <div
                    className="c-ss-calendar-nav-btn"
                    onClick={prevMonth}
                  >
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </div>
                  <div
                    className="c-ss-calendar-nav-btn"
                    onClick={nextMonth}
                  >
                    <FontAwesomeIcon icon={faChevronRight} />
                  </div>
                </div>
                <div className="c-ss-calendar-month">
                  {format(currentMonth, 'MMMM yyyy')}
                </div>
              </div>

              {renderDays()}
              {renderCells()}
            </div>
          </div>
        
        </div>
      </div>

      {/* Add Session Modal */}
      {isModalOpen && (
        <div className="c-ss-modal">
          <div className="c-ss-modal-content">
            <div className="c-ss-modal-header">
              <h2 className="c-ss-modal-title">Schedule New Session</h2>
              <div className="c-ss-modal-close" onClick={closeModal}>
                <FontAwesomeIcon icon={faTimes} />
              </div>
            </div>
            <div className="c-ss-modal-body">
              <div className="c-ss-form-group">
                <label
                value={title}
                className="c-ss-form-label">Session Title</label>
                <input
                  value={title}
                  type="text"
                  className="c-ss-form-control"
                  placeholder="E.g., Technical Skills Training"
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="c-ss-form-group">
                <label className="c-ss-form-label">Date & Time</label>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px'
                  }}
                >
                  <label htmlFor="">Date</label><br />
                  <select 
                    value={date}
                    onChange={handleDateChange}
                    className="c-ss-form-control"
                  >
                    <option value="">Select Date</option>
                    {availableDates.map((dateStr, index) => (
                      <option key={index} value={dateStr}>
                        {new Date(dateStr).toLocaleDateString()}
                      </option>
                    ))}
                  </select><br/>

                  <label htmlFor="">Start Time</label><br />
                  <select 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="c-ss-form-control"
                    disabled={!selectedBooking}
                  >
                    <option value="">Select Start Time</option>
                    {getAvailableTimeSlots().map((time, index) => (
                      <option key={index} value={time}>
                        {time}
                      </option>
                    ))}
                  </select><br />

                  <label htmlFor="">End Time</label><br />
                  <select 
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="c-ss-form-control"
                    disabled={!selectedBooking || !startTime}
                  >
                    <option value="">Select End Time</option>
                    {startTime && getAvailableTimeSlots()
                      .filter(time => time > startTime)
                      .map((time, index) => (
                        <option key={index} value={time}>
                          {time}
                        </option>
                      ))}
                  </select>

                </div>
              </div>

              <div className="c-ss-form-group">
                <label className="c-ss-form-label">Location</label>
                
                  <select 
                    value={location}
                    onChange={handleLocationChange}
                    className="c-ss-form-select"
                    disabled={!date}
                  >
                    <option value="">Select Location & Time Slot</option> {/* always on top */}
                    {bookingsForSelectedDate.length > 0 ? (
                      // Show bookings for selected date only
                      bookingsForSelectedDate.map((booking) => (
                        <option key={booking._id} value={`${booking.venue.name}|${booking._id}`}>
                          {booking.venue.name} - {new Date(booking.startTime).toLocaleTimeString()} to {new Date(booking.endTime).toLocaleTimeString()}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        {date ? 'No bookings available for this date' : 'Please select a date first'}
                      </option>
                    )}
                  </select>
                  
                  {selectedBooking && (
                    <div className="c-ss-booking-info">
                      <p><strong>Available Time Slot:</strong> {new Date(selectedBooking.startTime).toLocaleTimeString()} - {new Date(selectedBooking.endTime).toLocaleTimeString()}</p>
                      <p><strong>Booking Period:</strong> {new Date(selectedBooking.date).toLocaleDateString()}</p>
                    </div>
                  )}
                
              </div>

              <div className="c-ss-form-group">
                <label className="c-ss-form-label">Notes (Optional)</label>
                <textarea
                  className="c-ss-form-control"
                  rows="3"
                  placeholder="Add any additional notes for players..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
              </div>
            </div>
            <div className="c-ss-modal-footer">
              <button
                className="c-ss-btn c-ss-btn-outline"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button 
              onClick={handleSubmit}
              className="c-ss-btn c-ss-btn-primary">
                Schedule Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default CoachScheduleSessions;
