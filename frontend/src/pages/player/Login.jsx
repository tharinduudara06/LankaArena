import React, { useState } from 'react'
import Header from './Header'
import './styles/login.css'
import { useNavigate,Link} from 'react-router-dom';
import axios from 'axios'
import {ToastContainer , toast} from 'react-toastify'
import Banned from './Banned';
import Pending from './Pending';

export default function Login() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isBanned, setIsBanned] = useState(false);
  const [isPending, setisPending] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async(e) => {

    e.preventDefault();

    try {
      
      const res = await axios.post('http://localhost:8080/log', {email,password},{
        withCredentials: true,
      });

      if(res.status === 200)
      {
        const role = res.data.session.role;
        const sp_type = res.data.session?.SP_type;
        const status = res.data.session.status;

        if(role === 'admin')
        {
          navigate('/admin');
        }
        else if(role === 'operation_manager')
        {
          navigate('/operation_manager');
        }
        else if(role === 'player')
        {
          navigate('/player');
        }
        else if(role === 'coach' || (role === 'service_provider' && sp_type === 'coach'))
        {
          navigate('/coach');
        }
        else if(role === 'ground_manager' || (role === 'service_provider' && sp_type === 'venue_owner'))
        {
          navigate('/ground-manager');
        }
        else if(role === 'service_provider')
        {
          if(sp_type === 'referee')
          {
            navigate('/referee');
          }
          else
          {
            navigate('/log');
          }
        }
        else
        {
          navigate('/log');
        }
      }

    } catch (error) {
      if(error.response)
      {
        if (error.response.status === 401 && error.response.data?.reason === 'banned') {
            setIsBanned(true);
        }
        else if (error.response.status === 402 && error.response.data?.reason === 'pending') {
            setisPending(true);
        }
        else if(error.response.status === 400)
        {
          toast.error('Account not found!', {
            position: 'bottom-center',
            autoClose: 1500
          });
        }
        else if(error.response.status === 403)
        {
          toast.error('Invalid credentials!', {
            position: 'bottom-center',
            autoClose: 1500
          });
        }
        else if(error.response.status === 500)
        {
          toast.error('Something went wrong!', {
            position: 'bottom-center',
            autoClose: 1500
          });
        }
      }
    }
  }

  return (
    <div className='outer-content'>
      <Header/>
    
      <div className='login-container'>
        <ToastContainer/>
        
        <div className="login-main">
        <form onSubmit={handleSubmit}>
          <div className="login-header">
            Login To Your Account
          </div>
            <div className='form-item'>
                <input type="email" name='email' placeholder='Enter your Email' onChange={(e) => setEmail(e.target.value)} required/>
            </div>

            <div className='form-item'>
                <input type="password" name='password' placeholder='Enter your Password' onChange={(e) => setPassword(e.target.value)} required/>
            </div>

            <div className='form-item'>
                <button type='submit'>Login</button>
            </div>

            <div className="forgot-pass">
                <Link className='forgot-text'>Forgot Password?</Link>
            </div>
        </form>
       </div>
      </div>
      {isBanned && <Banned onClose={() => setIsBanned(false)}/>}
      {isPending && <Pending onClose={() => setisPending(false)}/>}
    </div>
  )
}
