import React, { useState } from 'react'
import Header from './Header'
import './styles/otp_verify.css'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {ToastContainer, toast} from 'react-toastify'

export default function OTP_verify() {

  const [otp, setOtp] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async(e) => {

    e.preventDefault();

    try {
      
      const res = await axios.post('http://localhost:8080/otp', {otp}, {
        withCredentials: true
      });

      

      if(res.status === 200)
      {
        toast.success('Successfully Registered! please Login', {
          position: 'bottom-center',
          autoClose:2000
        });
      }

    } catch (error) {
      if(error.response)
      {
        if(error.response.status === 400 || error.response.status === 401)
        {
            toast.error('Invalid OTP!', {
            position: 'bottom-center',
            autoClose:1500
          });
        }
        else if(error.response.status === 500)
        {
          toast.error('Something went wrong! try again later', {
            position: 'bottom-center',
            autoClose:1500
          });
        }
      }
    }

  }

  return (
    <div>
        <Header/>
        <div className='otp-container'>
          <ToastContainer/>
          <form onSubmit={handleSubmit}>
            <div className='otp-form-item'>
              <input type="text" name='otp' onChange={(e)=>setOtp(e.target.value)} placeholder='Enter OTP'/>
            </div>

            <div className='otp-form-item btn'>
              <button type='submit'>Verify</button>
            </div>
          </form>
        </div>
    </div>
  )
}
