import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateMeetingPassword } from '../utils/localStorageUtils';

const JoinMeetingModal = ({ meeting, onClose }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if the password is correct
    if (validateMeetingPassword(meeting.id, password)) {
      // Password is correct, navigate to the meeting room
      navigate(`/meeting/${meeting.id}`);
    } else {
      // Password is incorrect
      setError('Incorrect password. Please try again.');
    }
  };
  
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Join Meeting: {meeting.title}</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-danger">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="password">Enter Meeting Password:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Meeting password"
              required
            />
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-danger" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn">
              Join Meeting
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinMeetingModal;