import React, { useState } from 'react'
import Header from './Header'
import './styles/referee-signup.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCloudArrowUp } from '@fortawesome/free-solid-svg-icons'

export default function RefereeSignup() {

    const [fileNames, setFileNames] = useState([])
    
      const handleFileChange = (e) => {
        const files = Array.from(e.target.files).map(file => file.name)
        setFileNames(files)
      }

  return (
    <div>
      <Header/>
      <div className="referee-signup-container">
        <div className="referee-signup-main">
            <form encType='multipart/form-data'>
                <div className="rform-item">
                    <label htmlFor="">Enter you Name *</label><br />
                    <input type="text" name='name' placeholder='Enter your Name' required/>
                </div>

                <div className="rform-item">
                    <label htmlFor="">Enter you Email *</label><br />
                    <input type="email" name='email' placeholder='Enter your Email' required/>
                </div>

                <div className="rform-item">
                    <label htmlFor="">Enter you Mobile *</label><br />
                    <input type="number" name='mobile' placeholder='Enter your Mobile' required/>
                </div>

                <div className="rform-item">
                    <label htmlFor="">Create a Password *</label><br />
                    <input type="password" name='password' placeholder='Enter your Password' required/>
                </div>

                <div className="rform-item">
                    <label htmlFor="">Enter your certifications *</label><br />
                    <label className='rfile-input-area' htmlFor="certification">
                        <FontAwesomeIcon icon={faCloudArrowUp} size='2xl' style={{color: "#00d1b9",}} />
                        <p>{fileNames.length > 0 ? fileNames.join(", ") : "Click to Upload"}</p>
                    </label>
                    <input className='rfile-input' type="file" id='certification' accept='.pdf,.png,.jpg,.jpeg' 
                    name='certification' multiple onChange={handleFileChange}/>
                </div>

                <input type="hidden" name='role'/> 

                <input type="hidden" name="SP_type"/> 

                <input type="hidden" name='status'/> 

                <div className="rform-item">
                    <button>Register</button>
                </div>
            </form>
        </div>
      </div>
    </div>
  )
}
