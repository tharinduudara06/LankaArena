import React, { useEffect, useState } from 'react'
import Admin_nav from './Admin_nav'
import './styles/all-user.css'
import { Link } from 'react-router-dom'
import search from '../../images/search.png'
import worker01 from '../../images/worker01.jpg'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons'
import EditUser from './EditUser'
import {ToastContainer, toast} from 'react-toastify'

export default function All_users() {

    const [userData, setUserData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get('http://localhost:8080/all-users');
                if (res.status === 200) {
                    setUserData(res.data.data);
                }
            } catch (error) {
                console.error(error);
            }
        }
        fetchUsers();
    }, []);

    const handleEdit = (user) => {
        setSelectedUser(user);
    };

    const handleSave = async (updatedData) => {
        try {
            await axios.put(`http://localhost:8080/update-user/${selectedUser._id}`, updatedData);
            setUserData(userData.map(user => user._id === selectedUser._id ? { ...user, ...updatedData } : user));
            setSelectedUser(null);

        } catch (error) {
            
            console.log(error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                const res = await axios.delete(`http://localhost:8080/delete-user/${id}`);
                setUserData(userData.filter(user => user._id !== id));

                if(res.status === 200)
                {
                    toast.success(res.data.message, {
                        position:"top-center",
                        autoClose:1500
                    })
                }
            } catch (error) {
                if(error.response)
                {
                    if(error.response.status === 404)
                    {
                        toast.error("User Not Found!", {
                        position:"top-center",
                        autoClose:1500
                    })
                    }
                }
            }
        }
    };

    const filteredUsers = userData.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.mobile.includes(searchTerm)
    );

    return (
        <div>
            <Admin_nav />
            <div className='all-container'>
                <ToastContainer/>
                <div className='all-user-menu'>
                    <div className="search-bar user-item">
                        <img src={search} alt="" />
                        <input
                            type="text"
                            placeholder='Search here...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="add-user-btn user-item">
                        <Link to='/add-users' className='addUser-link'>+ Add user</Link>
                    </div>

                    <div className="profile-pic user-item">
                        <img src={worker01} alt="" />
                    </div>
                </div>

                <div className="table-content">
                    <div className="headText user-item">User management</div>

                    <div className="table user-item">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Mobile</th>
                                    <th>Role</th>
                                    <th>User Type</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <tr key={user._id}>
                                            <td>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>{user.mobile}</td>
                                            <td>{user.role}</td>
                                            <td>{user.SP_type}</td>
                                            <td
                                                style={{
                                                color: user.status === 'active' ? 'green' 
                                                    : user.status === 'pending' ? 'orange' 
                                                    : user.status === 'banned' ? 'red' 
                                                    : 'black',
                                                fontWeight: 'bold'
                                            }}
                                            >{user.status}</td>
                                            <td>
                                                <button className='edit' onClick={() => handleEdit(user)}>
                                                    <FontAwesomeIcon icon={faPenToSquare} style={{ color: "#00f8d7ff" }} />
                                                </button>

                                                <button className='delete' onClick={() => handleDelete(user._id)}>
                                                    <FontAwesomeIcon icon={faTrash} style={{ color: "#ff4000" }} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center' }}>
                                            No Data Found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {selectedUser && (
                <EditUser
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                    onSave={handleSave}
                />
            )}
        </div>
    )
}
