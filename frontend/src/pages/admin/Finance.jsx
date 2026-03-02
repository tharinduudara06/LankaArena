import Admin_nav from './Admin_nav'
import './styles/finance.css'
import {useEffect, useState} from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye } from '@fortawesome/free-solid-svg-icons'
import Booking_additional from './Booking_additional';
import dollar from '../../images/dollar.png'
import refund from '../../images/refund.png'
import commission from '../../images/commission.png'
import danger from '../../images/danger.png'
import payout from '../../images/payout.png'
import white_commission from '../../images/white_commission.png'
import white_report from '../../images/white_report.png'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import {ToastContainer,toast} from 'react-toastify'
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Finance() {

  const [bookings,setBookings] = useState([]);

  const navigate = useNavigate();

  const [activeTable, setActiveTable] = useState("bookings");
  const [additionalDetails, setAdditionalDetails] = useState(false);

  useEffect(()=>
  {
    const fetchBookings = async()=>
    {
    try {
    
      const res = await axios.get('http://localhost:8080/get-bookings',
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
        else if(error.response.status === 404)
        {
          toast.error("bookings not found",{autoClose:1500});
        }
        else if(error.response.status === 500)
        {
          toast.error("Internal server error",{autoClose:1500});
        }
      }
    }
  }

  fetchBookings();
  },[]);

    // Calculate total revenue here
  const totalRevenue = bookings.reduce((sum, booking) => {
    if (booking.status === "confirmed") {
      return sum + booking.price;
    }
    return sum;
  }, 0);

  // Inside Finance() component
const generateRefundsPDF = () => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text("Refunds Report", 14, 22);

  // Total Revenue
  const totalRevenue = bookings.reduce((sum, booking) => {
    if (booking.status === "confirmed") return sum + booking.price;
    return sum;
  }, 0);

  doc.setFontSize(12);
  doc.text(`Total Revenue: LKR ${totalRevenue.toLocaleString()}`, 14, 32);

  // Table columns
  const columns = [
    { header: "Booked By", dataKey: "bookedBy" },
    { header: "Amount", dataKey: "amount" },
    { header: "Booked Date", dataKey: "date" },
    { header: "Start Time", dataKey: "startTime" },
    { header: "End Time", dataKey: "endTime" },
    { header: "Payment Method", dataKey: "method" },
    { header: "Status", dataKey: "status" },
  ];

  // Table rows
  const rows = bookings.map((booking) => {
    const localDate = new Date(booking.date).toLocaleDateString();
    const localStartTime = new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit', hour12: true });
    const localEndTime = new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit', hour12: true });

    return {
      bookedBy: booking.from.name,
      amount: booking.price,
      date: localDate,
      startTime: localStartTime,
      endTime: localEndTime,
      method: booking.method,
      status: booking.status
    };
  });

  // Generate table
  autoTable(doc, {
  startY: 40,
  head: [columns.map(col => col.header)],
  body: rows.map(row => columns.map(col => row[col.dataKey])),
  theme: "striped"
});

  doc.save("Refunds_Report.pdf");
};
  
  return (
    <div>
      <Admin_nav/>

      {additionalDetails && <Booking_additional onClose={() => setAdditionalDetails(false)} />}

    <ToastContainer/>

      <div className='admin_finance_container'>

        <div className='oversight'>
          <div className="oversight-header">Financial Oversight</div>
          <div className="oversight-cards">
              <div className='cards'>
                <div className="cardText">
                  <p>Total Revenue</p>
                  <p>LKR {totalRevenue.toLocaleString()}</p>
                </div>
                <div className="cardIcon">
                  <img src={dollar} alt="" />
                </div>
              </div>
              <div className='cards'>
                <div className="cardText">
                  <p>Pending Refunds</p>
                  <p>LKR 2,000</p>
                </div>
                <div className="cardIcon">
                  <img src={refund} alt="" />
                </div>
              </div>
              <div className='cards'>
                <div className="cardText">
                  <p>Commission Rate</p>
                  <p>10%</p>
                </div>
                <div className="cardIcon">
                  <img src={commission} alt="" />
                </div>
              </div>
              <div className='cards'>
                <div className="cardText">
                  <p>Dispute Cases</p>
                  <p>5</p>
                </div>
                <div className="cardIcon">
                  <img src={danger} alt="" />
                </div>
              </div>
          </div>
        </div>

        <div className='tables-nav'>
            <div className="searchBar">
              <input type="text" placeholder='Search here...'/>
            </div>
            <div className="nav-btns">
              <button onClick={() => setActiveTable('bookings')} >All Bookings</button>
              <button onClick={() => setActiveTable('rentals')} >All Rentals</button>
              <button
              onClick={()=>generateRefundsPDF()}
              >Export report</button>
            </div>
        </div>

        <div className='finance-tables'>
          {activeTable ==='bookings' && (
              <div className="tables">
            <div className="table-title">All Ground Bookings</div>
            <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Booked By</th>
                      <th>Amount</th>
                      
                      <th>Booked date</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                      <th>Payment Method</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>                
                  </thead>

                  <tbody>
                {bookings.length > 0 ? (
                  bookings.map((booking) => {
                    const localDate = new Date(booking.date).toLocaleDateString(); // Local date
                    const localStartTime = new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }); // e.g., 10:30 AM
                    const localEndTime = new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }); // e.g., 12:30 PM

                    return (
                      <tr key={booking._id}>
                        <td>{booking.from.name}</td>
                        <td>LKR {booking.price}</td>
                        <td>{localDate}</td>
                        <td>{localStartTime}</td>
                        <td>{localEndTime}</td>
                        <td>{booking.method}</td>
                        <td>{booking.status}</td>
                        <td>
                          <button onClick={() => setAdditionalDetails(true)} className='viewIcon'>
                            <FontAwesomeIcon icon={faEye} size='lg' style={{color:"rgba(0, 220, 114, 1)"}}/>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center' }}>
                      No Data Found
                    </td>
                  </tr>
                )}
              </tbody>

                </table>
            </div>
          </div>
          )}
          
          {activeTable === 'rentals' && (
            <div className="tables">
            <div className="table-title">All Equipment Rentals</div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Equipment</th>
                    <th>Booked By</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Rent Date</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Price Per Hour</th>
                    <th>Actions</th>
                  </tr>                  
                </thead>

                <tbody>
                  <tr>
                    <td>football</td>
                    <td>kasun</td>
                    <td>2</td>
                    <td>300</td>
                    <td>2025-09-14</td>
                    <td>14:30:00</td>
                    <td>17:30:00</td>
                    <td>50</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          )}

          {activeTable === 'refunds' && (
              <div className="tables">
            <div className="table-title"></div>
            <div className="table-container"></div>
          </div>
          )}

          
        </div>
        <div className='revenue'>
          <div className="chart">chart</div>
          <div className="quick-actions">
            <div className="quick-action-header">
              <p>Quick Actions</p>
            </div>

            <div className="quick-action-btns">
              <button>
                <img src={payout} alt="" />
                <p>Process Payouts</p>
              </button>
              <button>
                <img src={white_commission} alt="" />
                <p>Adjust Commission</p>
              </button>
              <button>
                <img src={white_report} alt="" />
                <p>Generate Reports</p>
              </button>
              
            </div>

          </div>
        </div>
        
      </div>
      
    </div>
    
  )
}
