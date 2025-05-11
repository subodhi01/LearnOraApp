// Constants
const MEETINGS_STORAGE_KEY = 'scheduledMeetings';

/**
 * Save a meeting to local storage
 * @param {Object} meeting - Meeting object to save
 */
export const saveMeeting = (meeting) => {
  const existingMeetings = getMeetings();
  const updatedMeetings = [...existingMeetings, meeting];
  localStorage.setItem(MEETINGS_STORAGE_KEY, JSON.stringify(updatedMeetings));
};

/**
 * Get all meetings from local storage
 * @returns {Array} Array of meeting objects
 */
export const getMeetings = () => {
  const meetingsJSON = localStorage.getItem(MEETINGS_STORAGE_KEY);
  return meetingsJSON ? JSON.parse(meetingsJSON) : [];
};

/**
 * Get a meeting by its ID
 * @param {string} id - Meeting ID
 * @returns {Object|null} Meeting object or null if not found
 */
export const getMeetingById = (id) => {
  const meetings = getMeetings();
  return meetings.find(meeting => meeting.id === id) || null;
};

/**
 * Delete a meeting by its ID
 * @param {string} id - Meeting ID
 * @returns {boolean} Success status
 */
export const deleteMeeting = (id) => {
  const meetings = getMeetings();
  const filteredMeetings = meetings.filter(meeting => meeting.id !== id);
  
  if (meetings.length === filteredMeetings.length) {
    return false; // No meeting was deleted
  }
  
  localStorage.setItem(MEETINGS_STORAGE_KEY, JSON.stringify(filteredMeetings));
  return true;
};

/**
 * Update an existing meeting
 * @param {string} id - Meeting ID
 * @param {Object} updatedMeeting - Updated meeting data
 * @returns {boolean} Success status
 */
export const updateMeeting = (id, updatedMeeting) => {
  const meetings = getMeetings();
  const index = meetings.findIndex(meeting => meeting.id === id);
  
  if (index === -1) {
    return false;
  }
  
  meetings[index] = { ...meetings[index], ...updatedMeeting };
  localStorage.setItem(MEETINGS_STORAGE_KEY, JSON.stringify(meetings));
  return true;
};

/**
 * Validate meeting password
 * @param {string} id - Meeting ID
 * @param {string} password - Password to validate
 * @returns {boolean} Valid or not
 */
export const validateMeetingPassword = (id, password) => {
  const meeting = getMeetingById(id);
  return meeting && meeting.password === password;
};