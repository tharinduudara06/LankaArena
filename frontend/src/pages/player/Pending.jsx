import React from 'react'
import './styles/pending.css'

export default function Pending({onClose}) {
  return (
    <div className='pending-container'>
      <div className="pending-main">
        <p className='t1'>Login Blocked</p>
        <p className='t2'>Your account is still pending approval. <br /> Please wait until an admin approves it.</p>
        <button onClick={onClose}>Okay</button>
      </div>
    </div>
  )
}
