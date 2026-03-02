import React from 'react'
import OPM_sideBar from './OPM_sideBar'
import './styles/opm-dashboard.css'
import worker01 from '../../images/worker01.jpg'
import marker01 from '../../images/marker01.png'
import warehouse from '../../images/warehouse.png'
import calendar from '../../images/calendar.png'
import maintenance from '../../images/maintenance.png'
import football from '../../images/football.png'
import bat from '../../images/bat.png'
import ping_pong from '../../images/ping-pong.png'
import volleyball01 from '../../images/volleyball01.png'

export default function OPM_dashboard() {
  return (
    <div>
      <div>
        <OPM_sideBar/>
        <div className="opm-dashboard-container">
          <div className="opm-dashboard-header">
            <p>Operations Manager Dashboard</p>
            <div className="pp">
              <img src={worker01} alt="" />
            </div>
          </div>
          
          <div className="quickNumbers">
            <div className="quickNumbers-item">
              <div className='quickIcon'>
                <img src={marker01} alt="" />
              </div>
              <div className="quickText">
                <p>24</p>
                <p>Active Venues</p>
              </div>
            </div>
            <div className="quickNumbers-item">
              <div className='quickIcon'>
                <img src={warehouse} alt="" />
              </div>
              <div className="quickText">
                <p>156</p>
                <p>Equipment Items</p>
              </div>
            </div>
            <div className="quickNumbers-item">
              <div className='quickIcon'>
                <img src={calendar} alt="" />
              </div>
              <div className="quickText">
                <p>156</p>
                <p>Equipment Items</p>
              </div>
            </div>
            <div className="quickNumbers-item">
              <div className='quickIcon'>
                <img src={maintenance} alt="" />
              </div>
              <div className="quickText">
                <p>7</p>
                <p>Pending Maintenance</p>
              </div>
            </div>
          </div>

          <div className="equipment-overview">
            <p className='overview-text'>Equipment Overview</p>
            <div className="equipment-categories">

              <div className="sport-item">
                <div className="sport-item-icon">
                  <img src={football} alt="" />
                </div>
                <div className="sport-item-text">
                  <p>Football</p>
                  <p>42</p>
                </div>
              </div>

              <div className="sport-item">
                <div className="sport-item-icon">
                  <img src={bat} alt="" />
                </div>
                <div className="sport-item-text">
                  <p>Cricket Bats</p>
                  <p>22</p>
                </div>
              </div>
              <div className="sport-item">
                <div className="sport-item-icon">
                  <img src={ping_pong} alt="" />
                </div>
                <div className="sport-item-text">
                  <p>Table Tennis rackets</p>
                  <p>30</p>
                </div>
              </div>
              <div className="sport-item">
                <div className="sport-item-icon">
                  <img src={volleyball01} alt="" />
                </div>
                <div className="sport-item-text">
                  <p>Volleyballs</p>
                  <p>35</p>
                </div>
              </div>
            </div>
          </div>

          <div className="upcoming-bookings">
            <div className="upcoming-header-text">
              <p>Upcoming Premium Bookings</p>
            </div>
            <div className="bookings-content">
              
              <div className="booking">
                <p>Inter Univercity Football tournament</p>
                <p>Today, 3:00 PM</p>
              </div>

              <div className="booking">
                <p>Youth basketball league</p>
                <p>Tomorrow, 10:00 AM</p>
              </div>

              <div className="booking">
                <p>Tennis championship</p>
                <p>Jun 15, 9:00 AM</p>
              </div>
                
              <div className="booking">
                <p>Inter school Cricket Tournament</p>
                <p>Jun 18, 8:00 AM</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
