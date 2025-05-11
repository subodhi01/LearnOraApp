// Key for storing meetings in localStorage
const MEETINGS_STORAGE_KEY = 'meetings';

// Get all meetings from localStorage
export const getAllMeetings = () => {
  const meetings = localStorage.getItem(MEETINGS_STORAGE_KEY);
  return meetings ? JSON.parse(meetings) : [];
};

// Alias for getAllMeetings for backward compatibility
export const getMeetings = getAllMeetings;

// Get a specific meeting by ID
export const getMeetingById = (meetingId) => {
  const meetings = getAllMeetings();
  return meetings.find(meeting => meeting.id === meetingId);
};

// Validate meeting password
export const validateMeetingPassword = (meetingId, password) => {
  const meeting = getMeetingById(meetingId);
  if (!meeting) return false;
  return meeting.password === password;
};

// Save a new meeting
export const saveMeeting = (meeting) => {
  const meetings = getAllMeetings();
  meetings.push(meeting);
  localStorage.setItem(MEETINGS_STORAGE_KEY, JSON.stringify(meetings));
};

// Update an existing meeting
export const updateMeeting = (updatedMeeting) => {
  const meetings = getAllMeetings();
  const index = meetings.findIndex(meeting => meeting.id === updatedMeeting.id);
  if (index !== -1) {
    meetings[index] = updatedMeeting;
    localStorage.setItem(MEETINGS_STORAGE_KEY, JSON.stringify(meetings));
  }
};

// Delete a meeting
export const deleteMeeting = (meetingId) => {
  const meetings = getAllMeetings();
  const filteredMeetings = meetings.filter(meeting => meeting.id !== meetingId);
  localStorage.setItem(MEETINGS_STORAGE_KEY, JSON.stringify(filteredMeetings));
};

// Generate a unique meeting ID
export const generateMeetingId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}; 