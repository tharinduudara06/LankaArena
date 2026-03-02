import React, { useEffect, useState } from 'react'
import Ground_manager_sideBar from './Ground_manager_sideBar'
import './styles/gm_myGrounds.css'
import playGround from '../../images/playGround.jpg'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faMapMarkerAlt,faEdit,faTrash} from '@fortawesome/free-solid-svg-icons'
import {Link, useNavigate} from 'react-router-dom'
import axios from 'axios'
import {ToastContainer,toast} from 'react-toastify'
import GM_EditVenue from './GM_EditVenue'

export default function GM_myGrounds() {

const [grounds, setGrounds] = useState([]);
const [selectedGround, setSelectedGround] = useState(null);

const navigate = useNavigate();

useEffect(() => {

    const fetchGrounds = async() =>
    {
      try {
        
        const res = await axios.get('http://localhost:8080/api/ground-manager/gm-get-grounds',{
          withCredentials: true
        });

        if(res.status === 200)
        {
          setGrounds(res.data.data);
        }

      } catch (error) {
        if(error.response)
        {
          if(error.response.status === 401)
          {
            navigate('/log');
          }
          
          else if(error.response.status === 404)
          {
            console.log("you currently Don't have any grounds");
          }
          else if(error.response.status === 500)
          {
              toast.error("Something went wrong!",
              {
                position:'top-center',
                autoClose:1500
              }
            )
          }
        }
      }
    }

    fetchGrounds();
},[]);

 const handleEdit = (ground) => {
        setSelectedGround(ground);
};

const handleSave = async (updatedData) => {
  try {

     console.log("Sending update request for ground:", selectedGround._id);
      console.log("FormData contents:");

      for (let [key, value] of updatedData.entries()) {
      console.log(key, value);
    }
    
    const response = await axios.put(`http://localhost:8080/api/ground-manager/gm-update-venue/${selectedGround._id}`,
      updatedData,
      {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" }
      }
    );

    // Update state with response data
    setGrounds(grounds.map(ground => 
      ground._id === selectedGround._id ? response.data.data : ground
    ));
    
    setSelectedGround(null);
    toast.success("Ground updated successfully!");

  } catch (error) {
    console.log(error);
    
    if(error.response)
    {
      console.log("Error response:", error.response.data);
      console.log("Error status:", error.response.status);

      if(error.response && error.response.status === 401) {
      toast.error("Session expired! Please log in again.");
      navigate('/log');
    } else {
      console.log(error);
      toast.error("Failed to update ground!");
    }
    }
  }   
};

const handleDelete = async (groundId) => {
  if (!window.confirm("Are you sure you want to delete this ground?")) {
    return;
  }

  try {
    const response = await axios.delete(`http://localhost:8080/api/ground-manager/gm-delete-venue/${groundId}`,
      {
        withCredentials: true
      }
    );

    console.log("Delete response:", response.data);

    if (response.status === 200) {
      // Remove the deleted ground from state
      setGrounds(grounds.filter(ground => ground._id !== groundId));
      toast.success("Ground deleted successfully!");
    }

  } catch (error) {
    console.error("Delete error:", error);
    
    if (error.response) {
      if (error.response.status === 401) {
        toast.error("Session expired! Please log in again.");
        navigate('/log');
      } else if (error.response.status === 404) {
        toast.error("Ground not found!");
      } 
      else if(error.response.status === 400)
      {
        toast.error(error.response.data.message);
      }
      else {
        toast.error("Failed to delete ground!");
      }
    } else {
      toast.error("Network error! Please try again.");
    }
  }
};

  return (
    <div>
    
    <Ground_manager_sideBar/>

    {selectedGround && (
          <GM_EditVenue
            ground={selectedGround}
            onClose={() => setSelectedGround(null)}
            onSave={handleSave}
          />
      )}

    
      <div className="gm-mg-container">

        <ToastContainer/>

        

        <div className="gm-mg-header">
          <div className="gm-mg-header-text">My Grounds</div>
          <div className="gm-mg-addGround-btn">
            <Link to='/ground-manager-add-ground' className='gm-mg-addGround-link'>+ Add new ground</Link>
          </div>
        </div>
        
        <div className="gm-mg-grounds-container">
          {grounds.length > 0 ? (
            grounds.map((ground) => (

            <div key={ground._id} className="gm-mg-ground">

            {ground.photo && ground.photo.filename ? (
              <div className="gm-mg-ground-img">
                <img src={`/uploads/${ground.photo.filename}`} alt="" />
              </div>
            ):(
              <p>{ground.name}</p>
            )}
            

            <div className="gm-mg-ground-text">
              <p className='gm-mg-ground-name'>{ground.name}</p>
              <div className="gm-mg-marker">
                <FontAwesomeIcon className='gm-mg-marker-icon' icon={faMapMarkerAlt} style={{color:"#6c6c6cff"}}/>{ground.location.address},{ground.location.city}
              </div>
              <p className='gm-mg-ground-price'>LKR {ground.price} / Hour</p>
              <div className="gm-mg-ground-facilities">
                {ground.facilities.map((facility,i) => (
                  <p key={i}>{facility}</p>
                ))}
              </div>
            </div>
            <div className="gm-mg-ground-btns">
              <button onClick={() => handleEdit(ground)} className='gm-mg-ground-edit'>
                <FontAwesomeIcon className='gm-mg-marker-icon' icon={faEdit}/>
                Edit
              </button>
              <button onClick={() => handleDelete(ground._id)} className='gm-mg-ground-delete'>
                <FontAwesomeIcon className='gm-mg-marker-icon' icon={faTrash}/>
                Delete
              </button>
            </div>
          </div>

          ))
          ):(
            <div>
              <h2>you currently Don't have any grounds</h2>
              <h3>Add you ground</h3>
              <Link to='/ground-manager-add-ground'>+ Add new ground</Link>
            </div>
          )}
     
        </div>
      </div>
    </div>
  )
}
