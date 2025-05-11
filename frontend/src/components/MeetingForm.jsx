import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { saveMeeting } from '../utils/localStorageUtils';

const MeetingForm = ({ onMeetingCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    dateTime: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validate the date (must be in the future)
    const meetingDate = new Date(formData.dateTime);
    const now = new Date();
    
    if (meetingDate <= now) {
      setError('Meeting date and time must be in the future');
      return;
    }
    
    // Generate a unique room ID
    const meetingId = uuidv4();
    
    // Create the meeting object
    const newMeeting = {
      id: meetingId,
      title: formData.title,
      dateTime: formData.dateTime,
      password: formData.password,
      createdAt: new Date().toISOString()
    };
    
    // Save the meeting
    saveMeeting(newMeeting);
    
    // Notify parent component
    if (onMeetingCreated) {
      onMeetingCreated(newMeeting);
    }
    
    // Reset the form
    setFormData({
      title: '',
      dateTime: '',
      password: '',
    });
    
    setSuccess('Meeting scheduled successfully!');
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(''), 3000);
  };
  
  // Get minimum date-time value (current time + 5 minutes)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now.toISOString().slice(0, 16);
  };
  
  return (
    <div className="card meeting-form">
      <h2>Schedule a New Meeting</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Meeting Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter meeting title"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="dateTime">Date and Time</label>
          <input
            type="datetime-local"
            id="dateTime"
            name="dateTime"
            value={formData.dateTime}
            onChange={handleChange}
            min={getMinDateTime()}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Meeting Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Set a meeting password"
            required
          />
        </div>
        
        <button type="submit" className="btn btn-secondary">
          Schedule Meeting
        </button>
      </form>
    </div>
  );
};

export default MeetingForm;