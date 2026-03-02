import React from 'react'
import './styles/booking_additional.css'

export default function Booking_additional({onClose}) {
  return (
    <div className='booking_additional_container'>

        <div className="b_additional_main">

            <div className="b-title">
                <p>Booked By</p>
            </div>

            <div className="b-details">
                <p>Name: </p>
                <span>Kasun</span>
                <br />
                <br />
                <p>Mobile: </p>
                <span>0765436787</span>
            </div>

            <div className="b-title">
                <p>Manager</p>
            </div>

            <div className="b-details">
                <p>Name: </p>
                <span>Nadee</span>
                <br />
                <br />
                <p>Mobile: </p>
                <span>0778855443</span>
            </div>

            <div className="b-closeBtn">
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    </div>
  )
}
