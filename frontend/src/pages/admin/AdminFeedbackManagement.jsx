import React, { useState } from 'react';
import './styles/admin_feedback_management.css';
import Admin_nav from './Admin_nav';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload, faComments, faSearch, faEye, faEdit, faArchive,  } from '@fortawesome/free-solid-svg-icons'
import { faStar as faSolidStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as faRegularStar } from '@fortawesome/free-regular-svg-icons';

const AdminFeedbackManagement = () => {
    const [feedbackData, setFeedbackData] = useState([
        {
            id: 1,
            userName: "Sanjaya Perera",
            feedback: "Great cricket bat, but the grip could be better",
            rating: 4,
            date: "Oct 12, 2023",
            status: "Pending"
        },
        {
            id: 2,
            userName: "Nayana Silva",
            feedback: "The football ground was not properly maintained",
            rating: 2,
            date: "Oct 11, 2023",
            status: "Approved"
        },
        {
            id: 3,
            userName: "Kamal Fernando",
            feedback: "Coach was very professional and knowledgeable",
            rating: 5,
            date: "Oct 10, 2023",
            status: "Archived"
        },
        {
            id: 4,
            userName: "Priya Ratnayake",
            feedback: "The badminton court was excellent but a bit expensive",
            rating: 4,
            date: "Oct 9, 2023",
            status: "Pending"
        },
        {
            id: 5,
            userName: "Asela Gunawardena",
            feedback: "Volleyball was deflated, need better quality control",
            rating: 2,
            date: "Oct 8, 2023",
            status: "Approved"
        }
    ]);

    const handleActionClick = (action, feedbackId) => {
        if (action === 'archive') {
            alert(`Feedback ${feedbackId} will be archived.`);
        } else if (action === 'view') {
            alert(`Viewing feedback ${feedbackId} details.`);
        } else if (action === 'edit') {
            alert(`Editing feedback ${feedbackId} status.`);
        }
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <FontAwesomeIcon 
                    key={i}
                    icon={i <= rating ? faSolidStar : faRegularStar}
                    className="admin-fm-star"
                />
            );
        }
        return <div className="admin-fm-rating">{stars}</div>;
    };

    const getStatusClass = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'admin-fm-status admin-fm-status-new';
            case 'approved':
                return 'admin-fm-status admin-fm-status-reviewed';
            case 'archived':
                return 'admin-fm-status admin-fm-status-archived';
            default:
                return 'admin-fm-status admin-fm-status-new';
        }
    };

    return (
        <div className="admin-fm-body">
            
            <Admin_nav/>

            {/* Main Content */}
            <div className="admin-fm-main-content">
                <div className="admin-fm-page-header">
                    <h1 className="admin-fm-page-title">Feedback Management</h1>
                    <button className="admin-fm-export-btn">
                        <FontAwesomeIcon icon={faDownload} /> Export Report
                    </button>
                </div>

                <div className="admin-fm-stats-cards">
                    <div className="admin-fm-stat-card">
                        <div className="admin-fm-stat-header">
                            <div className="admin-fm-stat-title">TOTAL FEEDBACK</div>
                            <div className="admin-fm-stat-icon">
                                <FontAwesomeIcon icon={faComments} />
                            </div>
                        </div>
                        <div className="admin-fm-stat-value">1,247</div>
                    </div>

                    <div className="admin-fm-stat-card">
                        <div className="admin-fm-stat-header">
                            <div className="admin-fm-stat-title">AVERAGE RATING</div>
                            <div className="admin-fm-stat-icon">
                                <FontAwesomeIcon icon={faSolidStar} />
                            </div>
                        </div>
                        <div className="admin-fm-stat-value">4.2/5</div>
                    </div>
                </div>

                <div className="admin-fm-filters-bar">
                    <div className="admin-fm-filter-group">
                        <span className="admin-fm-filter-label">RATING</span>
                        <select className="admin-fm-select">
                            <option>All Ratings</option>
                            <option>5 Stars</option>
                            <option>4 Stars</option>
                            <option>3 Stars</option>
                            <option>2 Stars</option>
                            <option>1 Star</option>
                        </select>
                    </div>

                    <div className="admin-fm-search-box">
                        <FontAwesomeIcon icon={faSearch} className="admin-fm-search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search feedback..." 
                            className="admin-fm-input"
                        />
                    </div>
                </div>

                <div className="admin-fm-feedback-table-container">
                    <table className="admin-fm-feedback-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Feedback</th>
                                <th>Rating</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {feedbackData.map((feedback) => (
                                <tr key={feedback.id}>
                                    <td>
                                        <div className="admin-fm-user-info">
                                            <div>{feedback.userName}</div>
                                        </div>
                                    </td>
                                    <td>{feedback.feedback}</td>
                                    <td>
                                        {renderStars(feedback.rating)}
                                    </td>
                                    <td>{feedback.date}</td>
                                    <td>
                                        <span className={getStatusClass(feedback.status)}>
                                            {feedback.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            className="admin-fm-action-btn"
                                            onClick={() => handleActionClick('view', feedback.id)}
                                        >
                                            <FontAwesomeIcon icon={faEye} />
                                        </button>
                                        <button 
                                            className="admin-fm-action-btn"
                                            onClick={() => handleActionClick('edit', feedback.id)}
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                        <button 
                                            className="admin-fm-action-btn"
                                            onClick={() => handleActionClick('archive', feedback.id)}
                                        >
                                            <FontAwesomeIcon icon={faArchive} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminFeedbackManagement;
