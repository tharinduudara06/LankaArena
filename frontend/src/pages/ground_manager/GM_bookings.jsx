import React, { useState, useEffect } from 'react';
import './styles/groundManager_bookings.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome, faCalendarAlt, faTasks, faTools, faMoneyBillWave,
  faSignOutAlt, faPlus, faDownload, faClock, faCheckCircle, faTimesCircle,
  faSort, faChevronLeft, faChevronRight, faSearch
} from '@fortawesome/free-solid-svg-icons';
import Ground_manager_sideBar from './Ground_manager_sideBar';
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BookingsManagement = () => {

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();


  useEffect(() => {

    const fetchBookings = async () => {
      try {

        const res = await axios.get('http://localhost:8080/api/ground-manager/get-venue-owner-bookings',
          { withCredentials: true }
        )

        if (res.status === 200) {
          setBookings(res.data.data || []);
        }

      } catch (error) {
        if (error.response) {
          if (error.response.status === 400) {
            navigate('/log');
          }
          else if (error.response.status === 404) {
            toast.error("Bookings not found!", { autoClose: 1500 });
          }

          else if (error.response.status === 500) {
            toast.error("Internal server error!", { autoClose: 1500 });
          }
        }
        setBookings([]);
      }
    }

    fetchBookings();

  }, [])

  // Converts UTC date and time to local date & time with AM/PM
  const formatBookingDateTime = (date, startTime, endTime) => {
    try {
      let start, end;

      // If startTime includes a T, assume it's already ISO string
      if (startTime.includes("T")) {
        start = new Date(startTime);
        end = new Date(endTime);
      } else {
        // Otherwise, combine with date and add seconds if missing
        const fixTime = (t) => {
          t = t.trim();
          return t.split(":").length === 2 ? t + ":00" : t;
        };
        start = new Date(`${date}T${fixTime(startTime)}Z`);
        end = new Date(`${date}T${fixTime(endTime)}Z`);
      }

      if (isNaN(start.getTime()) || isNaN(end.getTime())) return "Invalid date";

      const localDate = start.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      const localStartTime = start.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const localEndTime = end.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      return `${localDate}, ${localStartTime} - ${localEndTime}`;
    } catch (err) {
      console.error("Date conversion error:", err, date, startTime, endTime);
      return "Invalid date";
    }
  };

  // Calculate duration between start and end times in hours & minutes
  const getDuration = (startTime, endTime) => {
    try {
      let start = new Date(startTime);
      let end = new Date(endTime);

      // If parsing fails, try assuming it's just HH:mm
      if (isNaN(start) || isNaN(end)) {
        const fixTime = (t) => {
          t = t.trim();
          if (!t) return "00:00:00";
          return t.split(":").length === 2 ? t + ":00" : t;
        };
        start = new Date(`1970-01-01T${fixTime(startTime)}Z`);
        end = new Date(`1970-01-01T${fixTime(endTime)}Z`);
      }

      if (isNaN(start) || isNaN(end)) return "Invalid time";

      let diffMs = end - start;
      if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000; // handle overnight bookings

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      return `${hours > 0 ? hours + "h " : ""}${minutes > 0 ? minutes + "m" : ""}`.trim();
    } catch (err) {
      console.error("Duration calculation error:", err, startTime, endTime);
      return "Invalid duration";
    }
  };

const updateBookingStatus = async (bookingId, newStatus) => {
  try {
    setLoadingBookings((prev) => ({ ...prev, [bookingId]: true }));

    const res = await axios.put(
      `http://localhost:8080/api/ground-manager/update-booking-status/${bookingId}`,
      { status: newStatus },
      { withCredentials: true }
    );

    if (res.status === 200) {
      setBookings((prev) =>
        prev.map((b) => {
          if (b._id === bookingId) {
            return {
              ...b,
              bookingDetails: {
                ...b.bookingDetails,
                status: newStatus
              }
            };
          }
          return b;
        })
      );
      toast.success(`Booking ${newStatus} successfully!`, { autoClose: 1500 });
    }
  } catch (error) {
    console.error(error);
    toast.error("Failed to update booking status!", { autoClose: 1500 });
  } finally {
    setLoadingBookings((prev) => ({ ...prev, [bookingId]: false }));
  }
};

  // Filter bookings by search (customer name, venue, status)
  const filteredBookings = searchQuery.trim()
    ? bookings.filter((b) => {
        const q = searchQuery.toLowerCase();
        const name = (b.customer?.name || '').toLowerCase();
        const venue = (b.venue?.name || '').toLowerCase();
        const status = (b.bookingDetails?.status || '').toLowerCase();
        return name.includes(q) || venue.includes(q) || status.includes(q);
      })
    : bookings;

  const exportPDF = () => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text('Bookings Management Report', 14, 22);

  // Stats - FIX: Use bookingDetails.status
  let pending = 0, confirmed = 0, cancelled = 0, totalRevenue = 0;
  bookings.forEach((b) => {
    if (b.bookingDetails.status === "pending") pending++;
    else if (b.bookingDetails.status === "confirmed") {
      confirmed++;
      totalRevenue += parseFloat(b.bookingDetails.price) || 0;
    } else if (b.bookingDetails.status === "cancelled") cancelled++;
  });
  const averageWeeklyRevenue = totalRevenue / 7;

  doc.setFontSize(12);
  doc.text(`Pending Requests: ${pending}`, 14, 32);
  doc.text(`Confirmed Bookings: ${confirmed}`, 14, 38);
  doc.text(`Cancelled Bookings: ${cancelled}`, 14, 44);
  doc.text(`Average Weekly Revenue: LKR ${averageWeeklyRevenue.toFixed(2)}`, 14, 50);

  // Table - FIX: Use bookingDetails.status
  const tableColumn = ["Customer", "Date & Time", "Duration", "Status", "Amount"];
  const tableRows = [];

  bookings.forEach((booking) => {
    const bookingData = [
      booking.customer.name,
      formatBookingDateTime(booking.bookingDetails.date, booking.bookingDetails.startTime, booking.bookingDetails.endTime),
      getDuration(booking.bookingDetails.startTime, booking.bookingDetails.endTime),
      booking.bookingDetails.status, // FIX: Use nested status
      `LKR ${booking.bookingDetails.price}`
    ];
    tableRows.push(bookingData);
  });

  autoTable(doc, {
    startY: 60,
    head: [tableColumn],
    body: tableRows,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 }
  });
  doc.save('Bookings_Report.pdf');
};


  return (
    <div className="gmb-container">

      <Ground_manager_sideBar />

      {/* Main Content */}
      <div className="gmb-main-content">
        {/* Header */}
        <div className="gmb-page-header">
          <h1 className="gmb-page-title">Bookings Management</h1>
          <div className="gmb-header-actions">

            <button
              onClick={exportPDF}
              className="gmb-btn gmb-btn-secondary">
              <FontAwesomeIcon icon={faDownload} /> Export
            </button>
          </div>
        </div>

          <div className="gmb-stats-container">
          {(() => {
            let pending = 0;
            let confirmed = 0;
            let cancelled = 0;
            let totalRevenue = 0;

            // FIX: Use bookingDetails.status and bookingDetails.price
            bookings.forEach((b) => {
              if (b.bookingDetails.status === "pending") pending++;
              else if (b.bookingDetails.status === "confirmed") {
                confirmed++;
                totalRevenue += parseFloat(b.bookingDetails.price) || 0;
              } else if (b.bookingDetails.status === "cancelled") cancelled++;
            });

            const averageWeeklyRevenue = totalRevenue / 7;

            return (
              <>
                <div className="gmb-stat-card">
                  <div className="gmb-stat-icon"><FontAwesomeIcon icon={faClock} /></div>
                  <div className="gmb-stat-value">{pending}</div>
                  <div className="gmb-stat-label">Pending Requests</div>
                </div>
                <div className="gmb-stat-card">
                  <div className="gmb-stat-icon"><FontAwesomeIcon icon={faCheckCircle} /></div>
                  <div className="gmb-stat-value">{confirmed}</div>
                  <div className="gmb-stat-label">Confirmed Bookings</div>
                </div>
                <div className="gmb-stat-card">
                  <div className="gmb-stat-icon"><FontAwesomeIcon icon={faTimesCircle} /></div>
                  <div className="gmb-stat-value">{cancelled}</div>
                  <div className="gmb-stat-label">Cancelled Bookings</div>
                </div>
                <div className="gmb-stat-card">
                  <div className="gmb-stat-icon"><FontAwesomeIcon icon={faMoneyBillWave} /></div>
                  <div className="gmb-stat-value">
                    LKR {averageWeeklyRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                  <div className="gmb-stat-label">Average Weekly Revenue</div>
                </div>
              </>
            );
          })()}
        </div>



        <div className="gmb-bookings-table-container">
          <div className="gmb-table-header">
            <div className="gmb-table-title">Recent Bookings</div>
            <div className="gmb-search-box">
              <FontAwesomeIcon icon={faSearch} className="gmb-search-icon" />
              <input
                type="text"
                placeholder="Search by customer, venue or status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="gmb-search-input"
              />
            </div>
          </div>
          <div className="gmb-table-scroll">
            <table className="gmb-bookings-table">
              <thead>
                <tr>
                  <th className="gmb-th-customer">Customer</th>
                  <th className="gmb-th-venue">Venue</th>
                  <th className="gmb-th-datetime">Date & Time</th>
                  <th className="gmb-th-duration">Duration</th>
                  <th className="gmb-th-payment">Payment</th>
                  <th className="gmb-th-status">Status</th>
                  <th className="gmb-th-amount">Amount</th>
                  <th className="gmb-th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((booking, index) => (
                    <tr key={booking._id} className="gmb-table-row">
                      <td className="gmb-td-customer" data-label="Customer">
                        <span className="gmb-customer-name">{booking.customer?.name || '—'}</span>
                        {booking.customer?.email && (
                          <span className="gmb-customer-email">{booking.customer.email}</span>
                        )}
                      </td>
                      <td className="gmb-td-venue" data-label="Venue">
                        {booking.venue?.name || '—'}
                      </td>
                      <td className="gmb-td-datetime" data-label="Date & Time">
                        {formatBookingDateTime(booking.bookingDetails?.date, booking.bookingDetails?.startTime, booking.bookingDetails?.endTime)}
                      </td>
                      <td className="gmb-td-duration" data-label="Duration">
                        {getDuration(booking.bookingDetails?.startTime, booking.bookingDetails?.endTime)}
                      </td>
                      <td className="gmb-td-payment" data-label="Payment">
                        <span className={`gmb-paid-badge gmb-paid-${String(booking.bookingDetails?.paymentStatus || 'Not-paid').toLowerCase().replace(/-/g, '')}`}>
                          {booking.bookingDetails?.paymentStatus || 'Not-paid'}
                        </span>
                      </td>
                      <td className="gmb-td-status" data-label="Status">
                        <span className={`gmb-status gmb-status-${booking.bookingDetails?.status || 'pending'}`}>
                          {booking.bookingDetails?.status || 'pending'}
                        </span>
                      </td>
                      <td className="gmb-td-amount" data-label="Amount">
                        <span className="gmb-amount">LKR {(booking.bookingDetails?.price ?? 0).toLocaleString()}</span>
                      </td>
                      <td className="gmb-td-actions" data-label="Actions">
                        <div className="gmb-action-buttons">
                          <button
                            type="button"
                            className="gmb-action-btn gmb-btn-approve"
                            onClick={() => updateBookingStatus(booking._id, "confirmed")}
                            disabled={loadingBookings[booking._id] || booking.bookingDetails?.status === "confirmed"}
                          >
                            {loadingBookings[booking._id] ? "..." : "Approve"}
                          </button>
                          <button
                            type="button"
                            className="gmb-action-btn gmb-btn-reject"
                            onClick={() => updateBookingStatus(booking._id, "cancelled")}
                            disabled={loadingBookings[booking._id] || booking.bookingDetails?.status === "cancelled"}
                          >
                            {loadingBookings[booking._id] ? "..." : "Reject"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="gmb-empty-row">
                    <td colSpan={8} className="gmb-empty-cell">
                      {bookings.length === 0
                        ? 'No bookings yet. Bookings for your venues will appear here.'
                        : 'No bookings match your search.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BookingsManagement;
