import React from 'react'
import Header from './Header'
import './styles/joinus.css'
import { Link } from 'react-router-dom'

export default function JoinUs() {
  return (
    <div>
        <Header/>
        <div className="joinus-container">
            <div className="joinus-text-header">
                <p>Choose Who Are You?</p>
                <p>Sign up as a player, Coach, or Ground / Court Manager</p>
            </div>
            <div className="roles">
                <div className="role-card">
                    
                    <div className="card-text">
                        <p>Player</p>
                        <p>Inspire and guide athletes to reach their full potential. Create training plans, mentor, and build champions.</p>
                    </div>
                    <div className="card-btn">
                        <Link to='/reg' className="btn">Sign Up as Player</Link>
                    </div>
                </div>

                <div className="role-card">
                    
                    <div className="card-text">
                        <p>Coach</p>
                        <p>Inspire and guide athletes to reach their full potential. Create training plans, mentor, and build champions.</p>
                    </div>
                    <div className="card-btn">
                        <Link to='/coach-signup' className="btn">Sign Up as Coach</Link>
                    </div>
                </div>

                

                <div className="role-card">
                    
                    <div className="card-text">
                        <p>Ground Manager</p>
                        <p>Oversee sports facilities, maintain standards, and ensure players have the best experience possible.</p>
                    </div>
                    <div className="card-btn">
                        <Link to='/ground-manager-signup' className="btn">Sign Up as Manager</Link>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}
