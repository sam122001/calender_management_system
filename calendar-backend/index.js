require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");
const session = require('express-session');
const mongoose = require('mongoose');
const Event = require('./models/Event');

const app = express();

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Google OAuth2 Client
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/calendar_app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Authentication Route
app.get("/auth/google", (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/calendar"],
  });
  res.redirect(authUrl);
});

// Callback Route
app.get("/auth/google/callback", async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    req.session.tokens = tokens;
    req.session.user = { authenticated: true };
    res.redirect(`${process.env.FRONTEND_URL}/calendar`);
  } catch (error) {
    console.error("Error getting tokens:", error.message);
    res.redirect(`${process.env.FRONTEND_URL}?error=auth_failed`);
  }
});

// Add Event to Google Calendar
app.post("/add-event", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { title, description, start, end, participants, sessionNotes } = req.body;

    // Validate Request Data
    if (!title || !start || !end) {
      return res.status(400).json({ error: "Missing required fields: title, start, or end" });
    }

    // Ensure OAuth Credentials are Set
    if (!oauth2Client.credentials) {
      return res.status(401).json({ error: "Google authentication required" });
    }

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const googleEvent = {
      summary: title,
      description: description || '',
      start: { dateTime: new Date(start).toISOString() },
      end: { dateTime: new Date(end).toISOString() },
      attendees: participants ? participants.split(",").map(email => ({ email: email.trim() })) : [],
    };

    console.log("Event to be inserted:", JSON.stringify(googleEvent, null, 2));

    // Add to Google Calendar
    const { data } = await calendar.events.insert({
      calendarId: "primary",
      resource: googleEvent
    });

    console.log("Event added to Google Calendar:", data);

    // Save to MongoDB
    const event = new Event({
      title,
      description,
      start,
      end,
      participants: participants ? participants.split(",") : [],
      sessionNotes,
      googleEventId: data.id,
      userId: req.session.user.id
    });

    await event.save();
    res.json({ message: "Event added successfully!", event });
  } catch (error) {
    console.error("Error adding event:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// Get Events from MongoDB
app.get("/get-events", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const events = await Event.find({ userId: req.session.user.id });
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: error.message });
  }
});

// Authentication Status Route
app.get("/auth/status", (req, res) => {
  res.json({
    authenticated: !!req.session.user,
    user: req.session.user || null
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
