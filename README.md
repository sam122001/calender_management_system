# Google Calendar Integration App

A full-stack web application that integrates with Google Calendar, allowing users to manage their calendar events with additional features like session notes and participant management.

## Features

- Google Calendar OAuth2 Authentication
- Create, view, and delete calendar events
- Sync events with Google Calendar
- Add multiple participants to events
- Include session notes with events
- Real-time calendar view using react-big-calendar
- MongoDB integration for storing extended event details

## Tech Stack

### Frontend
- React.js
- React Router for navigation
- react-big-calendar for calendar visualization
- Moment.js for date handling
- Custom CSS for styling

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Google Calendar API
- Express Session for authentication
- CORS for cross-origin resource sharing

## Prerequisites

Before running this application, you need to:

1. Create a Google Cloud Project
2. Enable Google Calendar API
3. Set up OAuth 2.0 credentials
4. Have MongoDB installed and running
5. Node.js and npm installed

## Environment Variables

### Backend (.env)
