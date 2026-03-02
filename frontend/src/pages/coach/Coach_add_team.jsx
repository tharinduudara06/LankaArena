import React, { useState } from 'react'
import Coach_sideBar from './Coach_sideBar'
import './styles/coach_add_team.css'
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
import {ToastContainer,toast} from 'react-toastify'

export default function Coach_add_team() {

    const [name,setname] = useState('');
    const [sport,setSport] = useState('');
    const [won, setWon] = useState('');
    const [uniform,setUniform] = useState([]);

    const navigate = useNavigate();

    const handleSubmit = async(e) =>
    {
        e.preventDefault();

        try {
            
            const data = new FormData();
            data.append('name',name);
            data.append('sport',sport);
            data.append('won',won);
            
            uniform.forEach(file => {
                data.append('uniform', file);
            });

            const res = await axios.post('http://localhost:8080/api/coach/add-team',data,
                {
                    withCredentials:true,
                    headers:{'content-Type':'multipart/form-data'}
                }
            )

            if(res.status === 201)
            {
                setname('');
                setSport('');
                setWon('');
                setUniform(null);
                
                toast.success("Team added sucessfully!",
                    {
                        position:'top-center',
                        autoClose:1500
                    }
                )
            }

        } catch (error) {
            console.log(error);
            if(error.response)
            {
                if(error.response.status === 400)
                {
                    navigate('/log');
                }
                else if(error.response.status === 500)
                {
                    toast.error("something went Wrong!",{
                        position:'top-center',
                        autoClose:1500
                    })
                }
            }
        }
    }

  return (
    <div>
        <Coach_sideBar/>
      <div className="c-add-team-container">
        <ToastContainer/>
            <div className="c-add-team-main">
                <form onSubmit={handleSubmit} encType='multipart\form-data'>
                    <div className="c-add-team-form-item">
                        <label htmlFor="">Team Name *</label><br />
                        <input 
                        onChange={(e) => setname(e.target.value)}
                        type="text" required/>
                    </div>

                    <div className="c-add-team-form-item">
                        <label htmlFor="">Sport *</label><br />
                        <input 
                        onChange={(e) => setSport(e.target.value)}
                        type="text" required/>
                    </div>

                    <div className="c-add-team-form-item">
                        <label htmlFor="">Matches Won Count(optional)</label><br />
                        <input 
                        onChange={(e) => setWon(e.target.value)}
                        type="text"/>
                    </div>

                    <div className="c-add-team-form-item">
                        <label htmlFor="">Select Team Jersey(optional)</label><br />
                        <input
                        onChange={(e) => setUniform(Array.from(e.target.files))}
                        type="file"
                        multiple
                        />
                    </div>

                    <div className="c-add-team-form-item">
                        <button>Add Team</button>
                    </div>
                </form>
            </div>
      </div>
    </div>
  )
}
