import React, { useEffect, useState } from 'react'
import './styles/coach_add_players.css'
import Coach_sideBar from './Coach_sideBar'
import {ToastContainer,toast} from 'react-toastify'
import axios from 'axios'
import { useLocation, useNavigate } from 'react-router-dom'

export default function Coach_add_players() {

    const [email, setEmail] = useState('');
    const [player, setUser] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState('');
    const [teams,setTeams] = useState([]);
    const navigate = useNavigate();

    const handleSearch = async() =>
    {
        if (!email) return toast.warning("Enter email!",{autoClose:1500});

        try {
            
            const res = await axios.get(`http://localhost:8080/api/coach/get-user-by-email/${email}`);

            if(res.data.player)
            {
                setUser(res.data.player);
            }
            else
            {
                toast.error("User not found!");
                setUser(null);
            }

        } catch (error) {
            toast.error("Error searching user!");
            console.error(error);
        }
    }

    const handleAddToTeam = async() =>
    {
        if (!selectedTeam) return toast.warning("Select a team!",{autoClose:1500});

        try {
            
            const res = await axios.post('http://localhost:8080/api/coach/add-player-to-team',
                {
                    playerId:player._id,
                    teamId:selectedTeam
                },
                {
                    withCredentials:true
                }
            );

            if (res.status === 200) {
                toast.success("Player added to team!",{autoClose:1500});
                setUser(null);
                setEmail('');
                setSelectedTeam('');
            }

        } catch (error) {
            if(error.response)
            {
              if(error.response.status === 401)
              {
                navigate('/log');
              }
              else if(error.response.status === 400)
              {
                toast.error(error.response.data.message,{
                    position:'top-right',
                    autoClose:1500
                  })
              }
              else if(error.response.status === 404)
              {
                toast.error(error.response.data.message,{
                    position:'top-right',
                    autoClose:1500
                  })
              }
              else if(error.response.status === 500)
              {
                toast.error("Something went wrong!",{
                    position:'top-center',
                    autoClose:1500
                  })
              }
            }
        }
    }

      useEffect(() => {
    
        const fetchTeams = async() =>
        {
          try {
            
            const res = await axios.get('http://localhost:8080/api/coach/get-team',
              {
                withCredentials:true
              }
            )
    
            if(res.status === 200)
            {
              setTeams(res.data.data);
            }
    
          } catch (error) {
            if(error.response)
            {
              if(error.response.status === 400)
              {
                navigate('/log');
                // alert("hiiiiiiiiiii");
              }
            }
            else if(error.response.status === 404)
            {
              console.log("No Teams");
            }
            else if(error.response.status === 500)
            {
              toast.error("Something went wrong!",{
                position:'top-center',
                autoClose:1500
              })
            }
          }
        }
    
        fetchTeams();
      },[])

  return (
    <div>
        <ToastContainer/>
        <Coach_sideBar/>
      <div className="coach-add-players-container">
        
        <div className="coach-add-player-form">
            
            <div className="add-player-items">
                <div className="add-player-main">
                    <label htmlFor="">Search Your Player to Add</label><br />
                    <div className="add-player-input">
                        <input 
                        type="email"
                        placeholder='Enter registered players email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        />
                        <button onClick={handleSearch} >🔍</button>
                    </div>
                </div>
            </div>
            
            {player && (

                <div className="coach-add-player-details-card">
                    <p>{player.name}</p>
                    <p>{player.email}</p>
                    <p>{player.mobile}</p>
                    <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
                        <option value="">Select Team</option>
                            {teams.map((team) => (
                            <option key={team._id} value={team._id}>
                                {team.name}
                            </option>
                            ))}
                    </select>
                    <button onClick={handleAddToTeam}>+ Add</button>
                </div>
            )}
             
        </div>

       

      </div>
    </div>
  )
}
