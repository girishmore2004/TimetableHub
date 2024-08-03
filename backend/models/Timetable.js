const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  class: { type: String, required: true },
  teacher: { type: String, required: true },
  time: { type: String, required: true }
});

module.exports = mongoose.model('Timetable', timetableSchema);
