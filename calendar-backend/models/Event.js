const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  start: {
    type: Date,
    required: true
  },
  end: {
    type: Date,
    required: true
  },
  participants: [String],
  sessionNotes: String,
  googleEventId: String,
  userId: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema); 