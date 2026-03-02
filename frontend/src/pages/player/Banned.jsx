import React from 'react'
import banned from '../../images/banned.png'
import './styles/banned.css'

export default function Banned({onClose}) {
  return (
    <div className='banned-container'>
      <div className="banned-main">
        <div className="banned-icon">
            <img src={banned} alt="" />
        </div>
        <p className='p1'>Access Denied</p>
        <p className='p2'>This account has been banned. Please contact support.</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  )
}
