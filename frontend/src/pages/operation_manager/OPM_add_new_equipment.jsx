import React, { useState } from 'react'
import './styles/opm_add_new_equipment.css'
import OPM_sideBar from './OPM_sideBar'
import { ToastContainer, toast } from 'react-toastify'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function OPM_add_new_equipment() {
  const [formData, setFormData] = useState({
    item: '',
    serialNo: '',
    quantity: '',
    price: ''
  });
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const data = new FormData();
      data.append('item', formData.item);
      data.append('serialNo', formData.serialNo);
      data.append('quantity', formData.quantity);
      data.append('price', formData.price);
      data.append('image', image);

      const res = await axios.post('http://localhost:8080/api/operation-manager/add-new-equipment', data, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.status === 200) {
        setFormData({
          item: '',
          serialNo: '',
          quantity: '',
          price: ''
        });
        setImage(null);
        
        toast.success("New Item Added Successfully!", {
          position: 'top-center',
          autoClose: 1500
        });
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          navigate('/log');
        } else if (error.response.status === 500) {
          toast.error("Something went wrong!", {
            position: 'top-center',
            autoClose: 1500
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="opm-ne-wrapper">
      <OPM_sideBar />
      <ToastContainer />
      
      <div className='opm-ne-container'>
        <div className="opm-ne-main">
          <div className="opm-ne-header">
            <h1 className="opm-ne-title">Add New Equipment</h1>
            <p className="opm-ne-subtitle">Fill in the details below to add new equipment to inventory</p>
          </div>
          
          <form onSubmit={handleSubmit} encType='multipart/form-data' className="opm-ne-form">
            <div className="opm-ne-form-grid">
              <div className="opm-ne-form-item">
                <label htmlFor="item" className="opm-ne-label">Equipment Name</label>
                <input 
                  type="text" 
                  id="item"
                  name="item"
                  value={formData.item}
                  onChange={handleInputChange}
                  className="opm-ne-input"
                  placeholder="Enter equipment name"
                  required
                />
              </div>

              <div className="opm-ne-form-item">
                <label htmlFor="serialNo" className="opm-ne-label">Serial Number</label>
                <input 
                  type="text"
                  id="serialNo"
                  name="serialNo"
                  value={formData.serialNo}
                  onChange={handleInputChange}
                  className="opm-ne-input"
                  placeholder="Enter serial number"
                  required
                />
              </div>

              <div className="opm-ne-form-item">
                <label htmlFor="price" className="opm-ne-label">Price per Hour ($)</label>
                <input 
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="opm-ne-input"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="opm-ne-form-item">
                <label htmlFor="quantity" className="opm-ne-label">Quantity</label>
                <input 
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="opm-ne-input"
                  placeholder="Enter quantity"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="opm-ne-form-item opm-ne-file-upload">
              <label htmlFor="image" className="opm-ne-label">Equipment Image</label>
              <div className="opm-ne-file-input-wrapper">
                <input 
                  type="file"
                  id="image"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="opm-ne-file-input"
                  accept="image/*"
                />
                <label htmlFor="image" className="opm-ne-file-label">
                  {image ? image.name : 'Choose an image'}
                </label>
              </div>
              {image && (
                <div className="opm-ne-image-preview">
                  <img src={URL.createObjectURL(image)} alt="Preview" className="opm-ne-preview-img" />
                </div>
              )}
            </div>

            <div className="opm-ne-form-item opm-ne-submit">
              <button 
                type="submit" 
                className={`opm-ne-submit-btn ${isSubmitting ? 'opm-ne-submitting' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="opm-ne-spinner"></span>
                    Adding Equipment...
                  </>
                ) : (
                  'Add Equipment'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}