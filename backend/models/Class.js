const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subjects: [{ type: String, required: true }]
});

module.exports = mongoose.model('Class', classSchema);
