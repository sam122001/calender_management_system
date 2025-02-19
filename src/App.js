import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // React Router for navigation
import MyCalendar from "./components/Calendar";
import EventModal from "./components/EventModal";

const handleGoogleAuth = () => {
  window.location.href = "http://localhost:5000/auth/google";
  console.log("api called")
};

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:5000/auth/status", {
          credentials: "include",
        });
        const data = await response.json();

        setIsAuthenticated(data.authenticated);
        if (data.authenticated) {
          navigate("/calendar");
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleEventSubmit = async (eventData) => {
    const response = await fetch("http://localhost:5000/add-event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include session cookies for authentication
      body: JSON.stringify(eventData),
    });

    if (response.ok) {
      alert("Event added successfully!");
      closeModal();
    } else {
      alert("Failed to add event");
    }
  };

  return (
    <div>
      <h1>Calendar App</h1>
      {!isAuthenticated ? (
        <button onClick={handleGoogleAuth}>Connect to Google Calendar</button>
      ) : (
        <>
          <button onClick={openModal}>Create Event</button>
          <MyCalendar />
          <EventModal isOpen={isModalOpen} onClose={closeModal} onSubmit={handleEventSubmit} />
        </>
      )}
    </div>
  );
}

export default App;
