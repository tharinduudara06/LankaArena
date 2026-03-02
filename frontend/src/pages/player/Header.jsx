import React from 'react'
import {Link} from 'react-router-dom'
import './styles/header.css'

export default function Header() {
  return (

    <div className='nav'>
      <ul>
        <li><p>LankaArena</p></li>
        <li><Link className='item' to='/'>Home</Link></li>
        <li><Link className='item'>About</Link></li>
        <li><Link className='item'>Contact</Link></li>
        <li><Link className='log' to='/log'>login</Link></li>
        <li><Link className='reg' to='/joinus'>Join Us</Link></li>
      </ul>
    </div>

  )
}
