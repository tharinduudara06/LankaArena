import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Coach_sideBar from './Coach_sideBar'
import './styles/coach_dashboard.css'
import sessions from '../../images/sessions.png'
import managers from '../../images/managers.png'
import jersey from '../../images/jersey.png'
import trophy from '../../images/trophy.png'
import quickAction from '../../images/quickAction.png'
import invoice from '../../images/invoice.png'
import attendance from '../../images/attendance.png'

console.log('=== FILE LOADED ===');
console.log('Coach_dashboard.jsx file has been loaded');

export default function Coach_dashboard() {
  console.log('=== COMPONENT LOADING ===');
  console.log('Coach_dashboard component is rendering');
  
  const [dashboardData, setDashboardData] = useState({
    activePlayers: 0,
    upcomingSessions: 0,
    matchesWon: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  console.log('=== STATE INITIALIZED ===');
  console.log('Initial dashboardData:', dashboardData);
  console.log('Initial loading:', loading);

  useEffect(() => {
    console.log('=== useEffect TRIGGERED ===');
    console.log('About to call fetchDashboardData');
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    console.log('=== FRONTEND: Starting fetchDashboardData ===');
    
    try {
      console.log('=== FRONTEND: About to make API call ===');
      
      const response = await fetch('http://localhost:8080/api/coach/dashboard-data', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('=== FRONTEND: API call completed ===');
      console.log('Response status:', response.status);

      if (response.ok) {
        console.log('=== FRONTEND: Response is OK ===');
        const data = await response.json();
        console.log('=== FRONTEND: Data parsed ===');
        console.log('Received data:', data);
        
        if (data && data.data) {
          console.log('=== FRONTEND: Setting dashboard data ===');
          setDashboardData(data.data);
        } else {
          console.log('=== FRONTEND: No data field in response ===');
          setDashboardData({
            activePlayers: 0,
            upcomingSessions: 0,
            matchesWon: 0,
            recentActivities: []
          });
        }
      } else {
        console.log('=== FRONTEND: Response not OK ===');
        console.log('Status:', response.status);
      }
    } catch (error) {
      console.log('=== FRONTEND: Error occurred ===');
      console.log('Error:', error);
    }
    
    console.log('=== FRONTEND: Setting loading to false ===');
    setLoading(false);
  };

  const handleCreateSession = () => {
    navigate('/coach-schedule-sessions');
  };

  const handleAddPlayer = () => {
    navigate('/coach-add-player');
  };

  // const testAPI = async () => {
  //   try {
  //     console.log('=== TESTING API CONNECTION ===');
  //     const response = await fetch('http://localhost:8080/api/coach/test', {
  //       method: 'GET',
  //       credentials: 'include',
  //     });
  //     console.log('Test response status:', response.status);
  //     const data = await response.json();
  //     console.log('Test response data:', data);
  //     alert('Test API response: ' + JSON.stringify(data));
  //   } catch (error) {
  //     console.error('Test API error:', error);
  //     alert('Test API error: ' + error.message);
  //   }
  // };


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    
    try {
      // If it's already a string, try to parse it
      if (typeof timeString === 'string') {
        // Check if it's already in a readable format
        if (timeString.includes('AM') || timeString.includes('PM')) {
          return timeString;
        }
        // Try to parse as date
        const date = new Date(timeString);
        if (!isNaN(date.getTime())) {
          return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          });
        }
        return timeString;
      }
      
      // If it's a Date object
      if (timeString instanceof Date) {
        return timeString.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      }
      
      return 'N/A';
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'N/A';
    }
  };

  return (
    <div>
      <Coach_sideBar/>
      <div className='coach-dashboard-container'>
        <div className="coach-dashboard-header">
          <div className="c-head-text">
            <p>Coach Dashboard</p>
          </div>
        </div>
        <div className="coach-dash-cards">
          <div className="c-dash-card">
            <p>Active Players</p>
            <p>{loading ? '...' : dashboardData.activePlayers}</p>
          </div>
          <div className="c-dash-card">
            <p>Upcoming Sessions</p>
            <p>{loading ? '...' : dashboardData.upcomingSessions}</p>
          </div>
          <div className="c-dash-card">
            <p>Matches Won</p>
            <p>{loading ? '...' : dashboardData.matchesWon}</p>
          </div>
        </div>
        
        <div className="c-recent-activities">
          <div className="c-recent-header">
            Recent Activities
          </div>

          {loading ? (
            <div className="c-activity-card">
              <div className="c-activity-text">
                <p>Loading activities...</p>
              </div>
            </div>
          ) : dashboardData.recentActivities.length > 0 ? (
            dashboardData.recentActivities.map((activity, index) => (
              <div key={index} className="c-activity-card">
                <div className="c-activity-card-icon">
                  <img src={activity.type === 'session' ? managers : trophy} alt="" />
                </div>
                <div className="c-activity-text">
                  <p>{activity.title}</p>
                  <p>{activity.description}</p>
                  <small>{formatDate(activity.date)} at {formatTime(activity.time)}</small>
                </div>
              </div>
            ))
          ) : (
            <div className="c-activity-card">
              <div className="c-activity-card-icon">
                <img src={managers} alt="" />
              </div>
              <div className="c-activity-text">
                <p>No recent activities</p>
                <p>Start by creating sessions or scheduling matches</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="c-quickActions">
          <div className="c-quickAction-header">
            <img src={quickAction} alt="" />
            <p>Quick Actions</p>
          </div>

          <div className="c-quickAction-btns">
            <button onClick={handleCreateSession}>
              <div><img src={sessions} alt="" /></div>
              Create new session Plan
            </button>

            <button onClick={handleAddPlayer}>
              <div><img src={managers} alt="" /></div>
              Add team player
            </button>

            
          </div>
        </div>
        
        
      </div>
    </div>
  )
}
