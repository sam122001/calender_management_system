import React, { useState, useEffect } from "react";
import moment from "moment";
import "../styles/EventModel.css";

const EventModal = ({ isOpen, onClose, onSubmit, selectedDate }) => {
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    participants: "",
    start: "",
    end: "",
    sessionNotes: "",
  });

  useEffect(() => {
    if (selectedDate) {
      const formattedDate = moment(selectedDate).format("YYYY-MM-DD");
      const defaultStartTime = moment(selectedDate).format("HH:mm");
      const defaultEndTime = moment(selectedDate).add(1, 'hour').format("HH:mm");
      
      setEventData(prev => ({
        ...prev,
        start: `${formattedDate}T${defaultStartTime}`,
        end: `${formattedDate}T${defaultEndTime}`
      }));
    }
  }, [selectedDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData({ ...eventData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(eventData);
    resetForm();
  };

  const resetForm = () => {
    setEventData({
      title: "",
      description: "",
      participants: "",
      start: "",
      end: "",
      sessionNotes: "",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Create Event</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="title"
              placeholder="Event Title"
              value={eventData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <textarea
              name="description"
              placeholder="Description"
              value={eventData.description}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              name="participants"
              placeholder="Participants (comma-separated emails)"
              value={eventData.participants}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Start Time</label>
            <input
              type="datetime-local"
              name="start"
              value={eventData.start}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>End Time</label>
            <input
              type="datetime-local"
              name="end"
              value={eventData.end}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <textarea
              name="sessionNotes"
              placeholder="Session Notes"
              value={eventData.sessionNotes}
              onChange={handleChange}
            />
          </div>
          <div className="button-group">
            <button type="submit" className="submit-btn">Create Event</button>
            <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
