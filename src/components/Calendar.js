import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import EventModal from "./EventModal";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const MyCalendar = () => {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const navigate = useNavigate();
  console.log(events, "events");

  const fetchEvents = async () => {
    const response = await fetch("http://localhost:5000/get-events", {
      credentials: "include",
    });
    const data = await response.json();
    if (response.ok) {
      setEvents(
        data.map((event) => ({
          _id: event._id,
          title: event.title,
          description: event.description,
          start: new Date(event.start).toISOString(), 
          end: new Date(event.end).toISOString(),
          participants: event.participants || [],
          sessionNotes: event.sessionNotes || "",
          googleEventId: event.googleEventId || "",
          createdAt: new Date(event.createdAt).toISOString(),
          updatedAt: new Date(event.updatedAt).toISOString(),
          __v: event.__v || 0,
        }))
      );
    }
  };

  const handleSelectSlot = ({ start }) => {
    setSelectedDate(start);
    setIsModalOpen(true);
  };

  const handleEventSubmit = async (eventData) => {
    try {
      const response = await fetch("http://localhost:5000/add-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        await fetchEvents(); 
        setIsModalOpen(false);
      } else {
        alert("Failed to add event");
      }
    } catch (error) {
      console.error("Error adding event:", error);
      alert("Error adding event");
    }
  };
  
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      const response = await fetch(`http://localhost:5000/delete-event/${eventId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        alert("Event deleted successfully!");
        fetchEvents();
      } else {
        alert("Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Error deleting event");
    }
  };
  
  const CustomEvent = ({ event }) => (
    <div
      style={{ cursor: "pointer", padding: "5px", backgroundColor: "#3174ad", color: "white", borderRadius: "5px" }}
      title={`${event.title}\n${event.description}\nParticipants: ${event.participants.join(", ")}`}
      onClick={() => handleDeleteEvent(event._id)}
    >
      {event.title}
    </div>
  );

  return (
    <div>
      <h1>My Calendar</h1>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        selectable={true}
        onSelectSlot={handleSelectSlot}
        components={{
          event: CustomEvent,
        }}
        views={["month"]}
      />

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleEventSubmit}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default MyCalendar;
