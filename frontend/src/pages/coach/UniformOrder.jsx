import React, { useEffect, useState } from 'react';
import './styles/UniformOrders.css';
import { Link, useNavigate } from 'react-router-dom';
import Coach_sideBar from './Coach_sideBar';
import axios from 'axios'
import {ToastContainer,toast} from 'react-toastify'

export default function UniformOrders() {
  const [selectedTeam, setSelectedTeam] = useState('');
  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);
  const [quantities, setQuantities] = useState({});

  const [teams,setTeams] = useState([]);

  const [teamPlayers,setTeamPlayers] = useState([]);

  const navigate = useNavigate();

  useEffect(() =>{

    const fetchTeams = async()=>
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
          }
          else if(error.response.status === 404)
          {
            toast(error.response.data.message,{autoClose:1500});
          }
          else if(error.response.status === 500)
          {
            toast(error.response.data.message,{autoClose:1500});
          }
        }
        }
    }

    fetchTeams();

  },[])

  const handleImageUpload = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (type === 'front') {
          setFrontPreview(e.target.result);
        } else {
          setBackPreview(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
  if (!selectedTeam) return;

  const fetchPlayers = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/coach/get-team-players/${selectedTeam}`, {
        withCredentials: true
      });

      if (res.status === 200) {
        
        setTeamPlayers(prev => ({
          ...prev,
          [selectedTeam]: res.data.data
        }));
      }
    } catch (error) {
      console.error("Error fetching players:", error);
      if(error.response)
        {
          if(error.response.status === 400)
          {
            navigate('/log');
          }
          else if(error.response.status === 404)
          {
            toast(error.response.data.message,{autoClose:1500});
          }
          else if(error.response.status === 500)
          {
            toast(error.response.data.message,{autoClose:1500});
          }
        }
    }
  };

  fetchPlayers();
}, [selectedTeam]);


const handleSubmitOrder = () => {
  if (!selectedTeam) return toast("Select a team first");
  
  const frontFile = document.getElementById("frontUpload").files[0];
  const backFile = document.getElementById("backUpload").files[0];
  if (!frontFile || !backFile) return toast("Upload both images");

  const formData = new FormData();
  formData.append("teamId", selectedTeam);
  formData.append("teamName", teams.find(t => t._id === selectedTeam)?.name);
  formData.append("frontDesign", frontFile);
  formData.append("backDesign", backFile);

  const playersData = teamPlayers[selectedTeam].map((player, index) => ({
    playerId: player._id,
    playerName: player.name,
    jerseyNumber: player.jersey,
    size: document.querySelectorAll(".size-select")[index].value,
    sleeve: document.querySelectorAll(".sleeve-select")[index].value,
    quantity: document.querySelectorAll(".quantity-input")[index].value
  }));
  formData.append("players", JSON.stringify(playersData));

  // Open PDF in new tab to download
  const url = "http://localhost:8080/api/coach/uniform-order";
  const xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.responseType = "blob";
  xhr.withCredentials = true;
  xhr.onload = function () {
    if (this.status === 200) {
      const blob = new Blob([this.response], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `uniform_order_${Date.now()}.pdf`;
      link.click();
    }
  };
  xhr.send(formData);
};


  return (
    <div>
      
      <Coach_sideBar/>
      <ToastContainer/>

      <div className='uniform-orders-container'>
        <div className="uniform-orders-header">
          <div className="uniform-orders-head-text">
            <p>Uniform Orders</p>
          </div>

          <div className="uniform-orders-header-btns">
            <button
            onClick={handleSubmitOrder}
            className="uniform-orders-header-btn secondary">
              Export PDF
            </button>
          </div>
        </div>

        <div className="uniform-orders-content-section">
          <div className="content-section-header">
            <p>Jersey Design</p>
          </div>
          
          <div className="design-upload">
            <div className="upload-area">
              <div 
                className="upload-box" 
                onClick={() => document.getElementById('frontUpload').click()}
              >
                {frontPreview ? (
                  <img src={frontPreview} alt="Front design preview" />
                ) : (
                  <>
                    <div className="upload-icon">+</div>
                    <p>Upload Front Design</p>
                    <p className="upload-hint">Click or drop image here</p>
                  </>
                )}
              </div>
              <input 
                type="file" 
                id="frontUpload" 
                accept="image/*" 
                style={{display: 'none'}} 
                onChange={(e) => handleImageUpload(e, 'front')} 
              />
            </div>
            
            <div className="upload-area">
              <div 
                className="upload-box" 
                onClick={() => document.getElementById('backUpload').click()}
              >
                {backPreview ? (
                  <img src={backPreview} alt="Back design preview" />
                ) : (
                  <>
                    <div className="upload-icon">+</div>
                    <p>Upload Back Design</p>
                    <p className="upload-hint">Click or drop image here</p>
                  </>
                )}
              </div>
              <input 
                type="file" 
                id="backUpload" 
                accept="image/*" 
                style={{display: 'none'}} 
                onChange={(e) => handleImageUpload(e, 'back')} 
              />
            </div>
          </div>
          
          <div className="team-select">
            <label className="select-label">Select Team</label>
            <select 
              value={selectedTeam} 
              onChange={(e) => setSelectedTeam(e.target.value)}
            >
              <option value="">-- Select a Team --</option>
              {teams.map(team => (
                <option key={team._id} value={team._id}>{team.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="uniform-orders-content-section">
          <div className="content-section-header">
            <p>Player Sizes</p>
          </div>
          
          <table className="players-table">
            <thead>
              <tr>
                <th>Player</th>
                <th>Jersey Number</th>
                <th>Size</th>
                <th>Sleeve</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {selectedTeam && teamPlayers[selectedTeam] ? (
                teamPlayers[selectedTeam].map(player => (
                  <tr key={player.id}>
                    <td>
                      <div className="player-info">
                        
                        <div>{player.name}</div>
                      </div>
                    </td>
                    <td>{player.jersey}</td>
                    <td>
                      <select className="size-select">
                        <option value="">Select Size</option>
                        <option value="S">Small</option>
                        <option value="M">Medium</option>
                        <option value="L">Large</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                      </select>
                    </td>
                    <td>
                      <select className="sleeve-select">
                        <option value="short">Short Sleeves</option>
                        <option value="long">Long Sleeves</option>
                      </select>
                    </td>
                    <td>
                      <input 
                        type="number" 
                        min="1" 
                        max="5" 
                        defaultValue="1" 
                        className="quantity-input" 
                        
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{textAlign: 'center', padding: '30px', color: '#8fbbc1'}}>
                    Please select a team to view players
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
        </div>
      </div>
    </div>
  );
}